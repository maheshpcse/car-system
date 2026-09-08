import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { readStorage, writeStorage } from '@/core/utils/storage'

export function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initial))
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    writeStorage(key, value)
  }, [key, value])

  const set = useCallback<Dispatch<SetStateAction<T>>>((next) => setValue(next), [])
  return [value, set]
}
