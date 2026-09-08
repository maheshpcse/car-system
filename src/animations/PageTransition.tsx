import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageVariants } from './motion'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/** Wraps a routed page with the shared entry/exit motion. */
export function PageTransition({ children, className }: PageTransitionProps) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={reduced ? undefined : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}

/** Fades content up when it enters the viewport (once). */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const Component = motion[as]
  if (reduced) return <Component className={className}>{children}</Component>
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Component>
  )
}
