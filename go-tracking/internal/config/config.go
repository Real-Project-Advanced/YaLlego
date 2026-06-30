package config

import "os"

type Config struct {
	DatabaseURL      string
	JWTSecret        string
	JWTRefreshSecret string
	Port             string
	OSRMBaseURL      string
	NominatimBaseURL string
}

func Load() *Config {
	return &Config{
		DatabaseURL:      getEnv("DIRECT_URL", getEnv("DATABASE_URL", "")),
		JWTSecret:        getEnv("JWT_SECRET", "NEXTHUS_NEOSYNK_SECRET"),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", "NEXTHUS_NEOSYNK_REFRESH_SECRET"),
		Port:             getEnv("PORT", "8080"),
		OSRMBaseURL:      getEnv("OSRM_BASE_URL", "https://router.project-osrm.org"),
		NominatimBaseURL: getEnv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
