import { Canvas, useFrame } from '@react-three/fiber'
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
  /** Visual variant seed: changes skin / hair / shirt tones. */
  seed?: number
}

const PALETTES = [
  { skin: '#e9c4a4', hair: '#2b2320', shirt: '#1400c3' },
  { skin: '#8d5a3b', hair: '#1a1412', shirt: '#0984e3' },
  { skin: '#f1d6c1', hair: '#c98a4b', shirt: '#1e272e' },
  { skin: '#c68a5c', hair: '#3a2a22', shirt: '#00a29e' },
  { skin: '#d8a883', hair: '#4b3a33', shirt: '#ba0001' },
]

interface MoodTargets {
  smile: number // -1 sad .. 1 happy
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

function Face({ mood, focus, seed = 0 }: AvatarSceneProps) {
  const reduced = usePrefersReducedMotion()
  const palette = PALETTES[seed % PALETTES.length]

  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
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

  const mouthGeo = useMemo(() => new THREE.TorusGeometry(0.16, 0.022, 10, 32, Math.PI * 0.7), [])

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

    // Gaze target: mood override > focused field > pointer (or idle drift)
    const desired = target.lookOverride ?? (focus ? new THREE.Vector2(focus.x, focus.y) : pointer.current)
    if (reduced) desired.set(0, 0)
    look.current.lerp(desired, 1 - Math.exp(-delta * 4))
    const lx = THREE.MathUtils.clamp(look.current.x, -1, 1)
    const ly = THREE.MathUtils.clamp(look.current.y, -1, 1)

    if (head.current) {
      const bob = reduced ? 0 : Math.sin(t * 0.9) * 0.015
      head.current.rotation.y = lx * 0.32
      head.current.rotation.x = ly * 0.2 + bob
      head.current.rotation.z = -lx * 0.04
      head.current.position.y = 0.3 + (reduced ? 0 : Math.sin(t * 1.3) * 0.01)
    }
    for (const p of [leftPupil.current, rightPupil.current]) {
      if (p) {
        p.position.x = lx * 0.05
        p.position.y = -ly * 0.035
      }
    }

    // Blink
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
      const base = 0.235
      leftBrow.current.position.y = base + s.browRaise * 0.035 + s.browTilt * 0.02
      rightBrow.current.position.y = base + s.browRaise * 0.035 - s.browTilt * 0.02
      leftBrow.current.rotation.z = 0.12 + s.smile * -0.06 + s.browTilt * 0.25
      rightBrow.current.rotation.z = -0.12 + s.smile * 0.06 + s.browTilt * 0.1
    }

    if (mouth.current) {
      // smile>0: arc at the bottom of the torus curves upward at the ends
      const smile = s.smile
      const rotation = smile >= 0 ? -Math.PI * 0.85 : Math.PI * 0.15
      mouth.current.rotation.z += (rotation - mouth.current.rotation.z) * k
      const curve = Math.abs(smile)
      mouth.current.scale.set(0.7 + curve * 0.5, 0.15 + curve * 0.85, 1)
      mouth.current.position.y = -0.22 + (smile >= 0 ? curve * 0.09 : -curve * 0.02)
    }
    if (mouthInner.current) {
      mouthInner.current.scale.set(1, Math.max(0.001, s.mouthOpen), 1)
      mouthInner.current.position.y = -0.25
    }
  })

  return (
    <group position={[0, -0.35, 0]}>
      {/* Bust */}
      <mesh position={[0, -0.75, 0]} castShadow>
        <capsuleGeometry args={[0.62, 0.5, 8, 24]} />
        <meshStandardMaterial color={palette.shirt} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.35, 24]} />
        <meshStandardMaterial color={palette.skin} roughness={0.7} />
      </mesh>

      <group ref={head} position={[0, 0.3, 0]}>
        {/* Head */}
        <mesh castShadow>
          <sphereGeometry args={[0.72, 48, 48]} />
          <meshStandardMaterial color={palette.skin} roughness={0.68} />
        </mesh>
        {/* Hair cap */}
        <mesh position={[0, 0.16, -0.06]} rotation={[-0.25, 0, 0]}>
          <sphereGeometry args={[0.745, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={palette.hair} roughness={0.85} />
        </mesh>
        {/* Ears */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.71, -0.02, 0]}>
            <sphereGeometry args={[0.11, 20, 20]} />
            <meshStandardMaterial color={palette.skin} roughness={0.7} />
          </mesh>
        ))}

        {/* Eyes */}
        <group ref={eyes} position={[0, 0.08, 0.6]}>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.24, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.105, 28, 28]} />
                <meshStandardMaterial color="#fbfbfb" roughness={0.25} />
              </mesh>
              <group ref={side < 0 ? leftPupil : rightPupil} position={[0, 0, 0.07]}>
                <mesh>
                  <sphereGeometry args={[0.052, 20, 20]} />
                  <meshStandardMaterial color="#2c4a6e" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, 0.035]}>
                  <sphereGeometry args={[0.026, 16, 16]} />
                  <meshStandardMaterial color="#0d1218" roughness={0.2} />
                </mesh>
                <mesh position={[0.02, 0.02, 0.05]}>
                  <sphereGeometry args={[0.009, 10, 10]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
                </mesh>
              </group>
              {/* Eyelid: skin-toned shell that scales down to blink */}
              <mesh ref={side < 0 ? leftLid : rightLid} position={[0, 0.005, 0.005]} scale={[1, 1, 1]}>
                <sphereGeometry args={[0.118, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
                <meshStandardMaterial color={palette.skin} roughness={0.7} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Brows */}
        {[-1, 1].map((side) => (
          <mesh key={side} ref={side < 0 ? leftBrow : rightBrow} position={[side * 0.24, 0.235, 0.63]} rotation={[0, 0, side * -0.12]}>
            <capsuleGeometry args={[0.02, 0.16, 4, 8]} />
            <meshStandardMaterial color={palette.hair} roughness={0.9} />
          </mesh>
        ))}

        {/* Nose */}
        <mesh position={[0, -0.06, 0.7]}>
          <sphereGeometry args={[0.065, 20, 20]} />
          <meshStandardMaterial color={palette.skin} roughness={0.7} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouth} geometry={mouthGeo} position={[0, -0.22, 0.66]} rotation={[0, 0, -Math.PI * 0.85]}>
          <meshStandardMaterial color="#8c3f3f" roughness={0.6} />
        </mesh>
        <mesh ref={mouthInner} position={[0, -0.25, 0.655]}>
          <sphereGeometry args={[0.07, 20, 20]} />
          <meshStandardMaterial color="#3b1a1c" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function StaticFallback() {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <svg viewBox="0 0 200 200" width="180" height="180">
        <circle cx="100" cy="150" r="60" fill="#1400C3" />
        <circle cx="100" cy="86" r="52" fill="#e9c4a4" />
        <path d="M48 80a52 52 0 0 1 104 0v-8a52 52 0 0 0-104 0z" fill="#2b2320" />
        <circle cx="82" cy="86" r="6" fill="#0d1218" />
        <circle cx="118" cy="86" r="6" fill="#0d1218" />
        <path d="M84 108q16 12 32 0" stroke="#8c3f3f" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function AvatarScene(props: AvatarSceneProps) {
  const webgl = useWebGLSupport()
  if (!webgl) return <StaticFallback />
  return (
    <SceneErrorBoundary fallback={<StaticFallback />}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 0.05, 3.3], fov: 30, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Studio floorRadius={0} intensity={0.9} />
          <Face {...props} />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  )
}
