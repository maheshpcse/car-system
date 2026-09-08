import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageTransition } from '@/animations/PageTransition'
import { useAuth } from '@/core/auth/AuthProvider'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { formatAcceleration, formatPower, formatPrice, formatRange } from '@/core/utils/format'
import { getVehicleById } from '@/data/vehicles'
import type { SavedBuild } from '@/models/vehicle'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { Button, ButtonLink } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Field'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import NotFoundPage from '@/features/misc/NotFoundPage'
import styles from './ConfiguratorPage.module.scss'

const VehicleViewer = lazy(() => import('@/three/viewer/VehicleViewer').then((m) => ({ default: m.VehicleViewer })))

type StepId = 'variant' | 'exterior' | 'wheels' | 'interior' | 'trim' | 'accessories' | 'summary'
const STEPS: { id: StepId; label: string; icon: IconName }[] = [
  { id: 'variant', label: 'Variant', icon: 'engine' },
  { id: 'exterior', label: 'Exterior', icon: 'palette' },
  { id: 'wheels', label: 'Wheels', icon: 'wheel' },
  { id: 'interior', label: 'Interior', icon: 'seats' },
  { id: 'trim', label: 'Trim', icon: 'layers' },
  { id: 'accessories', label: 'Accessories', icon: 'sparkle' },
  { id: 'summary', label: 'Summary', icon: 'check' },
]

