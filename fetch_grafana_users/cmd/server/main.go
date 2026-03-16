package main

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"fetch_grafana_users/internal/auth"
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
	sessionStore := auth.NewStore(12 * time.Hour)
	h := handler.New(grafanaClient, sessionStore)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	// REPLACE IN PROD
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOriginFunc: func(origin string) (bool, error) {
			return origin == "http://localhost" || strings.HasPrefix(origin, "http://localhost:"), nil
		},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	api := e.Group("/api")

	api.POST("/auth/login", h.Login)

	secured := api.Group("", h.RequireAuth)
	secured.GET("/auth/me", h.Me)
	secured.POST("/auth/logout", h.Logout)

	secured.GET("/users", h.ListUsers)
	secured.GET("/users/:id", h.GetUser)
	secured.GET("/orgs", h.ListOrgs)
	secured.GET("/orgs/:id/users", h.ListOrgUsers)

	log.Printf("starting server on :%s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
