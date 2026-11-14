// Command contact is the contact form Lambda (provided.al2023 runtime).
package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"

	"github.com/Rohin-Chopra/personal-website/apps/api/internal/contact"
)

const defaultAllowedOrigin = "https://www.rohinchopra.com"

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	handler, err := newHandler(context.Background(), logger)
	if err != nil {
		logger.Error("Failed to initialise handler", "error", err)
		os.Exit(1)
	}

	lambda.Start(handler.Handle)
}

func newHandler(ctx context.Context, logger *slog.Logger) (*contact.Handler, error) {
	cfg := contact.Config{
		AdminEmail:              os.Getenv("ADMIN_EMAIL"),
		NoReplyEmail:            os.Getenv("NO_REPLY_EMAIL"),
		NotifyTemplateName:      os.Getenv("NOTIFY_EMAIL_TEMPLATE_NAME"),
		SESConfigurationSetName: os.Getenv("SES_CONFIGURATION_SET_NAME"),
		AllowedOrigin:           os.Getenv("ALLOWED_ORIGIN"),
	}
	if cfg.AllowedOrigin == "" {
		cfg.AllowedOrigin = defaultAllowedOrigin
	}
	for name, value := range map[string]string{
		"ADMIN_EMAIL":                cfg.AdminEmail,
		"NO_REPLY_EMAIL":             cfg.NoReplyEmail,
		"NOTIFY_EMAIL_TEMPLATE_NAME": cfg.NotifyTemplateName,
	} {
		if value == "" {
			return nil, fmt.Errorf("%s is required", name)
		}
	}

	awsCfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("load AWS config: %w", err)
	}

	h := &contact.Handler{
		Config: cfg,
		Mailer: sesv2.NewFromConfig(awsCfg),
		Logger: logger,
	}
	if secret := os.Getenv("TURNSTILE_SECRET_KEY"); secret != "" {
		h.Verifier = contact.NewTurnstileVerifier(secret)
	}
	return h, nil
}
