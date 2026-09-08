import type { SVGProps } from 'react'

/**
 * Single custom SVG icon family.
 * All glyphs are drawn on a 24x24 grid with a 1.6 stroke and round joins so
 * the set stays visually consistent across the product.
 */
export type IconName = keyof typeof PATHS

const PATHS = {
  // Automotive -------------------------------------------------------------
  car: 'M4 15.5V13c0-.9.4-1.7 1-2.3L7.6 7.6C8.2 7 9 6.5 9.9 6.5h5.6c1.1 0 2.1.6 2.7 1.5l1.8 2.7c.9.5 2 1.4 2 2.9v2H4zM4 15.5h16 M7 15.5v2M17 15.5v2 M5.5 11h13 M6.5 18.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M14.5 18.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0',
  engine: 'M7 8h3l1-2h4l1 2h3v9h-2l-1 2h-6l-1-2H7z M4 10v6 M20 12v3 M10 10v5m4-5v5',
  battery: 'M3 8h15v8H3z M18 10.5h2v3h-2 M6 10.5v3m3-3v3m3-3v3',
  transmission: 'M6 5v14 M12 5v9 M18 5v9 M6 12h12 M4 5h4 M10 5h4 M16 5h4 M10 19h4',
  speed: 'M4.5 16.5a8 8 0 1 1 15 0 M12 16.5l3.5-6 M12 16.5h.01 M6.5 16.5h1M16.5 16.5h1',
  charging: 'M13 3 6 13h5l-1 8 7-10h-5z',
  fuel: 'M5 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14 M3.5 20h12 M7 8h6v4H7z M15 10h1.5a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 1 0 3 0V9.5L18.5 7',
  seats: 'M8 4v9h8 M8 13l-1.5 7 M16 13l1.5 7 M5 20h14 M8 4h5a2 2 0 0 1 2 2v7',
  safety: 'M12 3 5 6v5c0 4.5 3 8.4 7 10 4-1.6 7-5.5 7-10V6z M9.5 12l1.8 1.8L15 10',
  camera: 'M4 8h3.5l1.5-2.5h6L16.5 8H20v11H4z M12 16.5a3 3 0 1 0 0-6 3 3 0 1 0 0 6z',
  rotate360: 'M20 12a8 8 0 1 1-2.3-5.6 M20 4v4.5h-4.5 M7 12.5c0-1.4 2.2-2.5 5-2.5s5 1.1 5 2.5-2.2 2.5-5 2.5-5-1.1-5-2.5z',
  showroom: 'M3 10 12 4l9 6 M5 9v11h14V9 M9 20v-6h6v6 M3 20h18',
  compare: 'M9 4v16 M15 4v16 M4 9h5 M4 15h5 M15 9h5 M15 15h5',
  heart: 'M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z',
  filter: 'M4 6h16 M7 12h10 M10 18h4',
  sliders: 'M5 5v14 M12 5v14 M19 5v14 M3 9h4 M10 15h4 M17 7h4',
  list: 'M8 6h12 M8 12h12 M8 18h12 M4 6h.01M4 12h.01M4 18h.01',
  grid: 'M4 4h6.5v6.5H4z M13.5 4H20v6.5h-6.5z M4 13.5h6.5V20H4z M13.5 13.5H20V20h-6.5z',
  sort: 'M6 5v14 M6 19l-3-3 M6 19l3-3 M12 6h9 M12 11h7 M12 16h5',
  gauge: 'M12 4a8 8 0 0 1 8 8 M4 12a8 8 0 0 1 8-8 M12 12l3-4 M12 12h.01 M6 20h12',
  palette: 'M12 3a9 9 0 1 0 0 18c1.7 0 2-1 2-2v-1a2 2 0 0 1 2-2h1c2 0 4-1 4-4a9 9 0 0 0-9-9z M8 11h.01M11 7h.01M16 8h.01',
  layers: 'M12 4 4 8.5l8 4.5 8-4.5z M4 13l8 4.5 8-4.5 M4 17l8 4.5 8-4.5',
  wind: 'M4 9h10a2.5 2.5 0 1 0-2.5-2.5 M3 13h14a2.5 2.5 0 1 1-2.5 2.5 M5 17h5',
  drag: 'M12 3v18 M3 12h18 M12 3 9.5 5.5M12 3l2.5 2.5 M12 21l-2.5-2.5M12 21l2.5-2.5 M3 12l2.5-2.5M3 12l2.5 2.5 M21 12l-2.5-2.5M21 12l-2.5 2.5',
  steering: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z M12 14a2 2 0 1 0 0-4 2 2 0 1 0 0 4z M3.5 11c3-1.5 14-1.5 17 0 M12 14v7',

  // Interface --------------------------------------------------------------
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14z M16 16l4 4',
  x: 'M6 6l12 12 M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  arrowRight: 'M4 12h16 M13 5l7 7-7 7',
  arrowLeft: 'M20 12H4 M11 5l-7 7 7 7',
  arrowUpRight: 'M7 17 17 7 M8 7h9v9',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z M10 20a2 2 0 0 0 4 0',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 1 0 0 8z M4.5 20a7.5 7.5 0 0 1 15 0',
  users: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 1 0 0 7z M2.5 20a6.5 6.5 0 0 1 13 0 M16 5.5a3.5 3.5 0 0 1 0 6.5 M17 13.5c2.6.6 4.5 2.9 4.5 6.5',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 1 0 0 6z M19 12l1.5-1-1-2.5-1.8.2a7 7 0 0 0-1.4-1.4l.2-1.8L14 4.5 13 6h-2L10 4.5 7.5 5.5l.2 1.8A7 7 0 0 0 6.3 8.7l-1.8-.2-1 2.5L5 12l-1.5 1 1 2.5 1.8-.2a7 7 0 0 0 1.4 1.4l-.2 1.8 2.5 1 1-1.5h2l1 1.5 2.5-1-.2-1.8a7 7 0 0 0 1.4-1.4l1.8.2 1-2.5z',
  home: 'M4 11 12 4l8 7 M6 10v10h12V10 M10 20v-5h4v5',
  bookmark: 'M7 4h10v16l-5-3.5L7 20z',
  eye: 'M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z M12 15a3 3 0 1 0 0-6 3 3 0 1 0 0 6z',
  eyeOff: 'M4 4l16 16 M10.6 6.3A9.6 9.6 0 0 1 12 6c5.5 0 9 6 9 6a15.6 15.6 0 0 1-2.6 3.1 M6.5 8.4A15.3 15.3 0 0 0 3 12s3.5 6 9 6c1.2 0 2.3-.3 3.3-.7 M9.9 9.9a3 3 0 0 0 4.2 4.2',
  alert: 'M12 4 3 20h18z M12 10v4 M12 17h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 1 0 0 18z M12 11v5 M12 8h.01',
  maximize: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5',
  minimize: 'M9 4v5H4 M15 4v5h5 M9 20v-5H4 M15 20v-5h5',
  refresh: 'M4 12a8 8 0 0 1 13.7-5.7L20 8 M20 4v4h-4 M20 12a8 8 0 0 1-13.7 5.7L4 16 M4 20v-4h4',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5m4-5v5',
  logOut: 'M10 4H5v16h5 M14 8l4 4-4 4 M9 12h9',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3 M12 15v2',
  phone: 'M7 3h4l1.5 4.5-2 1.5a10 10 0 0 0 4.5 4.5l1.5-2L21 13v4a3 3 0 0 1-3 3A15 15 0 0 1 4 6a3 3 0 0 1 3-3z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 1 0 0 18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 1 0 0 8z M12 3v2 M12 19v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M3 12h2 M19 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  monitor: 'M3 5h18v11H3z M8 20h8 M12 16v4',
  panelLeft: 'M3 5h18v14H3z M9 5v14',
  wheel: 'M12 21a9 9 0 1 0 0-18 9 9 0 1 0 0 18z M12 15a3 3 0 1 0 0-6 3 3 0 1 0 0 6z M12 3v6 M12 15v6 M3 12h6 M15 12h6',
  share: 'M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5z M6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5z M18 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5z M8.2 11l7.6-4 M8.2 13l7.6 4',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  zap: 'M13 3 6 13h5l-1 8 7-10h-5z',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.8l-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.8z',
  play: 'M8 5v14l11-7z',
  send: 'M21 3 10 14 M21 3l-7 18-4-7-7-4z',
  shield: 'M12 3 5 6v5c0 4.5 3 8.4 7 10 4-1.6 7-5.5 7-10V6z',
  sparkle: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4z',
  cube: 'M12 3 4 7.5v9L12 21l8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9',
  dots: 'M6 12h.01M12 12h.01M18 12h.01',
  externalLink: 'M14 4h6v6 M20 4 11 13 M18 14v6H4V6h6',
  history: 'M4 12a8 8 0 1 0 2.4-5.7 M4 4v4.5h4.5 M12 8v4l3 2',
  ruler: 'M3 16 16 3l5 5L8 21z M7 12l1.5 1.5 M10 9l1.5 1.5 M13 6l1.5 1.5',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 1 0 0 6z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1',
  github: 'M12 3a9 9 0 0 0-2.8 17.5c.4.1.6-.2.6-.4v-1.6c-2.5.5-3-1.1-3-1.1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.4 0-1 .3-1.8.9-2.4-.1-.2-.4-1.2.1-2.4 0 0 .8-.2 2.5.9a8.6 8.6 0 0 1 4.6 0c1.7-1.1 2.5-.9 2.5-.9.5 1.2.2 2.2.1 2.4.6.6.9 1.4.9 2.4 0 3.4-2.1 4.2-4.1 4.4.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A9 9 0 0 0 12 3z',
} as const

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number | string
  strokeWidth?: number
  /** Fill-style rendering for a few solid glyphs (heart, star, bookmark). */
  filled?: boolean
  title?: string
}

export function Icon({ name, size = 20, strokeWidth = 1.6, filled = false, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  )
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[]
