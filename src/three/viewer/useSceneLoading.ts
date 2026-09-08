import { useEffect, useState } from 'react'

export const LOADING_STAGES = ['Loading vehicle model…', 'Preparing materials…', 'Initializing studio…'] as const

/**
 * Progressive loading feedback for the 3D viewer. The procedural model has no
 * network assets, so this tracks renderer creation and shader warm-up while
 * surfacing meaningful stage labels instead of a bare spinner.
 */
export function useSceneLoading(rendererReady: boolean) {
  const [stage, setStage] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    if (stage < LOADING_STAGES.length - 1) {
      const t = window.setTimeout(() => setStage((s) => s + 1), 260)
      return () => window.clearTimeout(t)
    }
  }, [stage, done])

  useEffect(() => {
    if (rendererReady && stage >= LOADING_STAGES.length - 1) {
      const t = window.setTimeout(() => setDone(true), 180)
      return () => window.clearTimeout(t)
    }
  }, [rendererReady, stage])

  const progress = done ? 100 : Math.round(((stage + (rendererReady ? 0.6 : 0.2)) / LOADING_STAGES.length) * 100)
  return { stage: LOADING_STAGES[stage], progress, done }
}