export default function ConfiguratorPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const vehicle = getVehicleById(id)
  const navigate = useNavigate()
  const { notify } = useToast()
  const { saveBuild, savedBuilds } = usePreferences()
  const { isAuthenticated } = useAuth()

  const [step, setStep] = useState<StepId>('variant')
  const [variantId, setVariantId] = useState(() => params.get('variant') ?? vehicle?.variants.find((v) => v.name === vehicle.variant)?.id ?? vehicle?.variants[0]?.id ?? '')
  const [colorId, setColorId] = useState(vehicle?.colors[0]?.id ?? '')
  const [wheelId, setWheelId] = useState(vehicle?.wheels[0]?.id ?? '')
  const [interiorId, setInteriorId] = useState(vehicle?.interiors[0]?.id ?? '')
  const [trimId, setTrimId] = useState(vehicle?.trims[0]?.id ?? '')
  const [accessoryIds, setAccessoryIds] = useState<string[]>([])
  const [priceBump, setPriceBump] = useState(false)

  useDocumentTitle(vehicle ? `Configure ${vehicle.manufacturer} ${vehicle.model}` : 'Configurator')

  // Restore a saved build when opened via ?build=
  useEffect(() => {
    const buildId = params.get('build')
    const build = buildId ? savedBuilds.find((b) => b.id === buildId) : undefined
    if (build && build.vehicleId === vehicle?.id) {
      setVariantId(build.variantId)
      setColorId(build.colorId)
      setWheelId(build.wheelId)
      setInteriorId(build.interiorId)
      setTrimId(build.trimId)
      setAccessoryIds(build.accessoryIds)
      setStep('summary')
    }
  }, [params, savedBuilds, vehicle?.id])

  const selection = useMemo(() => {
    if (!vehicle) return null
    const variant = vehicle.variants.find((v) => v.id === variantId) ?? vehicle.variants[0]
    const color = vehicle.colors.find((c) => c.id === colorId) ?? vehicle.colors[0]
    const wheel = vehicle.wheels.find((w) => w.id === wheelId) ?? vehicle.wheels[0]
    const interior = vehicle.interiors.find((i) => i.id === interiorId) ?? vehicle.interiors[0]
    const trim = vehicle.trims.find((t) => t.id === trimId) ?? vehicle.trims[0]
    const accessories = vehicle.accessories.filter((a) => accessoryIds.includes(a.id))
    const total = variant.price + color.price + wheel.price + interior.price + trim.price + accessories.reduce((s, a) => s + a.price, 0)
    return { variant, color, wheel, interior, trim, accessories, total }
  }, [vehicle, variantId, colorId, wheelId, interiorId, trimId, accessoryIds])

  useEffect(() => {
    setPriceBump(true)
    const t = window.setTimeout(() => setPriceBump(false), 320)
    return () => window.clearTimeout(t)
  }, [selection?.total])

  if (!vehicle || !selection) return <NotFoundPage title="Vehicle not found" description="We could not find a vehicle to configure." />

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const next = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].id)
  const prev = () => setStep(STEPS[Math.max(stepIndex - 1, 0)].id)

  const save = () => {
    const build: SavedBuild = {
      id: `${vehicle.id}-${Date.now()}`,
      vehicleId: vehicle.id,
      name: `${vehicle.manufacturer} ${vehicle.model} · ${selection.color.name}`,
      variantId: selection.variant.id,
      colorId: selection.color.id,
      wheelId: selection.wheel.id,
      interiorId: selection.interior.id,
      trimId: selection.trim.id,
      accessoryIds,
      totalPrice: selection.total,
      createdAt: new Date().toISOString(),
    }
    saveBuild(build)
    notify('Build saved', 'success')
    if (isAuthenticated) navigate('/saved-builds')
    else notify('Sign in to keep builds across devices', 'info')
  }

  const share = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('variant', selection.variant.id)
    try {
      await navigator.clipboard.writeText(url.toString())
      notify('Link copied to clipboard', 'success')
    } catch {
      notify('Copy the address bar link to share', 'info')
    }
  }

  const optionRow = (opts: {
    key: string
    label: string
    sub?: string
    price: number
    selected: boolean
    swatch?: string
    onSelect: () => void
  }) => (
    <button key={opts.key} type="button" role="radio" aria-checked={opts.selected} className={cx(styles.option, opts.selected && styles.optionActive)} onClick={opts.onSelect}>
      {opts.swatch && <span className={styles.optionSwatch} style={{ background: opts.swatch }} />}
      <span className={styles.optionText}>
        <strong>{opts.label}</strong>
        {opts.sub && <span>{opts.sub}</span>}
      </span>
      <span className={styles.optionPrice}>{opts.price ? `+${formatPrice(opts.price)}` : 'Included'}</span>
      <span className={styles.optionCheck}>
        <Icon name="check" size={13} strokeWidth={2.4} />
      </span>
    </button>
  )

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.stage}>
          <div className={styles.stageHeader}>
            <Link to={`/cars/${vehicle.id}`} className={styles.back}>
              <Icon name="arrowLeft" size={15} /> {vehicle.manufacturer} {vehicle.model}
            </Link>
            <span className={styles.stageMeta}>
              {selection.color.name} · {selection.wheel.name} · {selection.interior.name}
            </span>
          </div>
          <div className={styles.viewer}>
            <Suspense fallback={<div className={styles.viewerFallback}><VehicleSilhouette profile={vehicle.silhouette} color={selection.color.hex} /></div>}>
              <VehicleViewer vehicle={vehicle} color={selection.color} wheel={selection.wheel} interiorAccent={selection.interior.accent} variant="full" showHotspots={false} />
            </Suspense>
          </div>
        </div>

        <aside className={styles.panel} aria-label="Configuration">
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={cx(styles.stepButton, s.id === step && styles.stepActive, i < stepIndex && styles.stepDone)} onClick={() => setStep(s.id)} aria-current={s.id === step ? 'step' : undefined}>
                  <Icon name={s.icon} size={15} />
                  <span>{s.label}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className={styles.panelBody}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className={styles.stepContent}>
                {step === 'variant' && (
                  <>
                    <h2 className={styles.stepTitle}>Choose a variant</h2>
                    <div className={styles.options} role="radiogroup" aria-label="Variant">
                      {vehicle.variants.map((v) =>
                        optionRow({
                          key: v.id,
                          label: v.name,
                          sub: `${formatPower(v.power)} · ${formatRange(v.range)} · ${formatAcceleration(v.acceleration)}`,
                          price: v.price - vehicle.variants[0].price,
                          selected: v.id === selection.variant.id,
                          onSelect: () => setVariantId(v.id),
                        }),
                      )}
                    </div>
                  </>
                )}
                {step === 'exterior' && (
                  <>
                    <h2 className={styles.stepTitle}>Exterior colour</h2>
                    <div className={styles.options} role="radiogroup" aria-label="Exterior colour">
                      {vehicle.colors.map((c) => optionRow({ key: c.id, label: c.name, sub: c.finish, price: c.price, selected: c.id === selection.color.id, swatch: c.hex, onSelect: () => setColorId(c.id) }))}
                    </div>
                  </>
                )}
                {step === 'wheels' && (
                  <>
                    <h2 className={styles.stepTitle}>Wheels</h2>
                    <div className={styles.options} role="radiogroup" aria-label="Wheels">
                      {vehicle.wheels.map((w) => optionRow({ key: w.id, label: w.name, sub: `${w.style} · ${w.sizeInches}"`, price: w.price, selected: w.id === selection.wheel.id, onSelect: () => setWheelId(w.id) }))}
                    </div>
                  </>
                )}
                {step === 'interior' && (
                  <>
                    <h2 className={styles.stepTitle}>Interior theme</h2>
                    <div className={styles.options} role="radiogroup" aria-label="Interior">
                      {vehicle.interiors.map((i) => optionRow({ key: i.id, label: i.name, sub: i.material.replace('-', ' '), price: i.price, selected: i.id === selection.interior.id, swatch: i.accent, onSelect: () => setInteriorId(i.id) }))}
                    </div>
                    <p className={styles.tip}>
                      <Icon name="info" size={13} /> Use the Interior or Driver camera preset to see the cabin.
                    </p>
                  </>
                )}
                {step === 'trim' && (
                  <>
                    <h2 className={styles.stepTitle}>Trim inlays</h2>
                    <div className={styles.options} role="radiogroup" aria-label="Trim">
                      {vehicle.trims.map((t) => optionRow({ key: t.id, label: t.name, sub: t.description, price: t.price, selected: t.id === selection.trim.id, onSelect: () => setTrimId(t.id) }))}
                    </div>
                  </>
                )}
                {step === 'accessories' && (
                  <>
                    <h2 className={styles.stepTitle}>Accessories</h2>
                    <div className={styles.accessories}>
                      {vehicle.accessories.map((a) => (
                        <div key={a.id} className={cx(styles.accessory, accessoryIds.includes(a.id) && styles.accessoryActive)}>
                          <Checkbox
                            label={a.name}
                            description={a.description}
                            checked={accessoryIds.includes(a.id)}
                            onChange={() => setAccessoryIds((list) => (list.includes(a.id) ? list.filter((x) => x !== a.id) : [...list, a.id]))}
                          />
                          <span className={styles.optionPrice}>+{formatPrice(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {step === 'summary' && (
                  <>
                    <h2 className={styles.stepTitle}>Your build</h2>
                    <dl className={styles.summary}>
                      {[
                        ['Variant', selection.variant.name, selection.variant.price],
                        ['Exterior', selection.color.name, selection.color.price],
                        ['Wheels', selection.wheel.name, selection.wheel.price],
                        ['Interior', selection.interior.name, selection.interior.price],
                        ['Trim', selection.trim.name, selection.trim.price],
                        ...selection.accessories.map((a) => ['Accessory', a.name, a.price] as const),
                      ].map(([k, v, p], i) => (
                        <div key={`${k}-${i}`}>
                          <dt>{k}</dt>
                          <dd>
                            <span>{v}</span>
                            <span className={styles.summaryPrice}>{p ? formatPrice(p as number) : 'Included'}</span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className={styles.summaryActions}>
                      <Button onClick={save} iconLeft="bookmark" fullWidth>
                        Save build
                      </Button>
                      <Button variant="ghost" onClick={share} iconLeft="share" fullWidth>
                        Share
                      </Button>
                      <ButtonLink to={`/showroom?vehicle=${vehicle.id}`} variant="text" iconRight="arrowRight">
                        See it in the showroom
                      </ButtonLink>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className={styles.panelFooter}>
            <div className={styles.total}>
              <span className={styles.totalLabel}>Estimated total</span>
              <span className={cx(styles.totalValue, priceBump && styles.totalBump)} aria-live="polite">
                {formatPrice(selection.total)}
              </span>
            </div>
            <div className={styles.nav}>
              <Button variant="ghost" onClick={prev} disabled={stepIndex === 0} iconLeft="arrowLeft">
                Back
              </Button>
              {step !== 'summary' ? (
                <Button onClick={next} iconRight="arrowRight">
                  Next
                </Button>
              ) : (
                <Button onClick={save} iconLeft="bookmark">
                  Save
                </Button>
              )}
            </div>
          </footer>
        </aside>
      </div>
    </PageTransition>
  )
}
