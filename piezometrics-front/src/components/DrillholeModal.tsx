import { useState } from 'react'
import { X } from 'lucide-react'
import type { Drillhole } from '../types'

interface Props {
  drillhole: Drillhole | null   // null = add mode
  depositId: string
  onSave: (data: Drillhole) => void
  onClose: () => void
  saving?: boolean
  errorMessage?: string | null
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

type FormFields = {
  drillhole_id: string
  name: string
  latitude: string
  longitude: string
  depth: string
  dip: string
  azimuth: string
  easting: string
  northing: string
  collar_elevation: string
  model: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

function numField(val: number | undefined): string {
  return val !== undefined && !isNaN(val) ? String(val) : ''
}

export function DrillholeModal({ drillhole, depositId, onSave, onClose, saving = false, errorMessage }: Props) {
  const isEdit = drillhole !== null
  const [form, setForm] = useState<FormFields>({
    drillhole_id: drillhole?.drillhole_id ?? '',
    name: drillhole?.name ?? '',
    latitude: numField(drillhole?.latitude),
    longitude: numField(drillhole?.longitude),
    depth: numField(drillhole?.depth),
    dip: numField(drillhole?.dip),
    azimuth: numField(drillhole?.azimuth),
    easting: numField(drillhole?.easting),
    northing: numField(drillhole?.northing),
    collar_elevation: numField(drillhole?.collar_elevation),
    model: drillhole?.model ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function set(field: keyof FormFields, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validateNum(raw: string, _label: string, min?: number, max?: number): string | undefined {
    if (!raw.trim()) return 'Обязательное поле'
    const n = parseFloat(raw)
    if (isNaN(n)) return 'Введите число'
    if (min !== undefined && n < min) return `Минимум ${min}`
    if (max !== undefined && n > max) return `Максимум ${max}`
    return undefined
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!isEdit && !form.drillhole_id.trim()) e.drillhole_id = 'Обязательное поле'
    if (!form.name.trim()) e.name = 'Обязательное поле'
    e.latitude = validateNum(form.latitude, 'Широта', -90, 90)
    e.longitude = validateNum(form.longitude, 'Долгота', -180, 180)
    e.depth = validateNum(form.depth, 'Глубина', 0)
    e.dip = validateNum(form.dip, 'Наклон', -90, 90)
    e.azimuth = validateNum(form.azimuth, 'Азимут', 0, 360)
    // easting, northing, collar_elevation are optional
    const cleaned = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined)) as FormErrors
    setErrors(cleaned)
    return Object.keys(cleaned).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({
      drillhole_id: isEdit ? drillhole!.drillhole_id : form.drillhole_id.trim(),
      name: form.name.trim(),
      deposit_id: depositId,
      model: form.model.trim(),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      depth: parseFloat(form.depth),
      dip: parseFloat(form.dip),
      azimuth: parseFloat(form.azimuth),
      easting: form.easting ? parseFloat(form.easting) : 0,
      northing: form.northing ? parseFloat(form.northing) : 0,
      collar_elevation: form.collar_elevation ? parseFloat(form.collar_elevation) : 0,
    })
  }

  const col2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, overflowY: 'auto', padding: '20px 0',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: 520, maxWidth: '92vw',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        margin: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid #E8ECF0',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            {isEdit ? 'Редактировать скважину' : 'Новая скважина'}
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
          <div style={col2}>
            {!isEdit ? (
              <Field label="ID скважины" error={errors.drillhole_id}>
                <input
                  value={form.drillhole_id}
                  onChange={e => set('drillhole_id', e.target.value)}
                  placeholder="RAND001S"
                  style={{ ...INPUT, borderColor: errors.drillhole_id ? '#FCA5A5' : '#E5E7EB' }}
                />
              </Field>
            ) : (
              <Field label="ID скважины">
                <div style={{ ...INPUT, background: '#F9FAFB', color: '#9CA3AF' }}>{drillhole!.drillhole_id}</div>
              </Field>
            )}
            <Field label="Название" error={errors.name}>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Название"
                style={{ ...INPUT, borderColor: errors.name ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
          </div>

          <div style={col2}>
            <Field label="Широта (Latitude)" error={errors.latitude}>
              <input
                value={form.latitude}
                onChange={e => set('latitude', e.target.value)}
                placeholder="51.1234"
                style={{ ...INPUT, borderColor: errors.latitude ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
            <Field label="Долгота (Longitude)" error={errors.longitude}>
              <input
                value={form.longitude}
                onChange={e => set('longitude', e.target.value)}
                placeholder="71.4321"
                style={{ ...INPUT, borderColor: errors.longitude ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Глубина (м)" error={errors.depth}>
              <input
                value={form.depth}
                onChange={e => set('depth', e.target.value)}
                placeholder="120.5"
                style={{ ...INPUT, borderColor: errors.depth ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
            <Field label="Наклон (°)" error={errors.dip}>
              <input
                value={form.dip}
                onChange={e => set('dip', e.target.value)}
                placeholder="-75"
                style={{ ...INPUT, borderColor: errors.dip ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
            <Field label="Азимут (°)" error={errors.azimuth}>
              <input
                value={form.azimuth}
                onChange={e => set('azimuth', e.target.value)}
                placeholder="180"
                style={{ ...INPUT, borderColor: errors.azimuth ? '#FCA5A5' : '#E5E7EB' }}
              />
            </Field>
          </div>

          <div style={col2}>
            <Field label="Easting">
              <input
                value={form.easting}
                onChange={e => set('easting', e.target.value)}
                placeholder="123456.78"
                style={INPUT}
              />
            </Field>
            <Field label="Northing">
              <input
                value={form.northing}
                onChange={e => set('northing', e.target.value)}
                placeholder="654321.12"
                style={INPUT}
              />
            </Field>
          </div>

          <div style={col2}>
            <Field label="Collar Elevation (м)">
              <input
                value={form.collar_elevation}
                onChange={e => set('collar_elevation', e.target.value)}
                placeholder="320.5"
                style={INPUT}
              />
            </Field>
            <Field label="Модель датчика">
              <input
                value={form.model}
                onChange={e => set('model', e.target.value)}
                placeholder="RST-1000"
                style={INPUT}
              />
            </Field>
          </div>
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
        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
