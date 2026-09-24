import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { useWebGLSupport } from '@/core/hooks/useWebGL'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { formatAcceleration, formatPower, formatPrice, formatRange, formatSpeed } from '@/core/utils/format'
import { FUEL_TYPES, labelFor } from '@/data/categories'
import { vehicles } from '@/data/vehicles'
import { Brand } from '@/layout/Brand'
import { dismissBootLoader } from '@/shared/feedback/bootLoader'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { ButtonLink, IconButton } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import { SceneErrorBoundary } from '@/three/scene/SceneErrorBoundary'
import type { ShowroomMode } from '@/three/showroom/ShowroomScene'
import { useTheme } from '@/theme/ThemeProvider'
import styles from './ShowroomPage.module.scss'

const ShowroomScene = lazy(() => import('@/three/showroom/ShowroomScene').then((m) => ({ default: m.ShowroomScene })))

const MODES: { id: ShowroomMode; label: string; icon: IconName; hint: string }[] = [
  { id: 'explore', label: 'Explore', icon: 'showroom', hint: 'Drag to look around the floor. Click a car to focus.' },
  { id: 'focus', label: 'Focus', icon: 'car', hint: 'Orbit around the selected vehicle.' },
  { id: 'interior', label: 'Interior', icon: 'seats', hint: 'Look around from the driver’s seat.' },
  { id: 'compare', label: 'Compare', icon: 'compare', hint: 'Pick a second vehicle from the rail.' },
  { id: 'specs', label: 'Specs', icon: 'info', hint: 'Key figures for the selected vehicle.' },
  { id: 'drive', label: 'Drive', icon: 'road', hint: 'Ride behind the car on an illustrated studio road.' },
]

const LINEUP = vehicles.slice(0, 6)

