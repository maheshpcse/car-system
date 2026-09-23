import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition, Reveal } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { formatPrice } from '@/core/utils/format'
import { studioService } from '@/services/studioService'
import type { Brochure } from '@/data/studio'
import { ButtonLink } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Icon } from '@/shared/icons/Icon'
import styles from './CollectionPage.module.scss'
import brochureStyles from './BrochurePage.module.scss'

export default function BrochuresPage() {
  useDocumentTitle('Brochures', 'Large-format digital brochures with every variant.')
  const [items, setItems] = useState<Brochure[]>([])

  useEffect(() => {
    void studioService.brochures().then(setItems)
  }, [])

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.banner}>
          <div className={styles.bannerText}>
            <span className="t-eyebrow">Publications</span>
            <h1 className="t-title">Brochures</h1>
            <p className="t-description">Each brochure is assembled from live catalogue data — variants, mechanical figures and studio links.</p>
          </div>
        </header>
        {items.length === 0 ? (
          <EmptyState icon="fileText" title="No brochures" description="Brochures appear here once the studio catalogue is seeded." />
        ) : (
          <div className={styles.grid}>
            {items.map((brochure) => (
              <Link key={brochure.id} to={`/brochures/${brochure.slug}`} className={brochureStyles.card} style={{ '--hero': brochure.heroHex } as React.CSSProperties}>
                <span className="t-eyebrow">{brochure.sections.length} sections</span>
                <strong>{brochure.title}</strong>
                <span>{brochure.subtitle}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export function BrochureDetailPage() {
  const { id } = useParams()
  const [brochure, setBrochure] = useState<Brochure | undefined>()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoaded(false)
    void studioService.brochure(id).then((next) => {
      setBrochure(next)
      setLoaded(true)
    })
  }, [id])

  useDocumentTitle(brochure ? brochure.title : 'Brochure', brochure?.subtitle)

  if (!loaded) {
    return (
      <PageTransition>
        <div className={`container ${styles.page}`}>
          <p className="t-description">Opening brochure…</p>
        </div>
      </PageTransition>
    )
  }

  if (!brochure) {
    return (
      <PageTransition>
        <div className={`container ${styles.page}`}>
          <EmptyState icon="fileText" title="Brochure not found" description="This publication is not in the current studio set." />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <article className={`container ${styles.page}`}>
        <header className={styles.banner} style={{ background: `linear-gradient(135deg, ${brochure.heroHex}22, var(--color-surface))` }}>
          <div className={styles.bannerText}>
            <span className="t-eyebrow">Brochure</span>
            <h1 className="t-title">{brochure.title}</h1>
            <p className="t-description">{brochure.subtitle}</p>
          </div>
          {brochure.vehicleId ? (
            <ButtonLink to={`/cars/${brochure.vehicleId}`} iconLeft="car">
              Open vehicle
            </ButtonLink>
          ) : null}
        </header>
        {brochure.sections.map((section) => (
          <Reveal key={section.id} as="section" className={brochureStyles.section}>
            <h2 className="t-heading">{section.title}</h2>
            <p className="t-description">{section.body}</p>
            {section.highlights?.length ? (
              <ul className={styles.chips}>
                {section.highlights.map((item) => (
                  <li key={item} className="badge">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {section.variants?.length ? (
              <div className={brochureStyles.variants}>
                {section.variants.map((variant) => (
                  <Card key={variant.name} padding="md">
                    <h3 className="t-card-title">{variant.name}</h3>
                    <p>{formatPrice(variant.price)}</p>
                    <p>
                      {variant.power ? `${variant.power} hp` : ''}
                      {variant.range ? ` · ${variant.range} km` : ''}
                    </p>
                  </Card>
                ))}
              </div>
            ) : null}
          </Reveal>
        ))}
        <p className={brochureStyles.back}>
          <Link to="/brochures">
            <Icon name="arrowLeft" size={14} /> All brochures
          </Link>
        </p>
      </article>
    </PageTransition>
  )
}
