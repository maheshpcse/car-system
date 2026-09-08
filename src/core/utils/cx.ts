export type ClassValue = string | number | boolean | null | undefined

/** Minimal class-name joiner. */
export const cx = (...values: ClassValue[]) => values.filter((v): v is string => typeof v === 'string' && v.length > 0).join(' ')
