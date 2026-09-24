import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import styles from './AuthAtrium.module.scss'

/** Single-stroke paths for A U R O R A (viewBox 860×200). */
const LETTERS = [
  'M 24 172 L 72 32 L 120 172 L 98 112 L 46 112',
  'M 160 32 L 160 128 Q 160 172 206 172 Q 252 172 252 128 L 252 32',
  'M 292 172 L 292 32 L 350 32 Q 396 32 396 70 Q 396 108 350 108 L 292 108 L 348 108 L 396 172',
  'M 480 32 Q 536 32 536 102 Q 536 172 480 172 Q 424 172 424 102 Q 424 32 480 32',
  'M 576 172 L 576 32 L 634 32 Q 680 32 680 70 Q 680 108 634 108 L 576 108 L 632 108 L 680 172',
  'M 720 172 L 768 32 L 816 172 L 794 112 L 742 112',
]

const TRACE_SPEED = 72
const HOP_DURATION = 1.35

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function headingAt(path: SVGPathElement, at: number, length: number) {
  const point = path.getPointAtLength(at)
  const ahead = path.getPointAtLength(Math.min(length, at + 6))
  const back = path.getPointAtLength(Math.max(0, at - 6))
  const dx = ahead.x - point.x
  const dy = ahead.y - point.y
  if (dx * dx + dy * dy < 0.04) {
    return (Math.atan2(point.y - back.y, point.x - back.x) * 180) / Math.PI
  }
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

function lerpAngle(from: number, to: number, t: number) {
  const delta = ((to - from + 540) % 360) - 180
  return from + delta * t
}

function placeCar(node: SVGGElement, x: number, y: number, deg: number) {
  node.setAttribute('transform', `translate(${x} ${y}) rotate(${deg})`)
}

export function AuthAtrium() {
  const reduced = usePrefersReducedMotion()
  const paths = useRef<Array<SVGPathElement | null>>([])
  const car = useRef<SVGGElement>(null)
  const letter = useRef(0)
  const travelled = useRef(0)
  const hopping = useRef(false)
  const hopT = useRef(0)
  const hopFrom = useRef({ x: 0, y: 0, deg: 0 })
  const hopTo = useRef({ x: 0, y: 0, deg: 0 })

  useEffect(() => {
    if (reduced) return
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const node = car.current
      const path = paths.current[letter.current]
      if (!node || !path) {
        frame = window.requestAnimationFrame(step)
        return
      }

      if (hopping.current) {
        hopT.current = Math.min(1, hopT.current + dt / HOP_DURATION)
        const e = easeInOutCubic(hopT.current)
        const x = hopFrom.current.x + (hopTo.current.x - hopFrom.current.x) * e
        const y = hopFrom.current.y + (hopTo.current.y - hopFrom.current.y) * e - Math.sin(Math.PI * e) * 22
        const deg = lerpAngle(hopFrom.current.deg, hopTo.current.deg, e)
        placeCar(node, x, y, deg)
        if (hopT.current >= 1) {
          hopping.current = false
          travelled.current = 0
        }
        frame = window.requestAnimationFrame(step)
        return
      }

      const length = Math.max(path.getTotalLength(), 1)
      travelled.current += TRACE_SPEED * dt
      if (travelled.current >= length) {
        const next = (letter.current + 1) % LETTERS.length
        const nextPath = paths.current[next]
        const end = path.getPointAtLength(length)
        const deg = headingAt(path, length, length)
        if (nextPath) {
          const start = nextPath.getPointAtLength(0)
          hopFrom.current = { x: end.x, y: end.y, deg }
          hopTo.current = { x: start.x, y: start.y, deg: headingAt(nextPath, 0, nextPath.getTotalLength()) }
          hopT.current = 0
          hopping.current = true
          letter.current = next
          placeCar(node, end.x, end.y, deg)
        } else {
          letter.current = next
          travelled.current = 0
        }
        frame = window.requestAnimationFrame(step)
        return
      }

      const at = travelled.current
      const point = path.getPointAtLength(at)
      placeCar(node, point.x, point.y, headingAt(path, at, length))
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [reduced])

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.grid} />
      <div className={styles.orbit} />
      <div className={styles.orbitSlow} />
      <div className={styles.diamond} />
      <div className={styles.beam} />
      <div className={styles.stage}>
        <div className={styles.word}>
          <div className={styles.mark}>
            <span className={styles.wordmark}>AURORA</span>
            <svg className={styles.wordSvg} viewBox="0 0 860 200" preserveAspectRatio="xMidYMid meet">
              {LETTERS.map((d, i) => (
                <path
                  key={d}
                  ref={(el) => {
                    paths.current[i] = el
                  }}
                  d={d}
                  className={styles.letter}
                />
              ))}
              {!reduced && (
                <g ref={car} className={styles.carRide}>
                  <g transform="translate(-22 -8)">
                    <path d="M3 14h7l5-8h18l6 8h5v5H3z" fill="currentColor" />
                    <circle cx="13" cy="20" r="3.6" fill="#1e272e" />
                    <circle cx="37" cy="20" r="3.6" fill="#1e272e" />
                    <path d="M16 8h14l3 5H13z" fill="#f8f2d8" opacity="0.5" />
                  </g>
                </g>
              )}
            </svg>
          </div>
          <em className={styles.kicker}>STUDIO</em>
        </div>
      </div>
      <ul className={styles.stats}>
        <li>
          <strong>12</strong>
          <span>Line-up</span>
        </li>
        <li>
          <strong>8</strong>
          <span>Halls</span>
        </li>
        <li>
          <strong>3D</strong>
          <span>Floor</span>
        </li>
      </ul>
    </div>
  )
}
