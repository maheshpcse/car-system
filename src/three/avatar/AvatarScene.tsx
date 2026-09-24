import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { enableContextRecovery } from '@/three/scene/contextRecovery'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '@/core/hooks/useMediaQuery'
import { useWebGLSupport } from '@/core/hooks/useWebGL'
import type { AvatarFocus, AvatarMood } from '@/features/auth/avatarMood'
import { SceneErrorBoundary } from '@/three/scene/SceneErrorBoundary'
import { Studio } from '@/three/scene/Studio'
import styles from './AvatarScene.module.scss'

interface AvatarSceneProps {
  mood: AvatarMood
  focus: AvatarFocus | null
  seed?: number
  /** Full-body studio guide, or a closer portrait crop. */
  variant?: 'full' | 'portrait'
}

const PALETTES = [
  { skin: '#d4a574', hair: '#0d1218', shirt: '#0066b1', pants: '#111417', accent: '#ffffff' },
  { skin: '#8d5524', hair: '#1a1410', shirt: '#003d73', pants: '#1b2026', accent: '#6bb4e8' },
  { skin: '#f0c090', hair: '#2a1c14', shirt: '#111417', pants: '#003d73', accent: '#0066b1' },
  { skin: '#c68642', hair: '#3a2a22', shirt: '#0066b1', pants: '#0d1218', accent: '#ffffff' },
  { skin: '#e0ac69', hair: '#4b3a33', shirt: '#1b2026', pants: '#111417', accent: '#6bb4e8' },
]

interface MoodTargets {
  smile: number
  mouthOpen: number
  browRaise: number
  browTilt: number
  squint: number
  lookOverride: THREE.Vector2 | null
}

const MOODS: Record<AvatarMood, MoodTargets> = {
  idle: { smile: 0.25, mouthOpen: 0, browRaise: 0, browTilt: 0, squint: 0, lookOverride: null },
  attentive: { smile: 0.35, mouthOpen: 0, browRaise: 0.4, browTilt: 0, squint: 0, lookOverride: null },
  shy: { smile: 0.15, mouthOpen: 0, browRaise: 0.2, browTilt: 0.15, squint: 0.15, lookOverride: new THREE.Vector2(0.95, 0.35) },
  happy: { smile: 1, mouthOpen: 0.35, browRaise: 0.5, browTilt: 0, squint: 0.55, lookOverride: null },
  thinking: { smile: 0, mouthOpen: 0, browRaise: 0.6, browTilt: 0.5, squint: 0.1, lookOverride: new THREE.Vector2(0.6, -0.7) },
  sad: { smile: -0.8, mouthOpen: 0, browRaise: -0.2, browTilt: -0.4, squint: 0.2, lookOverride: null },
}

function Aim({ target }: { target: [number, number, number] }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(target[0], target[1], target[2])
  }, [camera, target])
  return null
}

