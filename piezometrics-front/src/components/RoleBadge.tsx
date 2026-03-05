interface RoleBadgeProps {
  role: string
}

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  'Админ':         { bg: '#FEE2E2', color: '#991B1B' },
  'Участник':      { bg: '#ECFDF5', color: '#065F46' },
  'Администратор': { bg: '#FEE2E2', color: '#991B1B' },
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const s = ROLE_STYLES[role] ?? { bg: '#F3F4F6', color: '#374151' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 12, fontWeight: 500, background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {role}
    </span>
  )
}
