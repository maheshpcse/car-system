import type { DemoPersona } from '@/models/user'

/** Demo-only personas. Credentials are fake and exist solely for the frontend demo. */
export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'customer',
    role: 'customer',
    name: 'Maya Lindqvist',
    title: 'Customer',
    description: 'Browse, favourite and configure vehicles as a prospective buyer.',
    email: 'maya@demo.aurora',
    password: 'demo1234',
    avatarSeed: 1,
  },
  {
    id: 'visitor',
    role: 'visitor',
    name: 'Showroom Visitor',
    title: 'Showroom Visitor',
    description: 'Explore the virtual showroom without a saved profile.',
    email: 'visitor@demo.aurora',
    password: 'demo1234',
    avatarSeed: 2,
  },
  {
    id: 'advisor',
    role: 'advisor',
    name: 'Daniel Okafor',
    title: 'Sales Advisor',
    description: 'Compare builds and guide customers through the line-up.',
    email: 'daniel@demo.aurora',
    password: 'demo1234',
    avatarSeed: 3,
  },
  {
    id: 'admin',
    role: 'admin',
    name: 'Priya Raman',
    title: 'Admin',
    description: 'Full access to every experience in the studio.',
    email: 'priya@demo.aurora',
    password: 'demo1234',
    avatarSeed: 4,
  },
]
