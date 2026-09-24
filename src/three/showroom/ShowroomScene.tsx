import { Html } from '@react-three/drei'
import { enableContextRecovery } from '@/three/scene/contextRecovery'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useIsMobile, usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import type { Vehicle } from '@/models/vehicle'
import { CAR_PROFILES } from '@/three/car/carProfiles'
import { RealisticCar } from '@/three/car/RealisticCar'
import { CameraRig, type CameraPose } from '@/three/scene/CameraRig'
import { StudioEnvironment } from '@/three/scene/StudioEnvironment'
import { ShowroomHall } from './ShowroomHall'
import styles from './ShowroomScene.module.scss'

export type ShowroomMode = 'explore' | 'focus' | 'interior' | 'compare' | 'specs' | 'drive'

export interface ShowroomPanels {
  doors: boolean
  hood: boolean
  boot: boolean
}

interface ShowroomSceneProps {
  vehicles: Vehicle[]
  selected: number
  compareWith: number | null
  mode: ShowroomMode
  entered: boolean
  paintHex?: string
  panels: ShowroomPanels
  onSelect: (index: number) => void
  onReady: () => void
  onInteract?: () => void
}

const SLOTS = [0, 1, 2, 3, 4, 5].map((index) => {
  const side = index < 3 ? -1 : 1
  const row = index % 3
  return {
    position: new THREE.Vector3(side * 5.6, 0, 3.2 - row * 3.4),
    rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
  }
})

export function placementFor(index: number) {
  return SLOTS[index] ?? SLOTS[0]
}

export function showroomPose(
  mode: ShowroomMode,
  vehicles: Vehicle[],
  selected: number,
  compareWith: number | null,
  entered: boolean,
): CameraPose {
  const p = CAR_PROFILES[vehicles[selected]?.silhouette ?? 'sedan']
  if (!entered) {
    return { position: [0, 1.55, 14.6], target: [0, 1.35, 10.6], minDistance: 2, maxDistance: 4 }
  }
  switch (mode) {
    case 'focus':
    case 'specs':
      return { position: [4.4, 1.55, 4.6], target: [0, 0.55, 0], minDistance: 3.2, maxDistance: 8 }
    case 'interior':
      return {
        position: [p.cabinEnd - p.windshieldRun - 0.35, p.roofHeight - 0.22, 0.38],
        target: [p.cabinEnd + 3, p.roofHeight * 0.55, 0.15],
        minDistance: 0.05,
        maxDistance: 0.3,
      }
    case 'compare': {
      const a = placementFor(selected).position
      const b = placementFor(compareWith ?? selected).position
      const mid = a.clone().add(b).multiplyScalar(0.5)
      return { position: [mid.x, 3.4, mid.z + 9], target: [mid.x, 0.5, mid.z], minDistance: 6, maxDistance: 16 }
    }
    case 'drive':
      return { position: [-6.2, 1.25, 0.4], target: [6, 0.65, 0], minDistance: 4, maxDistance: 12 }
    case 'explore':
    default:
      return { position: [0, 2.35, 11.2], target: [0, 0.55, 0], minDistance: 6, maxDistance: 15 }
  }
}

function SceneBackground() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.background = new THREE.Color('#1c242c')
    scene.fog = new THREE.Fog('#1c242c', 22, 42)
  }, [scene])
  return null
}

function Podium({ radius, active, spinning }: { radius: number; active: boolean; spinning?: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (spinning && ring.current) ring.current.rotation.z += dt * 0.35
  })
  return (
    <group>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius + 0.12, 0.1, 48]} />
        <meshStandardMaterial color="#4a545e" roughness={0.4} metalness={0.22} />
      </mesh>
      <mesh ref={ring} position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.08, radius, 64]} />
        <meshStandardMaterial
          color={active ? '#ff3b2e' : '#2a333c'}
          emissive={active ? '#ff3b2e' : '#000000'}
          emissiveIntensity={active ? 0.7 : 0}
          roughness={0.35}
        />
      </mesh>
    </group>
  )
}

