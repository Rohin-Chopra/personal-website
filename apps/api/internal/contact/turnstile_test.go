package contact

import (
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

func TestTurnstileVerifier(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		token   string
		status  int
		body    string
		want    bool
		wantErr bool
		called  bool
	}{
		{name: "success", token: "tok", status: 200, body: `{"success":true}`, want: true, called: true},
		{name: "rejected", token: "tok", status: 200, body: `{"success":false}`, want: false, called: true},
		{name: "non-200", token: "tok", status: 500, body: ``, want: false, called: true},
		{name: "garbage body", token: "tok", status: 200, body: `nope`, wantErr: true, called: true},
		{name: "missing token skips the call", token: "", want: false, called: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var called atomic.Bool
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				called.Store(true)
				if err := r.ParseForm(); err != nil {
					t.Error(err)
				}
				if r.PostForm.Get("secret") != "s3cret" || r.PostForm.Get("response") != tt.token || r.PostForm.Get("remoteip") != "198.51.100.1" {
					t.Errorf("unexpected form: %v", r.PostForm)
				}
				w.WriteHeader(tt.status)
				_, _ = w.Write([]byte(tt.body))
			}))
			defer srv.Close()

			v := NewTurnstileVerifier("s3cret")
			v.Endpoint = srv.URL

			got, err := v.Verify(t.Context(), tt.token, "198.51.100.1")
			if (err != nil) != tt.wantErr {
				t.Fatalf("err = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("got %v, want %v", got, tt.want)
			}
			if called.Load() != tt.called {
				t.Errorf("called = %v, want %v", called.Load(), tt.called)
			}
		})
	}
}
