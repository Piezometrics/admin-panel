export class ApiError extends Error {
  status: number
  details: unknown

  constructor(status: number, message: string, details: unknown = null) {
    super(message)
    this.status = status
    this.details = details
    this.name = 'ApiError'
  }
}

type Service = 'grafana' | 'admin' | 'health'

const BASES: Record<Service, string> = {
  grafana: '/grafana-api',
  admin: '/api/v1',
  health: '/health',
}

interface RequestOptions extends RequestInit {
  service?: Service
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    service = 'admin',
    headers: initHeaders,
    credentials = 'include',
    body,
    ...init
  } = options

  const headers = new Headers(initHeaders)
  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASES[service]}${path}`, {
    ...init,
    body,
    headers,
    credentials,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) {
    const details = typeof payload === 'object' && payload
      ? payload as Record<string, unknown>
      : null
    const message = details
      ? details.error || details.message
      : payload
    throw new ApiError(res.status, typeof message === 'string' ? message : `Request failed with ${res.status}`, details)
  }

  return payload as T
}