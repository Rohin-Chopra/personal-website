package contact

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
)

type fakeMailer struct {
	calls []*sesv2.SendEmailInput
	err   error
}

func (m *fakeMailer) SendEmail(_ context.Context, in *sesv2.SendEmailInput, _ ...func(*sesv2.Options)) (*sesv2.SendEmailOutput, error) {
	m.calls = append(m.calls, in)
	if m.err != nil {
		return nil, m.err
	}
	return &sesv2.SendEmailOutput{}, nil
}

type fakeVerifier struct {
	ok       bool
	err      error
	token    string
	remoteIP string
}

func (v *fakeVerifier) Verify(_ context.Context, token, remoteIP string) (bool, error) {
	v.token, v.remoteIP = token, remoteIP
	return v.ok, v.err
}

var testConfig = Config{
	AdminEmail:              "admin@example.com",
	NoReplyEmail:            "no-reply@example.com",
	NotifyTemplateName:      "contact-notify-template",
	SESConfigurationSetName: "personal-website-contact",
	AllowedOrigin:           "https://www.rohinchopra.com",
}

func newTestHandler(m Mailer, v Verifier) *Handler {
	h := &Handler{
		Config: testConfig,
		Mailer: m,
		Logger: slog.New(slog.NewJSONHandler(io.Discard, nil)),
	}
	if v != nil {
		h.Verifier = v
	}
	return h
}

func event(body string) events.APIGatewayProxyRequest {
	return events.APIGatewayProxyRequest{
		Body: body,
		RequestContext: events.APIGatewayProxyRequestContext{
			RequestID: "test-request-id",
			Identity:  events.APIGatewayRequestIdentity{SourceIP: "203.0.113.7"},
		},
	}
}

type body struct {
	Message string       `json:"message"`
	Errors  []FieldError `json:"errors"`
}

func decode(t *testing.T, res events.APIGatewayProxyResponse) body {
	t.Helper()
	var b body
	if err := json.Unmarshal([]byte(res.Body), &b); err != nil {
		t.Fatalf("response body is not JSON: %v", err)
	}
	return b
}

func assertCORS(t *testing.T, res events.APIGatewayProxyResponse) {
	t.Helper()
	if got := res.Headers["Access-Control-Allow-Origin"]; got != testConfig.AllowedOrigin {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, testConfig.AllowedOrigin)
	}
}

const validBody = `{"name":"Test User","email":"Test@Example.com","message":"Hello <b>there</b>"}`

func TestHandleSendsNotificationToAdminOnly(t *testing.T) {
	t.Parallel()
	mailer := &fakeMailer{}

	res, err := newTestHandler(mailer, nil).Handle(t.Context(), event(validBody))
	if err != nil {
		t.Fatal(err)
	}

	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want 200", res.StatusCode)
	}
	assertCORS(t, res)
	if got := decode(t, res).Message; got != "Message sent" {
		t.Errorf("message = %q", got)
	}

	if len(mailer.calls) != 1 {
		t.Fatalf("SendEmail called %d times, want 1", len(mailer.calls))
	}
	in := mailer.calls[0]
	if got := in.Destination.ToAddresses; len(got) != 1 || got[0] != testConfig.AdminEmail {
		t.Errorf("ToAddresses = %v, want only the admin", got)
	}
	if got := in.ReplyToAddresses; len(got) != 1 || got[0] != "test@example.com" {
		t.Errorf("ReplyToAddresses = %v", got)
	}
	if *in.FromEmailAddress != testConfig.NoReplyEmail {
		t.Errorf("From = %q", *in.FromEmailAddress)
	}
	if *in.ConfigurationSetName != testConfig.SESConfigurationSetName {
		t.Errorf("ConfigurationSetName = %q", *in.ConfigurationSetName)
	}
	if *in.Content.Template.TemplateName != testConfig.NotifyTemplateName {
		t.Errorf("TemplateName = %q", *in.Content.Template.TemplateName)
	}

	var data map[string]string
	if err := json.Unmarshal([]byte(*in.Content.Template.TemplateData), &data); err != nil {
		t.Fatal(err)
	}
	want := map[string]string{"NAME": "Test User", "EMAIL": "test@example.com", "MESSAGE": "Hello bthere/b"}
	for k, v := range want {
		if data[k] != v {
			t.Errorf("TemplateData[%s] = %q, want %q", k, data[k], v)
		}
	}
}

func TestHandleOmitsEmptyConfigurationSet(t *testing.T) {
	t.Parallel()
	mailer := &fakeMailer{}
	h := newTestHandler(mailer, nil)
	h.Config.SESConfigurationSetName = ""

	if _, err := h.Handle(t.Context(), event(validBody)); err != nil {
		t.Fatal(err)
	}
	if mailer.calls[0].ConfigurationSetName != nil {
		t.Error("ConfigurationSetName should be nil when unset")
	}
}

