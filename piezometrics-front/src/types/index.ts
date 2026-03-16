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

export interface AuthUser {
    id: number
    login: string
    email: string
    name: string
    isGrafanaAdmin: boolean
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

export interface Deposit {
    id: string
    name: string | null
    latitude: number
    longitude: number
    drillholeCount?: number
}

export interface Drillhole {
    drillhole_id: string
    name: string
    deposit_id: string
    model: string
    latitude: number
    longitude: number
    depth: number
    dip: number
    azimuth: number
    easting: number
    northing: number
    collar_elevation: number
}

export interface DepositPatch {
    name?: string | null
    latitude?: number
    longitude?: number
}

export interface DuplicateDepositConflict {
    message: string
    code: 'DUPLICATE_DEPOSIT_ID'
    deposit_id: string
    suggested_action: string
}

export interface DrillholePatch {
    name?: string
    model?: string
    latitude?: number
    longitude?: number
    depth?: number
    dip?: number
    azimuth?: number
    easting?: number
    northing?: number
    collar_elevation?: number
}

export interface CsvRowError {
    row: number
    field: string
    message: string
}

export interface CsvPreviewResponse {
    total_rows: number
    valid_rows: number
    invalid_rows: number
    rows: Drillhole[]
    errors: CsvRowError[]
}

export interface CsvImportResponse {
    total_rows: number
    imported_rows: number
    failed_rows: number
    errors: CsvRowError[]
}