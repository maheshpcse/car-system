import { MeshReflectorMaterial } from '@react-three/drei'
import { useTheme } from '@/theme/ThemeProvider'

const HALL = {
  width: 32,
  depth: 26,
  height: 6.35,
  wall: 0.32,
}

interface ShowroomHallProps {
  reflective: boolean
}

function WindowBay({ x, z, rotateY, dark }: { x: number; z: number; rotateY: number; dark: boolean }) {
  return (
    <group position={[x, 2.55, z]} rotation={[0, rotateY, 0]}>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[5.4, 0.22, 0.18]} />
        <meshStandardMaterial color={dark ? '#2a333c' : '#d8d0bc'} roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.15, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.18, 0.2]} />
        <meshStandardMaterial color={dark ? '#1b2228' : '#c4bba4'} roughness={0.65} />
      </mesh>
      <mesh>
        <planeGeometry args={[5.1, 2.4]} />
        <meshPhysicalMaterial
          color={dark ? '#8fb4d8' : '#d7e7f5'}
          transparent
          opacity={0.28}
          roughness={0.05}
          metalness={0.08}
          transmission={0.55}
          thickness={0.08}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.08, 2.4, 0.06]} />
        <meshStandardMaterial color={dark ? '#3a4550' : '#eee6d2'} metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  )
}

function CoveLight({ position, length, intensity }: { position: [number, number, number]; length: number; intensity: number }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[length, 0.06, 0.42]} />
        <meshStandardMaterial color="#f7f3e8" emissive="#fff6df" emissiveIntensity={intensity} />
      </mesh>
    </group>
  )
}

/**
 * Enclosed showroom: plaster walls, clerestory glass, polished stone floor,
 * timber soffits and ceiling coves. Cars sit inside this volume.
 */
export function ShowroomHall({ reflective }: ShowroomHallProps) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { width: W, depth: D, height: H, wall: T } = HALL
  const plaster = dark ? '#1d252d' : '#efe8d4'
  const stone = dark ? '#141b21' : '#cfc6ae'
  const timber = dark ? '#2a2118' : '#8d6b48'
  const trim = dark ? '#2f3943' : '#d7cfbb'
  const ceiling = dark ? '#161c22' : '#f4efe2'

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        {reflective ? (
          <MeshReflectorMaterial
            blur={[300, 80]}
            resolution={512}
            mixBlur={0.85}
            mixStrength={dark ? 14 : 5}
            roughness={0.78}
            depthScale={0.9}
            minDepthThreshold={0.35}
            maxDepthThreshold={1.2}
            color={dark ? '#171e24' : '#d8d0ba'}
            metalness={0.18}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial color={dark ? '#161d23' : '#d8d0ba'} roughness={0.92} />
        )}
      </mesh>

      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 1.15, 64]} />
        <meshStandardMaterial color={dark ? '#2a333c' : '#c2b89f'} roughness={0.7} />
      </mesh>

      {/* North / south walls with window bays */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow castShadow>
        <boxGeometry args={[W + T, H, T]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[0, H / 2, D / 2]} receiveShadow>
        <boxGeometry args={[W + T, H, T]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial color={plaster} roughness={0.92} />
      </mesh>

      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={ceiling} roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.18, -D / 2 + 0.28]} castShadow>
        <boxGeometry args={[W - 1.2, 0.36, 0.42]} />
        <meshStandardMaterial color={stone} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.15, -D / 2 + 0.22]}>
        <boxGeometry args={[10.5, 0.08, 0.12]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff4dc" emissiveIntensity={dark ? 1.8 : 0.9} />
      </mesh>
      <mesh position={[0, 4.55, -D / 2 + 0.18]}>
        <planeGeometry args={[9.2, 1.4]} />
        <meshStandardMaterial color={dark ? '#0e1318' : '#1400c3'} roughness={0.55} />
      </mesh>

      {[-8.4, 0, 8.4].map((z) => (
        <WindowBay key={`e-${z}`} x={W / 2 - 0.18} z={z} rotateY={-Math.PI / 2} dark={dark} />
      ))}
      {[-8.4, 0, 8.4].map((z) => (
        <WindowBay key={`w-${z}`} x={-W / 2 + 0.18} z={z} rotateY={Math.PI / 2} dark={dark} />
      ))}

      {[-10, -3.4, 3.4, 10].map((x) => (
        <group key={x}>
          <mesh position={[x, H / 2, -D / 2 + 2.1]} castShadow>
            <boxGeometry args={[0.42, H, 0.42]} />
            <meshStandardMaterial color={trim} roughness={0.55} metalness={0.08} />
          </mesh>
          <mesh position={[x, H / 2, D / 2 - 2.1]} castShadow>
            <boxGeometry args={[0.42, H, 0.42]} />
            <meshStandardMaterial color={trim} roughness={0.55} metalness={0.08} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, H - 0.22, 0]}>
        <boxGeometry args={[W - 2.4, 0.16, 1.1]} />
        <meshStandardMaterial color={timber} roughness={0.55} />
      </mesh>

      <CoveLight position={[0, H - 0.12, -4.2]} length={18} intensity={dark ? 1.1 : 0.7} />
      <CoveLight position={[0, H - 0.12, 2.4]} length={18} intensity={dark ? 0.9 : 0.55} />
      <CoveLight position={[-8.5, H - 0.12, -0.6]} length={8} intensity={dark ? 0.7 : 0.4} />
      <CoveLight position={[8.5, H - 0.12, -0.6]} length={8} intensity={dark ? 0.7 : 0.4} />

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 13.2, 0.22, 0]} receiveShadow>
          <boxGeometry args={[1.6, 0.44, 14]} />
          <meshStandardMaterial color={stone} roughness={0.8} />
        </mesh>
      ))}

      <ambientLight intensity={dark ? 0.18 : 0.32} />
      <spotLight
        position={[0, H - 0.4, 0]}
        angle={1.05}
        penumbra={0.55}
        intensity={dark ? 38 : 28}
        distance={22}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color={dark ? '#d7e6ff' : '#fff6e4'}
      />
    </group>
  )
}
