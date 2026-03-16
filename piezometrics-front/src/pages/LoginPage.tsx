import { useState } from 'react'
import { Lock, UserRound } from 'lucide-react'
import { ApiError, login } from '../api/grafana'
import type { AuthUser } from '../types'

interface Props {
  onLoginSuccess: (user: AuthUser) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #D6DFEA',
  borderRadius: 10,
  padding: '11px 12px 11px 36px',
  fontSize: 14,
  color: '#111827',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
}

export function LoginPage({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(username.trim(), password)
      onLoginSuccess(user)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Invalid username or password.')
        } else if (err.status === 403) {
          setError('Access denied. Grafana admin role is required.')
        } else {
          setError(err.message || 'Login failed.')
        }
      } else {
        setError('Unexpected error during login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: 'linear-gradient(180deg, #F5F9FF 0%, #ECF3FE 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#FFFFFF',
        border: '1px solid #DEE6F2',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 20px 55px rgba(38, 64, 114, 0.12)',
      }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#12233D' }}>Piezometrics Admin</h1>
        <p style={{ margin: '8px 0 22px', fontSize: 13, color: '#5D6B82', lineHeight: 1.5 }}>
          Sign in with Grafana credentials. Only Grafana admins can access this panel.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: 5, fontSize: 12, color: '#364865', fontWeight: 600 }}>
              Username or Email
            </span>
            <div style={{ position: 'relative' }}>
              <UserRound size={15} color="#7F8EA8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                style={inputStyle}
              />
            </div>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: 5, fontSize: 12, color: '#364865', fontWeight: 600 }}>
              Password
            </span>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#7F8EA8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                style={inputStyle}
              />
            </div>
          </label>

          {error && (
            <div style={{
              marginTop: 2,
              borderRadius: 8,
              border: '1px solid #F7C8C8',
              background: '#FEF2F2',
              color: '#9B1C1C',
              padding: '8px 10px',
              fontSize: 12,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: loading ? '#95B8F5' : '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}