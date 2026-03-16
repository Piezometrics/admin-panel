import { useCallback, useRef, useState } from 'react'
import { AlertCircle, CheckCircle, FileText, Upload, X } from 'lucide-react'
import { ApiError } from '../api/client'
import { importDrillholeCsv, previewDrillholeCsv } from '../api/admin'
import type { CsvImportResponse, CsvPreviewResponse } from '../types'

interface Props {
  depositId: string
  onImported: () => void
  onClose: () => void
}

const previewCols = ['drillhole_id', 'name', 'latitude', 'longitude', 'depth', 'dip', 'azimuth', 'model'] as const

function groupErrors(errors: CsvPreviewResponse['errors'] | CsvImportResponse['errors']) {
  return errors.reduce<Record<number, { field: string; message: string }[]>>((acc, error) => {
    const row = acc[error.row] ?? []
    row.push({ field: error.field, message: error.message })
    acc[error.row] = row
    return acc
  }, {})
}

export function CSVImportModal({ depositId, onImported, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null)
  const [result, setResult] = useState<CsvImportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function processFile(nextFile: File) {
    setLoading(true)
    setErrorMessage(null)
    setFile(nextFile)

    try {
      const nextPreview = await previewDrillholeCsv(depositId, nextFile)
      setPreview(nextPreview)
      setStep(2)
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : 'Не удалось создать предпросмотр файла.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const nextFile = event.dataTransfer.files[0]
    if (nextFile && nextFile.name.toLowerCase().endsWith('.csv')) {
      void processFile(nextFile)
    }
  }, [depositId])

  async function handleImport() {
    if (!file) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const nextResult = await importDrillholeCsv(depositId, file)
      setResult(nextResult)
      setStep(3)
      onImported()
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : 'Не удалось импортировать файл.')
    } finally {
      setLoading(false)
    }
  }

  const previewErrors = groupErrors(preview?.errors ?? [])
  const importErrors = groupErrors(result?.errors ?? [])

  return (
    <div
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px 0',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14,
        width: step === 2 ? 860 : 520,
        maxWidth: '94vw', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid #E8ECF0', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Импорт CSV</h2>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              {[1, 2, 3].map(index => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step >= index ? '#2563EB' : '#E5E7EB',
                    color: step >= index ? '#fff' : '#9CA3AF',
                  }}>{index}</div>
                  <span style={{ fontSize: 11, color: step >= index ? '#2563EB' : '#9CA3AF' }}>
                    {index === 1 ? 'Загрузка' : index === 2 ? 'Предпросмотр' : 'Результат'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#6B7280', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {step === 1 && (
          <div style={{ padding: '24px', flex: 1 }}>
            <div
              onDragOver={event => { event.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#2563EB' : '#D1D5DB'}`,
                borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                background: dragging ? '#EFF6FF' : '#F9FAFB', transition: 'all 0.15s',
              }}
            >
              <Upload size={32} color={dragging ? '#2563EB' : '#9CA3AF'} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: dragging ? '#2563EB' : '#374151', marginBottom: 6 }}>
                Перетащите CSV-файл сюда
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>или нажмите для выбора файла</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={event => {
                const nextFile = event.target.files?.[0]
                if (nextFile) void processFile(nextFile)
              }}
            />
            {errorMessage && (
              <div style={{ marginTop: 16, borderRadius: 8, border: '1px solid #F7C8C8', background: '#FEF2F2', color: '#9B1C1C', padding: '8px 10px', fontSize: 12 }}>
                {errorMessage}
              </div>
            )}
            {loading && <div style={{ marginTop: 16, fontSize: 12, color: '#6B7280' }}>Формируем предпросмотр...</div>}
          </div>
        )}

        {step === 2 && preview && (
          <>
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #F3F4F6', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={14} color="#6B7280" />
              <span style={{ fontSize: 13, color: '#374151' }}>{file?.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                <span style={{ color: '#16A34A', fontWeight: 600 }}>{preview.valid_rows} корректных</span>
                {preview.invalid_rows > 0 && <span style={{ color: '#EF4444', fontWeight: 600, marginLeft: 8 }}>{preview.invalid_rows} с ошибками</span>}
              </span>
            </div>
            <div style={{ overflow: 'auto', flex: 1, minHeight: 0, padding: '16px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Строки</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8ECF0' }}>
                      {previewCols.map(column => (
                        <th key={column} style={{ padding: '8px 10px', textAlign: 'left', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.length === 0 && (
                      <tr>
                        <td colSpan={previewCols.length} style={{ padding: '14px 10px', color: '#9CA3AF', textAlign: 'center' }}>
                          Нет корректных строк.
                        </td>
                      </tr>
                    )}
                    {preview.rows.map(row => (
                      <tr key={row.drillhole_id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        {previewCols.map(column => (
                          <td key={column} style={{ padding: '7px 10px', color: '#111827', whiteSpace: 'nowrap' }}>
                            {String(row[column] ?? '–')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.errors.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Ошибки по строкам</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(previewErrors).map(([row, errors]) => (
                      <div key={row} style={{ borderRadius: 8, background: '#FFF5F5', border: '1px solid #FED7D7', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B91C1C', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          <AlertCircle size={13} />
                          Строка {row}
                        </div>
                        {errors.map((error, index) => (
                          <div key={`${row}-${index}`} style={{ fontSize: 12, color: '#7F1D1D' }}>
                            {error.field}: {error.message}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div style={{ marginTop: 16, borderRadius: 8, border: '1px solid #F7C8C8', background: '#FEF2F2', color: '#9B1C1C', padding: '8px 10px', fontSize: 12 }}>
                  {errorMessage}
                </div>
              )}
            </div>
            <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0, borderTop: '1px solid #F3F4F6' }}>
              <button onClick={() => { setStep(1); setPreview(null); setErrorMessage(null) }} disabled={loading} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                Назад
              </button>
              <button onClick={handleImport} disabled={loading || preview.valid_rows === 0} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: loading || preview.valid_rows === 0 ? '#93C5FD' : '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading || preview.valid_rows === 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Импортируем...' : `Импортировать (${preview.valid_rows})`}
              </button>
            </div>
          </>
        )}

        {step === 3 && result && (
          <div style={{ padding: '36px 24px', textAlign: 'center', flex: 1, overflow: 'auto' }}>
            <CheckCircle size={48} color="#16A34A" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Импорт завершён</div>
            <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
              <span style={{ color: '#16A34A', fontWeight: 600 }}>Загружено: {result.imported_rows}</span>
              <br />
              <span style={{ color: result.failed_rows > 0 ? '#EF4444' : '#6B7280', fontWeight: 600 }}>Ошибок: {result.failed_rows}</span>
            </div>
            {result.errors.length > 0 && (
              <div style={{ textAlign: 'left', maxWidth: 520, margin: '0 auto 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(importErrors).map(([row, errors]) => (
                  <div key={row} style={{ borderRadius: 8, background: '#FFF5F5', border: '1px solid #FED7D7', padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C', marginBottom: 4 }}>Строка {row}</div>
                    {errors.map((error, index) => (
                      <div key={`${row}-${index}`} style={{ fontSize: 12, color: '#7F1D1D' }}>
                        {error.field}: {error.message}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
