package grafana

type GrafanaCurrentUser struct {
	ID             int    `json:"id"`
	Login          string `json:"login"`
	Email          string `json:"email"`
	Name           string `json:"name"`
	IsGrafanaAdmin bool   `json:"isGrafanaAdmin"`
	IsDisabled     bool   `json:"isDisabled"`
}

type GrafanaUser struct {
	ID            int      `json:"id"`
	UID           string   `json:"uid"`
	Name          string   `json:"name"`
	Login         string   `json:"login"`
	Email         string   `json:"email"`
	AvatarURL     string   `json:"avatarUrl"`
	IsAdmin       bool     `json:"isAdmin"`
	IsDisabled    bool     `json:"isDisabled"`
	IsProvisioned bool     `json:"isProvisioned"`
	LastSeenAt    string   `json:"lastSeenAt"`
	LastSeenAtAge string   `json:"lastSeenAtAge"`
	AuthLabels    []string `json:"authLabels"`
}

type GrafanaOrg struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type GrafanaOrgUser struct {
	OrgID  int    `json:"orgId"`
	UserID int    `json:"userId"`
	Login  string `json:"login"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}
