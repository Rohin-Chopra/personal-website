package contact

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf8"
)

// Request is the JSON body the contact form posts.
type Request struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
	// Website is a honeypot: it is hidden from people, so only bots fill it in.
	Website        string `json:"website"`
	TurnstileToken string `json:"turnstileToken"`
}

// FieldError describes why a single field was rejected.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationError is returned when the request body is well-formed JSON but
// its fields are invalid.
type ValidationError struct {
	Fields []FieldError
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("invalid request: %d field error(s)", len(e.Fields))
}

// errMalformed means the body isn't JSON at all.
var errMalformed = errors.New("malformed JSON body")

// emailPattern mirrors the conservative address shape the web form accepts.
// It deliberately rejects quoted local parts, IP literals and anything with
// whitespace or CR/LF, since the address ends up in a Reply-To header.
var emailPattern = regexp.MustCompile(`^[A-Za-z0-9_'+\-.]*[A-Za-z0-9_+\-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$`)

func isEmail(s string) bool {
	if strings.HasPrefix(s, ".") || strings.Contains(s, "..") {
		return false
	}
	return emailPattern.MatchString(s)
}

type lengthRule struct {
	field    string
	value    *string
	min, max int
	required string
}

// ParseRequest decodes and validates a contact request. Strings are trimmed
// and the email is lower-cased before validation.
func ParseRequest(body []byte) (Request, error) {
	if len(strings.TrimSpace(string(body))) == 0 {
		body = []byte("{}")
	}

	var req Request
	if err := json.Unmarshal(body, &req); err != nil {
		var typeErr *json.UnmarshalTypeError
		if errors.As(err, &typeErr) {
			field := typeErr.Field
			msg := fmt.Sprintf("Expected %s", typeErr.Type.Kind())
			if field == "" {
				msg = "Expected an object"
			}
			return Request{}, &ValidationError{Fields: []FieldError{{Field: field, Message: msg}}}
		}
		return Request{}, errMalformed
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Message = strings.TrimSpace(req.Message)

	var fields []FieldError
	rules := []lengthRule{
		{"name", &req.Name, 1, 100, "Please enter a name"},
		{"email", &req.Email, 1, 255, "Please enter an email"},
		{"message", &req.Message, 1, 5000, "Please enter a message"},
		{"website", &req.Website, 0, 500, ""},
		{"turnstileToken", &req.TurnstileToken, 0, 2048, ""},
	}
	for _, r := range rules {
		n := utf8.RuneCountInString(*r.value)
		switch {
		case n < r.min:
			fields = append(fields, FieldError{Field: r.field, Message: r.required})
		case n > r.max:
			fields = append(fields, FieldError{Field: r.field, Message: fmt.Sprintf("Must be at most %d characters", r.max)})
		}
	}
	if req.Email != "" && !isEmail(req.Email) {
		fields = append(fields, FieldError{Field: "email", Message: "Please enter a valid email"})
	}

	if len(fields) > 0 {
		return Request{}, &ValidationError{Fields: fields}
	}
	return req, nil
}

var (
	angleBrackets = regexp.MustCompile(`[<>]`)
	jsProtocol    = regexp.MustCompile(`(?i)javascript:`)
	eventHandler  = regexp.MustCompile(`(?i)on\w+=`)
)

// Sanitize strips markup-ish content from free text before it is placed in
// the notification email. SES also HTML-escapes template values; this is a
// second layer.
func Sanitize(s string) string {
	s = angleBrackets.ReplaceAllString(s, "")
	s = jsProtocol.ReplaceAllString(s, "")
	return eventHandler.ReplaceAllString(s, "")
}
