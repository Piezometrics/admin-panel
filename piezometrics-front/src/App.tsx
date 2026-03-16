import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { InternalUsersPage } from './pages/InternalUsersPage'
import { DepositsPage } from './pages/DepositsPage'
import { DrillholesPage } from './pages/DrillholesPage'
import { fetchMe, logout } from './api/grafana'
import { LoginPage } from './pages/LoginPage'
import type { AuthUser } from './types'

type View =
  | { type: 'users' }
  | { type: 'deposits' }
  | { type: 'drillholes'; depositId: string; depositName: string }

function App() {
  const [view, setView] = useState<View>({ type: 'users' })
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    fetchMe()
      .then(user => {
        if (!user.isGrafanaAdmin) {
          setAuthUser(null)
          return
        }
        setAuthUser(user)
      })
      .catch(() => setAuthUser(null))
      .finally(() => setCheckingAuth(false))
  }, [])

  function handleNav(key: string) {
    if (key === 'users') setView({ type: 'users' })
    if (key === 'deposits') setView({ type: 'deposits' })
  }

  const activeNav = view.type === 'users' ? 'users' : 'deposits'

  async function handleLogout() {
    try {
      await logout()
    } finally {
      setAuthUser(null)
      setView({ type: 'users' })
    }
  }

  if (checkingAuth) {
    return (
      <div style={{
        height: '100vh', display: 'grid', placeItems: 'center',
        background: '#F8FAFC', color: '#4B5563',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Checking session...
      </div>
    )
  }

  if (!authUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setAuthUser(user)
          setView({ type: 'users' })
        }}
      />
    )
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <Sidebar active={activeNav} setActive={handleNav} user={authUser} onLogout={handleLogout} />
      {view.type === 'users' && <InternalUsersPage />}
      {view.type === 'deposits' && (
        <DepositsPage
          onSelectDeposit={(id, name) => setView({ type: 'drillholes', depositId: id, depositName: name })}
        />
      )}
      {view.type === 'drillholes' && (
        <DrillholesPage
          depositId={view.depositId}
          depositName={view.depositName}
          onBack={() => setView({ type: 'deposits' })}
        />
      )}
    </div>
  )
}

export default App
