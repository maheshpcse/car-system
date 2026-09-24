import { ContactShadows } from '@react-three/drei'
import { useTheme } from '@/theme/ThemeProvider'

interface StudioProps {
  floorRadius?: number
  shadowOpacity?: number
  intensity?: number
}

/**
 * Local studio lights only — no drei Environment (avoids THREE.Clock warnings
 * and extra GPU work that was dropping WebGL contexts).
 */
export function Studio({ floorRadius = 9, shadowOpacity = 0.55, intensity = 1 }: StudioProps) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const floor = dark ? '#1a2229' : '#e4decb'
  const key = dark ? 0.55 : 0.9

  return (
    <>
      <ambientLight intensity={(dark ? 0.32 : 0.5) * intensity} />
      <hemisphereLight args={[dark ? '#4a5a6a' : '#fff6e8', dark ? '#1a2228' : '#cfc4ae', 0.55 * intensity]} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={key * intensity * 1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        color={dark ? '#cfe3ff' : '#fff5e6'}
      />
      <directionalLight position={[-6, 4, -5]} intensity={0.4 * intensity} color={dark ? '#7dd8d4' : '#dfe8ff'} />

      {floorRadius > 0 && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
            <circleGeometry args={[floorRadius, 72]} />
            <meshStandardMaterial color={floor} roughness={0.92} metalness={0} />
          </mesh>
          <ContactShadows position={[0, 0.002, 0]} opacity={shadowOpacity} scale={floorRadius * 1.4} blur={2.2} far={3} resolution={256} color="#000000" />
        </>
      )}
    </>
  )
}
