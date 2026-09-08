import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import styles from './ScrollProgress.module.scss'

/**
 * Slim vertical progress rail on the right edge. It reads the native scroll
 * position, so keyboard, wheel, trackpad and touch all stay in sync.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduced = useReducedMotion()
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })

  return (
    <div className={styles.rail} aria-hidden="true">
      <motion.div className={styles.fill} style={{ scaleY: reduced ? scrollYProgress : smooth }} />
    </div>
  )
}
