import { env } from '@/core/config/environment'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface SuccessEnvelope<T> {
  success: true
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalItems?: number
    totalPages: number
  }
}

const TOKEN_KEY = 'accessToken'

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const apiClient = {
  enabled: Boolean(env.apiBaseUrl),

  getAccessToken: readToken,

  setAccessToken(token: string | null, persist = false) {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_KEY)
      if (token) (persist ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
    } catch {
      /* ignore quota / private mode */
    }
  },

  async request<T>(path: string, init: RequestInit = {}, retry = true): Promise<SuccessEnvelope<T>> {
    if (!env.apiBaseUrl) {
      throw new ApiError('API base URL is not configured', 0, 'API_DISABLED')
    }
    const headers = new Headers(init.headers)
    if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
    const token = readToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    let response: Response
    try {
      response = await fetch(`${env.apiBaseUrl.replace(/\/$/, '')}${path}`, {
        ...init,
        headers,
        credentials: 'include',
        signal: init.signal ?? controller.signal,
      })
    } catch (error) {
      throw new ApiError(error instanceof Error ? error.message : 'Network error', 0, 'NETWORK')
    } finally {
      window.clearTimeout(timeout)
    }

    if (response.status === 401 && retry && !path.startsWith('/auth/')) {
      const refreshed = await this.refresh()
      if (refreshed) return this.request<T>(path, init, false)
    }

    const payload = (await response.json().catch(() => null)) as
      | SuccessEnvelope<T>
      | { success: false; error?: { message?: string; code?: string } }
      | null

    if (!response.ok || !payload || payload.success !== true) {
      const errorPayload = payload && 'error' in payload ? payload.error : undefined
      throw new ApiError(errorPayload?.message ?? `Request failed (${response.status})`, response.status, errorPayload?.code)
    }
    return payload
  },

  async refresh() {
    try {
      const result = await this.request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }, false)
      this.setAccessToken(result.data.accessToken)
      return true
    } catch {
      this.setAccessToken(null)
      return false
    }
  },
}
