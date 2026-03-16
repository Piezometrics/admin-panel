import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Deposit, DuplicateDepositConflict } from '../types'

interface Props {
  deposit: Deposit | null   // null = add mode
  onSave: (data: Deposit) => void
  onClose: () => void
  saving?: boolean
  errorMessage?: string | null
  conflict?: DuplicateDepositConflict | null
  onUpdateExisting?: (data: Deposit, depositId: string) => void
  onEditIdAndRetry?: () => void
  onDiscardConflict?: () => void
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

export function DepositModal({
  deposit,
  onSave,
  onClose,
  saving = false,
  errorMessage,
  conflict = null,
  onUpdateExisting,
  onEditIdAndRetry,
  onDiscardConflict,
}: Props) {
  const isEdit = deposit !== null
  const showCreateConflict = !isEdit && Boolean(conflict)
  const idInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    id: deposit?.id ?? '',
    name: deposit?.name ?? '',
    latitude: deposit?.latitude?.toString() ?? '',
    longitude: deposit?.longitude?.toString() ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<'id' | 'name' | 'latitude' | 'longitude', string>>>({})

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function toFormDeposit(): Deposit {
    return {
      id: isEdit ? deposit!.id : form.id.trim(),
      name: form.name.trim() || null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      drillholeCount: deposit?.drillholeCount,
    }
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!isEdit && !form.id.trim()) e.id = 'Обязательное поле'
    if (!form.name.trim()) e.name = 'Обязательное поле'
    const lat = parseFloat(form.latitude)
    const lon = parseFloat(form.longitude)
    if (!form.latitude.trim()) e.latitude = 'Обязательное поле'
    else if (isNaN(lat) || lat < -90 || lat > 90) e.latitude = 'Значение от −90 до 90'
    if (!form.longitude.trim()) e.longitude = 'Обязательное поле'
    else if (isNaN(lon) || lon < -180 || lon > 180) e.longitude = 'Значение от −180 до 180'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(toFormDeposit())
  }

  function handleUpdateExisting() {
    if (!conflict || !onUpdateExisting) return
    if (!validate()) return
    onUpdateExisting(toFormDeposit(), conflict.deposit_id)
  }

  function handleEditIdAndRetry() {
    if (isEdit) return
    onEditIdAndRetry?.()
    idInputRef.current?.focus()
    idInputRef.current?.select()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: showCreateConflict ? 620 : 440, maxWidth: '94vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid #E8ECF0',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            {isEdit ? 'Редактировать месторождение' : 'Новое месторождение'}
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
          {!isEdit && (
            <Field label="ID" error={errors.id}>
              <input
                ref={idInputRef}
                value={form.id}
                onChange={e => set('id', e.target.value)}
                placeholder="Напр. RAND"
                style={{ ...INPUT, borderColor: errors.id ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
          )}
          {isEdit && (
            <Field label="ID">
              <div style={{ ...INPUT, background: '#F9FAFB', color: '#9CA3AF' }}>{deposit!.id}</div>
            </Field>
          )}
          <Field label="Название" error={errors.name}>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Название месторождения"
              style={{ ...INPUT, borderColor: errors.name ? '#FCA5A5' : '#E5E7EB' }}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Широта" error={errors.latitude}>
              <input
                value={form.latitude}
                onChange={e => set('latitude', e.target.value)}
                placeholder="51.1234"
                style={{ ...INPUT, borderColor: errors.latitude ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
            <Field label="Долгота" error={errors.longitude}>
              <input
                value={form.longitude}
                onChange={e => set('longitude', e.target.value)}
                placeholder="71.4321"
                style={{ ...INPUT, borderColor: errors.longitude ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
          </div>
          {showCreateConflict && conflict && (
            <div style={{
              borderRadius: 8,
              border: '1px solid #FDE68A',
              background: '#FFFBEB',
              color: '#92400E',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Конфликт ID</div>
              <div style={{ fontSize: 12, lineHeight: 1.45 }}>{conflict.message}</div>
              {conflict.suggested_action && (
                <div style={{ fontSize: 12, lineHeight: 1.45 }}>
                  Подсказка: {conflict.suggested_action}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#7C5E10' }}>Выберите действие:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleUpdateExisting}
                  disabled={saving}
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: 'none',
                    background: saving ? '#93C5FD' : '#2563EB', color: '#fff',
                    fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                >
                  Обновить существующее месторождение
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleEditIdAndRetry}
                    disabled={saving}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
                      background: '#fff', color: '#374151',
                      fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Изменить ID
                  </button>
                  <button
                    type="button"
                    onClick={onDiscardConflict}
                    disabled={saving}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: '1px solid #FCA5A5',
                      background: '#FEF2F2', color: '#B91C1C',
                      fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
          {errorMessage && (
            <div style={{
              borderRadius: 8,
              border: '1px solid #F7C8C8',
              background: '#FEF2F2',
              color: '#9B1C1C',
              padding: '8px 10px',
              fontSize: 12,
            }}>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px 20px',
          display: 'flex', gap: 8, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} disabled={saving} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#374151',
          }}>
            Отмена
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: saving ? '#93C5FD' : '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
          }}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
