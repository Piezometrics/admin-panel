package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// ListUsers GET /api/users
func (h *Handler) ListUsers(c echo.Context) error {
	users, err := h.grafana.ListUsers()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, users)
}

// GetUser GET /api/users/:id
func (h *Handler) GetUser(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user id"})
	}

	user, err := h.grafana.GetUser(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, user)
}

// ListOrgs GET /api/orgs
func (h *Handler) ListOrgs(c echo.Context) error {
	orgs, err := h.grafana.ListOrgs()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, orgs)
}

// ListOrgUsers GET /api/orgs/:id/users
func (h *Handler) ListOrgUsers(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid org id"})
	}

	users, err := h.grafana.ListOrgUsers(id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, users)
}
