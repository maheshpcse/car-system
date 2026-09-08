import { Html, MeshReflectorMaterial } from '@react-three/drei'
import { enableContextRecovery } from '@/three/scene/contextRecovery'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useIsMobile, usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import type { Vehicle } from '@/models/vehicle'
import { CAR_PROFILES } from '@/three/car/carProfiles'
import { ProceduralCar } from '@/three/car/ProceduralCar'
import { CameraRig, type CameraPose } from '@/three/scene/CameraRig'
import { Studio } from '@/three/scene/Studio'
import { useTheme } from '@/theme/ThemeProvider'
import styles from './ShowroomScene.module.scss'

export type ShowroomMode = 'explore' | 'focus' | 'interior' | 'compare' | 'specs'

interface ShowroomSceneProps {
  vehicles: Vehicle[]
  selected: number
  compareWith: number | null
  mode: ShowroomMode
  onSelect: (index: number) => void
  onReady: () => void
  onInteract?: () => void
}

const RADIUS = 7.5

export function placementFor(index: number, count: number) {
  const spread = Math.min(Math.PI * 0.95, count * 0.42)
  const angle = -spread / 2 + (count === 1 ? spread / 2 : (index / (count - 1)) * spread)
  const position = new THREE.Vector3(Math.sin(angle) * RADIUS, 0, -Math.cos(angle) * RADIUS + RADIUS * 0.55)
  // Cars face slightly towards the centre aisle.
  const rotationY = -angle * 0.35 + Math.PI * 0.1
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
      const cam = sel.position.clone().add(forward.clone().multiplyScalar(5.2)).add(right.clone().multiplyScalar(4.6))
      cam.y = 1.7
      const target = sel.position.clone().setY(p.roofHeight * 0.45)
      return { position: cam.toArray() as [number, number, number], target: target.toArray() as [number, number, number], minDistance: 3, maxDistance: 10 }
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
      const cam = mid.clone().add(new THREE.Vector3(0, 4.2, 9.5))
      return { position: cam.toArray() as [number, number, number], target: [mid.x, 0.6, mid.z], minDistance: 4, maxDistance: 18 }
    }
    case 'explore':
    default:
      return { position: [0, 5.5, 17], target: [0, 0.4, 1], minDistance: 6, maxDistance: 26 }
  }
}

function SceneBackground({ dark }: { dark: boolean }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const tone = dark ? '#0f1519' : '#efe9d6'
    scene.background = new THREE.Color(tone)
    scene.fog = new THREE.Fog(tone, 22, 60)
  }, [scene, dark])
  return null
}

function Podium({ radius, active }: { radius: number; active: boolean }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius + 0.15, 0.12, 64]} />
        <meshStandardMaterial color={dark ? '#252f38' : '#efe9d6'} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.08, radius, 96]} />
        <meshStandardMaterial
          color={active ? '#7d6bff' : dark ? '#3a4650' : '#d9d2bb'}
          emissive={active ? '#5a48ff' : '#000000'}
          emissiveIntensity={active ? 0.9 : 0}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

function Floor({ reflective }: { reflective: boolean }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
      <planeGeometry args={[70, 70]} />
      {reflective ? (
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={dark ? 18 : 6}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color={dark ? '#141b21' : '#ddd6c0'}
          metalness={0.2}
          mirror={0}
        />
      ) : (
        <meshStandardMaterial color={dark ? '#161d23' : '#e0d9c4'} roughness={0.95} />
      )}
    </mesh>
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
      camera={{ position: pose.position, fov: 34, near: 0.05, far: 120 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        enableContextRecovery(state)
        onReady()
      }}
      className={styles.canvas}
    >
      <SceneBackground dark={theme === 'dark'} />
      <Suspense fallback={null}>
        <Studio floorRadius={0} intensity={1.05} />
        <Floor reflective={reflective} />

        {/* Back wall with a soft light band */}
        <mesh position={[0, 4, -14]}>
          <planeGeometry args={[70, 12]} />
          <meshStandardMaterial color={theme === 'dark' ? '#131a20' : '#e8e1cb'} roughness={1} />
        </mesh>
        <mesh position={[0, 3.2, -13.9]}>
          <planeGeometry args={[26, 0.12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={theme === 'dark' ? 1.6 : 0.8} />
        </mesh>

        {vehicles.map((vehicle, i) => {
          const { position, rotationY } = placementFor(i, vehicles.length)
          const active = i === selected || i === compareWith
          const focused = mode !== 'explore' && !active
          return (
            <group key={vehicle.id} position={position.toArray()} rotation={[0, rotationY, 0]}>
              <Podium radius={3.1} active={i === selected} />
              <group
                position={[0, 0.12, 0]}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(i)
                }}
              >
                <ProceduralCar
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
                <Html position={[0, CAR_PROFILES[vehicle.silhouette].roofHeight + 0.9, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'auto' }}>
                  <button
                    type="button"
                    className={`${styles.label} ${i === selected ? styles.labelActive : ''} ${focused ? styles.labelDim : ''}`}
                    onClick={() => onSelect(i)}
                    data-cursor="view"
                    data-cursor-label="Focus"
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
          parallax={mode === 'explore' && !reduced && !isMobile ? 0.9 : 0}
          enableZoom
          minPolarAngle={mode === 'interior' ? 0.6 : 0.25}
          maxPolarAngle={mode === 'interior' ? Math.PI - 0.6 : Math.PI / 2 - 0.05}
          onInteract={onInteract}
        />
      </Suspense>
    </Canvas>
  )
}
