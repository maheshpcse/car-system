import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/core/hooks/useLocalStorage'
import type { SavedBuild, ViewMode } from '@/models/vehicle'

export const MAX_COMPARE = 3

interface PreferencesContextValue {
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void

  compare: string[]
  isCompared: (id: string) => boolean
  toggleCompare: (id: string) => boolean
  clearCompare: () => void

  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  recentSearches: string[]
  addRecentSearch: (term: string) => void
  clearRecentSearches: () => void

  savedBuilds: SavedBuild[]
  saveBuild: (build: SavedBuild) => void
  removeBuild: (id: string) => void

  reducedEffects: boolean
  setReducedEffects: (value: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', [])
  const [compare, setCompare] = useLocalStorage<string[]>('compare', [])
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('viewMode', 'grid')
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>('sidebarCollapsed', false)
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recentSearches', [])
  const [savedBuilds, setSavedBuilds] = useLocalStorage<SavedBuild[]>('savedBuilds', [])
  const [reducedEffects, setReducedEffects] = useLocalStorage<boolean>('reducedEffects', false)

  const toggleFavorite = useCallback(
    (id: string) => setFavorites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])),
    [setFavorites],
  )

  const toggleCompare = useCallback(
    (id: string) => {
      let added = false
      setCompare((list) => {
        if (list.includes(id)) return list.filter((x) => x !== id)
        if (list.length >= MAX_COMPARE) return list
        added = true
        return [...list, id]
      })
      return added
    },
    [setCompare],
  )

  const addRecentSearch = useCallback(
    (term: string) => {
      const clean = term.trim()
      if (!clean) return
      setRecentSearches((list) => [clean, ...list.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6))
    },
    [setRecentSearches],
  )

  const saveBuild = useCallback(
    (build: SavedBuild) => setSavedBuilds((list) => [build, ...list.filter((b) => b.id !== build.id)]),
    [setSavedBuilds],
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      compare,
      isCompared: (id) => compare.includes(id),
      toggleCompare,
      clearCompare: () => setCompare([]),
      viewMode,
      setViewMode,
      sidebarCollapsed,
      setSidebarCollapsed,
      recentSearches,
      addRecentSearch,
      clearRecentSearches: () => setRecentSearches([]),
      savedBuilds,
      saveBuild,
      removeBuild: (id) => setSavedBuilds((list) => list.filter((b) => b.id !== id)),
      reducedEffects,
      setReducedEffects,
    }),
    [
      favorites,
      toggleFavorite,
      compare,
      toggleCompare,
      setCompare,
      viewMode,
      setViewMode,
      sidebarCollapsed,
      setSidebarCollapsed,
      recentSearches,
      addRecentSearch,
      setRecentSearches,
      savedBuilds,
      saveBuild,
      setSavedBuilds,
      reducedEffects,
      setReducedEffects,
    ],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
