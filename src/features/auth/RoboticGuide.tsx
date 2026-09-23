import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import type { AvatarFocus, AvatarMood } from './avatarMood'
import styles from './RoboticGuide.module.scss'

interface RoboticGuideProps {
  mood: AvatarMood
  focus: AvatarFocus | null
}

const MOUTH: Record<AvatarMood, string> = {
  idle: 'M72 108h16',
  attentive: 'M70 106h20',
  shy: 'M74 110q8 4 16 0',
  happy: 'M70 106q10 10 20 0',
  thinking: 'M78 108h10',
  sad: 'M70 112q10-8 20 0',
}

export function RoboticGuide({ mood, focus }: RoboticGuideProps) {
  const reduced = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = root.current
    if (!node || reduced) return
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      node.style.setProperty('--look-x', x.toFixed(3))
      node.style.setProperty('--look-y', y.toFixed(3))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  useEffect(() => {
    const node = root.current
    if (!node) return
    if (focus) {
      node.style.setProperty('--look-x', focus.x.toFixed(3))
      node.style.setProperty('--look-y', focus.y.toFixed(3))
    }
  }, [focus])

  return (
    <div ref={root} className={styles.root} data-mood={mood} data-reduced={reduced || undefined} aria-hidden="true">
      <div className={styles.stage}>
        <div className={styles.figure}>
          <svg className={styles.svg} viewBox="0 0 160 280" role="presentation">
            <g className={styles.legs}>
              <path d="M68 168v78" />
              <path d="M92 168v78" />
              <path d="M58 248h22" />
              <path d="M80 248h22" />
            </g>
            <g className={styles.torso}>
              <rect x="54" y="112" width="52" height="58" rx="6" />
              <path d="M62 128h36" />
              <path d="M62 142h28" />
              <circle cx="80" cy="154" r="3" className={styles.core} />
            </g>
            <g className={styles.armLeft}>
              <path d="M54 122l-22 38" />
              <circle cx="30" cy="164" r="5" />
            </g>
            <g className={styles.armRight}>
              <path d="M106 122l22 38" />
              <circle cx="130" cy="164" r="5" />
            </g>
            <g className={styles.head}>
              <rect x="52" y="52" width="56" height="52" rx="8" />
              <path d="M66 48h28" />
              <circle cx="70" cy="74" r="6" className={styles.eye} />
              <circle cx="90" cy="74" r="6" className={styles.eye} />
              <circle cx="70" cy="74" r="2.2" className={styles.pupil} />
              <circle cx="90" cy="74" r="2.2" className={styles.pupil} />
              <path className={styles.mouth} d={MOUTH[mood]} />
              <path d="M58 88h10" />
              <path d="M92 88h10" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
