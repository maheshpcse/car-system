import { useSyncExternalStore } from 'react'

function subscribe(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }
}

export function useMediaQuery(query: string, serverFallback = false): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  )
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const useIsFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')
export const useIsMobile = () => useMediaQuery('(max-width: 819.98px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1079.98px)')
