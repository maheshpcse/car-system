export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/

export const validateUsername = (value: string) => {
  if (!value.trim()) return 'Username is required.'
  if (!USERNAME_RE.test(value.trim())) return 'Use 3–32 letters, numbers, dots, hyphens or underscores.'
  return undefined
}

export const validateEmail = (value: string) => {
  if (!value.trim()) return 'Email is required.'
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address.'
  return undefined
}

export const validatePassword = (value: string, min = 6) => {
  if (!value) return 'Password is required.'
  if (value.length < min) return `Use at least ${min} characters.`
  return undefined
}

export const validateName = (value: string) => {
  if (!value.trim()) return 'Name is required.'
  if (value.trim().length < 2) return 'Enter your full name.'
  return undefined
}

export const passwordStrength = (value: string): { score: 0 | 1 | 2 | 3 | 4; label: string } => {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  return { score: score as 0 | 1 | 2 | 3 | 4, label: value ? labels[score] : '' }
}
