package main

import (
	"log"
	"net/http"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/config"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/db"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/ws"
)

func main() {
	cfg := config.Load()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer database.Close()

	hub := ws.NewHub()
	handler := ws.NewHandler(hub, database, cfg.JWTSecret)

	mux := http.NewServeMux()
	mux.HandleFunc("/ws/passenger", handler.ServePassenger)
	mux.HandleFunc("/ws/driver", handler.ServeDriver)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	log.Printf("go-tracking listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
		log.Fatalf("server: %v", err)
	}
}
