import { useMutation, useQuery } from '@tanstack/react-query'
import type { components } from '@shared/api/openapi'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

type FeedbackPayload = components['schemas']['FeedbackPayload']
type FeedbackResponse = components['schemas']['FeedbackResponse']

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const newsKeys = {
  list: (params: string) => ['news', 'list', params] as const,
  detail: (id: string) => ['news', 'detail', id] as const,
}

export function useGetNewsQuery(queryParams: string) {
  return useQuery({
    queryKey: newsKeys.list(queryParams),
    queryFn: async () => {
      const data = await apiFetch<components['schemas']['NewsListResponse']>(`/api/news?${queryParams}`)
      return data.news
    },
  })
}

export function useGetNewsDetailQuery(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => apiFetch<NewsDetailsData>(`/api/news/${id}`),
    enabled: Boolean(id),
  })
}

export function usePostFeedbackMutation() {
  return useMutation<FeedbackResponse, Error, FeedbackPayload>({
    mutationFn: (body) =>
      apiFetch<FeedbackResponse>('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
  })
}
