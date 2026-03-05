package config

import (
	"fmt"
	"os"
)

type Config struct {
	GrafanaURL      string
	GrafanaUser     string
	GrafanaPassword string
	Port            string
}

func Load() (*Config, error) {
	cfg := &Config{
		GrafanaURL:      os.Getenv("GRAFANA_URL"),
		GrafanaUser:     os.Getenv("GRAFANA_USER"),
		GrafanaPassword: os.Getenv("GRAFANA_PASSWORD"),
		Port:            os.Getenv("PORT"),
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	// validation
	if cfg.GrafanaURL == "" {
		return nil, fmt.Errorf("GRAFANA_URL env var not set")
	}
	if cfg.GrafanaUser == "" {
		return nil, fmt.Errorf("GRAFANA_USER env var not set")
	}
	if cfg.GrafanaPassword == "" {
		return nil, fmt.Errorf("GRAFANA_PASSWORD env var not set")
	}

	return cfg, nil
}
