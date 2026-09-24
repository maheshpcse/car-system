interface ShowroomHallProps {
  doorsOpen: boolean
}

export const HALL = { width: 24, depth: 26, height: 6.4 }

function Door({ side, open }: { side: -1 | 1; open: boolean }) {
  const x = side * (open ? 3.15 : 1.15)
  return (
    <mesh position={[x, 1.7, 11.15]}>
      <boxGeometry args={[2.2, 3.35, 0.08]} />
      <meshPhysicalMaterial color="#9ec4de" transparent opacity={0.22} roughness={0.05} metalness={0.15} />
    </mesh>
  )
}

/** Dark cinematic hall: glass entrance, red-accent aisle, lit bays. */
export function ShowroomHall({ doorsOpen }: ShowroomHallProps) {
  const W = HALL.width
  const D = HALL.depth
  const H = HALL.height

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#14181d" roughness={0.55} metalness={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[2.2, 18]} />
        <meshStandardMaterial color="#1c1010" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.12, 18]} />
        <meshStandardMaterial color="#ff3b2e" emissive="#c81e14" emissiveIntensity={0.55} />
      </mesh>

      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W + 0.4, H, 0.35]} />
        <meshStandardMaterial color="#0e1216" roughness={0.95} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.35, H, D]} />
        <meshStandardMaterial color="#10151a" roughness={0.95} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.35, H, D]} />
        <meshStandardMaterial color="#10151a" roughness={0.95} />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#0b0e12" roughness={1} />
      </mesh>

      {/* Glass entrance wall */}
      <mesh position={[0, H / 2, 11.3]}>
        <boxGeometry args={[W, H, 0.12]} />
        <meshPhysicalMaterial color="#7ea8c4" transparent opacity={0.1} roughness={0.04} metalness={0.2} />
      </mesh>
      <mesh position={[0, 3.45, 11.28]}>
        <boxGeometry args={[6.4, 0.08, 0.16]} />
        <meshStandardMaterial color="#2a3138" metalness={0.5} roughness={0.35} />
      </mesh>
      <Door side={-1} open={doorsOpen} />
      <Door side={1} open={doorsOpen} />

      <mesh position={[0, 4.4, -D / 2 + 0.22]}>
        <boxGeometry args={[8.5, 0.9, 0.06]} />
        <meshStandardMaterial color="#1400c3" emissive="#1400c3" emissiveIntensity={0.35} />
      </mesh>

      {[-5.6, 5.6].map((x) =>
        [3.2, -0.2, -3.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 5.55, z]}>
            <boxGeometry args={[3.4, 0.06, 0.7]} />
            <meshStandardMaterial color="#f4ead2" emissive="#ffe7b8" emissiveIntensity={0.85} />
          </mesh>
        )),
      )}
      <mesh position={[0, 5.55, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.08, 40]} />
        <meshStandardMaterial color="#f4ead2" emissive="#ffd9a0" emissiveIntensity={1.1} />
      </mesh>

      <ambientLight intensity={0.16} />
      <spotLight position={[0, 5.8, 0]} angle={0.85} penumbra={0.5} intensity={28} distance={16} color="#ffe8c4" />
      <spotLight position={[0, 4.2, 10]} angle={0.6} penumbra={0.4} intensity={16} distance={14} color="#d7e6ff" />
      <directionalLight position={[4, 8, 6]} intensity={0.45} color="#cfd8e3" />
    </group>
  )
}
