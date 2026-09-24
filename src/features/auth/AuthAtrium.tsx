import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import styles from './AuthAtrium.module.scss'

/** Continuous stroke paths for A U R O R A in a 860×200 viewBox. */
const LETTERS = [
  'M 22 176 L 70 28 L 118 176 L 94 108 L 46 108',
  'M 158 28 L 158 132 Q 158 176 204 176 Q 250 176 250 132 L 250 28',
  'M 290 176 L 290 28 L 348 28 Q 392 28 392 68 Q 392 108 348 108 L 290 108 L 344 108 L 392 176',
  'M 478 28 Q 534 28 534 102 Q 534 176 478 176 Q 422 176 422 102 Q 422 28 478 28',
  'M 574 176 L 574 28 L 632 28 Q 676 28 676 68 Q 676 108 632 108 L 574 108 L 628 108 L 676 176',
  'M 716 176 L 764 28 L 812 176 L 788 108 L 740 108',
]

const LETTER_MS = 2800

export function AuthAtrium() {
  const reduced = usePrefersReducedMotion()
  const [letter, setLetter] = useState(0)

  useEffect(() => {
    if (reduced) return
    const timer = window.setTimeout(() => setLetter((n) => (n + 1) % LETTERS.length), LETTER_MS)
    return () => window.clearTimeout(timer)
  }, [letter, reduced])

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.grid} />
      <div className={styles.stage}>
        <svg className={styles.wordSvg} viewBox="0 0 860 200">
          {LETTERS.map((d, i) => (
            <path key={d} d={d} className={i === letter && !reduced ? styles.letterActive : styles.letter} />
          ))}
          {!reduced && (
            <g key={letter} className={styles.carRide}>
              <g transform="translate(-24 -10)">
                <path d="M4 16h7l5-8h20l6 8h6v5H4z" fill="currentColor" />
                <circle cx="14" cy="21" r="4" fill="#1e272e" />
                <circle cx="40" cy="21" r="4" fill="#1e272e" />
                <path d="M17 9h16l3 6H14z" fill="#f8f2d8" opacity="0.5" />
              </g>
              <animateMotion dur="2.8s" rotate="auto" fill="freeze" path={LETTERS[letter]} />
            </g>
          )}
        </svg>
        <em className={styles.kicker}>STUDIO</em>
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
