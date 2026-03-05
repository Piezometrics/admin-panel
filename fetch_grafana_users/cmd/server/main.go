package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"fetch_grafana_users/internal/config"
	"fetch_grafana_users/internal/grafana"
	"fetch_grafana_users/internal/handler"
)

func main() {
	// Load .env if present (ignored in production where env vars are set directly)
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	grafanaClient := grafana.NewClient(cfg)
	h := handler.New(grafanaClient)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	// REPLACE IN PROD
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
	}))

	api := e.Group("/api")
	api.GET("/users", h.ListUsers)
	api.GET("/users/:id", h.GetUser)
	api.GET("/orgs", h.ListOrgs)
	api.GET("/orgs/:id/users", h.ListOrgUsers)

	log.Printf("starting server on :%s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
