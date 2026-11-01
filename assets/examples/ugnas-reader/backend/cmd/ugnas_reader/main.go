// Command ugnas_reader is the HTTP backend for the UGOS Pro Reader app.
//
// It is launched by UGOS as: bin/ugnas_reader --port=<port>
// UGOS routes /api/* (per project.yaml proxy_path) to this server and injects
// Ugreen-User-* headers. The process must shut down within 10s of SIGTERM.
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/leafvmaple/ugnas-reader/internal/config"
	"github.com/leafvmaple/ugnas-reader/internal/server"
	"github.com/leafvmaple/ugnas-reader/internal/store"
)

// Version is the application version. Overridden via -ldflags at release time.
var Version = "0.1.0-dev"

func main() {
	port := flag.Int("port", 21010, "HTTP listen port")
	flag.Parse()

	logger := log.New(os.Stdout, "[ugnas-reader] ", log.LstdFlags|log.Lmicroseconds)
	logger.Printf("starting ugnas-reader %s on port %d", Version, *port)

	paths, err := config.Load()
	if err != nil {
		logger.Fatalf("config.Load: %v", err)
	}
	logger.Printf("data=%s cache=%s log=%s shared=%s", paths.Data, paths.Cache, paths.Log, paths.Shared)
	if len(paths.LibraryRoots) > 0 {
		logger.Printf("LIBRARY_PATH roots (from env): %v", paths.LibraryRoots)
	}

	st, err := store.Open(paths.Data)
	if err != nil {
		logger.Fatalf("store.Open: %v", err)
	}
	defer func() { _ = st.Close() }()

	// On first boot, seed library_folders from LIBRARY_PATH so the user
	// doesn't have to re-add what they configured in the UGOS app settings.
	// Duplicate entries are idempotent.
	for _, root := range paths.LibraryRoots {
		if _, err := st.AddFolder(context.Background(), root); err != nil {
			// ErrFolderExists is fine; log other errors but don't abort.
			logger.Printf("seed folder %s: %v", root, err)
		}
	}

	srv := server.New(server.Config{
		Port:    *port,
		Version: Version,
		Logger:  logger,
		Store:   st,
	})

	errCh := make(chan error, 1)
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			errCh <- err
		}
	}()

	// UGOS sends SIGTERM on stop and SIGKILLs after 10s. Be conservative: 8s grace.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errCh:
		logger.Fatalf("http server crashed: %v", err)
	case sig := <-stop:
		logger.Printf("received %s, shutting down", sig)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		logger.Printf("graceful shutdown failed: %v", err)
		os.Exit(1)
	}
	logger.Printf("bye")
}
