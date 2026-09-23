import { Link } from 'react-router-dom'
import { env } from '@/core/config/environment'
import { Icon } from '@/shared/icons/Icon'
import { Brand } from './Brand'
import styles from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Brand />
          <p className={styles.tagline}>A digital automotive studio for discovering, configuring and experiencing cars in 3D.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link to="/cars">Explore</Link>
          <Link to="/used-cars">Used</Link>
          <Link to="/upcoming">Upcoming</Link>
          <Link to="/vintage">Vintage</Link>
          <Link to="/brochures">Brochures</Link>
          <Link to="/locations">Showrooms</Link>
          <Link to="/sell">Sell</Link>
          <Link to="/showroom">3D floor</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={env.repositoryUrl} target="_blank" rel="noreferrer" className={styles.external}>
            <Icon name="github" size={15} /> GitHub
          </a>
        </nav>
      </div>
      <div className={styles.legal}>
        <span>© {new Date().getFullYear()} Rekha Motors. Fictional India-focused brand — demo project.</span>
        <span>Every vehicle, brand and specification is illustrative.</span>
      </div>
    </footer>
  )
}
