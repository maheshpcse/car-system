import { Html } from '@react-three/drei'
import { enableContextRecovery } from '@/three/scene/contextRecovery'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIsMobile, usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import { useWebGLSupport } from '@/core/hooks/useWebGL'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import type { Vehicle, VehicleColor, WheelOption } from '@/models/vehicle'
import { Icon } from '@/shared/icons/Icon'
import { IconButton } from '@/shared/ui/Button'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import { CAR_PROFILES } from '@/three/car/carProfiles'
import { ProceduralCar } from '@/three/car/ProceduralCar'
import { CameraRig } from '@/three/scene/CameraRig'
import { SceneErrorBoundary } from '@/three/scene/SceneErrorBoundary'
import { Studio } from '@/three/scene/Studio'
import { useSceneLoading } from './useSceneLoading'
import { poseFor, VIEW_PRESETS, type ViewPresetId } from './viewPresets'
import styles from './VehicleViewer.module.scss'

export interface VehicleViewerProps {
  vehicle: Vehicle
  color?: VehicleColor
  wheel?: WheelOption
  interiorAccent?: string
  /** hero: minimal chrome, parallax, no preset bar. full: all controls. */
  variant?: 'hero' | 'full' | 'compact'
  className?: string
  showHotspots?: boolean
  autoRotate?: boolean
}

interface Hotspot {
  id: string
  label: string
  detail: string
  position: [number, number, number]
}

function hotspotsFor(vehicle: Vehicle): Hotspot[] {
  const p = CAR_PROFILES[vehicle.silhouette]
  return [
    { id: 'light', label: 'Lighting', detail: vehicle.technology[3] ?? 'Adaptive LED lighting', position: [p.length / 2, p.noseHeight + 0.2, p.width / 2 - 0.35] },
    { id: 'wheel', label: 'Wheels', detail: vehicle.wheels[0]?.name ?? 'Aero wheels', position: [p.axles[1], p.wheelRadius * 1.9, p.width / 2] },
    { id: 'roof', label: 'Roof', detail: vehicle.features.find((f) => /roof/i.test(f)) ?? 'Structural roof', position: [(p.cabinStart + p.cabinEnd) / 2, p.roofHeight + 0.05, 0] },
    { id: 'power', label: 'Powertrain', detail: `${vehicle.power} hp · ${vehicle.torque} Nm`, position: [p.length / 2 - 0.8, p.shoulderFront + 0.05, -p.width / 4] },
  ]
}

function ViewerFallback({ vehicle, color, message }: { vehicle: Vehicle; color: string; message: string }) {
  return (
    <div className={styles.fallback} role="img" aria-label={`${vehicle.manufacturer} ${vehicle.model} preview`}>
      <VehicleSilhouette profile={vehicle.silhouette} color={color} className={styles.fallbackImage} />
      <p className={styles.fallbackMessage}>
        <Icon name="info" size={14} /> {message}
      </p>
    </div>
  )
}

