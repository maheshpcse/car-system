import type { Vehicle } from '@/models/vehicle'
import type { IconName } from '@/shared/icons/Icon'
import { CAR_PROFILES } from '@/three/car/carProfiles'
import type { CameraPose } from '@/three/scene/CameraRig'

export type ViewPresetId = 'hero' | 'front' | 'rear' | 'left' | 'right' | 'top' | 'detail' | 'interior' | 'driver'

export interface ViewPreset {
  id: ViewPresetId
  label: string
  icon: IconName
  interior?: boolean
}

export const VIEW_PRESETS: ViewPreset[] = [
  { id: 'hero', label: 'Studio', icon: 'sparkle' },
  { id: 'front', label: 'Front', icon: 'car' },
  { id: 'rear', label: 'Rear', icon: 'arrowLeft' },
  { id: 'left', label: 'Left', icon: 'chevronLeft' },
  { id: 'right', label: 'Right', icon: 'chevronRight' },
  { id: 'top', label: 'Top', icon: 'layers' },
  { id: 'detail', label: 'Detail', icon: 'search' },
  { id: 'interior', label: 'Interior', icon: 'seats', interior: true },
  { id: 'driver', label: 'Driver', icon: 'steering', interior: true },
]

export function poseFor(id: ViewPresetId, silhouette: Vehicle['silhouette']): CameraPose {
  const p = CAR_PROFILES[silhouette]
  const L = p.length
  const h = p.roofHeight
  const centre: [number, number, number] = [0, h * 0.45, 0]
  const d = L * 1.35
  switch (id) {
    case 'front':
      return { position: [d * 0.95, h * 0.9, d * 0.35], target: centre }
    case 'rear':
      return { position: [-d * 0.95, h * 0.9, -d * 0.35], target: centre }
    case 'left':
      return { position: [0.3, h * 0.8, d], target: centre }
    case 'right':
      return { position: [0.3, h * 0.8, -d], target: centre }
    case 'top':
      return { position: [0.2, d * 1.15, 0.01], target: [0, 0, 0] }
    case 'detail':
      return { position: [p.axles[1] + 1.6, p.wheelRadius + 0.4, p.width / 2 + 1.7], target: [p.axles[1], p.wheelRadius, p.width / 2], minDistance: 1.2 }
    case 'interior':
      return {
        position: [p.cabinStart + 0.4, h - 0.25, 0.0],
        target: [p.cabinEnd + 1.5, h * 0.6, 0],
        minDistance: 0.05,
        maxDistance: 0.4,
      }
    case 'driver':
      return {
        position: [p.cabinEnd - p.windshieldRun - 0.35, h - 0.22, 0.38],
        target: [p.cabinEnd + 3, h * 0.55, 0.2],
        minDistance: 0.05,
        maxDistance: 0.3,
      }
    case 'hero':
    default:
      return { position: [d * 0.8, h * 1.05, d * 0.62], target: centre }
  }
}
