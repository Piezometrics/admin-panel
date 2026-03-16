import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  onPage: (p: number) => void
  itemLabel?: string
}

export function Pagination({ page, totalPages, totalItems, onPage, itemLabel = 'пользователей' }: PaginationProps) {
  const PAGE_SIZE = 10
  const from = page * PAGE_SIZE + 1
  const to = Math.min((page + 1) * PAGE_SIZE, totalItems)

  const range: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) range.push(i)
  } else {
    range.push(0)
    if (page > 2) range.push('…')
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) range.push(i)
    if (page < totalPages - 3) range.push('…')
    range.push(totalPages - 1)
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 12px', borderRadius: 7, border: '1px solid #E5E7EB',
    background: '#fff', fontSize: 13, fontFamily: 'inherit',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <span style={{ fontSize: 13, color: '#6B7280' }}>
        {totalItems === 0
          ? `Нет ${itemLabel}`
          : `${from}–${to} из ${totalItems} ${itemLabel}`}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={{ ...btnBase, cursor: page === 0 ? 'default' : 'pointer', color: page === 0 ? '#D1D5DB' : '#374151' }}
        >
          <ChevronLeft size={14} /> Назад
        </button>

        {range.map((item, idx) =>
          item === '…'
            ? <span key={`e${idx}`} style={{ fontSize: 13, color: '#9CA3AF', padding: '0 2px' }}>…</span>
            : <button
                key={item}
                onClick={() => onPage(item as number)}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: '1px solid',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  borderColor: page === item ? '#2563EB' : '#E5E7EB',
                  background:  page === item ? '#EFF6FF' : '#fff',
                  color:       page === item ? '#2563EB' : '#374151',
                  fontWeight:  page === item ? 600 : 400,
                }}
              >
                {(item as number) + 1}
              </button>
        )}

        <button
          onClick={() => onPage(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          style={{ ...btnBase, cursor: page === totalPages - 1 ? 'default' : 'pointer', color: page === totalPages - 1 ? '#D1D5DB' : '#374151' }}
        >
          Далее <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
