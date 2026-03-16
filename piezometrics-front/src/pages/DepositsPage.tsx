import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { createDeposit, deleteDeposit, fetchDeposits, fetchDrillholes, patchDeposit } from '../api/admin'
import { ApiError } from '../api/client'
import { DepositModal } from '../components/DepositModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useCachedQuery } from '../hooks/useCachedQuery'
import { Th, TD } from '../components/TableHelpers'
import type { Deposit, DepositPatch, DuplicateDepositConflict } from '../types'

interface Props {
  onSelectDeposit: (id: string, name: string) => void
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB',
  background: '#fff', cursor: 'pointer', color: '#6B7280',
}

export function DepositsPage({ onSelectDeposit }: Props) {
  const { data: deposits = [], error, isLoading, refresh } = useCachedQuery('admin:deposits', fetchDeposits)
  const [drillholeCounts, setDrillholeCounts] = useState<Record<string, number>>({})
  const [modal, setModal] = useState<{ type: 'add' } | { type: 'edit'; deposit: Deposit } | null>(null)
  const [createConflict, setCreateConflict] = useState<DuplicateDepositConflict | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function closeDepositModal() {
    setModal(null)
    setCreateConflict(null)
    setSaveError(null)
  }

  function buildDepositPatch(original: Deposit, next: Deposit): DepositPatch {
    const patch: DepositPatch = {}
    const originalName = original.name ?? null
    const nextName = next.name ?? null

    if (originalName !== nextName) patch.name = nextName

    const latitudeChanged = original.latitude !== next.latitude
    const longitudeChanged = original.longitude !== next.longitude
    if (latitudeChanged || longitudeChanged) {
      patch.latitude = next.latitude
      patch.longitude = next.longitude
    }

    return patch
  }

  async function handleUpdateExisting(data: Deposit, conflictDepositId: string) {
    setSaving(true)
    setSaveError(null)

    try {
      const original = deposits.find(deposit => deposit.id === conflictDepositId)
      if (!original) {
        setSaveError('Не удалось найти месторождение для обновления.')
        return
      }

      const patch = buildDepositPatch(original, data)
      setCreateConflict(null)

      if (Object.keys(patch).length > 0) {
        await patchDeposit(conflictDepositId, patch)
        await refresh()
      }

      closeDepositModal()
    } catch (nextError) {
      setSaveError(nextError instanceof Error ? nextError.message : 'Не удалось сохранить месторождение.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      const pairs = await Promise.all(
        deposits.map(async deposit => {
          try {
            const drillholes = await fetchDrillholes(deposit.id)
            return [deposit.id, drillholes.length] as const
          } catch {
            return [deposit.id, 0] as const
          }
        }),
      )

      if (!cancelled) {
        setDrillholeCounts(Object.fromEntries(pairs))
      }
    }

    if (deposits.length > 0) {
      void loadCounts()
    } else {
      setDrillholeCounts({})
    }

    return () => {
      cancelled = true
    }
  }, [deposits])

  async function handleSave(data: Deposit) {
    setSaving(true)
    setSaveError(null)
    if (modal?.type === 'add') {
      setCreateConflict(null)
    }

    try {
      if (modal?.type === 'add') {
        await createDeposit(data)
      } else if (modal?.type === 'edit') {
        const original = modal.deposit
        const patch = buildDepositPatch(original, data)

        if (Object.keys(patch).length > 0) {
          await patchDeposit(original.id, patch)
        }
      }

      closeDepositModal()
      await refresh()
    } catch (nextError) {
      if (modal?.type === 'add' && nextError instanceof ApiError && nextError.status === 409) {
        const details = nextError.details as Record<string, unknown> | null
        if (details?.code === 'DUPLICATE_DEPOSIT_ID') {
          setCreateConflict({
            message: typeof details.error === 'string' ? details.error : nextError.message,
            code: 'DUPLICATE_DEPOSIT_ID',
            deposit_id: typeof details.deposit_id === 'string' ? details.deposit_id : data.id,
            suggested_action: typeof details.suggested_action === 'string' ? details.suggested_action : '',
          })
          return
        }
      }

      setSaveError(nextError instanceof Error ? nextError.message : 'Не удалось сохранить месторождение.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)

    try {
      await deleteDeposit(id)
      setDeleteId(null)
      await refresh()
    } catch (nextError) {
      setDeleteError(nextError instanceof Error ? nextError.message : 'Не удалось удалить месторождение.')
    }
  }

  const deleteTarget = deposits.find(d => d.id === deleteId)

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', padding: 28,
      background: '#F8FAFC', overflow: 'auto', minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Месторождения</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B7280' }}>
            {deposits.length} {deposits.length === 1 ? 'месторождение' : deposits.length < 5 ? 'месторождения' : 'месторождений'}
          </p>
        </div>
        <button
          onClick={() => {
            setCreateConflict(null)
            setSaveError(null)
            setModal({ type: 'add' })
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', background: '#2563EB', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          <Plus size={14} />
          Добавить месторождение
        </button>
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
      <div style={{ borderRadius: 10, border: '1px solid #E8ECF0', background: '#fff', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8ECF0' }}>
              <Th>Название</Th>
              <Th>Широта</Th>
              <Th>Долгота</Th>
              <Th>Скважин</Th>
              <th style={{ padding: '10px 12px', width: 72, background: '#F9FAFB' }} />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} style={{ ...TD, textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>
                  Загрузка...
                </td>
              </tr>
            )}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...TD, textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>
                  Нет месторождений. Нажмите «Добавить месторождение».
                </td>
              </tr>
            )}
            {deposits.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < deposits.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={TD}>
                  <button
                    onClick={() => onSelectDeposit(d.id, d.name ?? d.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#2563EB', fontSize: 13, fontWeight: 600,
                      padding: 0, fontFamily: 'inherit', textDecoration: 'none',
                    }}
                  >
                    {d.name ?? d.id}
                  </button>
                </td>
                <td style={{ ...TD, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                  {d.latitude.toFixed(6)}
                </td>
                <td style={{ ...TD, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                  {d.longitude.toFixed(6)}
                </td>
                <td style={TD}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', background: '#EFF6FF', color: '#2563EB',
                    borderRadius: 4, fontSize: 12, fontWeight: 600,
                  }}>
                    <MapPin size={11} />
                    {drillholeCounts[d.id] ?? '...'}
                  </span>
                </td>
                <td style={{ ...TD, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <button
                      onClick={() => setModal({ type: 'edit', deposit: d })}
                      title="Редактировать"
                      style={iconBtn}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(d.id)}
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

      {modal && (
        <DepositModal
          deposit={modal.type === 'edit' ? modal.deposit : null}
          onSave={handleSave}
          onClose={closeDepositModal}
          saving={saving}
          errorMessage={saveError}
          conflict={modal.type === 'add' ? createConflict : null}
          onUpdateExisting={handleUpdateExisting}
          onEditIdAndRetry={() => {
            setCreateConflict(null)
            setSaveError(null)
          }}
          onDiscardConflict={closeDepositModal}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message={`Удалить месторождение «${deleteTarget?.name ?? deleteId}»? Это действие нельзя отменить.`}
          confirmPhrase={deleteTarget?.name ?? deleteId ?? ''}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
