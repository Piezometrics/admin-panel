export type SortDir = 'asc' | 'desc' | null

export interface User {
  id: number
  login: string
  email: string
  name: string
  role: string
  lastActive: string | null
  isDisabled: boolean
}

export interface GrafanaUser {
    id: number
    uid: string
    name: string
    login: string
    email: string
    avatarUrl: string
    isAdmin: boolean
    isDisabled: boolean
    lastSeenAt: string
    lastSeenAtAge: string
    authLabels: string[]
}

export interface GrafanaOrg {
    id: number
    name: string
}

export interface GrafanaOrgUser {
    orgId: number
    userId: number
    login: string
    email: string
    role: 'Admin' | 'Editor' | 'Viewer'
}