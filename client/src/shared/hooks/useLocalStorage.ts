import { useEffect, useState } from 'react'

interface UseLocalStorageOptions<T> {
  key: string
  initialValue: T
}

export function useLocalStorage<T>({ key, initialValue }: UseLocalStorageOptions<T>) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T
      } catch {}
      return initialValue
    }
    return initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
