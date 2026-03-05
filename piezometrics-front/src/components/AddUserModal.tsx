import { useState } from 'react'
import { X } from 'lucide-react'
import { type GrafanaOrg } from '../types'

interface NewUser {
  name: string
  email: string
  login: string
  password: string
  role: 'Admin' | 'Editor'
  orgId: number | ''
}

const INPUT: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #E5E7EB', fontSize: 13, color: '#111827',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff',
}

const ERR: React.CSSProperties = { fontSize: 11, color: '#EF4444', marginTop: 3 }

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
      {error && <div style={ERR}>{error}</div>}
    </div>
  )
}

interface Props {
  orgs: GrafanaOrg[]
  onClose: () => void
}

export function AddUserModal({ orgs, onClose }: Props) {
  const [form, setForm] = useState<NewUser>({
    name: '', email: '', login: '', password: '', role: 'Editor', orgId: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof NewUser, string>>>({})

  function set<K extends keyof NewUser>(field: K, value: NewUser[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof NewUser, string>> = {}
    if (!form.name.trim()) e.name = 'Обязательное поле'
    if (!form.email.trim()) e.email = 'Обязательное поле'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Некорректный email'
    if (!form.login.trim()) e.login = 'Обязательное поле'
    if (!form.password) e.password = 'Обязательное поле'
    else if (form.password.length < 8) e.password = 'Минимум 8 символов'
    if (form.orgId === '') e.orgId = 'Выберите организацию'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    // TODO: POST /api/users when backend supports it
    console.log('New user payload:', form)
    onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 0.15s ease',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: 460, maxWidth: '90vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid #E8ECF0',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Новый пользователь
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: 6, color: '#6B7280', display: 'flex',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Имя" error={errors.name}>
            <input style={INPUT} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="Иван Иванов" />
          </Field>
          <Field label="Email" error={errors.email}>
            <input style={INPUT} type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="user@example.com" />
          </Field>
          <Field label="Логин" error={errors.login}>
            <input style={INPUT} value={form.login}
              onChange={e => set('login', e.target.value)} placeholder="ivan.ivanov" />
          </Field>
          <Field label="Пароль" error={errors.password}>
            <input style={INPUT} type="password" value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="Минимум 8 символов" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Роль" error={errors.role}>
              <select style={INPUT} value={form.role}
                onChange={e => set('role', e.target.value as NewUser['role'])}>
                <option value="Admin">Админ</option>
                <option value="Editor">Участник</option>
              </select>
            </Field>
            <Field label="Организация" error={errors.orgId}>
              <select style={INPUT} value={form.orgId}
                onChange={e => set('orgId', Number(e.target.value))}>
                <option value="">Выберите...</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10,
          borderTop: '1px solid #E8ECF0',
        }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: 'inherit',
          }}>
            Отмена
          </button>
          <button onClick={handleSubmit} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#2563EB', cursor: 'pointer', fontSize: 13, color: '#fff',
            fontFamily: 'inherit', fontWeight: 600,
          }}>
            Создать
          </button>
        </div>
      </div>
    </div>
  )
}
