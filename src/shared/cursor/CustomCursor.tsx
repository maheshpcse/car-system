import { useEffect, useRef } from 'react'
import { useIsFinePointer, usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import styles from './CustomCursor.module.scss'

/**
 * Cursor variants are declared on DOM elements:
 *   data-cursor="link" | "orbit" | "drag" | "view" | "text" | "hidden"
 *   data-cursor-label="EXPLORE"   (optional contextual label)
 * Interactive elements (buttons, links, inputs) are detected automatically.
 */
export type CursorVariant = 'default' | 'link' | 'orbit' | 'drag' | 'view' | 'text' | 'hidden'

const INTERACTIVE = 'a, button, [role="button"], summary, select, [data-cursor]'
const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]'

export function CustomCursor() {
  const finePointer = useIsFinePointer()
  const reducedMotion = usePrefersReducedMotion()
  const { reducedEffects } = usePreferences()
  const enabled = finePointer && !reducedMotion && !reducedEffects

  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('custom-cursor-active')
      return
    }

    const ring = ringRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!ring || !dot || !label) return

    document.body.classList.add('custom-cursor-active')

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...target }
    let variant: CursorVariant = 'default'
    let pressed = false
    let visible = false
    let frame = 0

    const applyVariant = (next: CursorVariant, text: string) => {
      if (next !== variant) {
        variant = next
        ring.dataset.variant = next
      }
      if (label.textContent !== text) label.textContent = text
      ring.classList.toggle(styles.hasLabel, Boolean(text))
    }

    const resolve = (el: Element | null) => {
      if (!el) return applyVariant('default', '')
      const declared = el.closest<HTMLElement>('[data-cursor]')
      if (declared) {
        return applyVariant(
          (declared.dataset.cursor as CursorVariant) || 'link',
          declared.dataset.cursorLabel ?? '',
        )
      }
      if (el.closest(TEXT_INPUT)) return applyVariant('text', '')
      if (el.closest(INTERACTIVE)) return applyVariant('link', '')
      applyVariant('default', '')
    }

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!visible) {
        visible = true
        ringPos.x = target.x
        ringPos.y = target.y
        ring.style.opacity = '1'
        dot.style.opacity = '1'
      }
      resolve(e.target as Element | null)
    }
    const onDown = () => {
      pressed = true
      ring.dataset.pressed = 'true'
    }
    const onUp = () => {
      pressed = false
      delete ring.dataset.pressed
    }
    const onLeave = () => {
      visible = false
      ring.style.opacity = '0'
      dot.style.opacity = '0'
    }

    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18
      ringPos.y += (target.y - ringPos.y) * 0.18
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%) scale(${pressed ? 0.6 : 1})`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.body.classList.remove('custom-cursor-active')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className={styles.root} aria-hidden="true">
      <div ref={ringRef} className={styles.ring} data-variant="default">
        <span className={styles.orbit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 12a7 7 0 0 1 12-4.9" />
            <path d="M17 4v3.5h-3.5" />
            <path d="M19 12a7 7 0 0 1-12 4.9" />
            <path d="M7 20v-3.5h3.5" />
          </svg>
        </span>
        <span className={styles.drag}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3" />
          </svg>
        </span>
        <span ref={labelRef} className={styles.label} />
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  )
}
