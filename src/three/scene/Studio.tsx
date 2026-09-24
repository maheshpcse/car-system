import { ContactShadows } from '@react-three/drei'
import { useTheme } from '@/theme/ThemeProvider'
import { StudioEnvironment } from './StudioEnvironment'

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
  const floor = dark ? '#2a333c' : '#e4decb'
  const key = dark ? 1.15 : 0.9

  return (
    <>
      <StudioEnvironment intensity={dark ? 1 : 0.75} />
      <ambientLight intensity={(dark ? 0.58 : 0.5) * intensity} />
      <hemisphereLight args={[dark ? '#e8f0ff' : '#fff6e8', dark ? '#3a3330' : '#cfc4ae', (dark ? 0.75 : 0.55) * intensity]} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={key * intensity * 1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        color={dark ? '#fff4dc' : '#fff5e6'}
      />
      <directionalLight position={[-6, 4, -5]} intensity={(dark ? 0.85 : 0.4) * intensity} color={dark ? '#9ec8ff' : '#dfe8ff'} />
      <directionalLight position={[0, 2.4, 7]} intensity={(dark ? 0.55 : 0.28) * intensity} color="#ffffff" />

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
