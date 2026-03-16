import { Settings, ChevronDown, ArrowLeft, LogOut, User, Layers } from 'lucide-react'
import type { AuthUser } from '../types'

const NAV_ITEMS = [
  { key: 'users', label: 'Пользователи', icon: User },
  { key: 'deposits', label: 'Месторождения', icon: Layers },
]

interface SidebarProps {
  active: string
  setActive: (s: string) => void
  user: AuthUser
  onLogout: () => void
}

export function Sidebar({ active, setActive, user, onLogout }: SidebarProps) {
  return (
    <div style={{
      width: 250, minHeight: '100vh', background: '#0E2149',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      fontFamily: 'inherit',
    }}>
      {/* User info */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {user.name || user.login}
            <ChevronDown size={12} />
          </div>
          <Settings size={14} color="rgba(255,255,255,0.5)" />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.1 }}>
          {user.email}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '9px 10px', borderRadius: 8,
                background: isActive ? '#1E3A6E' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: isActive ? 600 : 400, textAlign: 'left',
                marginBottom: 2, fontFamily: 'inherit',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div style={{ padding: '12px 8px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { label: 'Вернуться на портал', icon: ArrowLeft },
          { label: 'Мой профиль', icon: null },
        ].map(({ label, icon: Icon }) => (
          <button key={label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: '100%', padding: '7px 10px', background: 'transparent',
            border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            fontSize: 12, textAlign: 'left', fontFamily: 'inherit', marginBottom: 1,
          }}>
            {Icon && <Icon size={12} />}
            {label}
          </button>
        ))}
        <button
          onClick={onLogout}
          style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '7px 10px', background: 'transparent',
          border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          fontSize: 12, textAlign: 'left', fontFamily: 'inherit', marginTop: 4,
        }}>
          <LogOut size={12} />
          Выход
        </button>
      </div>
    </div>
  )
}
