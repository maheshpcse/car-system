export type UserRole = 'customer' | 'visitor' | 'advisor' | 'admin'

export interface User {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
  title: string
  avatarSeed: number
  joinedAt: string
  location: string
}

export interface DemoPersona {
  id: string
  role: UserRole
  name: string
  title: string
  description: string
  username: string
  email: string
  password: string
  avatarSeed: number
}

export interface Credentials {
  username?: string
  email?: string
  password: string
  remember?: boolean
}

export interface SignupPayload {
  name: string
  username: string
  email: string
  password: string
  phone?: string
  country?: string
}
