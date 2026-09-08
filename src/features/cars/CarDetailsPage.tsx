import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition, Reveal } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { formatAcceleration, formatNumber, formatPower, formatPrice, formatRange, formatSpeed } from '@/core/utils/format'
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, labelFor } from '@/data/categories'
import { getVehicleById, vehicles } from '@/data/vehicles'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink, IconButton } from '@/shared/ui/Button'
import { Card, SpecCard } from '@/shared/ui/Card'
import { VehicleCard } from '@/shared/vehicle/VehicleCard'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import NotFoundPage from '@/features/misc/NotFoundPage'
import styles from './CarDetailsPage.module.scss'

const VehicleViewer = lazy(() => import('@/three/viewer/VehicleViewer').then((m) => ({ default: m.VehicleViewer })))

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'colours', label: 'Colours' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'performance', label: 'Performance' },
  { id: 'technology', label: 'Technology' },
  { id: 'safety', label: 'Safety' },
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'variants', label: 'Variants' },
]

export default function CarDetailsPage() {
  const { id } = useParams()
  const vehicle = getVehicleById(id)
  const { isFavorite, toggleFavorite, isCompared, toggleCompare } = usePreferences()
  const { notify } = useToast()
  const [colorIndex, setColorIndex] = useState(0)
  const [interiorIndex, setInteriorIndex] = useState(0)
  const [active, setActive] = useState('overview')

  useDocumentTitle(vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : 'Vehicle not found', vehicle?.tagline)

  useEffect(() => {
    setColorIndex(0)
    setInteriorIndex(0)
  }, [id])

  // Section-aware sticky navigation.
  useEffect(() => {
    if (!vehicle) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -50% 0px' },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [vehicle])

  const related = useMemo(
    () => (vehicle ? vehicles.filter((v) => v.id !== vehicle.id && v.category.some((c) => vehicle.category.includes(c))).slice(0, 3) : []),
    [vehicle],
  )

  if (!vehicle) return <NotFoundPage title="Vehicle not found" description="This vehicle is not part of the current line-up." />

  const color = vehicle.colors[colorIndex] ?? vehicle.colors[0]
  const favorite = isFavorite(vehicle.id)
  const compared = isCompared(vehicle.id)

  const onCompare = () => {
    const added = toggleCompare(vehicle.id)
    if (compared) notify('Removed from compare')
    else if (added) notify('Added to compare', 'success')
    else notify('You can compare up to 3 vehicles', 'warning')
  }

  return (
    <PageTransition>
      <article className={styles.page}>
        {/* Hero ------------------------------------------------------------ */}
        <section id="overview" className={`container ${styles.hero}`}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/cars">Explore Cars</Link>
            <Icon name="chevronRight" size={13} />
            <span>{labelFor(BODY_TYPES, vehicle.bodyType)}</span>
            <Icon name="chevronRight" size={13} />
            <span aria-current="page">
              {vehicle.manufacturer} {vehicle.model}
            </span>
          </nav>

          <div id="viewer" className={styles.viewer}>
            <Suspense fallback={<div className={styles.viewerFallback}><VehicleSilhouette profile={vehicle.silhouette} color={color.hex} /></div>}>
              <VehicleViewer vehicle={vehicle} color={color} interiorAccent={vehicle.interiors[interiorIndex]?.accent} variant="full" />
            </Suspense>
          </div>

          <div className={styles.heroBar}>
            <div className={styles.titleBlock}>
              <div className={styles.badges}>
                {vehicle.isNew && <span className="badge badge--accent">New</span>}
                <span className="badge">{vehicle.year}</span>
                <span className="badge">{labelFor(FUEL_TYPES, vehicle.fuelType)}</span>
                <span className="badge">
                  <Icon name="star" size={11} filled /> {vehicle.rating.toFixed(1)}
                </span>
              </div>
              <h1 className="t-title">
                {vehicle.manufacturer} {vehicle.model}
              </h1>
              <p className={styles.variant}>
                {vehicle.variant} · {vehicle.tagline}
              </p>
            </div>
            <div className={styles.priceBlock}>
              <span className="t-eyebrow">Starting at</span>
              <span className={styles.price}>{formatPrice(vehicle.price)}</span>
              <div className={styles.heroActions}>
                <ButtonLink to={`/configurator/${vehicle.id}`} iconLeft="palette">
                  Configure
                </ButtonLink>
                <ButtonLink to={`/showroom?vehicle=${vehicle.id}`} variant="ghost" iconLeft="showroom">
                  Showroom
                </ButtonLink>
                <IconButton icon="compare" label={compared ? 'Remove from compare' : 'Add to compare'} variant="secondary" active={compared} onClick={onCompare} />
                <IconButton
                  icon="heart"
                  label={favorite ? 'Remove from favourites' : 'Save to favourites'}
                  variant="secondary"
                  active={favorite}
                  filled={favorite}
                  className={cx(favorite && styles.favActive)}
                  onClick={() => {
                    toggleFavorite(vehicle.id)
                    notify(favorite ? 'Removed from favourites' : 'Saved to favourites', favorite ? 'info' : 'success')
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.primarySpecs}>
            <SpecCard icon="engine" label="Power" value={formatPower(vehicle.power)} detail={`${formatNumber(vehicle.torque)} Nm torque`} />
            <SpecCard icon={vehicle.fuelType === 'electric' ? 'battery' : 'fuel'} label="Range" value={formatRange(vehicle.range)} detail={vehicle.mileage ? `${vehicle.mileage} km/l` : 'Full charge'} />
            <SpecCard icon="speed" label="0–100 km/h" value={formatAcceleration(vehicle.acceleration)} detail={`Top speed ${formatSpeed(vehicle.topSpeed)}`} />
            <SpecCard icon="transmission" label="Transmission" value={labelFor(TRANSMISSIONS, vehicle.transmission)} detail={labelFor(BODY_TYPES, vehicle.bodyType)} />
            <SpecCard icon="seats" label="Seats" value={String(vehicle.seats)} detail={`${formatNumber(vehicle.dimensions.cargoLiters)} L cargo`} />
          </div>
        </section>

        {/* Sticky mini nav ------------------------------------------------- */}
        <nav className={styles.miniNav} aria-label="Sections">
          <div className={`container ${styles.miniNavInner}`}>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={cx(styles.miniLink, active === s.id && styles.miniLinkActive)} aria-current={active === s.id ? 'true' : undefined}>
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <div className={`container ${styles.sections}`}>
          {/* Colours ------------------------------------------------------- */}
          <Reveal as="section" className={styles.section}>
            <div id="colours" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Exterior & interior</span>
              <h2 className="t-heading">Colours and cabins</h2>
            </div>
            <div className={styles.colourGrid}>
              <Card padding="md" className={styles.colourCard}>
                <h3 className="t-card-title">Exterior colours</h3>
                <ul className={styles.swatchList} role="radiogroup" aria-label="Exterior colour">
                  {vehicle.colors.map((c, i) => (
                    <li key={c.id}>
                      <button type="button" role="radio" aria-checked={i === colorIndex} className={cx(styles.swatchRow, i === colorIndex && styles.swatchRowActive)} onClick={() => setColorIndex(i)}>
                        <span className={styles.swatchDot} style={{ background: c.hex }} />
                        <span className={styles.swatchText}>
                          <strong>{c.name}</strong>
                          <span>{c.finish}</span>
                        </span>
                        <span className={styles.swatchPrice}>{c.price ? `+${formatPrice(c.price)}` : 'Included'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card padding="md" className={styles.colourCard}>
                <h3 className="t-card-title">Interior themes</h3>
                <ul className={styles.swatchList} role="radiogroup" aria-label="Interior theme">
                  {vehicle.interiors.map((c, i) => (
                    <li key={c.id}>
                      <button type="button" role="radio" aria-checked={i === interiorIndex} className={cx(styles.swatchRow, i === interiorIndex && styles.swatchRowActive)} onClick={() => setInteriorIndex(i)}>
                        <span className={styles.swatchDot} style={{ background: c.accent }} />
                        <span className={styles.swatchText}>
                          <strong>{c.name}</strong>
                          <span>{c.material.replace('-', ' ')}</span>
                        </span>
                        <span className={styles.swatchPrice}>{c.price ? `+${formatPrice(c.price)}` : 'Included'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Reveal>

          {/* Gallery ------------------------------------------------------- */}
          <Reveal as="section" className={styles.section}>
            <div id="gallery" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Gallery</span>
              <h2 className="t-heading">{vehicle.model} in every finish</h2>
            </div>
            <ul className={styles.gallery}>
              {vehicle.colors.map((c, i) => (
                <li key={c.id} className={cx(styles.galleryItem, i === 0 && styles.galleryLead)}>
                  <button type="button" className={styles.galleryButton} onClick={() => { setColorIndex(i); document.getElementById('viewer')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} data-cursor="view" data-cursor-label="360°">
                    <VehicleSilhouette profile={vehicle.silhouette} color={c.hex} />
                    <span className={styles.galleryCaption}>{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Performance --------------------------------------------------- */}
          <Reveal as="section" className={styles.section}>
            <div id="performance" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Performance</span>
              <h2 className="t-heading">Numbers that describe the drive</h2>
            </div>
            <div className={styles.perfGrid}>
              {[
                { label: 'Power', value: vehicle.power, max: 900, unit: 'hp' },
                { label: 'Torque', value: vehicle.torque, max: 1200, unit: 'Nm' },
                { label: 'Top speed', value: vehicle.topSpeed, max: 330, unit: 'km/h' },
                { label: 'Range', value: vehicle.range, max: 1000, unit: 'km' },
              ].map((m) => (
                <div key={m.label} className={styles.perfRow}>
                  <div className={styles.perfLabel}>
                    <span>{m.label}</span>
                    <strong>
                      {formatNumber(m.value)} <small>{m.unit}</small>
                    </strong>
                  </div>
                  <div className={styles.perfBar} role="meter" aria-valuenow={m.value} aria-valuemin={0} aria-valuemax={m.max} aria-label={m.label}>
                    <span style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className={styles.perfAside}>
                <Card tone="inverse" padding="md" className={styles.accelCard}>
                  <span className="t-eyebrow">0–100 km/h</span>
                  <span className={styles.accelValue}>{vehicle.acceleration.toFixed(1)}s</span>
                  <p>{vehicle.features[0]}</p>
                </Card>
              </div>
            </div>
          </Reveal>

          {/* Technology & Safety ------------------------------------------- */}
          <Reveal as="section" className={styles.section}>
            <div id="technology" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Technology & features</span>
              <h2 className="t-heading">What comes with it</h2>
            </div>
            <div className={styles.listGrid}>
              <Card padding="md">
                <h3 className="t-card-title">Technology</h3>
                <ul className={styles.checkList}>
                  {vehicle.technology.map((t) => (
                    <li key={t}>
                      <Icon name="zap" size={15} /> {t}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card padding="md">
                <h3 className="t-card-title">Comfort & features</h3>
                <ul className={styles.checkList}>
                  {vehicle.features.map((t) => (
                    <li key={t}>
                      <Icon name="check" size={15} /> {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Reveal>

          <Reveal as="section" className={styles.section}>
            <div id="safety" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Safety</span>
              <h2 className="t-heading">Assistance on every trim</h2>
            </div>
            <ul className={styles.safetyGrid}>
              {vehicle.safety.map((s) => (
                <li key={s} className={styles.safetyItem}>
                  <span className={styles.safetyIcon}>
                    <Icon name="safety" size={18} />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Dimensions ---------------------------------------------------- */}
          <Reveal as="section" className={styles.section}>
            <div id="dimensions" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Dimensions</span>
              <h2 className="t-heading">Fit for your garage</h2>
            </div>
            <dl className={styles.dimensions}>
              {[
                ['Length', `${formatNumber(vehicle.dimensions.lengthMm)} mm`],
                ['Width', `${formatNumber(vehicle.dimensions.widthMm)} mm`],
                ['Height', `${formatNumber(vehicle.dimensions.heightMm)} mm`],
                ['Wheelbase', `${formatNumber(vehicle.dimensions.wheelbaseMm)} mm`],
                ['Cargo', `${formatNumber(vehicle.dimensions.cargoLiters)} L`],
                ['Weight', `${formatNumber(vehicle.dimensions.weightKg)} kg`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Variants ------------------------------------------------------ */}
          <Reveal as="section" className={styles.section}>
            <div id="variants" className={styles.anchor} />
            <div className={styles.sectionHead}>
              <span className="t-eyebrow">Variants</span>
              <h2 className="t-heading">Choose your {vehicle.model}</h2>
            </div>
            <div className={styles.variants}>
              {vehicle.variants.map((v) => (
                <Card key={v.id} padding="md" interactive className={cx(styles.variantCard, v.name === vehicle.variant && styles.variantCurrent)}>
                  <div className={styles.variantHead}>
                    <h3 className="t-card-title">{v.name}</h3>
                    {v.name === vehicle.variant && <span className="badge badge--primary">Shown</span>}
                  </div>
                  <span className={styles.variantPrice}>{formatPrice(v.price)}</span>
                  <dl className={styles.variantSpecs}>
                    <div>
                      <dt>Power</dt>
                      <dd>{formatPower(v.power)}</dd>
                    </div>
                    <div>
                      <dt>Range</dt>
                      <dd>{formatRange(v.range)}</dd>
                    </div>
                    <div>
                      <dt>0–100</dt>
                      <dd>{formatAcceleration(v.acceleration)}</dd>
                    </div>
                  </dl>
                  <ButtonLink to={`/configurator/${vehicle.id}?variant=${v.id}`} variant="ghost" size="sm" iconRight="arrowRight">
                    Configure
                  </ButtonLink>
                </Card>
              ))}
            </div>
          </Reveal>

          {/* CTAs ---------------------------------------------------------- */}
          <Reveal className={styles.ctaRow}>
            <Card tone="inverse" padding="lg" className={styles.ctaCard}>
              <span className="t-eyebrow">Compare</span>
              <h3 className="t-subheading">See how the {vehicle.model} stacks up.</h3>
              <Button variant="cta" onClick={onCompare} iconLeft="compare">
                {compared ? 'Open comparison' : 'Add to compare'}
              </Button>
            </Card>
            <Card padding="lg" className={styles.ctaCard}>
              <span className="t-eyebrow">Showroom</span>
              <h3 className="t-subheading">Walk around it on the studio floor.</h3>
              <ButtonLink to={`/showroom?vehicle=${vehicle.id}`} iconLeft="showroom">
                Open in showroom
              </ButtonLink>
            </Card>
          </Reveal>

          {related.length > 0 && (
            <Reveal as="section" className={styles.section}>
              <div className={styles.sectionHead}>
                <span className="t-eyebrow">You may also like</span>
                <h2 className="t-heading">Similar vehicles</h2>
              </div>
              <div className={styles.related}>
                {related.map((v, i) => (
                  <VehicleCard key={v.id} vehicle={v} index={i} />
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </article>
    </PageTransition>
  )
}
