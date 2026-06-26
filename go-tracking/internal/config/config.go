package config

import "os"

type Config struct {
	DatabaseURL      string
	JWTSecret        string
	JWTRefreshSecret string
	Port             string
}

func Load() *Config {
	return &Config{
		DatabaseURL:      getEnv("DIRECT_URL", getEnv("DATABASE_URL", "")),
		JWTSecret:        getEnv("JWT_SECRET", "NEXTHUS_NEOSYNK_SECRET"),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", "NEXTHUS_NEOSYNK_REFRESH_SECRET"),
		Port:             getEnv("PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
