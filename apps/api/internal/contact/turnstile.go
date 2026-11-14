package contact

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// TurnstileVerifyURL is Cloudflare's siteverify endpoint.
const TurnstileVerifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// Verifier checks that a submission came from a person.
type Verifier interface {
	Verify(ctx context.Context, token, remoteIP string) (bool, error)
}

// TurnstileVerifier verifies Cloudflare Turnstile tokens.
type TurnstileVerifier struct {
	Secret   string
	Endpoint string
	Client   *http.Client
}

// NewTurnstileVerifier returns a verifier with a 5 second timeout.
func NewTurnstileVerifier(secret string) *TurnstileVerifier {
	return &TurnstileVerifier{
		Secret:   secret,
		Endpoint: TurnstileVerifyURL,
		Client:   &http.Client{Timeout: 5 * time.Second},
	}
}

// Verify reports whether Cloudflare accepted the token. A missing token is
// never valid.
func (v *TurnstileVerifier) Verify(ctx context.Context, token, remoteIP string) (bool, error) {
	if token == "" {
		return false, nil
	}

	form := url.Values{"secret": {v.Secret}, "response": {token}}
	if remoteIP != "" {
		form.Set("remoteip", remoteIP)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, v.Endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return false, fmt.Errorf("build turnstile request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	res, err := v.Client.Do(req)
	if err != nil {
		return false, fmt.Errorf("call turnstile: %w", err)
	}
	defer func() { _ = res.Body.Close() }()

	if res.StatusCode != http.StatusOK {
		return false, nil
	}

	var result struct {
		Success bool `json:"success"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return false, fmt.Errorf("decode turnstile response: %w", err)
	}
	return result.Success, nil
}
