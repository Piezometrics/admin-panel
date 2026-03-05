import { useState, useEffect } from 'react'
import { User as UserIcon, Search, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { type GrafanaOrgUser, type GrafanaUser, type GrafanaOrg, type SortDir, type User } from '../types'
import { UsersTable } from '../components/UsersTable'
import { Pagination } from '../components/Pagination'
import { fetchOrgs, fetchOrgUsers, fetchUsers } from '../api/grafana'
import { AddUserModal } from '../components/AddUserModal'

export function InternalUsersPage() {
  const PAGE_SIZE = 10
  const ALL_TAB = 'Все Пользователи'
  const ALL_FILTER = 'Все'
  const FILTERS = ['Все', 'Админ', 'Участник']
  const STATUS_OPTIONS = ['Все', 'Активен', 'Отключён'] as const
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Все')
  const [showAddUser, setShowAddUser] = useState(false)

  useEffect(() => {
    fetchUsers()
      .then((data: GrafanaUser[]) => {
        setUsers(data.map(u => ({
          id: u.id,
          login: u.login,
          email: u.email,
          name: u.name || u.login,
          role: u.isAdmin ? 'Админ' : 'Участник',
          lastActive: u.lastSeenAtAge == '10 years' ? null : u.lastSeenAtAge,
          isDisabled: u.isDisabled,
        })))
      })
  }, [])

  const [orgUsers, setOrgUsers] = useState<Record<number, GrafanaOrgUser[]>>({})
  const [orgs, setOrgs] = useState<GrafanaOrg[]>([])

  useEffect(() => {
    fetchOrgs()
      .then((data: GrafanaOrg[]) => {
        setOrgs(data.map(o => ({ id: o.id, name: o.name })))
      })
  }, [])

  useEffect(() => {
    orgs.forEach(org => {
      fetchOrgUsers(org.id)
        .then((data: GrafanaOrgUser[]) => {
          setOrgUsers(prev => ({ ...prev, [org.id]: data }))
        })
    })
  }, [orgs])
  const tabs = [ALL_TAB, ...orgs.map(o => o.name)]
  const [activeTab, setActiveTab] = useState(ALL_TAB)
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER)
  const [sortCol, setSortCol] = useState<string | null>('lastActive')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const filteredUsers = users.filter(u => {
    // search
    if (search) {
      const q = search.toLowerCase()
      if (!u.login.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !u.name.toLowerCase().includes(q)) return false
    }
    // status
    if (statusFilter === 'Активен' && u.isDisabled) return false
    if (statusFilter === 'Отключён' && !u.isDisabled) return false
    // tab + role
    if (activeTab === ALL_TAB) {
      if (activeFilter === ALL_FILTER) return true
      if (activeFilter === 'Админ') return u.role === 'Админ'
      if (activeFilter === 'Участник') return u.role === 'Участник'
      return true
    }
    const orgId = orgs.find(o => o.name === activeTab)?.id
    if (!orgId) return false
    const members = orgUsers[orgId] ?? []
    const member = members.find(m => m.login === u.login)
    if (!member) return false
    if (activeFilter === ALL_FILTER) return true
    const orgRole = member.role === 'Admin' ? 'Админ' : 'Участник'
    if (activeFilter === 'Админ') return orgRole === 'Админ'
    if (activeFilter === 'Участник') return orgRole === 'Участник'
    return true
  }).map(u => {
    // compute effective role based on activeTab
    let effectiveRole = u.role
    if (activeTab !== ALL_TAB) {
      const orgId = orgs.find(o => o.name === activeTab)?.id
      if (orgId) {
        const members = orgUsers[orgId] ?? []
        const member = members.find(m => m.login === u.login)
        if (member) {
          effectiveRole = member.role === 'Admin' ? 'Админ' : 'Участник'
        }
      }
    }
    return { ...u, role: effectiveRole }
  }).sort((a, b) => {
    if (!sortCol) return 0
    const aVal = (a as any)[sortCol]
    const bVal = (b as any)[sortCol]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const cmp = aVal.localeCompare(bVal, 'ru', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    }
    return 0
  })

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE)
  const paged = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => { setPage(0) }, [activeTab, activeFilter])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'inherit', overflow: 'hidden', minWidth: 0 }}>

      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px 14px', background: '#fff', borderBottom: '1px solid #E8ECF0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserIcon size={18} color="#374151" />
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Админ-панель</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#F9FAFB', border: '1px solid #E5E7EB',
            borderRadius: 8, padding: '7px 14px', width: 480,
          }}>
            <Search size={16} color="#9CA3AF" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, email или логину"
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontSize: 13, color: '#374151', width: '100%', fontFamily: 'inherit',
              }}
            />
          </label>
          <button onClick={() => setShowAddUser(true)} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#2563EB', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(37,99,235,0.4)',
          }}>
            <Plus size={16} color="#fff" />
          </button>
        </div>
      </div>

      {/* Tabs row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', background: '#fff', borderBottom: '1px solid #E8ECF0',
      }}>
        <div style={{ display: 'flex' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 18px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? '#2563EB' : '#6B7280',
                borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
                fontFamily: 'inherit', marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Предыдущая сессия: вчера</span>
      </div>

      {/* Filter row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 28px', background: '#fff', borderBottom: '1px solid #E8ECF0',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '6px 14px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13,
                fontWeight: activeFilter === f ? 600 : 400,
                color: activeFilter === f ? '#2563EB' : '#6B7280',
                borderBottom: activeFilter === f ? '2px solid #2563EB' : '2px solid transparent',
                fontFamily: 'inherit',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowFilters(f => !f)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 7,
          background: showFilters || statusFilter !== 'Все' ? '#EFF6FF' : '#fff',
          cursor: 'pointer', fontSize: 13,
          color: showFilters || statusFilter !== 'Все' ? '#2563EB' : '#374151',
          fontFamily: 'inherit', transition: 'all 0.15s ease',
        }}>
          <SlidersHorizontal size={13} />
          Фильтры
          {statusFilter !== 'Все' && (
            <span style={{
              background: '#2563EB', color: '#fff', borderRadius: '50%',
              width: 16, height: 16, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, fontWeight: 700,
            }}>1</span>
          )}
          <ChevronDown size={12} style={{
            transform: showFilters ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }} />
        </button>
      </div>

      {/* Slide-out filter panel */}
      {showFilters && (
        <div style={{
          padding: '14px 28px 16px', background: '#F9FAFB',
          borderBottom: '1px solid #E8ECF0',
          display: 'flex', gap: 32,
          animation: 'slideDown 0.18s ease',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', marginBottom: 8 }}>СТАТУС</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  border: statusFilter === s ? 'none' : '1px solid #E5E7EB',
                  background: statusFilter === s ? '#2563EB' : '#fff',
                  color: statusFilter === s ? '#fff' : '#374151',
                  fontFamily: 'inherit', fontWeight: statusFilter === s ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table + pagination */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 28px 20px', gap: 12, minHeight: 0 }}>
        <UsersTable
          users={paged}
          sortCol={sortCol}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          onPage={setPage}
        />
      </div>

      {showAddUser && <AddUserModal orgs={orgs} onClose={() => setShowAddUser(false)} />}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
