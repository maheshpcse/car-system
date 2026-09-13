import { Canvas, useFrame } from '@react-three/fiber'
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
  { skin: '#c68642', hair: '#1b1410', shirt: '#1400c3', pants: '#1e272e' },
  { skin: '#8d5524', hair: '#2a1c14', shirt: '#0984e3', pants: '#2b3138' },
  { skin: '#f1c27d', hair: '#6b4423', shirt: '#1e272e', pants: '#3a434b' },
  { skin: '#d1a3a4', hair: '#3a2a22', shirt: '#00a29e', pants: '#243038' },
  { skin: '#e0ac69', hair: '#4b3a33', shirt: '#ba0001', pants: '#1b2026' },
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
    if (figure.current && !reduced) {
      figure.current.position.y = Math.sin(t * 1.2) * 0.012
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
      {/* Shoes */}
      {[-1, 1].map((side) => (
        <mesh key={`shoe-${side}`} position={[side * 0.13, 0.05, 0.06]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.28]} />
          <meshStandardMaterial color="#15191d" roughness={0.7} />
        </mesh>
      ))}
      {/* Legs */}
      {[-1, 1].map((side) => (
        <mesh key={`leg-${side}`} position={[side * 0.12, 0.42, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.52, 6, 16]} />
          <meshStandardMaterial color={palette.pants} roughness={0.8} />
        </mesh>
      ))}
      {/* Hips */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.38, 0.16, 0.2]} />
        <meshStandardMaterial color={palette.pants} roughness={0.8} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.42, 8, 20]} />
        <meshStandardMaterial color={palette.shirt} roughness={0.72} />
      </mesh>
      {/* Arms */}
      {([-1, 1] as const).map((side) => (
        <group key={`arm-${side}`} ref={side < 0 ? leftArm : rightArm} position={[side * 0.28, 1.34, 0]}>
          <mesh position={[0, -0.22, 0]} rotation={[0, 0, side * 0.18]} castShadow>
            <capsuleGeometry args={[0.055, 0.42, 6, 14]} />
            <meshStandardMaterial color={palette.shirt} roughness={0.72} />
          </mesh>
          <mesh position={[side * 0.05, -0.48, 0.02]}>
            <sphereGeometry args={[0.055, 14, 14]} />
            <meshStandardMaterial color={palette.skin} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Neck */}
      <mesh position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 16]} />
        <meshStandardMaterial color={palette.skin} roughness={0.7} />
      </mesh>

      <group ref={head} position={[0, 1.68, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 40, 40]} />
          <meshStandardMaterial color={palette.skin} roughness={0.66} />
        </mesh>
        {/* Shorter cropped hair, not a giant cap */}
        <mesh position={[0, 0.08, -0.02]} rotation={[-0.35, 0, 0]}>
          <sphereGeometry args={[0.228, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
          <meshStandardMaterial color={palette.hair} roughness={0.88} />
        </mesh>
        <mesh position={[0.02, 0.1, 0.12]} rotation={[0.2, 0.4, 0.2]}>
          <boxGeometry args={[0.18, 0.05, 0.08]} />
          <meshStandardMaterial color={palette.hair} roughness={0.88} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.215, 0, 0]}>
            <sphereGeometry args={[0.038, 16, 16]} />
            <meshStandardMaterial color={palette.skin} roughness={0.7} />
          </mesh>
        ))}
        <group position={[0, 0.03, 0.185]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.07, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.038, 22, 22]} />
                <meshStandardMaterial color="#fbfbfb" roughness={0.25} />
              </mesh>
              <group ref={side < 0 ? leftPupil : rightPupil} position={[0, 0, 0.022]}>
                <mesh>
                  <sphereGeometry args={[0.018, 16, 16]} />
                  <meshStandardMaterial color="#3b2416" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.012]}>
                  <sphereGeometry args={[0.009, 12, 12]} />
                  <meshStandardMaterial color="#0d1218" roughness={0.2} />
                </mesh>
              </group>
              <mesh ref={side < 0 ? leftLid : rightLid} position={[0, 0.002, 0.002]}>
                <sphereGeometry args={[0.042, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
                <meshStandardMaterial color={palette.skin} roughness={0.7} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
        </group>
        {[-1, 1].map((side) => (
          <mesh key={side} ref={side < 0 ? leftBrow : rightBrow} position={[side * 0.07, 0.13, 0.19]} rotation={[0, 0, side * -0.1]}>
            <capsuleGeometry args={[0.01, 0.07, 4, 8]} />
            <meshStandardMaterial color={palette.hair} roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, -0.02, 0.2]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color={palette.skin} roughness={0.7} />
        </mesh>
        <mesh ref={mouth} geometry={mouthGeo} position={[0, -0.12, 0.195]} rotation={[0, 0, -Math.PI * 0.85]}>
          <meshStandardMaterial color="#8c3f3f" roughness={0.6} />
        </mesh>
        <mesh ref={mouthInner} position={[0, -0.13, 0.192]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#3b1a1c" roughness={0.9} />
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
            <rect x="52" y="128" width="56" height="88" rx="20" fill="#1400C3" />
            <rect x="32" y="136" width="16" height="70" rx="8" fill="#1400C3" />
            <rect x="112" y="136" width="16" height="70" rx="8" fill="#1400C3" />
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
  const camera = variant === 'full' ? { position: [0.45, 1.15, 4.9] as [number, number, number], fov: 28 } : { position: [0.2, 1.55, 2.05] as [number, number, number], fov: 32 }
  return (
    <SceneErrorBoundary fallback={<StaticFallback variant={variant} />}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        shadows="percentage"
        onCreated={enableContextRecovery}
        camera={{ ...camera, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Studio floorRadius={0} intensity={0.9} />
          <Guide {...props} variant={variant} />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  )
}
