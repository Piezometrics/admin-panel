import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Search, Upload, Pencil, Trash2 } from 'lucide-react'
import { createDrillhole, deleteDrillhole, fetchDrillholes, patchDrillhole } from '../api/admin'
import { DrillholeModal } from '../components/DrillholeModal'
import { CSVImportModal } from '../components/CSVImportModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Pagination } from '../components/Pagination'
import { useCachedQuery } from '../hooks/useCachedQuery'
import { Th, TD } from '../components/TableHelpers'
import type { Drillhole, DrillholePatch } from '../types'

interface Props {
  depositId: string
  depositName: string
  onBack: () => void
}

const PAGE_SIZE = 10

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB',
  background: '#fff', cursor: 'pointer', color: '#6B7280',
}

export function DrillholesPage({ depositId, depositName, onBack }: Props) {
  const { data: drillholes = [], error, isLoading, refresh } = useCachedQuery(`admin:drillholes:${depositId}`, () => fetchDrillholes(depositId))
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ type: 'add' } | { type: 'edit'; drillhole: Drillhole } | null>(null)
  const [csvOpen, setCsvOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setPage(0)
  }, [depositId, search])

  const filteredDrillholes = drillholes.filter(drillhole => {
    if (!search.trim()) return true
    const query = search.trim().toLowerCase()
    return drillhole.name.toLowerCase().includes(query)
      || drillhole.drillhole_id.toLowerCase().includes(query)
      || drillhole.model.toLowerCase().includes(query)
  })

  const totalPages = Math.max(1, Math.ceil(filteredDrillholes.length / PAGE_SIZE))
  const pageDrillholes = filteredDrillholes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const deleteTarget = drillholes.find(d => d.drillhole_id === deleteId)

  async function handleSave(data: Drillhole) {
    setSaving(true)
    setSaveError(null)

    try {
      if (modal?.type === 'add') {
        await createDrillhole(data)
      } else if (modal?.type === 'edit') {
        const original = modal.drillhole
        const patch: DrillholePatch = {}

        if (original.name !== data.name) patch.name = data.name
        if (original.model !== data.model) patch.model = data.model
        if (original.depth !== data.depth) patch.depth = data.depth
        if (original.dip !== data.dip) patch.dip = data.dip
        if (original.azimuth !== data.azimuth) patch.azimuth = data.azimuth
        if (original.easting !== data.easting) patch.easting = data.easting
        if (original.northing !== data.northing) patch.northing = data.northing
        if (original.collar_elevation !== data.collar_elevation) patch.collar_elevation = data.collar_elevation

        const latitudeChanged = original.latitude !== data.latitude
        const longitudeChanged = original.longitude !== data.longitude
        if (latitudeChanged || longitudeChanged) {
          patch.latitude = data.latitude
          patch.longitude = data.longitude
        }

        if (Object.keys(patch).length > 0) {
          await patchDrillhole(original.drillhole_id, patch)
        }
      }

      setModal(null)
      await refresh()
    } catch (nextError) {
      setSaveError(nextError instanceof Error ? nextError.message : 'Не удалось сохранить скважину.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)

    try {
      await deleteDrillhole(id)
      setDeleteId(null)
      await refresh()
    } catch (nextError) {
      setDeleteError(nextError instanceof Error ? nextError.message : 'Не удалось удалить скважину.')
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', padding: 28,
      background: '#F8FAFC', overflow: 'hidden', minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B7280', fontSize: 13, padding: '0 0 8px', fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={14} /> Назад к месторождениям
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>{depositName}</h1>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B7280' }}>
              {filteredDrillholes.length} {filteredDrillholes.length === 1 ? 'скважина'
                : filteredDrillholes.length < 5 ? 'скважины' : 'скважин'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 10, top: 10 }} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Поиск по названию, ID или модели"
                style={{
                  width: 260,
                  padding: '9px 12px 9px 32px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={() => setCsvOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', background: '#fff', color: '#374151',
                border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              }}
            >
              <Upload size={14} />
              Импорт CSV
            </button>
            <button
              onClick={() => setModal({ type: 'add' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', background: '#2563EB', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              <Plus size={14} />
              Добавить скважину
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #F7C8C8', background: '#FEF2F2', color: '#9B1C1C', padding: '8px 10px', fontSize: 12 }}>
          {error}
        </div>
      )}

      {deleteError && (
        <div style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #F7C8C8', background: '#FEF2F2', color: '#9B1C1C', padding: '8px 10px', fontSize: 12 }}>
          {deleteError}
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
        <div style={{ flex: 1, overflow: 'auto', borderRadius: 10, border: '1px solid #E8ECF0', background: '#fff', minHeight: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8ECF0' }}>
                <Th>Название</Th>
                <Th>Широта</Th>
                <Th>Долгота</Th>
                <Th>Глубина (м)</Th>
                <Th>Наклон (°)</Th>
                <Th>Азимут (°)</Th>
                <Th>Модель</Th>
                <th style={{ padding: '10px 12px', width: 72, background: '#F9FAFB' }} />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} style={{ ...TD, textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>
                    Загрузка...
                  </td>
                </tr>
              )}
              {pageDrillholes.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ ...TD, textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>
                    Нет скважин. Нажмите «Добавить скважину» или импортируйте CSV.
                  </td>
                </tr>
              )}
              {pageDrillholes.map((d, i) => (
                <tr key={d.drillhole_id} style={{ borderBottom: i < pageDrillholes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ ...TD, fontWeight: 500 }}>{d.name}</td>
                  <td style={{ ...TD, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                    {d.latitude.toFixed(6)}
                  </td>
                  <td style={{ ...TD, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                    {d.longitude.toFixed(6)}
                  </td>
                  <td style={{ ...TD, fontVariantNumeric: 'tabular-nums' }}>{d.depth.toFixed(1)}</td>
                  <td style={{ ...TD, fontVariantNumeric: 'tabular-nums' }}>{d.dip}</td>
                  <td style={{ ...TD, fontVariantNumeric: 'tabular-nums' }}>{d.azimuth}</td>
                  <td style={TD}>
                    {d.model ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        fontSize: 12, fontWeight: 500, background: '#F3F4F6', color: '#374151',
                      }}>
                        {d.model}
                      </span>
                    ) : '–'}
                  </td>
                  <td style={{ ...TD, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      <button
                        onClick={() => setModal({ type: 'edit', drillhole: d })}
                        title="Редактировать"
                        style={iconBtn}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(d.drillhole_id)}
                        title="Удалить"
                        style={{ ...iconBtn, color: '#EF4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drillholes.length > PAGE_SIZE && (
          <div style={{ flexShrink: 0 }}>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={drillholes.length}
              onPage={setPage}
              itemLabel="скважин"
            />
          </div>
        )}
      </div>

      {modal && (
        <DrillholeModal
          drillhole={modal.type === 'edit' ? modal.drillhole : null}
          depositId={depositId}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
          errorMessage={saveError}
        />
      )}

      {csvOpen && (
        <CSVImportModal
          depositId={depositId}
          onImported={() => { void refresh() }}
          onClose={() => setCsvOpen(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message={`Удалить скважину «${deleteTarget?.name ?? deleteId}»? Это действие нельзя отменить.`}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
