import { Settings, Mail, ChevronDown } from 'lucide-react'
import type { User, SortDir } from '../types'
import { RoleBadge } from './RoleBadge'
import { SortBtn, Th, TD } from './TableHelpers'

interface UsersTableProps {
  users: User[]
  sortCol: string | null
  sortDir: SortDir
  onSort: (col: string) => void
}

export function UsersTable({ users, sortCol, sortDir, onSort }: UsersTableProps) {
  return (
    <div style={{ flex: 1, overflow: 'auto', borderRadius: 10, border: '1px solid #E8ECF0', background: '#fff', minHeight: 0 }}>
      <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8ECF0' }}>
            <Th>
              Логин
              <SortBtn col="login" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            </Th>
            <Th>
              Эл. почта
              <SortBtn col="email" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            </Th>
            <Th>
              Имя
              <SortBtn col="name" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            </Th>
            <Th>
              Роль
              <ChevronDown size={12} style={{ marginLeft: 4, color: '#9CA3AF', verticalAlign: 'middle' }} />
            </Th>
            <Th isActive={sortCol === 'lastActive'}>
              Последняя активность
              <SortBtn col="lastActive" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            </Th>
            <th style={{ padding: '10px 12px', width: 36, background: '#F9FAFB' }}>
              <Settings size={14} color="#9CA3AF" />
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr
              key={u.id}
              style={{ borderBottom: i < users.length - 1 ? '1px solid #F3F4F6' : 'none' }}
            >
              <td style={TD}>{u.login}</td>
              <td style={{ ...TD, color: '#6B7280' }}>{u.email}</td>
              <td style={TD}>{u.name}</td>
              <td style={TD}>
                <RoleBadge role={u.role} />
              </td>
              <td style={TD}>
                {u.lastActive
                  ? u.lastActive
                  : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9CA3AF', fontSize: 13 }}>
                      <Mail size={13} />
                      Повторно отправить приглашение
                    </span>
                  )
                }
              </td>
              <td style={{ ...TD, textAlign: 'center' }}>
                <Settings size={14} color="#D1D5DB" style={{ cursor: 'pointer' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
