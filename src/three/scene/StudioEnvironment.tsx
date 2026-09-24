import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Lightweight generated IBL. Metallic / clearcoat paint reads as black without
 * an environment map; this avoids drei's HDR Environment (Clock + extra GPU).
 */
export function StudioEnvironment({ intensity = 0.9 }: { intensity?: number }) {
  const { gl, scene } = useThree()

  useEffect(() => {
    const room = new RoomEnvironment()
    const pmrem = new THREE.PMREMGenerator(gl)
    const { texture } = pmrem.fromScene(room, 0.04)
    scene.environment = texture
    scene.environmentIntensity = intensity
    room.dispose()
    pmrem.dispose()

    return () => {
      if (scene.environment === texture) scene.environment = null
      texture.dispose()
    }
  }, [gl, scene, intensity])

  return null
}
