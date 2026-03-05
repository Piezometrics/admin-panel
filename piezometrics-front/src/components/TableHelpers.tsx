import React from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { SortDir } from '../types'

// ─── SortBtn ─────────────────────────────────────────────────────────────────

interface SortBtnProps {
  col: string
  sortCol: string | null
  sortDir: SortDir
  onSort: (col: string) => void
}

export function SortBtn({ col, sortCol, sortDir, onSort }: SortBtnProps) {
  const active = sortCol === col
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button onClick={() => onSort(col)} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      color: active ? '#2563EB' : '#9CA3AF', display: 'inline-flex',
      verticalAlign: 'middle', marginLeft: 4,
    }}>
      <Icon size={13} />
    </button>
  )
}

// ─── Th ──────────────────────────────────────────────────────────────────────

interface ThProps {
  children: React.ReactNode
  isActive?: boolean
}

export function Th({ children, isActive }: ThProps) {
  return (
    <th style={{
      padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600,
      color: isActive ? '#2563EB' : '#6B7280', whiteSpace: 'nowrap',
      userSelect: 'none',
    }}>
      {children}
    </th>
  )
}

// ─── TD style constant ────────────────────────────────────────────────────────

export const TD: React.CSSProperties = {
  padding: '11px 12px', fontSize: 13, color: '#111827', verticalAlign: 'middle',
}
