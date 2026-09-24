import { Html } from '@react-three/drei'
import { enableContextRecovery } from '@/three/scene/contextRecovery'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useIsMobile, usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import type { Vehicle } from '@/models/vehicle'
import { CAR_PROFILES } from '@/three/car/carProfiles'
import { RealisticCar } from '@/three/car/RealisticCar'
import { CameraRig, type CameraPose } from '@/three/scene/CameraRig'
import { Studio } from '@/three/scene/Studio'
import { useTheme } from '@/theme/ThemeProvider'
import { ShowroomHall } from './ShowroomHall'
import styles from './ShowroomScene.module.scss'

export type ShowroomMode = 'explore' | 'focus' | 'interior' | 'compare' | 'specs' | 'drive'

interface ShowroomSceneProps {
  vehicles: Vehicle[]
  selected: number
  compareWith: number | null
  mode: ShowroomMode
  onSelect: (index: number) => void
  onReady: () => void
  onInteract?: () => void
}

const RADIUS = 5.8

export function placementFor(index: number, count: number) {
  const spread = Math.min(Math.PI * 0.82, count * 0.4)
  const angle = -spread / 2 + (count === 1 ? spread / 2 : (index / (count - 1)) * spread)
  const position = new THREE.Vector3(Math.sin(angle) * RADIUS, 0, -Math.cos(angle) * RADIUS + RADIUS * 0.28)
  const rotationY = -angle * 0.28 + Math.PI * 0.08
  return { position, rotationY }
}

export function showroomPose(mode: ShowroomMode, vehicles: Vehicle[], selected: number, compareWith: number | null): CameraPose {
  const count = vehicles.length
  const sel = placementFor(selected, count)
  const p = CAR_PROFILES[vehicles[selected]?.silhouette ?? 'sedan']
  const forward = new THREE.Vector3(Math.cos(sel.rotationY), 0, -Math.sin(sel.rotationY))
  const right = new THREE.Vector3(-forward.z, 0, forward.x)

  switch (mode) {
    case 'focus':
    case 'specs': {
      const cam = sel.position.clone().add(forward.clone().multiplyScalar(4.4)).add(right.clone().multiplyScalar(3.6))
      cam.y = 1.45
      const target = sel.position.clone().setY(p.roofHeight * 0.42)
      return { position: cam.toArray() as [number, number, number], target: target.toArray() as [number, number, number], minDistance: 2.8, maxDistance: 9 }
    }
    case 'interior': {
      const cam = sel.position.clone().add(forward.clone().multiplyScalar(p.cabinEnd - p.windshieldRun - 0.35)).add(right.clone().multiplyScalar(0.38))
      cam.y = p.roofHeight - 0.22
      const target = sel.position.clone().add(forward.clone().multiplyScalar(p.cabinEnd + 3))
      target.y = p.roofHeight * 0.55
      return { position: cam.toArray() as [number, number, number], target: target.toArray() as [number, number, number], minDistance: 0.05, maxDistance: 0.3 }
    }
    case 'compare': {
      const other = placementFor(compareWith ?? selected, count)
      const mid = sel.position.clone().add(other.position).multiplyScalar(0.5)
      const cam = mid.clone().add(new THREE.Vector3(0, 2.6, 7.4))
      return { position: cam.toArray() as [number, number, number], target: [mid.x, 0.55, mid.z], minDistance: 3.5, maxDistance: 12 }
    }
    case 'drive': {
      const cam = sel.position.clone().add(forward.clone().multiplyScalar(-5.2)).add(right.clone().multiplyScalar(0.35))
      cam.y = 1.2
      const target = sel.position.clone().add(forward.clone().multiplyScalar(6))
      target.y = 0.65
      return { position: cam.toArray() as [number, number, number], target: target.toArray() as [number, number, number], minDistance: 3.5, maxDistance: 11 }
    }
    case 'explore':
    default:
      return { position: [0, 2.05, 9.4], target: [0, 0.62, -1.1], minDistance: 4, maxDistance: 14 }
  }
}

function SceneBackground({ dark }: { dark: boolean }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const tone = dark ? '#12181d' : '#e8e1cc'
    scene.background = new THREE.Color(tone)
    scene.fog = new THREE.Fog(tone, 16, 34)
  }, [scene, dark])
  return null
}

function Podium({ radius, active }: { radius: number; active: boolean }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return (
    <group>
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius + 0.12, 0.1, 64]} />
        <meshStandardMaterial color={dark ? '#252f38' : '#e7dfc8'} roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.07, radius, 96]} />
        <meshStandardMaterial
          color={active ? '#1400c3' : dark ? '#3a4650' : '#d4cbb4'}
          emissive={active ? '#7d6bff' : '#000000'}
          emissiveIntensity={active ? 0.55 : 0}
          roughness={0.35}
        />
      </mesh>
    </group>
  )
}

export function ShowroomScene({ vehicles, selected, compareWith, mode, onSelect, onReady, onInteract }: ShowroomSceneProps) {
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const { reducedEffects } = usePreferences()
  const { theme } = useTheme()
  const pose = useMemo(() => showroomPose(mode, vehicles, selected, compareWith), [mode, vehicles, selected, compareWith])
  const reflective = !isMobile && !reducedEffects

  return (
    <Canvas
      shadows="percentage"
      dpr={isMobile || reducedEffects ? [1, 1.25] : [1, 1.6]}
      camera={{ position: pose.position, fov: 34, near: 0.05, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        enableContextRecovery(state)
        onReady()
      }}
      className={styles.canvas}
    >
      <SceneBackground dark={theme === 'dark'} />
      <Suspense fallback={null}>
        <Studio floorRadius={0} intensity={0.72} />
        <ShowroomHall reflective={reflective} />

        {vehicles.map((vehicle, i) => {
          const { position, rotationY } = placementFor(i, vehicles.length)
          const active = i === selected || i === compareWith
          const focused = mode !== 'explore' && !active
          return (
            <group key={vehicle.id} position={position.toArray()} rotation={[0, rotationY, 0]}>
              <Podium radius={2.7} active={i === selected} />
              <group
                position={[0, 0.1, 0]}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(i)
                }}
              >
                <RealisticCar
                  silhouette={vehicle.silhouette}
                  color={vehicle.colors[0].hex}
                  finish={vehicle.colors[0].finish}
                  wheelStyle={vehicle.wheels[0]?.style}
                  interiorAccent={vehicle.interiors[0]?.accent}
                  interiorMode={mode === 'interior' && i === selected}
                  castShadow={!isMobile}
                />
              </group>
              {mode === 'explore' && (
                <Html position={[0, CAR_PROFILES[vehicle.silhouette].roofHeight + 0.75, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'auto' }}>
                  <button
                    type="button"
                    className={`${styles.label} ${i === selected ? styles.labelActive : ''} ${focused ? styles.labelDim : ''}`}
                    onClick={() => onSelect(i)}
                  >
                    <span>{vehicle.manufacturer}</span>
                    <strong>{vehicle.model}</strong>
                  </button>
                </Html>
              )}
            </group>
          )
        })}

        <CameraRig
          pose={pose}
          parallax={mode === 'explore' && !reduced && !isMobile ? 0.45 : 0}
          enableZoom
          minPolarAngle={mode === 'interior' ? 0.6 : 0.35}
          maxPolarAngle={mode === 'interior' ? Math.PI - 0.6 : Math.PI / 2 - 0.12}
          onInteract={onInteract}
        />
      </Suspense>
    </Canvas>
  )
}
