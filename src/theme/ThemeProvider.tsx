import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readStorage, removeStorage, writeStorage } from '@/core/utils/storage'

export type Theme = 'light' | 'dark'
export type ThemePreference = Theme | 'system'

interface ThemeContextValue {
  theme: Theme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'theme'

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

function readPreference(): ThemePreference {
  const stored = readStorage<string | null>(STORAGE_KEY, null)
  return stored === 'dark' || stored === 'light' ? stored : 'system'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [system, setSystem] = useState<Theme>(systemTheme)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(systemTheme())
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const theme: Theme = preference === 'system' ? system : preference

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.add('theme-transition')
    const timeout = window.setTimeout(() => root.classList.remove('theme-transition'), 500)
    return () => window.clearTimeout(timeout)
  }, [theme])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    if (next === 'system') removeStorage(STORAGE_KEY)
    else writeStorage(STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPreference])

  const value = useMemo(() => ({ theme, preference, setPreference, toggle }), [theme, preference, setPreference, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
