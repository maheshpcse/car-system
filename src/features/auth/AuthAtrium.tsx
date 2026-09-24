import styles from './AuthAtrium.module.scss'

/** Decorative left pane for auth — architecture and light, no people, no pointer follow. */
export function AuthAtrium() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.grid} />
      <div className={styles.orbit} />
      <div className={styles.orbitSlow} />
      <div className={styles.diamond} />
      <div className={styles.beam} />
      <div className={styles.horizon} />
      <div className={styles.word}>
        <span>AURORA</span>
        <em>STUDIO</em>
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
