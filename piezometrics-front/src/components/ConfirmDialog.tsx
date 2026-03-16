import React from 'react'

interface Props {
  title?: string
  message: string
  confirmLabel?: string
  confirmDanger?: boolean
  /** When provided, user must type this exact string to enable the confirm button */
  confirmPhrase?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title = 'Подтверждение',
  message,
  confirmLabel = 'Удалить',
  confirmDanger = true,
  confirmPhrase,
  onConfirm,
  onCancel,
}: Props) {
  const [typed, setTyped] = React.useState('')
  const confirmed = !confirmPhrase || typed === confirmPhrase
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px',
        width: 400, maxWidth: '90vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
          {message}
        </p>
        {confirmPhrase && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6B7280' }}>
              Для подтверждения введите <span style={{ fontWeight: 700, color: '#111827' }}>«{confirmPhrase}»</span>
            </p>
            <input
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder={confirmPhrase}
              autoFocus
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 7, boxSizing: 'border-box',
                border: `1px solid ${typed && !confirmed ? '#FCA5A5' : '#E5E7EB'}`,
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '7px 16px', borderRadius: 7, border: '1px solid #E5E7EB',
              background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#374151',
            }}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            style={{
              padding: '7px 16px', borderRadius: 7, border: 'none',
              background: confirmed ? (confirmDanger ? '#EF4444' : '#2563EB') : '#D1D5DB',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: confirmed ? 'pointer' : 'default', fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
