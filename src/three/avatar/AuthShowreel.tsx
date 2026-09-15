import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ProceduralCar } from '@/three/car/ProceduralCar'

/**
 * Looping automotive “film” behind the studio guide:
 * a car driving a circuit, a service-bay lift, and a shopping lane.
 */
export function AuthShowreel({ reduced }: { reduced: boolean }) {
  return (
    <group>
      <RoadRing />
      <DrivingLoop reduced={reduced} />
      <ServiceBay reduced={reduced} />
      <ShoppingLane reduced={reduced} />
      <LightStreaks reduced={reduced} />
    </group>
  )
}

function RoadRing() {
  const geo = useMemo(() => new THREE.RingGeometry(2.15, 2.55, 64), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.008, -0.35]} geometry={geo} receiveShadow>
      <meshStandardMaterial color="#2a3138" roughness={0.92} metalness={0.05} />
    </mesh>
  )
}

function DrivingLoop({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return
    const u = clock.getElapsedTime() * 0.32
    const x = Math.cos(u) * 2.35 + 0.4
    const z = Math.sin(u) * 1.55 - 0.55
    ref.current.position.set(x, 0, z)
    ref.current.rotation.y = -u + Math.PI / 2
  })
  return (
    <group ref={ref} position={[2.75, 0, -0.55]} rotation={[0, Math.PI / 2, 0]} scale={0.38}>
      <ProceduralCar silhouette="sedan" color="#1400c3" finish="metallic" wheelStyle="sport" wheelSpin={reduced ? 0 : 10} />
    </group>
  )
}

function ServiceBay({ reduced }: { reduced: boolean }) {
  const lift = useRef<THREE.Group>(null)
  const wrench = useRef<THREE.Group>(null)
  const wheel = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (reduced) return
    const t = clock.getElapsedTime()
    if (lift.current) lift.current.position.y = 0.12 + (Math.sin(t * 0.7) + 1) * 0.18
    if (wrench.current) {
      wrench.current.rotation.z = Math.sin(t * 2.4) * 0.45
      wrench.current.rotation.y = t * 0.4
    }
    if (wheel.current) wheel.current.rotation.x = t * 2.2
  })
  return (
    <group position={[1.55, 0, 0.85]} rotation={[0, -0.55, 0]}>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.22, 0.18]}>
          <cylinderGeometry args={[0.035, 0.04, 0.44, 8]} />
          <meshStandardMaterial color="#3a434b" metalness={0.5} roughness={0.45} />
        </mesh>
      ))}
      <group ref={lift}>
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.95, 0.05, 0.55]} />
          <meshStandardMaterial color="#1b2026" roughness={0.7} />
        </mesh>
        <group scale={0.28} position={[0, 0.02, 0]} rotation={[0, Math.PI * 0.08, 0]}>
          <ProceduralCar silhouette="hatch" color="#00a29e" finish="pearl" wheelStyle="aero" wheelSpin={0} />
        </group>
      </group>
      <group ref={wrench} position={[-0.55, 0.55, 0.12]}>
        <mesh>
          <capsuleGeometry args={[0.03, 0.34, 4, 8]} />
          <meshStandardMaterial color="#cfd4d9" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <torusGeometry args={[0.07, 0.022, 8, 16]} />
          <meshStandardMaterial color="#b9bec4" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <mesh ref={wheel} position={[0.62, 0.22, 0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
        <meshStandardMaterial color="#15191d" roughness={0.7} />
      </mesh>
    </group>
  )
}

function ShoppingLane({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return
    const t = (Math.sin(clock.getElapsedTime() * 0.35) + 1) * 0.5
    ref.current.position.x = 1.15 + t * 1.1
    ref.current.position.z = -1.55 - t * 0.35
  })
  return (
    <group ref={ref} position={[1.15, 0, -1.55]} rotation={[0, 0.7, 0]} scale={0.3}>
      <ProceduralCar silhouette="coupe" color="#ba0001" finish="metallic" wheelStyle="forged" wheelSpin={reduced ? 0 : 4} />
    </group>
  )
}

function LightStreaks({ reduced }: { reduced: boolean }) {
  const a = useRef<THREE.Mesh>(null)
  const b = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (reduced) return
    const t = clock.getElapsedTime()
    if (a.current) a.current.position.x = ((t * 1.4) % 6) - 2.4
    if (b.current) b.current.position.x = 2.2 - ((t * 1.1 + 1.6) % 6)
  })
  return (
    <group>
      <mesh ref={a} position={[-2, 0.04, -0.2]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[1.4, 0.01, 0.06]} />
        <meshBasicMaterial color="#8fe6e2" transparent opacity={0.35} />
      </mesh>
      <mesh ref={b} position={[2, 0.04, -1.1]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[1.1, 0.01, 0.05]} />
        <meshBasicMaterial color="#fff1c4" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}
