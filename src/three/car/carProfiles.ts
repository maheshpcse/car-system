import type { Vehicle } from '@/models/vehicle'

/**
 * Parametric description of a stylised car body. All values are metres.
 * The x axis points to the front of the car, y is up, z is the width axis.
 */
export interface CarProfile {
  length: number
  width: number
  /** Ride height of the body underside. */
  clearance: number
  /** Height of the shoulder line (top of doors) at the rear / front. */
  shoulderRear: number
  shoulderFront: number
  /** Height of the nose tip and tail tip. */
  noseHeight: number
  tailHeight: number
  /** Roof height and the x-range of the roof panel. */
  roofHeight: number
  cabinStart: number
  cabinEnd: number
  /** Windshield / rear glass rake, as x-length of the sloped glass. */
  windshieldRun: number
  rearGlassRun: number
  wheelRadius: number
  /** x positions of rear and front axles. */
  axles: [number, number]
  /** Optional open bed (pickups): x where the bed starts. */
  bedStart?: number
  /** Roadster: no roof panel. */
  openTop?: boolean
}

export const CAR_PROFILES: Record<Vehicle['silhouette'], CarProfile> = {
  sedan: {
    length: 4.7,
    width: 1.86,
    clearance: 0.34,
    shoulderRear: 0.98,
    shoulderFront: 0.9,
    noseHeight: 0.62,
    tailHeight: 0.78,
    roofHeight: 1.42,
    cabinStart: -1.55,
    cabinEnd: 1.1,
    windshieldRun: 0.95,
    rearGlassRun: 0.85,
    wheelRadius: 0.36,
    axles: [-1.45, 1.4],
  },
  suv: {
    length: 4.85,
    width: 1.95,
    clearance: 0.42,
    shoulderRear: 1.16,
    shoulderFront: 1.05,
    noseHeight: 0.72,
    tailHeight: 0.98,
    roofHeight: 1.76,
    cabinStart: -2.2,
    cabinEnd: 1.05,
    windshieldRun: 0.82,
    rearGlassRun: 0.35,
    wheelRadius: 0.4,
    axles: [-1.5, 1.45],
  },
  coupe: {
    length: 4.6,
    width: 1.92,
    clearance: 0.28,
    shoulderRear: 0.92,
    shoulderFront: 0.8,
    noseHeight: 0.52,
    tailHeight: 0.8,
    roofHeight: 1.28,
    cabinStart: -1.5,
    cabinEnd: 0.85,
    windshieldRun: 1.1,
    rearGlassRun: 1.1,
    wheelRadius: 0.37,
    axles: [-1.35, 1.45],
  },
  hatch: {
    length: 4.15,
    width: 1.78,
    clearance: 0.33,
    shoulderRear: 0.98,
    shoulderFront: 0.9,
    noseHeight: 0.62,
    tailHeight: 0.92,
    roofHeight: 1.5,
    cabinStart: -1.95,
    cabinEnd: 0.95,
    windshieldRun: 0.85,
    rearGlassRun: 0.4,
    wheelRadius: 0.34,
    axles: [-1.25, 1.3],
  },
  wagon: {
    length: 4.9,
    width: 1.88,
    clearance: 0.33,
    shoulderRear: 1.0,
    shoulderFront: 0.9,
    noseHeight: 0.62,
    tailHeight: 0.92,
    roofHeight: 1.48,
    cabinStart: -2.35,
    cabinEnd: 1.15,
    windshieldRun: 0.95,
    rearGlassRun: 0.3,
    wheelRadius: 0.36,
    axles: [-1.5, 1.5],
  },
  roadster: {
    length: 4.2,
    width: 1.88,
    clearance: 0.27,
    shoulderRear: 0.86,
    shoulderFront: 0.76,
    noseHeight: 0.5,
    tailHeight: 0.74,
    roofHeight: 1.12,
    cabinStart: -1.0,
    cabinEnd: 0.6,
    windshieldRun: 0.6,
    rearGlassRun: 0.2,
    wheelRadius: 0.36,
    axles: [-1.25, 1.35],
    openTop: true,
  },
  pickup: {
    length: 5.45,
    width: 2.05,
    clearance: 0.5,
    shoulderRear: 1.12,
    shoulderFront: 1.08,
    noseHeight: 0.78,
    tailHeight: 1.12,
    roofHeight: 1.82,
    cabinStart: -0.55,
    cabinEnd: 1.25,
    windshieldRun: 0.8,
    rearGlassRun: 0.1,
    wheelRadius: 0.44,
    axles: [-1.75, 1.7],
    bedStart: -0.5,
  },
}
