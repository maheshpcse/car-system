import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { assetUrl } from '@/core/config/environment'
import type { Vehicle, VehicleColor, WheelOption } from '@/models/vehicle'
import { CAR_PROFILES } from './carProfiles'

export interface RealisticCarProps {
  silhouette: Vehicle['silhouette']
  color: string
  finish?: VehicleColor['finish']
  wheelStyle?: WheelOption['style']
  interiorAccent?: string
  interiorMode?: boolean
  wheelSpin?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  castShadow?: boolean
}

const FERRARI = assetUrl('models/ferrari.glb')
const CONCEPT = assetUrl('models/car-concept.glb')

const FINISH: Record<VehicleColor['finish'], { metalness: number; roughness: number; clearcoat: number }> = {
  solid: { metalness: 0.22, roughness: 0.34, clearcoat: 0.72 },
  metallic: { metalness: 0.82, roughness: 0.22, clearcoat: 1 },
  pearl: { metalness: 0.48, roughness: 0.16, clearcoat: 1 },
  matte: { metalness: 0.08, roughness: 0.86, clearcoat: 0 },
}

const PAINT = /body|paint|carpaint|chassis|shell|hood|bonnet|door|fender|wing|bumper|quarter|panel|exterior|coat/i
const SKIP = /wheel|tire|tyre|rim|hub|glass|window|light|lamp|lens|chrome|interior|seat|brake|caliper|disc|rubber|grille|logo|number|plate|exhaust|rotor|spoke/i
const GLASS = /glass|window|windscreen|windshield|canopy/i
const ROOF = /roof|glass|window|canopy|cabin/i

function modelUrl(silhouette: Vehicle['silhouette']) {
  return silhouette === 'coupe' || silhouette === 'roadster' ? FERRARI : CONCEPT
}

function materialName(mesh: THREE.Mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  return mats.map((m) => m?.name ?? '').join(' ')
}

function labelOf(mesh: THREE.Mesh) {
  return `${mesh.name} ${mesh.parent?.name ?? ''} ${materialName(mesh)}`
}

function cloneMaterials(root: THREE.Object3D, castShadow: boolean) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    if (!mesh.material) return
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map((m) => m.clone()) : mesh.material.clone()
  })
}

function paintTargets(root: THREE.Object3D) {
  const named: THREE.MeshStandardMaterial[] = []
  const fallback: { mesh: THREE.Mesh; area: number }[] = []

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || !mesh.material) return
    const label = labelOf(mesh)
    const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(
      (m): m is THREE.MeshStandardMaterial => Boolean(m) && 'color' in m,
    )
    if (GLASS.test(label)) {
      mats.forEach((m) => {
        m.transparent = true
        m.opacity = Math.min(m.opacity, 0.42)
        m.roughness = 0.08
        m.metalness = 0.12
        if ('envMapIntensity' in m) m.envMapIntensity = 1.4
      })
      return
    }
    if (SKIP.test(label) && !PAINT.test(label)) return
    if (PAINT.test(label)) {
      named.push(...mats)
      return
    }
    const geo = mesh.geometry
    geo.computeBoundingBox()
    const size = geo.boundingBox?.getSize(new THREE.Vector3())
    fallback.push({ mesh, area: size ? size.x * size.y * size.z : 0 })
  })

  if (named.length) return named
  fallback.sort((a, b) => b.area - a.area)
  const mats: THREE.MeshStandardMaterial[] = []
  fallback.slice(0, 4).forEach(({ mesh }) => {
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    list.forEach((m) => {
      if (m && 'color' in m) mats.push(m as THREE.MeshStandardMaterial)
    })
  })
  return mats
}

function applyInteriorCut(root: THREE.Object3D, enabled: boolean) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    if (ROOF.test(labelOf(mesh))) mesh.visible = !enabled
  })
}

export function RealisticCar({
  silhouette,
  color,
  finish = 'metallic',
  wheelStyle: _wheelStyle,
  interiorAccent: _interiorAccent,
  interiorMode = false,
  wheelSpin = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
}: RealisticCarProps) {
  const url = modelUrl(silhouette)
  const gltf = useGLTF(url)
  const spin = useRef<THREE.Group>(null)
  const paint = useRef<THREE.MeshStandardMaterial[]>([])
  const target = useMemo(() => new THREE.Color(color), [color])
  const surface = FINISH[finish]

  const prepared = useMemo(() => {
    const clone = gltf.scene.clone(true)
    cloneMaterials(clone, castShadow)
    const paints = paintTargets(clone)
    applyInteriorCut(clone, interiorMode)

    const raw = new THREE.Box3().setFromObject(clone)
    const rawSize = raw.getSize(new THREE.Vector3())
    const yaw = rawSize.z > rawSize.x * 1.06 ? -Math.PI / 2 : 0
    clone.rotation.y = yaw
    clone.updateMatrixWorld(true)

    const aligned = new THREE.Box3().setFromObject(clone)
    const alignedSize = aligned.getSize(new THREE.Vector3())
    const length = CAR_PROFILES[silhouette].length
    const unit = alignedSize.x > 0.01 ? length / alignedSize.x : 1
    clone.scale.setScalar(unit)
    clone.updateMatrixWorld(true)

    const fitted = new THREE.Box3().setFromObject(clone)
    clone.position.x = -(fitted.min.x + fitted.max.x) / 2
    clone.position.z = -(fitted.min.z + fitted.max.z) / 2
    clone.position.y = -fitted.min.y

    return { clone, paints }
  }, [gltf.scene, silhouette, interiorMode, castShadow])

  useLayoutEffect(() => {
    paint.current = prepared.paints
    prepared.paints.forEach((mat) => {
      mat.color.copy(target)
      mat.metalness = surface.metalness
      mat.roughness = surface.roughness
      if ('clearcoat' in mat) {
        ;(mat as THREE.MeshPhysicalMaterial).clearcoat = surface.clearcoat
        ;(mat as THREE.MeshPhysicalMaterial).clearcoatRoughness = finish === 'matte' ? 0.55 : 0.12
      }
    })
  }, [prepared, target, surface, finish])

  useFrame((_, delta) => {
    paint.current.forEach((mat) => mat.color.lerp(target, Math.min(1, delta * 6)))
    if (spin.current && wheelSpin) spin.current.rotation.y += wheelSpin * delta * 0.15
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={spin}>
        <primitive object={prepared.clone} />
      </group>
    </group>
  )
}

useGLTF.preload(FERRARI)
useGLTF.preload(CONCEPT)
