import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/** Expression states the guide avatar can take. */
export type AvatarMood = 'idle' | 'attentive' | 'shy' | 'happy' | 'thinking' | 'sad'

/** Where the avatar should look, in normalized viewport coordinates (-1..1). */
export interface AvatarFocus {
  x: number
  y: number
}

interface AvatarMoodContextValue {
  mood: AvatarMood
  focus: AvatarFocus | null
  setMood: (mood: AvatarMood) => void
  /** Point the avatar at a DOM element (e.g. the focused input). */
  lookAt: (element: HTMLElement | null) => void
}

const AvatarMoodContext = createContext<AvatarMoodContextValue | null>(null)

export function AvatarMoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<AvatarMood>('idle')
  const [focus, setFocus] = useState<AvatarFocus | null>(null)

  const lookAt = useCallback((element: HTMLElement | null) => {
    if (!element) {
      setFocus(null)
      return
    }
    const rect = element.getBoundingClientRect()
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 2 - 1
    setFocus({ x, y })
  }, [])

  const value = useMemo(() => ({ mood, focus, setMood, lookAt }), [mood, focus, lookAt])
  return <AvatarMoodContext.Provider value={value}>{children}</AvatarMoodContext.Provider>
}

export function useAvatarMood() {
  const ctx = useContext(AvatarMoodContext)
  if (!ctx) {
    // Outside the auth layout the avatar isn't present; provide inert handlers.
    return { mood: 'idle' as AvatarMood, focus: null, setMood: () => {}, lookAt: () => {} }
  }
  return ctx
}

/** Convenience handlers for inputs: look at the field on focus, relax on blur. */
export function useAvatarFieldHandlers(moodOnFocus: AvatarMood = 'attentive') {
  const { lookAt, setMood } = useAvatarMood()
  return {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      lookAt(e.currentTarget)
      setMood(moodOnFocus)
    },
    onBlur: () => {
      lookAt(null)
      setMood('idle')
    },
  }
}
