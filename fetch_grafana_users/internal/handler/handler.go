package handler

import (
	"fetch_grafana_users/internal/grafana"
)

type Handler struct {
	grafana *grafana.Client
}

func New(grafanaClient *grafana.Client) *Handler {
	return &Handler{
		grafana: grafanaClient,
	}
}
