import { useCallback, useEffect, useState } from 'react'

export function useFetch(fetchFunction) {
  const [data, setData] = useState(null)
  const [isLoading, setIsloading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setIsloading(true)
      setError(null)
      setData(null)
      const result = await fetchFunction()
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsloading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