func TestHandleBase64Body(t *testing.T) {
	t.Parallel()
	mailer := &fakeMailer{}
	ev := event(base64.StdEncoding.EncodeToString([]byte(validBody)))
	ev.IsBase64Encoded = true

	res, _ := newTestHandler(mailer, nil).Handle(t.Context(), ev)
	if res.StatusCode != http.StatusOK || len(mailer.calls) != 1 {
		t.Fatalf("status = %d, calls = %d", res.StatusCode, len(mailer.calls))
	}
}

func TestHandleRejectsBadInput(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		body        string
		wantMessage string
		wantErrors  bool
	}{
		{"malformed JSON", "{oops", "Invalid request format", false},
		{"missing fields", "{}", "Invalid request", true},
		{"invalid email", `{"name":"A","email":"nope","message":"m"}`, "Invalid request", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			mailer := &fakeMailer{}

			res, _ := newTestHandler(mailer, nil).Handle(t.Context(), event(tt.body))

			if res.StatusCode != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400", res.StatusCode)
			}
			assertCORS(t, res)
			b := decode(t, res)
			if b.Message != tt.wantMessage {
				t.Errorf("message = %q, want %q", b.Message, tt.wantMessage)
			}
			if (len(b.Errors) > 0) != tt.wantErrors {
				t.Errorf("errors = %v, want present=%v", b.Errors, tt.wantErrors)
			}
			if len(mailer.calls) != 0 {
				t.Error("no email should be sent")
			}
		})
	}
}

func TestHandleHoneypotPretendsToSucceed(t *testing.T) {
	t.Parallel()
	mailer := &fakeMailer{}
	verifier := &fakeVerifier{ok: false}

	res, _ := newTestHandler(mailer, verifier).Handle(t.Context(),
		event(`{"name":"Bot","email":"bot@example.com","message":"spam","website":"http://spam"}`))

	if res.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want 200", res.StatusCode)
	}
	if len(mailer.calls) != 0 {
		t.Error("honeypot submissions must not send email")
	}
}

func TestHandleTurnstile(t *testing.T) {
	t.Parallel()

	t.Run("rejects failed verification", func(t *testing.T) {
		t.Parallel()
		mailer := &fakeMailer{}
		verifier := &fakeVerifier{ok: false}

		res, _ := newTestHandler(mailer, verifier).Handle(t.Context(), event(validBody))

		if res.StatusCode != http.StatusForbidden {
			t.Fatalf("status = %d, want 403", res.StatusCode)
		}
		assertCORS(t, res)
		if len(mailer.calls) != 0 {
			t.Error("no email should be sent")
		}
	})

	t.Run("rejects when verification errors", func(t *testing.T) {
		t.Parallel()
		mailer := &fakeMailer{}
		verifier := &fakeVerifier{ok: false, err: errors.New("timeout")}

		res, _ := newTestHandler(mailer, verifier).Handle(t.Context(), event(validBody))
		if res.StatusCode != http.StatusForbidden {
			t.Fatalf("status = %d, want 403", res.StatusCode)
		}
	})

	t.Run("passes token and source IP", func(t *testing.T) {
		t.Parallel()
		mailer := &fakeMailer{}
		verifier := &fakeVerifier{ok: true}

		res, _ := newTestHandler(mailer, verifier).Handle(t.Context(),
			event(`{"name":"A","email":"a@b.co","message":"m","turnstileToken":"tok"}`))

		if res.StatusCode != http.StatusOK {
			t.Fatalf("status = %d, want 200", res.StatusCode)
		}
		if verifier.token != "tok" || verifier.remoteIP != "203.0.113.7" {
			t.Errorf("verifier got token=%q ip=%q", verifier.token, verifier.remoteIP)
		}
	})
}

func TestHandleSESFailure(t *testing.T) {
	t.Parallel()
	mailer := &fakeMailer{err: errors.New("throttled")}

	res, err := newTestHandler(mailer, nil).Handle(t.Context(), event(validBody))
	if err != nil {
		t.Fatalf("Handle must not return errors, got %v", err)
	}
	if res.StatusCode != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", res.StatusCode)
	}
	assertCORS(t, res)
	if got := decode(t, res).Message; got != "Internal Server Error" {
		t.Errorf("message = %q, internal errors must not leak", got)
	}
}

func TestRedactEmail(t *testing.T) {
	t.Parallel()
	for in, want := range map[string]string{"alice@example.com": "ali***", "ab": "ab***", "éèêx@y.z": "éèê***"} {
		if got := redactEmail(in); got != want {
			t.Errorf("redactEmail(%q) = %q, want %q", in, got, want)
		}
	}
}
