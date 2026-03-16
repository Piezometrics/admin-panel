import { ApiError, apiRequest } from './client'
import type { AuthUser, GrafanaOrg, GrafanaOrgUser, GrafanaUser } from '../types'

function normalizeAuthUser(raw: unknown): AuthUser {
    const data = (raw as { user?: AuthUser }).user ?? (raw as AuthUser)
    return {
        id: data.id,
        login: data.login,
        email: data.email,
        name: data.name || data.login,
        isGrafanaAdmin: Boolean(data.isGrafanaAdmin),
    }
}

export async function login(username: string, password: string): Promise<AuthUser> {
    const res = await apiRequest<unknown>('/auth/login', {
        service: 'grafana',
        method: 'POST',
        body: JSON.stringify({ username, password }),
    })
    return normalizeAuthUser(res)
}

export async function fetchMe(): Promise<AuthUser> {
    const res = await apiRequest<unknown>('/auth/me', { service: 'grafana' })
    return normalizeAuthUser(res)
}

export async function logout(): Promise<void> {
    await apiRequest('/auth/logout', { service: 'grafana', method: 'POST' })
}

export async function fetchUsers(): Promise<GrafanaUser[]> {
    return apiRequest('/users', { service: 'grafana' })
}

export async function fetchOrgs(): Promise<GrafanaOrg[]> {
    return apiRequest('/orgs', { service: 'grafana' })
}

export async function fetchOrgUsers(orgId: number): Promise<GrafanaOrgUser[]> {
    return apiRequest(`/orgs/${orgId}/users`, { service: 'grafana' })
}

export { ApiError }