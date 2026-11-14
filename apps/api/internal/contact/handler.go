// Package contact implements the contact form Lambda.
package contact

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

// Mailer is the subset of the SES v2 client the handler uses.
type Mailer interface {
	SendEmail(ctx context.Context, in *sesv2.SendEmailInput, optFns ...func(*sesv2.Options)) (*sesv2.SendEmailOutput, error)
}

// Config holds the handler's settings, read from the environment in main.
type Config struct {
	AdminEmail              string
	NoReplyEmail            string
	NotifyTemplateName      string
	SESConfigurationSetName string
	AllowedOrigin           string
}

// Handler handles contact form submissions from API Gateway.
type Handler struct {
	Config Config
	Mailer Mailer
	// Verifier is nil when bot verification is disabled.
	Verifier Verifier
	Logger   *slog.Logger
}

type response struct {
	Message string       `json:"message"`
	Errors  []FieldError `json:"errors,omitempty"`
}

func (h *Handler) respond(status int, body response) events.APIGatewayProxyResponse {
	payload, _ := json.Marshal(body)
	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  h.Config.AllowedOrigin,
			"Access-Control-Allow-Headers": "Content-Type",
			"Content-Type":                 "application/json",
			"Vary":                         "Origin",
		},
		Body: string(payload),
	}
}

// Handle processes one API Gateway (REST, proxy integration) request. It
// never returns an error: failures become HTTP responses so API Gateway
// always sends CORS headers.
func (h *Handler) Handle(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log := h.Logger.With("requestId", event.RequestContext.RequestID)

	body := []byte(event.Body)
	if event.IsBase64Encoded {
		decoded, err := base64.StdEncoding.DecodeString(event.Body)
		if err != nil {
			log.Warn("Failed to decode base64 body", "error", err)
			return h.respond(http.StatusBadRequest, response{Message: "Invalid request format"}), nil
		}
		body = decoded
	}

	req, err := ParseRequest(body)
	if err != nil {
		var validationErr *ValidationError
		if errors.As(err, &validationErr) {
			log.Warn("Validation failed", "errors", validationErr.Fields)
			return h.respond(http.StatusBadRequest, response{Message: "Invalid request", Errors: validationErr.Fields}), nil
		}
		log.Warn("Failed to parse request body", "error", err)
		return h.respond(http.StatusBadRequest, response{Message: "Invalid request format"}), nil
	}

	// Pretend the honeypot submission worked so bots don't adapt.
	if req.Website != "" {
		log.Warn("Honeypot field filled, dropping submission")
		return h.respond(http.StatusOK, response{Message: "Message sent"}), nil
	}

	if h.Verifier != nil {
		ok, err := h.Verifier.Verify(ctx, req.TurnstileToken, event.RequestContext.Identity.SourceIP)
		if err != nil {
			log.Error("Turnstile verification errored", "error", err)
		}
		if !ok {
			log.Warn("Turnstile verification failed")
			return h.respond(http.StatusForbidden, response{Message: "Bot verification failed, please try again"}), nil
		}
	}

	log.Info("Processing contact form submission", "email", redactEmail(req.Email))

	templateData, err := json.Marshal(map[string]string{
		"NAME":    Sanitize(req.Name),
		"EMAIL":   req.Email,
		"MESSAGE": Sanitize(req.Message),
	})
	if err != nil {
		log.Error("Failed to encode template data", "error", err)
		return h.respond(http.StatusInternalServerError, response{Message: "Internal Server Error"}), nil
	}

	// Only ever email the site owner. Sending anything to the caller-supplied
	// address would let anyone use this API to email arbitrary people.
	input := &sesv2.SendEmailInput{
		FromEmailAddress: &h.Config.NoReplyEmail,
		Destination:      &types.Destination{ToAddresses: []string{h.Config.AdminEmail}},
		ReplyToAddresses: []string{req.Email},
		Content: &types.EmailContent{
			Template: &types.Template{
				TemplateName: &h.Config.NotifyTemplateName,
				TemplateData: new(string(templateData)),
			},
		},
	}
	if h.Config.SESConfigurationSetName != "" {
		input.ConfigurationSetName = &h.Config.SESConfigurationSetName
	}

	if _, err := h.Mailer.SendEmail(ctx, input); err != nil {
		log.Error("Failed to send notification email", "error", err)
		return h.respond(http.StatusInternalServerError, response{Message: "Internal Server Error"}), nil
	}

	log.Info("Contact form submission successful")
	return h.respond(http.StatusOK, response{Message: "Message sent"}), nil
}

func redactEmail(email string) string {
	runes := []rune(email)
	if len(runes) > 3 {
		runes = runes[:3]
	}
	return string(runes) + "***"
}
