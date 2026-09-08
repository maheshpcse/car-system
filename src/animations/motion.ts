import type { Transition, Variants } from 'framer-motion'

/** Unified motion language: durations match the CSS tokens in _tokens.scss. */
export const DURATION = {
  fast: 0.16,
  normal: 0.26,
  slow: 0.42,
  page: 0.56,
} as const

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_STANDARD: [number, number, number, number] = [0.2, 0.7, 0.2, 1]

export const transitionFast: Transition = { duration: DURATION.fast, ease: EASE_STANDARD }
export const transitionNormal: Transition = { duration: DURATION.normal, ease: EASE_OUT }
export const transitionSlow: Transition = { duration: DURATION.slow, ease: EASE_OUT }
export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 30, mass: 0.8 }

/** Page entry/exit: fade + 8px translate. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
  exit: { opacity: 0, y: -6, transition: { duration: DURATION.fast, ease: EASE_STANDARD } },
}

/** Staggered reveal for lists / sections. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.normal, ease: EASE_STANDARD } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitionNormal },
}

export const viewportOnce = { once: true, amount: 0.2 } as const
