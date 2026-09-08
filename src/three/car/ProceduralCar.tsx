import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Vehicle, VehicleColor, WheelOption } from '@/models/vehicle'
import { CAR_PROFILES, type CarProfile } from './carProfiles'

export interface ProceduralCarProps {
  silhouette: Vehicle['silhouette']
  color: string
  finish?: VehicleColor['finish']
  wheelStyle?: WheelOption['style']
  interiorAccent?: string
  /** Hide roof + glass so interior presets can look inside. */
  interiorMode?: boolean
  /** Rotate wheels for a subtle "alive" feel. */
  wheelSpin?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  castShadow?: boolean
}

const BEVEL = 0.07

function bodyShape(p: CarProfile) {
  const half = p.length / 2
  const s = new THREE.Shape()
  s.moveTo(-half, p.clearance)
  s.lineTo(-half + 0.02, p.tailHeight)
  s.quadraticCurveTo(-half + 0.08, p.shoulderRear, -half + 0.28, p.shoulderRear)
  s.lineTo(p.cabinStart, p.shoulderRear)
  s.lineTo(p.cabinEnd, p.shoulderFront)
  s.lineTo(half - 0.35, p.noseHeight + 0.14)
  s.quadraticCurveTo(half, p.noseHeight + 0.1, half, p.noseHeight - 0.08)
  s.lineTo(half, p.clearance)
  s.closePath()
  return s
}

function glassShape(p: CarProfile) {
  const s = new THREE.Shape()
  if (p.openTop) {
    s.moveTo(p.cabinEnd, p.shoulderFront - 0.02)
    s.lineTo(p.cabinEnd - p.windshieldRun, p.roofHeight)
    s.lineTo(p.cabinEnd - p.windshieldRun - 0.08, p.roofHeight)
    s.lineTo(p.cabinEnd - 0.12, p.shoulderFront - 0.02)
    s.closePath()
    return s
  }
  s.moveTo(p.cabinStart + 0.05, p.shoulderRear - 0.02)
  s.lineTo(p.cabinStart + p.rearGlassRun, p.roofHeight - 0.02)
  s.lineTo(p.cabinEnd - p.windshieldRun, p.roofHeight - 0.02)
  s.lineTo(p.cabinEnd - 0.02, p.shoulderFront - 0.02)
  s.closePath()
  return s
}

function extrude(shape: THREE.Shape, width: number, bevel = BEVEL) {
  const depth = Math.max(width - bevel * 2, 0.2)
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    steps: 1,
    curveSegments: 12,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.computeVertexNormals()
  return geometry
}

const FINISH: Record<VehicleColor['finish'], { metalness: number; roughness: number; clearcoat: number }> = {
  solid: { metalness: 0.15, roughness: 0.38, clearcoat: 0.6 },
  metallic: { metalness: 0.75, roughness: 0.28, clearcoat: 1 },
  pearl: { metalness: 0.45, roughness: 0.2, clearcoat: 1 },
  matte: { metalness: 0.05, roughness: 0.85, clearcoat: 0 },
}

