import { useCallback, useEffect, useState } from 'react'

interface UseFetchReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFetch<T>(fetchFunction: () => Promise<T>): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsloading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setIsloading(true)
      setError(null)
      setData(null)
      const result = await fetchFunction()
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setIsloading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
