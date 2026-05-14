import { useQuery, type UseQueryResult } from '@tanstack/react-query'

/** TanStack Query `useQuery` status — `'pending' | 'success' | 'error'` */
export type HealthStatus = UseQueryResult<unknown>['status']

interface UseHealthCheckReturn {
  status: HealthStatus
  lastOnlineAt: Date | null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL
export const useHealthCheck = (): UseHealthCheckReturn => {
  const { status, dataUpdatedAt } = useQuery({
    queryKey: ['health'],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${BASE_URL}/api/health`, { signal })
      if (!res.ok) throw new Error('Server error')
      return res.json()
    },
    refetchInterval: 30_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
  })

  const lastOnlineAt = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null

  return { status, lastOnlineAt }
}
