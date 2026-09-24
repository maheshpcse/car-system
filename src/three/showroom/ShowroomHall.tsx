interface ShowroomHallProps {
  doorsOpen: boolean
}

export const HALL = { width: 24, depth: 26, height: 6.4 }

function Door({ side, open }: { side: -1 | 1; open: boolean }) {
  const x = side * (open ? 3.15 : 1.15)
  return (
    <mesh position={[x, 1.7, 11.15]}>
      <boxGeometry args={[2.2, 3.35, 0.08]} />
      <meshPhysicalMaterial color="#c5d8e8" transparent opacity={0.28} roughness={0.06} metalness={0.2} />
    </mesh>
  )
}

/** Dark hall that still reads: cool walls, lighter floor, bay key lights. */
export function ShowroomHall({ doorsOpen }: ShowroomHallProps) {
  const W = HALL.width
  const D = HALL.depth
  const H = HALL.height

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#3a434d" roughness={0.62} metalness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[2.4, 18]} />
        <meshStandardMaterial color="#4a3333" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.14, 18]} />
        <meshStandardMaterial color="#ff6a4a" emissive="#ff4a2a" emissiveIntensity={0.7} />
      </mesh>

      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W + 0.4, H, 0.35]} />
        <meshStandardMaterial color="#2a333c" roughness={0.92} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.35, H, D]} />
        <meshStandardMaterial color="#2c3640" roughness={0.92} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.35, H, D]} />
        <meshStandardMaterial color="#2c3640" roughness={0.92} />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#1e262e" roughness={1} />
      </mesh>

      <mesh position={[0, H / 2, 11.3]}>
        <boxGeometry args={[W, H, 0.12]} />
        <meshPhysicalMaterial color="#9ec4de" transparent opacity={0.14} roughness={0.05} metalness={0.18} />
      </mesh>
      <mesh position={[0, 3.45, 11.28]}>
        <boxGeometry args={[6.4, 0.08, 0.16]} />
        <meshStandardMaterial color="#5a6570" metalness={0.45} roughness={0.35} />
      </mesh>
      <Door side={-1} open={doorsOpen} />
      <Door side={1} open={doorsOpen} />

      <mesh position={[0, 4.4, -D / 2 + 0.22]}>
        <boxGeometry args={[8.5, 0.9, 0.06]} />
        <meshStandardMaterial color="#7d6bff" emissive="#7d6bff" emissiveIntensity={0.55} />
      </mesh>

      {[-5.6, 5.6].map((x) =>
        [3.2, -0.2, -3.6].map((z) => (
          <group key={`${x}-${z}`}>
            <mesh position={[x, 5.55, z]}>
              <boxGeometry args={[3.4, 0.08, 0.8]} />
              <meshStandardMaterial color="#fff6e0" emissive="#ffe7b8" emissiveIntensity={1.4} />
            </mesh>
            <spotLight
              position={[x, 5.2, z]}
              angle={0.55}
              penumbra={0.45}
              intensity={42}
              distance={9}
              color="#fff1d6"
              castShadow={false}
            />
          </group>
        )),
      )}
      <mesh position={[0, 5.55, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.08, 40]} />
        <meshStandardMaterial color="#fff6e0" emissive="#ffe2b0" emissiveIntensity={1.6} />
      </mesh>

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#e8f0ff', '#3a3330', 0.7]} />
      <spotLight position={[0, 5.9, 0]} angle={0.95} penumbra={0.4} intensity={55} distance={18} color="#fff4dc" />
      <directionalLight position={[6, 9, 5]} intensity={1.35} color="#fff7ea" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-7, 5, -4]} intensity={0.85} color="#9ec8ff" />
      <directionalLight position={[0, 3, 10]} intensity={0.55} color="#ffffff" />
    </group>
  )
}
