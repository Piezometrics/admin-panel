package handler

import (
	"fetch_grafana_users/internal/auth"
	"fetch_grafana_users/internal/grafana"
)

type Handler struct {
	grafana  *grafana.Client
	sessions *auth.Store
}

func New(grafanaClient *grafana.Client, sessions *auth.Store) *Handler {
	return &Handler{
		grafana:  grafanaClient,
		sessions: sessions,
	}
}
