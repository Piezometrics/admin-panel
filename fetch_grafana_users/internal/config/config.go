package config

import (
	"fmt"
	"os"
)

type Config struct {
	GrafanaURL string
	Port       string
}

func Load() (*Config, error) {
	cfg := &Config{
		GrafanaURL: os.Getenv("GRAFANA_URL"),
		Port:       os.Getenv("PORT"),
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	// validation
	if cfg.GrafanaURL == "" {
		return nil, fmt.Errorf("GRAFANA_URL env var not set")
	}

	return cfg, nil
}