function Guide({ mood, focus, seed = 0 }: AvatarSceneProps) {
  const reduced = usePrefersReducedMotion()
  const palette = PALETTES[seed % PALETTES.length]

  const figure = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const leftPupil = useRef<THREE.Group>(null)
  const rightPupil = useRef<THREE.Group>(null)
  const leftLid = useRef<THREE.Mesh>(null)
  const rightLid = useRef<THREE.Mesh>(null)
  const leftBrow = useRef<THREE.Mesh>(null)
  const rightBrow = useRef<THREE.Mesh>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const mouthInner = useRef<THREE.Mesh>(null)

  const pointer = useRef(new THREE.Vector2(0, 0))
  const look = useRef(new THREE.Vector2(0, 0))
  const blink = useRef({ next: 2.5, phase: 0 })
  const state = useRef({ smile: 0.25, mouthOpen: 0, browRaise: 0, browTilt: 0, squint: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const mouthGeo = useMemo(() => new THREE.TorusGeometry(0.09, 0.014, 10, 32, Math.PI * 0.7), [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const target = MOODS[mood]
    const s = state.current
    const k = 1 - Math.exp(-delta * 6)

    s.smile += (target.smile - s.smile) * k
    s.mouthOpen += (target.mouthOpen - s.mouthOpen) * k
    s.browRaise += (target.browRaise - s.browRaise) * k
    s.browTilt += (target.browTilt - s.browTilt) * k
    s.squint += (target.squint - s.squint) * k

    const desired = target.lookOverride ?? (focus ? new THREE.Vector2(focus.x, focus.y) : pointer.current)
    if (reduced) desired.set(0, 0)
    look.current.lerp(desired, 1 - Math.exp(-delta * 4))
    const lx = THREE.MathUtils.clamp(look.current.x, -1, 1)
    const ly = THREE.MathUtils.clamp(look.current.y, -1, 1)

    if (head.current) {
      head.current.rotation.y = lx * 0.28
      head.current.rotation.x = ly * 0.16
      head.current.rotation.z = -lx * 0.04
    }
    if (figure.current) {
      figure.current.rotation.y = lx * 0.22
      if (!reduced) figure.current.position.y = Math.sin(t * 1.2) * 0.012
    }
    if (leftArm.current && rightArm.current && !reduced) {
      leftArm.current.rotation.x = Math.sin(t * 1.1) * 0.06
      rightArm.current.rotation.x = Math.sin(t * 1.1 + 0.4) * -0.05
    }
    for (const p of [leftPupil.current, rightPupil.current]) {
      if (p) {
        p.position.x = lx * 0.028
        p.position.y = -ly * 0.02
      }
    }

    const b = blink.current
    if (!reduced) {
      if (t > b.next) {
        b.phase = 0.001
        b.next = t + 2.4 + Math.random() * 3.5
      }
      if (b.phase > 0) {
        b.phase += delta * 9
        if (b.phase >= Math.PI) b.phase = 0
      }
    }
    const blinkAmount = b.phase > 0 ? Math.sin(b.phase) : 0
    const lidScale = Math.max(0.06, 1 - blinkAmount * 0.96 - s.squint * 0.45)
    for (const lid of [leftLid.current, rightLid.current]) if (lid) lid.scale.y = lidScale

    if (leftBrow.current && rightBrow.current) {
      const base = 0.13
      leftBrow.current.position.y = base + s.browRaise * 0.02 + s.browTilt * 0.012
      rightBrow.current.position.y = base + s.browRaise * 0.02 - s.browTilt * 0.012
      leftBrow.current.rotation.z = 0.1 + s.smile * -0.05 + s.browTilt * 0.2
      rightBrow.current.rotation.z = -0.1 + s.smile * 0.05 + s.browTilt * 0.08
    }

    if (mouth.current) {
      const smile = s.smile
      const rotation = smile >= 0 ? -Math.PI * 0.85 : Math.PI * 0.15
      mouth.current.rotation.z += (rotation - mouth.current.rotation.z) * k
      const curve = Math.abs(smile)
      mouth.current.scale.set(0.7 + curve * 0.45, 0.18 + curve * 0.75, 1)
      mouth.current.position.y = -0.12 + (smile >= 0 ? curve * 0.05 : -curve * 0.015)
    }
    if (mouthInner.current) {
      mouthInner.current.scale.set(1, Math.max(0.001, s.mouthOpen), 1)
    }
  })

  return (
    <group ref={figure}>
      {[-1, 1].map((side) => (
        <mesh key={`shoe-${side}`} position={[side * 0.11, 0.045, 0.08]} castShadow>
          <boxGeometry args={[0.14, 0.07, 0.3]} />
          <meshStandardMaterial color="#0d1218" roughness={0.55} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`leg-${side}`} position={[side * 0.1, 0.4, 0]} castShadow>
          <capsuleGeometry args={[0.058, 0.56, 6, 16]} />
          <meshStandardMaterial color={palette.pants} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 0.76, 0]} castShadow>
        <boxGeometry args={[0.32, 0.14, 0.18]} />
        <meshStandardMaterial color={palette.pants} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.16, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.48, 8, 20]} />
        <meshStandardMaterial color={palette.shirt} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0, 1.38, 0.12]}>
        <boxGeometry args={[0.22, 0.04, 0.02]} />
        <meshStandardMaterial color={palette.accent} roughness={0.35} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <group key={`arm-${side}`} ref={side < 0 ? leftArm : rightArm} position={[side * 0.24, 1.36, 0]}>
          <mesh position={[0, -0.24, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <capsuleGeometry args={[0.045, 0.46, 6, 14]} />
            <meshStandardMaterial color={palette.shirt} roughness={0.38} />
          </mesh>
          <mesh position={[side * 0.04, -0.5, 0.02]}>
            <sphereGeometry args={[0.048, 14, 14]} />
            <meshStandardMaterial color={palette.skin} roughness={0.62} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.1, 16]} />
        <meshStandardMaterial color={palette.skin} roughness={0.62} />
      </mesh>

      <group ref={head} position={[0, 1.72, 0]}>
        <mesh castShadow scale={[0.92, 1.08, 0.88]}>
          <sphereGeometry args={[0.2, 36, 36]} />
          <meshStandardMaterial color={palette.skin} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.06, -0.01]} rotation={[-0.55, 0, 0]}>
          <sphereGeometry args={[0.205, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          <meshStandardMaterial color={palette.hair} roughness={0.82} />
        </mesh>
        <mesh position={[0.08, 0.12, 0.08]} rotation={[0.15, 0.6, 0.35]}>
          <boxGeometry args={[0.16, 0.035, 0.06]} />
          <meshStandardMaterial color={palette.hair} roughness={0.82} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.19, -0.02, 0]}>
            <sphereGeometry args={[0.028, 14, 14]} />
            <meshStandardMaterial color={palette.skin} roughness={0.62} />
          </mesh>
        ))}
        <group position={[0, 0.04, 0.168]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.062, 0, 0]}>
              <mesh scale={[1.15, 0.78, 1]}>
                <sphereGeometry args={[0.032, 20, 20]} />
                <meshStandardMaterial color="#f7f7f4" roughness={0.2} />
              </mesh>
              <group ref={side < 0 ? leftPupil : rightPupil} position={[0, 0, 0.02]}>
                <mesh>
                  <sphereGeometry args={[0.014, 14, 14]} />
                  <meshStandardMaterial color="#16324f" roughness={0.25} />
                </mesh>
                <mesh position={[0, 0, 0.01]}>
                  <sphereGeometry args={[0.007, 10, 10]} />
                  <meshStandardMaterial color="#05080c" roughness={0.15} />
                </mesh>
              </group>
              <mesh ref={side < 0 ? leftLid : rightLid} position={[0, 0.002, 0.002]}>
                <sphereGeometry args={[0.036, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color={palette.skin} roughness={0.62} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
        </group>
        {[-1, 1].map((side) => (
          <mesh key={side} ref={side < 0 ? leftBrow : rightBrow} position={[side * 0.062, 0.118, 0.175]} rotation={[0, 0, side * -0.18]}>
            <capsuleGeometry args={[0.007, 0.06, 4, 8]} />
            <meshStandardMaterial color={palette.hair} roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, -0.01, 0.185]} scale={[0.7, 1.15, 0.7]}>
          <sphereGeometry args={[0.022, 14, 14]} />
          <meshStandardMaterial color={palette.skin} roughness={0.58} />
        </mesh>
        <mesh ref={mouth} geometry={mouthGeo} position={[0, -0.11, 0.178]} rotation={[0, 0, -Math.PI * 0.85]}>
          <meshStandardMaterial color="#7a3a3a" roughness={0.55} />
        </mesh>
        <mesh ref={mouthInner} position={[0, -0.12, 0.176]}>
          <sphereGeometry args={[0.028, 14, 14]} />
          <meshStandardMaterial color="#3b1a1c" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

function StaticFallback({ variant }: { variant: 'full' | 'portrait' }) {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <svg viewBox={variant === 'full' ? '0 0 160 280' : '0 0 160 180'} width={variant === 'full' ? 120 : 140} height={variant === 'full' ? 210 : 150}>
        {variant === 'full' && (
          <>
            <rect x="58" y="210" width="18" height="48" rx="8" fill="#1e272e" />
            <rect x="84" y="210" width="18" height="48" rx="8" fill="#1e272e" />
            <rect x="52" y="128" width="56" height="88" rx="20" fill="#0066B1" />
            <rect x="32" y="136" width="16" height="70" rx="8" fill="#0066B1" />
            <rect x="112" y="136" width="16" height="70" rx="8" fill="#0066B1" />
          </>
        )}
        <circle cx="80" cy={variant === 'full' ? 88 : 86} r="36" fill="#c68642" />
        <path d={variant === 'full' ? 'M48 78a34 34 0 0 1 64 6v-10a34 34 0 0 0-64 0z' : 'M48 76a34 34 0 0 1 64 6v-10a34 34 0 0 0-64 0z'} fill="#1b1410" />
        <circle cx="68" cy={variant === 'full' ? 90 : 88} r="4" fill="#0d1218" />
        <circle cx="92" cy={variant === 'full' ? 90 : 88} r="4" fill="#0d1218" />
        <path d={variant === 'full' ? 'M70 104q10 8 20 0' : 'M70 102q10 8 20 0'} stroke="#8c3f3f" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function AvatarScene({ variant = 'full', ...props }: AvatarSceneProps) {
  const webgl = useWebGLSupport()
  if (!webgl) return <StaticFallback variant={variant} />
  const camera =
    variant === 'full'
      ? { position: [1.2, 1.28, 5.55] as [number, number, number], fov: 30, lookAt: [0.22, 1.02, 0.12] as [number, number, number] }
      : { position: [0.18, 1.66, 2.15] as [number, number, number], fov: 32, lookAt: [0, 1.66, 0] as [number, number, number] }
  return (
    <SceneErrorBoundary fallback={<StaticFallback variant={variant} />}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        shadows="percentage"
        onCreated={enableContextRecovery}
        camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Aim target={camera.lookAt} />
          <Studio floorRadius={variant === 'full' ? 6.5 : 0} intensity={variant === 'full' ? 1 : 0.9} />
          <group position={variant === 'full' ? ([-0.15, 0, 0.2] as [number, number, number]) : [0, 0, 0]} scale={variant === 'full' ? 1.22 : 1}>
            <Guide {...props} variant={variant} />
          </group>
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  )
}
