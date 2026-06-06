import { apiFetch } from '@shared/api/apiFetch'
import type { components } from '@shared/api/openapi'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

type FeedbackPayload = components['schemas']['FeedbackPayload']
type FeedbackResponse = components['schemas']['FeedbackResponse']

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
