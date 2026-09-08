const PREFIX = 'aurora.'

export const storageKey = (key: string) => `${PREFIX}${key}`

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(storageKey(key))
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    /* storage may be unavailable (private mode, quota) — fail silently */
  }
}

export function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(storageKey(key))
  } catch {
    /* noop */
  }
}
