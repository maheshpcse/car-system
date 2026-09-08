import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export interface CameraPose {
  position: [number, number, number]
  target: [number, number, number]
  /** Override zoom limits, e.g. for interior views. */
  minDistance?: number
  maxDistance?: number
}

interface CameraRigProps {
  pose: CameraPose
  /** Incrementing this re-applies the pose even if it is unchanged (reset). */
  poseKey?: number
  enableZoom?: boolean
  enablePan?: boolean
  autoRotate?: boolean
  /** Subtle pointer parallax when the user is not dragging. */
  parallax?: number
  minPolarAngle?: number
  maxPolarAngle?: number
  onInteract?: () => void
}

/**
 * Orbit controls + smooth interpolation towards preset poses.
 * User input immediately cancels the interpolation.
 */
export function CameraRig({
  pose,
  poseKey = 0,
  enableZoom = true,
  enablePan = false,
  autoRotate = false,
  parallax = 0,
  minPolarAngle = 0.2,
  maxPolarAngle = Math.PI / 2 - 0.04,
  onInteract,
}: CameraRigProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera, pointer } = useThree()
  const goalPos = useRef(new THREE.Vector3(...pose.position))
  const goalTarget = useRef(new THREE.Vector3(...pose.target))
  const animating = useRef(true)
  const dragging = useRef(false)

  useEffect(() => {
    goalPos.current.set(...pose.position)
    goalTarget.current.set(...pose.target)
    animating.current = true
  }, [pose, poseKey])

  useFrame((_, delta) => {
    const c = controls.current
    if (!c) return
    if (animating.current && !dragging.current) {
      const k = 1 - Math.exp(-delta * 4.5)
      camera.position.lerp(goalPos.current, k)
      c.target.lerp(goalTarget.current, k)
      if (camera.position.distanceTo(goalPos.current) < 0.01 && c.target.distanceTo(goalTarget.current) < 0.01) {
        animating.current = false
      }
    } else if (parallax > 0 && !dragging.current) {
      // Gentle drift towards the pointer, relative to the current goal.
      const offset = new THREE.Vector3(-pointer.x * parallax, pointer.y * parallax * 0.5, 0)
      const desired = goalPos.current.clone().add(offset)
      camera.position.lerp(desired, 1 - Math.exp(-delta * 2))
    }
    c.update()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enableZoom={enableZoom}
      enablePan={enablePan}
      autoRotate={autoRotate}
      autoRotateSpeed={0.4}
      minDistance={pose.minDistance ?? 3.2}
      maxDistance={pose.maxDistance ?? 12}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      rotateSpeed={0.6}
      onStart={() => {
        dragging.current = true
        animating.current = false
        onInteract?.()
      }}
      onEnd={() => {
        dragging.current = false
        // After the user lets go, keep the new position as the parallax anchor.
        goalPos.current.copy(camera.position)
        goalTarget.current.copy(controls.current?.target ?? goalTarget.current)
      }}
    />
  )
}
