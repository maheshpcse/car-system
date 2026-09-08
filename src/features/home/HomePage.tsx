import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition, Reveal } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { formatAcceleration, formatPower, formatRange, formatSpeed } from '@/core/utils/format'
import { CATEGORIES } from '@/data/categories'
import { vehicles } from '@/data/vehicles'
import { Icon } from '@/shared/icons/Icon'
import { ButtonLink } from '@/shared/ui/Button'
import { FeatureCard, Stat } from '@/shared/ui/Card'
import { VehicleCard } from '@/shared/vehicle/VehicleCard'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import styles from './HomePage.module.scss'

const VehicleViewer = lazy(() => import('@/three/viewer/VehicleViewer').then((m) => ({ default: m.VehicleViewer })))

const HERO_VEHICLE = vehicles.find((v) => v.id === 'aureon-x1') ?? vehicles[0]
const INTERACTIVE_VEHICLE = vehicles.find((v) => v.id === 'ventra-rs') ?? vehicles[1]

export default function HomePage() {
  useDocumentTitle('Digital Automotive Studio', 'Discover, inspect, configure and virtually experience vehicles in an interactive 3D showroom.')
  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroShift = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 80])
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0.25])
  const [paintIndex, setPaintIndex] = useState(0)
  const featured = useMemo(() => vehicles.filter((v) => v.isFeatured).slice(0, 4), [])
  const categories = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <PageTransition>
      {/* Hero -------------------------------------------------------------- */}
      <section ref={heroRef} className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroBackdrop} aria-hidden="true">
          <span className={styles.heroArc} />
          <span className={styles.heroLine} />
        </div>
        <div className={`container ${styles.heroGrid}`}>
          <motion.div className={styles.heroCopy} style={{ opacity: heroFade }}>
            <span className="t-eyebrow">{HERO_VEHICLE.manufacturer} · {HERO_VEHICLE.year} line-up</span>
            <h1 id="hero-title" className="t-display">
              Every detail,
              <br />
              <span className={styles.heroAccent}>seen in the round.</span>
            </h1>
            <p className={styles.heroText}>
              Discover, inspect, configure and virtually experience vehicles in a calm digital studio. Rotate the {HERO_VEHICLE.model},
              step into the showroom, and build the exact car you want.
            </p>
            <div className={styles.heroActions}>
              <ButtonLink to="/cars" size="lg" iconRight="arrowRight">
                Explore Cars
              </ButtonLink>
              <ButtonLink to="/showroom" size="lg" variant="ghost" iconLeft="showroom">
                Enter Showroom
              </ButtonLink>
            </div>
            <dl className={styles.heroStats}>
              <Stat label="Power" value={formatPower(HERO_VEHICLE.power).replace(' hp', '')} unit="hp" />
              <Stat label="Range" value={String(HERO_VEHICLE.range)} unit="km" />
              <Stat label="Top speed" value={String(HERO_VEHICLE.topSpeed)} unit="km/h" />
              <Stat label="0–100" value={HERO_VEHICLE.acceleration.toFixed(1)} unit="s" />
            </dl>
          </motion.div>

          <motion.div className={styles.heroVisual} style={{ y: heroShift }}>
            <Suspense fallback={<div className={styles.heroFallback}><VehicleSilhouette profile={HERO_VEHICLE.silhouette} color={HERO_VEHICLE.colors[0].hex} /></div>}>
              <VehicleViewer vehicle={HERO_VEHICLE} variant="hero" autoRotate />
            </Suspense>
            <Link to={`/cars/${HERO_VEHICLE.id}`} className={styles.heroCaption} data-cursor="view" data-cursor-label="Explore">
              <span className={styles.heroCaptionName}>
                {HERO_VEHICLE.manufacturer} {HERO_VEHICLE.model}
              </span>
              <span className={styles.heroCaptionMeta}>
                {HERO_VEHICLE.variant} · from ${(HERO_VEHICLE.price / 1000).toFixed(1)}k
              </span>
              <Icon name="arrowUpRight" size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured ----------------------------------------------------------- */}
      <section className={`container section ${styles.featured}`} aria-labelledby="featured-title">
        <Reveal className="section-header">
          <div className="section-header__text">
            <span className="t-eyebrow">Featured vehicles</span>
            <h2 id="featured-title" className="t-heading">Four ways to move.</h2>
          </div>
          <Link to="/cars" className="link-arrow">
            View all vehicles <Icon name="arrowRight" size={16} />
          </Link>
        </Reveal>
        <div className={styles.featuredGrid}>
          {featured.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} index={i} />
          ))}
        </div>
      </section>

      {/* Categories --------------------------------------------------------- */}
      <section className={`container section ${styles.categories}`} aria-labelledby="categories-title">
        <Reveal className="section-header">
          <div className="section-header__text">
            <span className="t-eyebrow">Explore categories</span>
            <h2 id="categories-title" className="t-heading">Start with how you drive.</h2>
          </div>
        </Reveal>
        <ul className={styles.categoryGrid}>
          {categories.map((c, i) => {
            const count = vehicles.filter((v) => v.category.includes(c.id as never)).length
            return (
              <Reveal as="li" key={c.id} delay={i * 0.04}>
                <Link to={`/cars?category=${c.id}`} className={styles.category} data-cursor="link">
                  <span className={styles.categoryIcon}>
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span className={styles.categoryText}>
                    <strong>{c.label}</strong>
                    <span>{c.description}</span>
                  </span>
                  <span className={styles.categoryCount}>{count}</span>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </section>

      {/* Showroom preview --------------------------------------------------- */}
      <section className={`container section`} aria-labelledby="showroom-title">
        <Reveal className={styles.showroom}>
          <div className={styles.showroomCopy}>
            <span className="t-eyebrow">Virtual showroom</span>
            <h2 id="showroom-title" className="t-heading">Walk the floor without leaving your desk.</h2>
            <p className="t-description">
              A quiet, well-lit space where the entire line-up waits on its podiums. Move between vehicles, switch to focus or
              interior mode, and compare two cars side by side.
            </p>
            <div className={styles.showroomActions}>
              <ButtonLink to="/showroom" variant="cta" iconRight="arrowRight">
                Enter Showroom
              </ButtonLink>
              <ul className={styles.showroomModes}>
                {['Explore', 'Focus', 'Interior', 'Compare', 'Specs'].map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.showroomVisual} aria-hidden="true">
            <span className={styles.showroomFloor} />
            {vehicles.slice(0, 3).map((v, i) => (
              <span key={v.id} className={styles.showroomCar} style={{ '--i': i } as React.CSSProperties}>
                <VehicleSilhouette profile={v.silhouette} color={v.colors[0].hex} />
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Technology --------------------------------------------------------- */}
      <section className={`container section`} aria-labelledby="tech-title">
        <Reveal className="section-header">
          <div className="section-header__text">
            <span className="t-eyebrow">Performance & EV technology</span>
            <h2 id="tech-title" className="t-heading">Engineering you can read at a glance.</h2>
          </div>
        </Reveal>
        <div className={styles.techGrid}>
          <FeatureCard icon="battery" title="800-volt architecture" description="Faster charging, lighter cabling and cooler running batteries across the electric line-up." />
          <FeatureCard icon="charging" title="10–80% in 15 minutes" description="Silicon-carbide inverters and active thermal management keep charge curves flat." />
          <FeatureCard icon="speed" title="Torque vectoring" description="Independent motor control places power exactly where the road asks for it." />
          <FeatureCard icon="safety" title="Predictive safety" description="Camera and radar fusion with steering assist, on every trim, not only the top one." />
          <FeatureCard icon="wind" title="Low-drag design" description="Flush glass, active aero and aero wheels contribute real range, not just visual polish." />
          <FeatureCard icon="cube" title="Over-the-air updates" description="Every vehicle improves over time, from drive modes to showroom-ready UI." />
        </div>
      </section>

      {/* Interactive model -------------------------------------------------- */}
      <section className={`container section`} aria-labelledby="interactive-title">
        <Reveal className={styles.interactive}>
          <div className={styles.interactiveViewer}>
            <Suspense fallback={<div className={styles.heroFallback}><VehicleSilhouette profile={INTERACTIVE_VEHICLE.silhouette} color={INTERACTIVE_VEHICLE.colors[paintIndex].hex} /></div>}>
              <VehicleViewer vehicle={INTERACTIVE_VEHICLE} color={INTERACTIVE_VEHICLE.colors[paintIndex]} variant="compact" showHotspots={false} />
            </Suspense>
          </div>
          <div className={styles.interactiveCopy}>
            <span className="t-eyebrow">Interactive model</span>
            <h2 id="interactive-title" className="t-heading">
              {INTERACTIVE_VEHICLE.manufacturer} {INTERACTIVE_VEHICLE.model}. Your colour, your angle.
            </h2>
            <p className="t-description">{INTERACTIVE_VEHICLE.description}</p>
            <div className={styles.swatches} role="radiogroup" aria-label="Exterior colour">
              {INTERACTIVE_VEHICLE.colors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={i === paintIndex}
                  aria-label={c.name}
                  title={c.name}
                  className={`${styles.swatch} ${i === paintIndex ? styles.swatchActive : ''}`}
                  style={{ '--swatch': c.hex } as React.CSSProperties}
                  onClick={() => setPaintIndex(i)}
                />
              ))}
              <span className={styles.swatchName}>{INTERACTIVE_VEHICLE.colors[paintIndex].name}</span>
            </div>
            <dl className={styles.interactiveSpecs}>
              <div>
                <dt>Power</dt>
                <dd>{formatPower(INTERACTIVE_VEHICLE.power)}</dd>
              </div>
              <div>
                <dt>0–100 km/h</dt>
                <dd>{formatAcceleration(INTERACTIVE_VEHICLE.acceleration)}</dd>
              </div>
              <div>
                <dt>Top speed</dt>
                <dd>{formatSpeed(INTERACTIVE_VEHICLE.topSpeed)}</dd>
              </div>
              <div>
                <dt>Range</dt>
                <dd>{formatRange(INTERACTIVE_VEHICLE.range)}</dd>
              </div>
            </dl>
            <div className={styles.interactiveActions}>
              <ButtonLink to={`/configurator/${INTERACTIVE_VEHICLE.id}`} iconLeft="palette">
                Open configurator
              </ButtonLink>
              <ButtonLink to={`/cars/${INTERACTIVE_VEHICLE.id}`} variant="text" iconRight="arrowRight">
                Full specification
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA ---------------------------------------------------------------- */}
      <section className={`container section`}>
        <Reveal className={styles.cta}>
          <div>
            <span className="t-eyebrow">Ready when you are</span>
            <h2 className="t-heading">Save favourites, compare builds, pick up where you left off.</h2>
          </div>
          <div className={styles.ctaActions}>
            <ButtonLink to="/demo-login" size="lg" iconRight="arrowRight">
              Try the demo
            </ButtonLink>
            <ButtonLink to="/signup" size="lg" variant="ghost">
              Create account
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
