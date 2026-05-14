import { useMutation, useQuery } from '@tanstack/react-query'
import type { components } from '@shared/api/openapi'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

type FeedbackPayload = components['schemas']['FeedbackPayload']
type FeedbackResponse = components['schemas']['FeedbackResponse']

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const newsKeys = {
  list: (params: string) => ['news', 'list', params] as const,
  detail: (id: string) => ['news', 'detail', id] as const,
}

export function useGetNewsQuery(queryParams: string) {
  return useQuery({
    queryKey: newsKeys.list(queryParams),
    queryFn: async (): Promise<NewsDetailsData[]> => {
      const res = await fetch(`${BASE_URL}/api/news?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch news')
      const data: components['schemas']['NewsListResponse'] = await res.json()
      return data.news
    },
  })
}

export function useGetNewsDetailQuery(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: async (): Promise<NewsDetailsData> => {
      const res = await fetch(`${BASE_URL}/api/news/${id}`)
      if (!res.ok) throw new Error(`Failed to fetch news detail: ${id}`)
      return res.json() as Promise<NewsDetailsData>
    },
    enabled: Boolean(id),
  })
}

export function usePostFeedbackMutation() {
  return useMutation<FeedbackResponse, Error, FeedbackPayload>({
    mutationFn: async (body) => {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to post feedback')
      return res.json() as Promise<FeedbackResponse>
    },
  })
}
