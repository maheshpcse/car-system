import { useId } from 'react'
import type { Vehicle } from '@/models/vehicle'
import { cx } from '@/core/utils/cx'
import styles from './VehicleSilhouette.module.scss'

type Profile = Vehicle['silhouette']

/**
 * Side-profile body outlines on a 400x180 grid. Wheels are drawn separately so
 * the same profiles can be recolored for every vehicle.
 */
const BODIES: Record<Profile, { body: string; glass: string; wheels: [number, number]; wheelR: number }> = {
  sedan: {
    body: 'M28 118c0-10 6-16 18-20l34-8 44-32c10-8 18-10 30-10h70c14 0 24 4 34 12l38 30 44 8c12 2 20 8 20 20v12c0 6-4 10-10 10H38c-6 0-10-4-10-10z',
    glass: 'M132 90l36-28c6-5 10-6 18-6h30v34h-84zm94 0V56h34c8 0 14 2 20 7l26 27h-80z',
    wheels: [98, 306],
    wheelR: 26,
  },
  suv: {
    body: 'M26 124c0-12 6-18 18-22l26-6 34-38c8-9 16-12 28-12h130c14 0 24 4 32 12l30 30 40 8c12 2 18 8 18 20v14c0 6-4 10-10 10H36c-6 0-10-4-10-10z',
    glass: 'M114 90l30-32c4-4 8-6 14-6h50v38h-94zm106 0V52h48c8 0 14 2 18 7l26 31h-92z',
    wheels: [96, 312],
    wheelR: 28,
  },
  coupe: {
    body: 'M30 120c0-10 6-14 16-18l40-10 48-32c10-7 20-10 32-10h50c16 0 26 6 38 16l40 30 46 6c12 2 18 8 18 20v10c0 6-4 10-10 10H40c-6 0-10-4-10-10z',
    glass: 'M144 92l42-30c6-4 10-6 16-6h26v36h-84zm92 0V56h20c10 0 16 4 22 10l28 26h-70z',
    wheels: [102, 300],
    wheelR: 26,
  },
  hatch: {
    body: 'M32 120c0-10 6-16 18-20l28-8 38-36c8-8 16-10 28-10h96c14 0 22 6 28 14l22 30 34 10c12 4 16 10 16 20v10c0 6-4 10-10 10H42c-6 0-10-4-10-10z',
    glass: 'M124 90l32-32c4-4 8-6 14-6h36v38h-82zm90 0V52h26c8 0 12 4 16 9l20 29h-62z',
    wheels: [96, 296],
    wheelR: 26,
  },
  wagon: {
    body: 'M26 120c0-10 6-16 18-20l30-8 40-34c8-8 16-10 28-10h150c14 0 20 4 26 12l14 28 30 12c10 4 14 10 14 20v10c0 6-4 10-10 10H36c-6 0-10-4-10-10z',
    glass: 'M122 90l34-30c4-4 8-6 14-6h42v36h-90zm98 0V54h62c8 0 12 2 14 6l16 30h-92z',
    wheels: [94, 318],
    wheelR: 26,
  },
  roadster: {
    body: 'M34 122c0-10 6-14 16-18l46-10 44-24c8-4 14-6 24-6h28l30-16c8-4 12-4 20 0l12 16h30l40 26 40 6c12 2 18 8 18 18v8c0 6-4 10-10 10H44c-6 0-10-4-10-10z',
    glass: 'M198 70l24-14c6-3 10-3 14 0l10 14h-48z',
    wheels: [104, 300],
    wheelR: 26,
  },
  pickup: {
    body: 'M24 124c0-12 6-18 18-22l24-4 34-40c8-9 16-12 28-12h84c12 0 20 4 26 12l26 36h96c8 0 12 4 12 12v14c0 6-4 10-10 10H34c-6 0-10-4-10-10zM238 58h-8v36h86',
    glass: 'M108 92l30-36c4-4 8-6 14-6h28v42h-72zm84 0V50h20c8 0 12 2 16 7l24 35h-60z',
    wheels: [94, 320],
    wheelR: 28,
  },
}

interface VehicleSilhouetteProps {
  profile: Profile
  color: string
  className?: string
  /** Renders a soft floor shadow underneath. */
  shadow?: boolean
  title?: string
}

export function VehicleSilhouette({ profile, color, className, shadow = true, title }: VehicleSilhouetteProps) {
  const id = useId().replace(/:/g, '')
  const spec = BODIES[profile]
  return (
    <svg
      viewBox="0 0 400 180"
      className={cx(styles.svg, className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe8ee" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5e6f7c" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.32" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {shadow && <ellipse cx="200" cy="152" rx="170" ry="12" fill={`url(#${id}-shadow)`} />}

      <path d={spec.body} fill={color} />
      <path d={spec.body} fill={`url(#${id}-paint)`} />
      <path d={spec.glass} fill={`url(#${id}-glass)`} />

      {spec.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={130} r={spec.wheelR} fill="#1b2026" />
          <circle cx={cx} cy={130} r={spec.wheelR * 0.62} fill="#8a949c" />
          <circle cx={cx} cy={130} r={spec.wheelR * 0.52} fill="none" stroke="#3a434b" strokeWidth="3" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <line
              key={deg}
              x1={cx}
              y1={130}
              x2={cx + Math.cos((deg * Math.PI) / 180) * spec.wheelR * 0.5}
              y2={130 + Math.sin((deg * Math.PI) / 180) * spec.wheelR * 0.5}
              stroke="#3a434b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <circle cx={cx} cy={130} r={4} fill="#3a434b" />
        </g>
      ))}

      {/* Lights */}
      <rect x="352" y="96" width="18" height="7" rx="3" fill="#fff3d6" opacity="0.9" />
      <rect x="30" y="96" width="14" height="7" rx="3" fill="#ff4e02" opacity="0.85" />
      {/* Door line */}
      <path d="M200 92v30" stroke="#000" strokeOpacity="0.18" strokeWidth="1.5" />
    </svg>
  )
}
