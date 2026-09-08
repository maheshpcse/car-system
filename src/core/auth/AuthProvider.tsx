import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Credentials, SignupPayload, User } from '@/models/user'
import { authService } from '@/services/authService'
import { readStorage, removeStorage, writeStorage } from '@/core/utils/storage'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: Credentials) => Promise<User>
  signup: (payload: SignupPayload) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (patch: Partial<Pick<User, 'name' | 'location' | 'title'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const SESSION_KEY = 'session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStorage<User | null>(SESSION_KEY, null))

  const persist = useCallback((next: User | null) => {
    setUser(next)
    if (next) writeStorage(SESSION_KEY, next)
    else removeStorage(SESSION_KEY)
  }, [])

  const login = useCallback(
    async (credentials: Credentials) => {
      const result = await authService.login(credentials)
      persist(result)
      return result
    },
    [persist],
  )

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const result = await authService.signup(payload)
      persist(result)
      return result
    },
    [persist],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    persist(null)
  }, [persist])

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, 'name' | 'location' | 'title'>>) => {
      setUser((current) => {
        if (!current) return current
        const next = { ...current, ...patch }
        writeStorage(SESSION_KEY, next)
        return next
      })
    },
    [],
  )

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, signup, logout, updateProfile }),
    [user, login, signup, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