function Bay({
  vehicle,
  index,
  selected,
  mode,
  paintHex,
  panels,
  onSelect,
}: {
  vehicle: Vehicle
  index: number
  selected: number
  mode: ShowroomMode
  paintHex?: string
  panels: ShowroomPanels
  onSelect: (index: number) => void
}) {
  const group = useRef<THREE.Group>(null)
  const slot = placementFor(index)
  const focused = mode === 'focus' || mode === 'specs' || mode === 'interior' || mode === 'drive'
  const onStage = focused && index === selected
  const dest = useMemo(() => (onStage ? new THREE.Vector3(0, 0.1, 0) : slot.position.clone().setY(0.08)), [onStage, slot.position])
  const destYaw = onStage ? -Math.PI / 2 : slot.rotationY
  const yaw = useRef(slot.rotationY)

  useFrame((_, dt) => {
    if (!group.current) return
    group.current.position.lerp(dest, 1 - Math.exp(-dt * 3.2))
    yaw.current = THREE.MathUtils.damp(yaw.current, destYaw, 3.2, dt)
    if (onStage && mode === 'focus') yaw.current += dt * 0.35
    group.current.rotation.y = yaw.current
  })

  const paint = paintHex && index === selected ? paintHex : vehicle.colors[0].hex
  const dimmed = focused && index !== selected

  return (
    <group ref={group} position={slot.position.toArray()} rotation={[0, slot.rotationY, 0]}>
      {!onStage && <Podium radius={2.15} active={index === selected} />}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect(index)
        }}
      >
        <RealisticCar
          silhouette={vehicle.silhouette}
          color={paint}
          finish={vehicle.colors[0].finish}
          wheelStyle={vehicle.wheels[0]?.style}
          interiorAccent={vehicle.interiors[0]?.accent}
          interiorMode={mode === 'interior' && index === selected}
          detail="high"
          openDoors={index === selected && panels.doors}
          openHood={index === selected && panels.hood}
          openBoot={index === selected && panels.boot}
          dimmed={dimmed}
          castShadow
        />
      </group>
      {mode === 'explore' && (
        <Html position={[0, CAR_PROFILES[vehicle.silhouette].roofHeight + 0.55, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'auto' }}>
          <button type="button" className={`${styles.label} ${index === selected ? styles.labelActive : ''}`} onClick={() => onSelect(index)}>
            <span>{vehicle.manufacturer}</span>
            <strong>{vehicle.model}</strong>
          </button>
        </Html>
      )}
    </group>
  )
}

export function ShowroomScene({
  vehicles,
  selected,
  compareWith,
  mode,
  entered,
  paintHex,
  panels,
  onSelect,
  onReady,
  onInteract,
}: ShowroomSceneProps) {
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const { reducedEffects } = usePreferences()
  const pose = useMemo(() => showroomPose(mode, vehicles, selected, compareWith, entered), [mode, vehicles, selected, compareWith, entered])
  const interior = mode === 'interior'

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile || reducedEffects ? [1, 1.15] : [1, 1.4]}
      camera={{ position: pose.position, fov: 34, near: 0.08, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        enableContextRecovery(state)
        onReady()
      }}
      className={styles.canvas}
    >
      <SceneBackground />
      <Suspense fallback={null}>
        <StudioEnvironment intensity={1.05} />
        <ShowroomHall doorsOpen={entered} />
        <Podium radius={2.6} active={mode === 'focus' || mode === 'specs'} spinning={mode === 'focus'} />

        {vehicles.map((vehicle, i) => (
          <Bay
            key={vehicle.id}
            vehicle={vehicle}
            index={i}
            selected={selected}
            mode={mode}
            paintHex={paintHex}
            panels={panels}
            onSelect={onSelect}
          />
        ))}

        <CameraRig
          pose={pose}
          poseKey={entered ? 1 : 0}
          parallax={entered && mode === 'explore' && !reduced && !isMobile ? 0.2 : 0}
          enableZoom={entered}
          autoRotate={entered && mode === 'focus' && !reduced}
          minPolarAngle={interior ? 0.7 : 0.72}
          maxPolarAngle={interior ? Math.PI - 0.7 : 1.22}
          onInteract={onInteract}
        />
      </Suspense>
    </Canvas>
  )
}
