package handler

import (
	"fetch_grafana_users/internal/auth"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

const sessionCookieName = "pz_admin_session"

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handler) Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "username and password are required"})
	}

	gc := h.grafana.WithCredentials(req.Username, req.Password)
	me, err := gc.GetCurrentUser()
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid credentials"})
	}

	if !me.IsGrafanaAdmin {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "admin access required"})
	}

	session := h.sessions.CreateSession(req.Username, req.Password, auth.User{
		ID:             me.ID,
		Login:          me.Login,
		Email:          me.Email,
		Name:           me.Name,
		IsGrafanaAdmin: me.IsGrafanaAdmin,
	})

	cookie := &http.Cookie{
		Name:     sessionCookieName,
		Value:    session.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(12 * time.Hour),
		MaxAge:   int((12 * time.Hour).Seconds()),
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]any{
		"user": session.User,
	})
}

func (h *Handler) Me(c echo.Context) error {
	session, ok := sessionFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}
	return c.JSON(http.StatusOK, map[string]any{
		"user": session.User,
	})
}

func (h *Handler) Logout(c echo.Context) error {
	session, ok := sessionFromContext(c)
	if ok {
		h.sessions.Delete(session.Token)
	}

	c.SetCookie(&http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	return c.JSON(http.StatusOK, map[string]string{"message": "logged out successfully"})
}

func (h *Handler) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie(sessionCookieName)
		if err != nil || cookie.Value == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		}

		session, ok := h.sessions.Get(cookie.Value)
		if !ok {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		}

		if !session.User.IsGrafanaAdmin {
			return c.JSON(http.StatusForbidden, map[string]string{"error": "admin access required"})
		}

		c.Set("session", session)
		return next(c)
	}
}

func sessionFromContext(c echo.Context) (auth.Session, bool) {
	v := c.Get("session")
	sess, ok := v.(auth.Session)
	return sess, ok
}