export function VehicleViewer({
  vehicle,
  color,
  wheel,
  interiorAccent,
  variant = 'full',
  className,
  showHotspots = variant === 'full',
  autoRotate = false,
}: VehicleViewerProps) {
  const webgl = useWebGLSupport()
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const { reducedEffects } = usePreferences()
  const wrapper = useRef<HTMLDivElement>(null)

  const [preset, setPreset] = useState<ViewPresetId>('hero')
  const [poseKey, setPoseKey] = useState(0)
  const [rendererReady, setRendererReady] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [hotspotsOn, setHotspotsOn] = useState(showHotspots)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const { stage, progress, done } = useSceneLoading(rendererReady)
  const paint = color ?? vehicle.colors[0]
  const pose = useMemo(() => poseFor(preset, vehicle.silhouette), [preset, vehicle.silhouette])
  const interior = preset === 'interior' || preset === 'driver'
  const hotspots = useMemo(() => hotspotsFor(vehicle), [vehicle])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const el = wrapper.current
    if (!el) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await el.requestFullscreen()
    } catch {
      /* unsupported – ignore */
    }
  }, [])

  const reset = () => {
    setPreset('hero')
    setPoseKey((k) => k + 1)
    setActiveHotspot(null)
  }

  if (!webgl || failed) {
    return (
      <div ref={wrapper} className={cx(styles.viewer, styles[variant], className)}>
        <ViewerFallback vehicle={vehicle} color={paint.hex} message={failed ? '3D model unavailable — showing a static preview.' : 'WebGL is not supported on this device — showing a static preview.'} />
      </div>
    )
  }

  const dpr: [number, number] = isMobile || reducedEffects ? [1, 1.25] : [1, 1.75]

  return (
    <div
      ref={wrapper}
      className={cx(styles.viewer, styles[variant], fullscreen && styles.fullscreen, className)}
    >
      <SceneErrorBoundary
        onError={() => setFailed(true)}
        fallback={<ViewerFallback vehicle={vehicle} color={paint.hex} message="3D model unavailable — showing a static preview." />}
      >
        <Canvas
          shadows="percentage"
          dpr={dpr}
          camera={{ position: pose.position, fov: 32, near: 0.05, far: 80 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={(state) => {
            enableContextRecovery(state)
            setRendererReady(true)
          }}
          onPointerDown={() => setInteracted(true)}
          className={styles.canvas}
        >
          <Suspense fallback={null}>
            <Studio floorRadius={variant === 'hero' ? 0 : 8} shadowOpacity={variant === 'hero' ? 0.5 : 0.6} />
            <ProceduralCar
              silhouette={vehicle.silhouette}
              color={paint.hex}
              finish={paint.finish}
              wheelStyle={wheel?.style ?? vehicle.wheels[0]?.style ?? 'aero'}
              interiorAccent={interiorAccent ?? vehicle.interiors[0]?.accent}
              interiorMode={interior}
              wheelSpin={autoRotate && !reducedMotion ? 0.6 : 0}
            />
            {hotspotsOn && !interior && done &&
              hotspots.map((h) => (
                <Html key={h.id} position={h.position} center zIndexRange={[10, 0]} style={{ pointerEvents: 'auto' }}>
                  <button
                    type="button"
                    className={cx(styles.hotspot, activeHotspot === h.id && styles.hotspotActive)}
                    onClick={() => setActiveHotspot((a) => (a === h.id ? null : h.id))}
                    aria-label={`${h.label}: ${h.detail}`}
                    aria-expanded={activeHotspot === h.id}
                  >
                    <span className={styles.hotspotDot} />
                    <AnimatePresence>
                      {activeHotspot === h.id && (
                        <motion.span
                          className={styles.hotspotCard}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.18 }}
                        >
                          <strong>{h.label}</strong>
                          <span>{h.detail}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </Html>
              ))}
            <CameraRig
              pose={pose}
              poseKey={poseKey}
              parallax={variant === 'hero' && !reducedMotion && !isMobile ? 0.5 : 0}
              autoRotate={autoRotate && !reducedMotion && !interacted}
              enableZoom={variant !== 'hero'}
              minPolarAngle={interior ? 0.6 : 0.2}
              maxPolarAngle={interior ? Math.PI - 0.6 : Math.PI / 2 - 0.04}
              onInteract={() => setInteracted(true)}
            />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>

      {/* Loading */}
      <AnimatePresence>
        {!done && (
          <motion.div className={styles.loading} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} role="status" aria-live="polite">
            <div className={styles.loadingSilhouette}>
              <VehicleSilhouette profile={vehicle.silhouette} color={paint.hex} shadow={false} />
            </div>
            <div className={styles.loadingBar}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.loadingLabel}>
              {stage} <span className={styles.loadingPct}>{progress}%</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <AnimatePresence>
        {done && !interacted && !reducedMotion && (
          <motion.div className={styles.hint} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.4 }} aria-hidden="true">
            <Icon name="drag" size={15} /> Drag to explore
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {variant !== 'hero' && (
        <div className={styles.controls}>
          {variant === 'full' && (
            <div className={styles.presets} role="radiogroup" aria-label="Camera view">
              {VIEW_PRESETS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={preset === v.id}
                  className={cx(styles.preset, preset === v.id && styles.presetActive)}
                  onClick={() => {
                    setPreset(v.id)
                    setPoseKey((k) => k + 1)
                    setActiveHotspot(null)
                  }}
                  title={v.label}
                >
                  <Icon name={v.icon} size={14} />
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          )}
          <div className={styles.tools}>
            {variant === 'full' && (
              <IconButton icon="info" label={hotspotsOn ? 'Hide hotspots' : 'Show hotspots'} size="sm" variant="circular" active={hotspotsOn} onClick={() => setHotspotsOn((v) => !v)} />
            )}
            <IconButton icon="refresh" label="Reset camera" size="sm" variant="circular" onClick={reset} />
            <IconButton icon={fullscreen ? 'minimize' : 'maximize'} label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} size="sm" variant="circular" onClick={toggleFullscreen} />
          </div>
        </div>
      )}
    </div>
  )
}
