import { env } from '@/core/config/environment'
import { DEMO_PERSONAS } from '@/data/personas'
import type { Credentials, SignupPayload, User } from '@/models/user'
import { apiClient, ApiError } from './apiClient'

export interface AuthService {
  login(credentials: Credentials): Promise<User>
  signup(payload: SignupPayload): Promise<User>
  requestPasswordReset(email: string): Promise<{ code: string }>
  verifyResetCode(email: string, code: string): Promise<boolean>
  logout(): Promise<void>
}

export class AuthError extends Error {
  readonly field?: 'email' | 'password' | 'form'

  constructor(message: string, field?: 'email' | 'password' | 'form') {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const toUser = (persona: (typeof DEMO_PERSONAS)[number]): User => ({
  id: persona.id,
  name: persona.name,
  email: persona.email,
  role: persona.role,
  title: persona.title,
  avatarSeed: persona.avatarSeed,
  joinedAt: '2024-03-12T09:00:00.000Z',
  location: 'Copenhagen, DK',
})

export const demoAuthService: AuthService = {
  async login({ email, password }) {
    await wait(700)
    if (!EMAIL_RE.test(email)) throw new AuthError('Enter a valid email address.', 'email')
    const persona = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.trim().toLowerCase())
    if (persona) {
      if (persona.password !== password) throw new AuthError('Incorrect password for this demo account.', 'password')
      return toUser(persona)
    }
    if (password.length < 6) throw new AuthError('Password must be at least 6 characters.', 'password')
    return {
      id: `user-${email.toLowerCase()}`,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: 'customer',
      title: 'Customer',
      avatarSeed: 5,
      joinedAt: new Date().toISOString(),
      location: 'Remote',
    }
  },

  async signup(payload) {
    await wait(900)
    if (!EMAIL_RE.test(payload.email)) throw new AuthError('Enter a valid email address.', 'email')
    if (DEMO_PERSONAS.some((p) => p.email === payload.email.toLowerCase())) {
      throw new AuthError('This email is already used by a demo account. Try logging in.', 'email')
    }
    return {
      id: `user-${payload.email.toLowerCase()}`,
      name: payload.name.trim(),
      email: payload.email.trim(),
      role: 'customer',
      title: 'Customer',
      avatarSeed: 6,
      joinedAt: new Date().toISOString(),
      location: payload.country ?? 'Remote',
    }
  },

  async requestPasswordReset(email) {
    await wait(800)
    if (!EMAIL_RE.test(email)) throw new AuthError('Enter a valid email address.', 'email')
    return { code: '482910' }
  },

  async verifyResetCode(_email, code) {
    await wait(600)
    return code === '482910'
  },

  async logout() {
    await wait(200)
  },
}

interface AuthSession {
  user: User
  accessToken?: string
}

const mapAuthError = (error: unknown): never => {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') throw new AuthError('Incorrect email or password.', 'form')
    if (error.code === 'EMAIL_IN_USE') throw new AuthError('This email is already in use.', 'email')
    throw new AuthError(error.message, 'form')
  }
  throw error
}

export const httpAuthService: AuthService = {
  async login(credentials) {
    try {
      const result = await apiClient.request<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      if (result.data.accessToken) apiClient.setAccessToken(result.data.accessToken, Boolean(credentials.remember))
      return result.data.user
    } catch (error) {
      return mapAuthError(error)
    }
  },

  async signup(payload) {
    try {
      const result = await apiClient.request<AuthSession>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (result.data.accessToken) apiClient.setAccessToken(result.data.accessToken)
      return result.data.user
    } catch (error) {
      return mapAuthError(error)
    }
  },

  async requestPasswordReset(email) {
    const result = await apiClient.request<{ code?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return { code: result.data.code ?? '' }
  },

  async verifyResetCode(_email, code) {
    return code.trim().length >= 6
  },

  async logout() {
    try {
      await apiClient.request('/auth/logout', { method: 'POST' })
    } finally {
      apiClient.setAccessToken(null)
    }
  },
}

export const authService: AuthService = env.apiBaseUrl ? httpAuthService : demoAuthService
