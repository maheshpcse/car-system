import { useTheme } from '@/theme/ThemeProvider'

export const HALL = {
  width: 78,
  depth: 62,
  height: 8.2,
  wall: 0.4,
}

interface ShowroomHallProps {
  reflective: boolean
}

function Pendant({ x, z, dark }: { x: number; z: number; dark: boolean }) {
  return (
    <group position={[x, HALL.height - 0.2, z]}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 8]} />
        <meshStandardMaterial color={dark ? '#2a333c' : '#6d5a3c'} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.18, 24]} />
        <meshStandardMaterial color="#f4ead2" emissive="#ffe7b0" emissiveIntensity={dark ? 1.4 : 0.7} />
      </mesh>
      <pointLight position={[0, -0.85, 0]} intensity={dark ? 18 : 12} distance={16} color="#fff1cc" />
    </group>
  )
}

/**
 * Large dealership hall: marble bays, teak desk, jali screens, hanging lamps.
 */
export function ShowroomHall({ reflective: _reflective }: ShowroomHallProps) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { width: W, depth: D, height: H, wall: T } = HALL
  const plaster = dark ? '#1a222a' : '#f3ebe0'
  const marble = dark ? '#1c242c' : '#e8e0d0'
  const teak = dark ? '#3a2a1c' : '#8b5a2b'
  const jali = dark ? '#2a333c' : '#c9bba4'

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={marble} roughness={0.72} metalness={0.08} />
      </mesh>

      {[-1, 0, 1].map((gx) =>
        [-1, 0, 1].map((gz) => (
          <mesh key={`${gx}-${gz}`} rotation={[-Math.PI / 2, 0, 0]} position={[gx * 18, 0.01, gz * 16]} receiveShadow>
            <circleGeometry args={[3.4, 48]} />
            <meshStandardMaterial color={dark ? '#242c34' : '#ddd4c2'} roughness={0.78} />
          </mesh>
        )),
      )}

      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W + T, H, T]} />
        <meshStandardMaterial color={plaster} roughness={0.94} />
      </mesh>
      <mesh position={[0, H / 2, D / 2]} receiveShadow>
        <boxGeometry args={[W + T, H, T]} />
        <meshStandardMaterial color={plaster} roughness={0.94} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial color={plaster} roughness={0.94} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial color={plaster} roughness={0.94} />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={dark ? '#141a20' : '#f7f1e6'} roughness={0.96} />
      </mesh>

      {[-24, -8, 8, 24].map((z) => (
        <group key={`win-${z}`}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (W / 2 - 0.22), 3.4, z]}>
              <planeGeometry args={[0.08, 3.6]} />
              <meshPhysicalMaterial
                color={dark ? '#8fb4d8' : '#dceaf6'}
                transparent
                opacity={0.32}
                roughness={0.06}
                metalness={0.05}
              />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[0, 1.05, -D / 2 + 2.4]} castShadow>
        <boxGeometry args={[7.2, 1.05, 1.8]} />
        <meshStandardMaterial color={teak} roughness={0.55} />
      </mesh>
      <mesh position={[0, 4.6, -D / 2 + 0.28]}>
        <boxGeometry args={[16, 1.6, 0.08]} />
        <meshStandardMaterial color={dark ? '#0e1318' : '#1400c3'} roughness={0.5} />
      </mesh>

      {[-18, 0, 18].map((x) =>
        [8, -12].map((z) => <Pendant key={`${x}-${z}`} x={x} z={z} dark={dark} />),
      )}

      {[-28, 28].map((x) => (
        <group key={`jali-${x}`} position={[x, 2.4, -8]}>
          {[-2, -1, 0, 1, 2].map((c) =>
            [0, 1, 2].map((r) => (
              <mesh key={`${c}-${r}`} position={[c * 0.42, r * 0.55, 0]}>
                <boxGeometry args={[0.18, 0.32, 0.08]} />
                <meshStandardMaterial color={jali} roughness={0.7} />
              </mesh>
            )),
          )}
        </group>
      ))}

      {[-32, 32].map((x) => (
        <mesh key={`planter-${x}`} position={[x, 0.45, 18]}>
          <cylinderGeometry args={[0.7, 0.8, 0.9, 16]} />
          <meshStandardMaterial color={teak} roughness={0.7} />
        </mesh>
      ))}

      <ambientLight intensity={dark ? 0.22 : 0.4} />
      <hemisphereLight args={[dark ? '#4a5a6a' : '#fff6e8', dark ? '#1a2228' : '#cfc4ae', dark ? 0.45 : 0.7]} />
      <directionalLight
        position={[8, 14, 10]}
        intensity={dark ? 0.7 : 1.05}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color={dark ? '#d7e6ff' : '#fff6e4'}
      />
    </group>
  )
}
