package contact

import (
	"errors"
	"strings"
	"testing"
)

func TestParseRequest(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		body       string
		want       Request
		wantFields []string
		malformed  bool
	}{
		{
			name: "valid request is trimmed and lower-cased",
			body: `{"name":"  Ada  ","email":" Ada@Example.COM ","message":" hi ","extra":1}`,
			want: Request{Name: "Ada", Email: "ada@example.com", Message: "hi"},
		},
		{
			name:       "empty body",
			body:       "",
			wantFields: []string{"name", "email", "message"},
		},
		{
			name:       "null body",
			body:       "null",
			wantFields: []string{"name", "email", "message"},
		},
		{
			name:       "whitespace-only fields",
			body:       `{"name":"   ","email":"a@b.co","message":"\n\t"}`,
			wantFields: []string{"name", "message"},
		},
		{
			name:       "invalid email",
			body:       `{"name":"A","email":"not-an-email","message":"m"}`,
			wantFields: []string{"email"},
		},
		{
			name:       "email with header injection",
			body:       `{"name":"A","email":"a@b.co\r\nBcc: x@y.co","message":"m"}`,
			wantFields: []string{"email"},
		},
		{
			name:       "too long",
			body:       `{"name":"` + strings.Repeat("a", 101) + `","email":"a@b.co","message":"` + strings.Repeat("m", 5001) + `"}`,
			wantFields: []string{"name", "message"},
		},
		{
			name:       "wrong type",
			body:       `{"name":123,"email":"a@b.co","message":"m"}`,
			wantFields: []string{"name"},
		},
		{
			name:       "array body",
			body:       `[]`,
			wantFields: []string{""},
		},
		{
			name:      "not JSON",
			body:      `{nope`,
			malformed: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ParseRequest([]byte(tt.body))

			if tt.malformed {
				if !errors.Is(err, errMalformed) {
					t.Fatalf("err = %v, want errMalformed", err)
				}
				return
			}

			if tt.wantFields != nil {
				var vErr *ValidationError
				if !errors.As(err, &vErr) {
					t.Fatalf("err = %v, want *ValidationError", err)
				}
				var fields []string
				for _, f := range vErr.Fields {
					fields = append(fields, f.Field)
				}
				if strings.Join(fields, ",") != strings.Join(tt.wantFields, ",") {
					t.Fatalf("fields = %v, want %v", fields, tt.wantFields)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tt.want {
				t.Fatalf("got %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestIsEmail(t *testing.T) {
	t.Parallel()

	valid := []string{"a@b.co", "first.last+tag@sub.example.com", "o'neil@example.ie", "x_y-z@ex-ample.org"}
	invalid := []string{"", "a@b", ".a@b.co", "a..b@c.co", "a.@b.co", "a b@c.co", "a@-b.co", "a@b.c", "\"a\"@b.co", "a@[127.0.0.1]"}

	for _, e := range valid {
		if !isEmail(e) {
			t.Errorf("isEmail(%q) = false, want true", e)
		}
	}
	for _, e := range invalid {
		if isEmail(e) {
			t.Errorf("isEmail(%q) = true, want false", e)
		}
	}
}

func TestSanitize(t *testing.T) {
	t.Parallel()

	tests := map[string]string{
		"<script>alert(1)</script>":     "scriptalert(1)/script",
		"JavaScript:alert(1)":           "alert(1)",
		`<img src=x OnError=alert(1)>`:  "img src=x alert(1)",
		"plain text, nothing to remove": "plain text, nothing to remove",
	}
	for in, want := range tests {
		if got := Sanitize(in); got != want {
			t.Errorf("Sanitize(%q) = %q, want %q", in, got, want)
		}
	}
}
