// Package config reads the runtime environment injected by UGOS and exposes
// well-known paths to the rest of the app.
//
// UGOS injects these env vars (see AGENTS.md §6.2):
//   - UGAPP_INSTALL_DIR: install root (read-only)
//   - UGAPP_DATA_DIR:    rw, default cwd
//   - UGAPP_CACHE_DIR:   rw
//   - UGAPP_LOG_DIR:     rw, stdout/stderr also lands here
//   - UGAPP_SHARED_DIR:  symlinks to user-authorised folders
// Plus any `parameters[].key` from project.yaml (e.g. LIBRARY_PATH).
//
// Outside UGOS (local dev), we fall back to ./data, ./cache, ./log so a Go
// developer can `go run` without setting any env var.
package config

import (
	"os"
	"path/filepath"
	"strings"
)

// Paths holds the resolved on-disk locations for the running process.
type Paths struct {
	Install      string
	Data         string
	Cache        string
	Log          string
	Shared       string
	LibraryRoots []string // user-configured library folders from LIBRARY_PATH
}

// Load reads UGAPP_* env vars, falling back to local dev defaults rooted at
// the current working directory. It returns a Paths with all directories
// guaranteed to exist (best-effort: mkdir errors are returned).
func Load() (Paths, error) {
	cwd, _ := os.Getwd()

	p := Paths{
		Install: env("UGAPP_INSTALL_DIR", cwd),
		Data:    env("UGAPP_DATA_DIR", filepath.Join(cwd, "data")),
		Cache:   env("UGAPP_CACHE_DIR", filepath.Join(cwd, "cache")),
		Log:     env("UGAPP_LOG_DIR", filepath.Join(cwd, "log")),
		Shared:  env("UGAPP_SHARED_DIR", filepath.Join(cwd, "shared")),
	}

	// LIBRARY_PATH is declared `multi: true` in project.yaml. The actual
	// joining char UGOS uses for multi-value path params is not documented
	// in our extracted docs — split on the OS path-list separator first,
	// then on ';' and ':' as a fallback. Empty entries are filtered.
	if raw := os.Getenv("LIBRARY_PATH"); raw != "" {
		p.LibraryRoots = splitPaths(raw)
	}

	for _, d := range []string{p.Data, p.Cache, p.Log} {
		if err := os.MkdirAll(d, 0o755); err != nil {
			return p, err
		}
	}
	return p, nil
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitPaths(raw string) []string {
	// UGOS doesn't document the join character for multi-value `path`
	// parameters. We assume it's the OS-native list separator
	// (`:` on Linux, `;` on Windows) — which is what every other tool we've
	// seen does. Splitting on `:` unconditionally is a non-starter on
	// Windows because absolute paths begin with `<drive>:`.
	parts := strings.Split(raw, string(os.PathListSeparator))
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
