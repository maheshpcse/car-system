import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useTheme } from '@/theme/ThemeProvider'

interface StudioProps {
  /** Radius of the floor disc; 0 disables the floor. */
  floorRadius?: number
  shadowOpacity?: number
  intensity?: number
}

/**
 * Procedural studio lighting: no HDR downloads, works offline and on GitHub Pages.
 * Light temperature and floor tone follow the active theme.
 */
export function Studio({ floorRadius = 9, shadowOpacity = 0.55, intensity = 1 }: StudioProps) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const floor = dark ? '#1a2229' : '#e4decb'
  const key = dark ? 0.55 : 0.9

  return (
    <>
      <ambientLight intensity={(dark ? 0.25 : 0.45) * intensity} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={key * intensity * 1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        color={dark ? '#cfe3ff' : '#fff5e6'}
      />
      <directionalLight position={[-6, 4, -5]} intensity={0.35 * intensity} color={dark ? '#7dd8d4' : '#dfe8ff'} />

      <Environment key={theme} resolution={256} frames={1}>
        <group>
          <Lightformer form="rect" intensity={dark ? 2.4 : 3.2} position={[0, 5.5, 0]} scale={[8, 3, 1]} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
          <Lightformer form="rect" intensity={dark ? 1.2 : 1.6} position={[-7, 2.5, 2]} scale={[5, 1.4, 1]} rotation={[0, Math.PI / 2, 0]} color={dark ? '#a6c8ff' : '#fff4e0'} />
          <Lightformer form="rect" intensity={dark ? 1.0 : 1.4} position={[7, 2.5, -2]} scale={[5, 1.4, 1]} rotation={[0, -Math.PI / 2, 0]} color={dark ? '#8fe6e2' : '#ffffff'} />
          <Lightformer form="ring" intensity={dark ? 0.8 : 1.1} position={[0, 3, -7]} scale={[4, 4, 1]} color="#ffffff" />
        </group>
      </Environment>

      {floorRadius > 0 && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
            <circleGeometry args={[floorRadius, 72]} />
            <meshStandardMaterial color={floor} roughness={0.92} metalness={0} />
          </mesh>
          <ContactShadows position={[0, 0.002, 0]} opacity={shadowOpacity} scale={floorRadius * 1.4} blur={2.2} far={3} resolution={512} color="#000000" />
        </>
      )}
    </>
  )
}