export default function ShowroomPage() {
  useDocumentTitle('Virtual Showroom', 'Walk the Aurora Motors showroom floor in 3D.')
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const webgl = useWebGLSupport()
  const { theme, toggle } = useTheme()
  const { isFavorite, toggleFavorite } = usePreferences()
  const { notify } = useToast()

  const initial = Math.max(0, LINEUP.findIndex((v) => v.id === params.get('vehicle')))
  const [selected, setSelected] = useState(initial)
  const [compareWith, setCompareWith] = useState<number | null>(null)
  const initialMode = (params.get('mode') as ShowroomMode | null) ?? (params.get('vehicle') ? 'focus' : 'explore')
  const [mode, setMode] = useState<ShowroomMode>(MODES.some((item) => item.id === initialMode) ? initialMode : 'explore')
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [railOpen, setRailOpen] = useState(true)
  const [hintVisible, setHintVisible] = useState(true)
  const [paintId, setPaintId] = useState<string | null>(null)
  const [panels, setPanels] = useState({ doors: false, hood: false, boot: false })

  const vehicle = LINEUP[selected]
  const other = compareWith !== null ? LINEUP[compareWith] : null
  const paint = vehicle.colors.find((c) => c.id === paintId) ?? vehicle.colors[0]

  useEffect(() => {
    setParams(
      (prev) => {
        if (prev.get('vehicle') === vehicle.id) return prev
        const next = new URLSearchParams(prev)
        next.set('vehicle', vehicle.id)
        return next
      },
      { replace: true },
    )
  }, [vehicle.id, setParams])

  useEffect(() => {
    setHintVisible(true)
    const t = window.setTimeout(() => setHintVisible(false), 3600)
    return () => window.clearTimeout(t)
  }, [mode])

  useEffect(() => {
    dismissBootLoader()
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
      if (e.key === 'ArrowRight') setSelected((i) => (i + 1) % LINEUP.length)
      if (e.key === 'ArrowLeft') setSelected((i) => (i - 1 + LINEUP.length) % LINEUP.length)
      if (e.key === 'Escape') setMode('explore')
      const n = Number(e.key)
      if (n >= 1 && n <= MODES.length) setMode(MODES[n - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const select = useCallback(
    (index: number) => {
      if (mode === 'compare') {
        if (index === selected) return
        setCompareWith(index)
        return
      }
      setSelected(index)
      setPaintId(null)
      setPanels({ doors: false, hood: false, boot: false })
      if (mode === 'explore') setMode('focus')
    },
    [mode, selected],
  )

  const changeMode = (next: ShowroomMode) => {
    setMode(next)
    if (next === 'compare' && compareWith === null) setCompareWith((selected + 1) % LINEUP.length)
  }

  const activeMode = useMemo(() => MODES.find((m) => m.id === mode)!, [mode])

  if (!webgl) {
    return (
      <div className={styles.fallbackPage}>
        <header className={styles.topbar}>
          <Brand />
          <ButtonLink to="/" variant="ghost" size="sm" iconLeft="arrowLeft">
            Back to studio
          </ButtonLink>
        </header>
        <div className="container">
          <EmptyState
            icon="showroom"
            title="The showroom needs WebGL"
            description="Your browser or device does not support 3D rendering. You can still explore every vehicle in the catalogue."
            action={
              <ButtonLink to="/cars" iconRight="arrowRight">
                Explore cars
              </ButtonLink>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cx(styles.page, ready && styles.ready)}>
      <SceneErrorBoundary
        fallback={
          <div className={styles.sceneFallback}>
            <VehicleSilhouette profile={vehicle.silhouette} color={vehicle.colors[0].hex} />
            <p>The 3D showroom could not start on this device.</p>
          </div>
        }
      >
        <Suspense fallback={null}>
          <ShowroomScene
            vehicles={LINEUP}
            selected={selected}
            compareWith={mode === 'compare' ? compareWith : null}
            mode={mode}
            entered={entered}
            paintHex={paint.hex}
            panels={panels}
            onSelect={select}
            onReady={() => setReady(true)}
            onInteract={() => setHintVisible(false)}
          />
        </Suspense>
      </SceneErrorBoundary>

      {/* Loading */}
      <AnimatePresence>
        {!ready && (
          <motion.div className={styles.loading} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} role="status">
            <Brand />
            <div className={styles.loadingBar}>
              <span />
            </div>
            <span>Preparing the hall…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && !entered && (
          <motion.button
            type="button"
            className={styles.enter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEntered(true)}
          >
            <span className="t-eyebrow">Aurora Motors</span>
            <strong>Enter the showroom</strong>
            <span>Glass doors open onto a dark hall of Indian-line cars.</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <IconButton icon="arrowLeft" label="Back to studio" variant="circular" onClick={() => navigate('/')} />
          <Brand className={styles.brand} />
        </div>
        <div className={styles.topCenter} aria-live="polite">
          <span className={styles.topEyebrow}>{vehicle.manufacturer}</span>
          <strong className={styles.topTitle}>{vehicle.model}</strong>
        </div>
        <div className={styles.topRight}>
          <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label="Toggle theme" variant="circular" onClick={toggle} />
          <IconButton icon="heart" label={isFavorite(vehicle.id) ? 'Remove from favourites' : 'Save to favourites'} variant="circular" active={isFavorite(vehicle.id)} filled={isFavorite(vehicle.id)} onClick={() => { toggleFavorite(vehicle.id); notify(isFavorite(vehicle.id) ? 'Removed from favourites' : 'Saved to favourites', 'success') }} />
          <IconButton icon={railOpen ? 'panelLeft' : 'list'} label={railOpen ? 'Hide vehicle list' : 'Show vehicle list'} variant="circular" onClick={() => setRailOpen((v) => !v)} className={styles.railToggle} />
        </div>
      </header>

      {/* Vehicle rail */}
      <AnimatePresence initial={false}>
        {railOpen && (
          <motion.aside className={styles.rail} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} aria-label="Vehicles on the floor">
            <span className={styles.railTitle}>{mode === 'compare' ? 'Pick a second vehicle' : 'On the floor'}</span>
            <ul className={styles.railList}>
              {LINEUP.map((v, i) => {
                const isSelected = i === selected
                const isOther = mode === 'compare' && i === compareWith
                return (
                  <li key={v.id}>
                    <button type="button" className={cx(styles.railItem, isSelected && styles.railItemActive, isOther && styles.railItemOther)} onClick={() => select(i)} aria-pressed={isSelected || isOther}>
                      <span className={styles.railVisual}>
                        <VehicleSilhouette profile={v.silhouette} color={v.colors[0].hex} shadow={false} />
                      </span>
                      <span className={styles.railText}>
                        <span>{v.manufacturer}</span>
                        <strong>{v.model}</strong>
                      </span>
                      {isSelected && <span className={cx('badge badge--primary', styles.railBadge)}>A</span>}
                      {isOther && <span className={cx('badge badge--accent', styles.railBadge)}>B</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
            <Link to={`/cars/${vehicle.id}`} className={styles.railLink}>
              Full details <Icon name="arrowUpRight" size={14} />
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Specs / compare overlays */}
      <AnimatePresence>
        {mode === 'specs' && (
          <motion.section key="specs" className={styles.panel} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }} aria-label="Specifications">
            <span className="t-eyebrow">{vehicle.variant}</span>
            <h2 className={styles.panelTitle}>
              {vehicle.manufacturer} {vehicle.model}
            </h2>
            <p className={styles.panelText}>{vehicle.tagline}</p>
            <dl className={styles.specList}>
              {[
                ['Power', formatPower(vehicle.power)],
                ['0–100 km/h', formatAcceleration(vehicle.acceleration)],
                ['Top speed', formatSpeed(vehicle.topSpeed)],
                ['Range', formatRange(vehicle.range)],
                ['Powertrain', labelFor(FUEL_TYPES, vehicle.fuelType)],
                ['Seats', String(vehicle.seats)],
                ['From', formatPrice(vehicle.price)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.panelActions}>
              <ButtonLink to={`/configurator/${vehicle.id}`} size="sm" iconLeft="palette">
                Configure
              </ButtonLink>
              <ButtonLink to={`/cars/${vehicle.id}`} size="sm" variant="ghost" iconRight="arrowRight">
                Details
              </ButtonLink>
            </div>
          </motion.section>
        )}

        {mode === 'compare' && other && (
          <motion.section key="compare" className={cx(styles.panel, styles.comparePanel)} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.25 }} aria-label="Comparison">
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th />
                  <th>
                    <span className="badge badge--primary">A</span> {vehicle.model}
                  </th>
                  <th>
                    <span className="badge badge--accent">B</span> {other.model}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Price', formatPrice(vehicle.price), formatPrice(other.price)],
                  ['Power', formatPower(vehicle.power), formatPower(other.power)],
                  ['0–100', formatAcceleration(vehicle.acceleration), formatAcceleration(other.acceleration)],
                  ['Range', formatRange(vehicle.range), formatRange(other.range)],
                  ['Seats', String(vehicle.seats), String(other.seats)],
                ].map(([k, a, b]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/compare" className={styles.railLink}>
              Full comparison <Icon name="arrowUpRight" size={14} />
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entered && (mode === 'focus' || mode === 'specs') && (
          <motion.div className={styles.customize} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className={styles.swatches} role="listbox" aria-label="Paint">
              {vehicle.colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={cx(styles.swatch, paint.id === color.id && styles.swatchActive)}
                  style={{ background: color.hex }}
                  aria-label={color.name}
                  onClick={() => setPaintId(color.id)}
                />
              ))}
            </div>
            <div className={styles.panelToggles}>
              {(['doors', 'hood', 'boot'] as const).map((key) => (
                <button key={key} type="button" className={cx(styles.panelBtn, panels[key] && styles.panelBtnOn)} onClick={() => setPanels((p) => ({ ...p, [key]: !p[key] }))}>
                  {key === 'doors' ? 'Doors' : key === 'hood' ? 'Bonnet' : 'Boot'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode hint */}
      <AnimatePresence>
        {hintVisible && ready && (
          <motion.p key={mode} className={styles.hint} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {activeMode.hint}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mode bar */}
      <nav className={styles.modeBar} aria-label="Showroom mode">
        {MODES.map((m, i) => (
          <button key={m.id} type="button" className={cx(styles.modeButton, mode === m.id && styles.modeActive)} onClick={() => changeMode(m.id)} aria-pressed={mode === m.id} title={`${m.label} (${i + 1})`}>
            <Icon name={m.icon} size={16} />
            <span>{m.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
