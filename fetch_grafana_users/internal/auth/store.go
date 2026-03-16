package auth

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

type User struct {
	ID             int    `json:"id"`
	Login          string `json:"login"`
	Email          string `json:"email"`
	Name           string `json:"name"`
	IsGrafanaAdmin bool   `json:"isGrafanaAdmin"`
}

type Session struct {
	Token     string
	Username  string
	Password  string
	User      User
	ExpiresAt time.Time
}

type Store struct {
	mu       sync.RWMutex
	ttl      time.Duration
	sessions map[string]Session
}

func NewStore(ttl time.Duration) *Store {
	if ttl <= 0 {
		ttl = 12 * time.Hour
	}

	return &Store{
		ttl:      ttl,
		sessions: make(map[string]Session),
	}
}

func (s *Store) CreateSession(username, password string, user User) Session {
	token := randomToken(32)
	session := Session{
		Token:     token,
		Username:  username,
		Password:  password,
		User:      user,
		ExpiresAt: time.Now().Add(s.ttl),
	}

	s.mu.Lock()
	s.sessions[token] = session
	s.mu.Unlock()

	return session
}

func (s *Store) Get(token string) (Session, bool) {
	s.mu.RLock()
	session, ok := s.sessions[token]
	s.mu.RUnlock()

	if !ok {
		return Session{}, false
	}
	return session, true
}

func (s *Store) Delete(token string) {
	s.mu.Lock()
	delete(s.sessions, token)
	s.mu.Unlock()
}

func randomToken(size int) string {
	b := make([]byte, size)
	if _, err := rand.Read(b); err != nil {
		return ""
	}

	return hex.EncodeToString(b)
}