function Wheel({ radius, style, x, z, spin }: { radius: number; style: WheelOption['style']; x: number; z: number; spin: number }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current && spin) group.current.rotation.z -= spin * delta
  })
  const spokes = style === 'sport' ? 5 : style === 'forged' ? 7 : 0
  const rimR = radius * (style === 'classic' ? 0.58 : 0.66)
  return (
    <group position={[x, radius, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.27, 40]} />
        <meshStandardMaterial color="#15191d" roughness={0.9} metalness={0} />
      </mesh>
      <group ref={group}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[rimR, rimR, 0.285, 32]} />
          <meshStandardMaterial color={style === 'forged' ? '#2b3138' : '#b9bec4'} metalness={0.9} roughness={0.25} />
        </mesh>
        {spokes > 0 && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.01 : -0.01]}>
            <cylinderGeometry args={[rimR * 0.92, rimR * 0.92, 0.02, 32]} />
            <meshStandardMaterial color="#1b2026" metalness={0.6} roughness={0.5} />
          </mesh>
        )}
        {Array.from({ length: spokes }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (i / spokes) * Math.PI * 2]} position={[0, 0, z > 0 ? 0.15 : -0.15]}>
            <boxGeometry args={[rimR * 0.16, rimR * 1.7, 0.03]} />
            <meshStandardMaterial color="#cfd4d9" metalness={0.95} roughness={0.2} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.12, radius * 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#3a434b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export function ProceduralCar({
  silhouette,
  color,
  finish = 'metallic',
  wheelStyle = 'aero',
  interiorAccent = '#23272b',
  interiorMode = false,
  wheelSpin = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
}: ProceduralCarProps) {
  const p = CAR_PROFILES[silhouette]
  const bodyGeo = useMemo(() => extrude(bodyShape(p), p.width), [p])
  const glassGeo = useMemo(() => extrude(glassShape(p), p.width * 0.9, 0.04), [p])
  const bodyMat = useRef<THREE.MeshPhysicalMaterial>(null)
  const target = useMemo(() => new THREE.Color(color), [color])
  const f = FINISH[finish]

  // Smoothly blend paint colour when the user picks a new one.
  useFrame((_, delta) => {
    if (bodyMat.current) bodyMat.current.color.lerp(target, Math.min(1, delta * 6))
  })

  const half = p.length / 2
  const zEdge = p.width / 2 - 0.13
  const roofStart = p.cabinStart + p.rearGlassRun
  const roofEnd = p.cabinEnd - p.windshieldRun
  const roofLen = Math.max(roofEnd - roofStart, 0.2)
  const seatY = p.clearance + 0.32
  const seatX = roofEnd - 0.45

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Body */}
      <mesh geometry={bodyGeo} castShadow={castShadow} receiveShadow>
        <meshPhysicalMaterial
          ref={bodyMat}
          color={color}
          metalness={f.metalness}
          roughness={f.roughness}
          clearcoat={f.clearcoat}
          clearcoatRoughness={0.12}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Glasshouse + roof */}
      {!interiorMode && (
        <mesh geometry={glassGeo} castShadow={castShadow}>
          <meshPhysicalMaterial color="#5b6c78" metalness={0.9} roughness={0.08} transparent opacity={0.55} envMapIntensity={1.6} />
        </mesh>
      )}
      {!p.openTop && !interiorMode && (
        <mesh position={[(roofStart + roofEnd) / 2, p.roofHeight, 0]} castShadow={castShadow}>
          <boxGeometry args={[roofLen + 0.05, 0.06, p.width * 0.86]} />
          <meshPhysicalMaterial color={color} metalness={f.metalness} roughness={f.roughness} clearcoat={f.clearcoat} />
        </mesh>
      )}

      {/* Pickup bed liner */}
      {p.bedStart !== undefined && (
        <mesh position={[(-half + p.bedStart) / 2 + 0.05, p.shoulderRear + 0.005, 0]}>
          <boxGeometry args={[p.bedStart - -half - 0.35, 0.03, p.width - 0.4]} />
          <meshStandardMaterial color="#1b2026" roughness={0.95} />
        </mesh>
      )}

      {/* Interior */}
      <group>
        <mesh position={[roofEnd + 0.15, seatY + 0.28, 0]}>
          <boxGeometry args={[0.5, 0.22, p.width * 0.78]} />
          <meshStandardMaterial color="#1b2026" roughness={0.9} />
        </mesh>
        {[-0.38, 0.38].map((z) => (
          <group key={z} position={[seatX, seatY, z * (p.width / 1.86)]}>
            <mesh>
              <boxGeometry args={[0.55, 0.16, 0.5]} />
              <meshStandardMaterial color={interiorAccent} roughness={0.85} />
            </mesh>
            <mesh position={[-0.24, 0.32, 0]} rotation={[0, 0, -0.18]}>
              <boxGeometry args={[0.12, 0.62, 0.5]} />
              <meshStandardMaterial color={interiorAccent} roughness={0.85} />
            </mesh>
          </group>
        ))}
        {!p.openTop && roofLen > 1.4 && (
          <group position={[roofStart + 0.5, seatY, 0]}>
            <mesh>
              <boxGeometry args={[0.55, 0.16, p.width * 0.7]} />
              <meshStandardMaterial color={interiorAccent} roughness={0.85} />
            </mesh>
            <mesh position={[-0.24, 0.3, 0]} rotation={[0, 0, -0.14]}>
              <boxGeometry args={[0.12, 0.58, p.width * 0.7]} />
              <meshStandardMaterial color={interiorAccent} roughness={0.85} />
            </mesh>
          </group>
        )}
        <mesh position={[seatX + 0.42, seatY + 0.5, 0.38 * (p.width / 1.86)]} rotation={[0, 0, Math.PI / 2 - 0.5]}>
          <torusGeometry args={[0.17, 0.02, 12, 32]} />
          <meshStandardMaterial color="#111417" roughness={0.6} />
        </mesh>
      </group>

      {/* Lights */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[half - 0.02, p.noseHeight + 0.16, side * (p.width / 2 - 0.36)]}>
            <boxGeometry args={[0.08, 0.1, 0.46]} />
            <meshStandardMaterial color="#fff6dc" emissive="#fff1c4" emissiveIntensity={1.4} roughness={0.2} />
          </mesh>
          <mesh position={[-half + 0.02, p.tailHeight - 0.14, side * (p.width / 2 - 0.36)]}>
            <boxGeometry args={[0.08, 0.1, 0.5]} />
            <meshStandardMaterial color="#ff4a2a" emissive="#ff2d12" emissiveIntensity={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[p.cabinEnd - 0.05, p.shoulderFront + 0.08, side * (p.width / 2 + 0.08)]} castShadow={castShadow}>
            <boxGeometry args={[0.18, 0.09, 0.2]} />
            <meshPhysicalMaterial color={color} metalness={f.metalness} roughness={f.roughness} clearcoat={f.clearcoat} />
          </mesh>
        </group>
      ))}

      {/* Grille / bumpers / sills */}
      <mesh position={[half - 0.01, p.clearance + 0.16, 0]}>
        <boxGeometry args={[0.06, 0.22, p.width * 0.55]} />
        <meshStandardMaterial color="#12161a" roughness={0.7} />
      </mesh>
      <mesh position={[half - 0.05, p.clearance + 0.03, 0]}>
        <boxGeometry args={[0.2, 0.08, p.width * 0.9]} />
        <meshStandardMaterial color="#1b2026" roughness={0.8} />
      </mesh>
      <mesh position={[-half + 0.05, p.clearance + 0.03, 0]}>
        <boxGeometry args={[0.2, 0.08, p.width * 0.9]} />
        <meshStandardMaterial color="#1b2026" roughness={0.8} />
      </mesh>
      <mesh position={[0, p.clearance - 0.02, 0]}>
        <boxGeometry args={[p.length - 0.6, 0.08, p.width - 0.1]} />
        <meshStandardMaterial color="#15191d" roughness={0.9} />
      </mesh>

      {/* Wheels */}
      {p.axles.map((x) =>
        [-zEdge, zEdge].map((z) => <Wheel key={`${x}-${z}`} radius={p.wheelRadius} style={wheelStyle} x={x} z={z} spin={wheelSpin} />),
      )}
    </group>
  )
}
