import { useEffect, useRef, useState } from 'react'

export type HealthStatus = 'checking' | 'online' | 'offline'

interface UseHealthCheckReturn {
  status: HealthStatus
  lastOnlineAt: Date | null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useHealthCheck = (): UseHealthCheckReturn => {
  const [status, setStatus] = useState<HealthStatus>('checking')
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null)

  const abortControllerRef = useRef<AbortController>(new AbortController())
  const isPollingRef = useRef(false)
  const errorCountRef = useRef(0)
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function poll() {
    if (isPollingRef.current) return

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current
    isPollingRef.current = true

    try {
      const res = await fetch(`${BASE_URL}/api/health`, { signal })

      if (res.ok) {
        setStatus('online')
        setLastOnlineAt(new Date())
        errorCountRef.current = 0
      } else {
        errorCountRef.current++
        if (errorCountRef.current >= 3) {
          setStatus('offline')
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      errorCountRef.current++
      if (errorCountRef.current >= 3) {
        setStatus('offline')
      }
    } finally {
      isPollingRef.current = false

      const errors = errorCountRef.current
      const delay = errors === 0 ? 30_000 : Math.min(1000 * 2 ** (errors - 1), 30_000)

      timerId.current = setTimeout(poll, delay)
    }
  }

  useEffect(() => {
    poll()
    return () => {
      abortControllerRef.current.abort()
      if (timerId.current !== null) clearTimeout(timerId.current)
    }
  }, [])

  return { status, lastOnlineAt }
}
