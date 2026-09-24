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

export function AuthAtrium() {
  const reduced = usePrefersReducedMotion()
  const paths = useRef<Array<SVGPathElement | null>>([])
  const car = useRef<SVGGElement>(null)
  const letter = useRef(0)
  const travelled = useRef(0)

  useEffect(() => {
    if (reduced) return
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const path = paths.current[letter.current]
      const node = car.current
      if (path && node) {
        const length = path.getTotalLength()
        travelled.current += 165 * dt
        if (travelled.current >= length) {
          letter.current = (letter.current + 1) % LETTERS.length
          travelled.current = 0
        }
        const at = travelled.current
        const point = path.getPointAtLength(at)
        const ahead = path.getPointAtLength(Math.min(length, at + 3))
        const deg = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI
        node.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${deg})`)
      }
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
          <span>AURORA</span>
          <em>STUDIO</em>
        </div>
        <svg className={styles.wordSvg} viewBox="0 0 860 200">
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
