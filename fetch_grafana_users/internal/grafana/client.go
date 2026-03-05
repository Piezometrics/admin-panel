package grafana

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"fetch_grafana_users/internal/config"
)

type Client struct {
	baseURL  string
	username string
	password string
	client   *http.Client
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		baseURL:  strings.TrimSuffix(cfg.GrafanaURL, "/"),
		username: cfg.GrafanaUser,
		password: cfg.GrafanaPassword,
		client:   &http.Client{},
	}
}

func (c *Client) ListUsers() ([]GrafanaUser, error) {
	req, err := http.NewRequest("GET", c.baseURL+"/api/users?perpage=1000", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.SetBasicAuth(c.username, c.password)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch users: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("grafana returned status: %d: %s", resp.StatusCode, string(body))
	}

	var users []GrafanaUser
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("failed to decode users: %w", err)
	}

	return users, nil
}

func (c *Client) GetUser(userID int) (*GrafanaUser, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/users/%d", c.baseURL, userID), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.SetBasicAuth(c.username, c.password)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("grafana returned status %d:%s", resp.StatusCode, string(body))
	}

	var user GrafanaUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, fmt.Errorf("failed to decode user: %w", err)
	}

	return &user, nil
}

func (c *Client) ListOrgs() ([]GrafanaOrg, error) {
	req, err := http.NewRequest("GET", c.baseURL+"/api/orgs", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.SetBasicAuth(c.username, c.password)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch orgs: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("grafana returned status %d:%s", resp.StatusCode, string(body))
	}

	var orgs []GrafanaOrg
	if err := json.NewDecoder(resp.Body).Decode(&orgs); err != nil {
		return nil, fmt.Errorf("failed to decode orgs: %w", err)
	}

	return orgs, nil
}

func (c *Client) ListOrgUsers(orgID int) ([]GrafanaOrgUser, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/orgs/%d/users", c.baseURL, orgID), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.SetBasicAuth(c.username, c.password)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch org users: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("grafana returned status %d: %s", resp.StatusCode, string(body))
	}

	var users []GrafanaOrgUser
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("failed to decode org users: %w", err)
	}

	return users, nil
}
