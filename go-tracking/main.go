package main

import (
	"log"
	"net/http"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/config"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/db"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/navigation"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/ws"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env if present; ignore if the file is absent
	// (in production the env vars are provided directly).
	if err := godotenv.Load(); err != nil {
		log.Printf("no .env file loaded: %v", err)
	}

	cfg := config.Load()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer database.Close()

	hub := ws.NewHub(database)
	handler := ws.NewHandler(hub, database, cfg.JWTSecret)
	navigationHandler := navigation.NewHandler(cfg.OSRMBaseURL, cfg.NominatimBaseURL)

	mux := http.NewServeMux()
	mux.HandleFunc("/navigation/route", navigationHandler.ServeRoute)
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
