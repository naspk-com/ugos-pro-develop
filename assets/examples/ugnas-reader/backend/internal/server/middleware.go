package server

import (
	"context"
	"net/http"
)

type ctxKey int

const (
	ctxKeyUser ctxKey = iota
)

// User is the authenticated principal as derived from UGOS gateway headers.
// In local dev (no gateway), ID is the literal "dev" so progress saving
// still works against a single bucket.
type User struct {
	ID   string
	Name string
	Type string // "admin" / "users" / "dev"
}

// withUser populates the request context with a User derived from Ugreen-User-*
// headers. If those headers are missing (direct loopback hit), we synthesise a
// "dev" user — handlers can rely on ctx always having a non-nil User.
func withUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		u := User{
			ID:   r.Header.Get("Ugreen-User-ID"),
			Name: r.Header.Get("Ugreen-User-Name"),
			Type: r.Header.Get("Ugreen-User-Type"),
		}
		if u.ID == "" {
			u = User{ID: "dev", Name: "dev", Type: "dev"}
		}
		ctx := context.WithValue(r.Context(), ctxKeyUser, u)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// currentUser returns the authenticated user attached by withUser. It is safe
// to call from any handler downstream of the middleware.
func currentUser(r *http.Request) User {
	u, _ := r.Context().Value(ctxKeyUser).(User)
	return u
}
