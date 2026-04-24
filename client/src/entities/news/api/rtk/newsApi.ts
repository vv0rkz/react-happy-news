import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

// TODO: добавить интерфейсы для feedback:
// interface FeedbackPayload { message: string; email?: string }
// interface FeedbackResponse { ok: boolean; message: string }

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsDetailsData[], string>({
      query: (sources) => `/api/news?sources=${sources}`,
      transformResponse: (response: { news: NewsDetailsData[] }) => response.news,
      providesTags: ['News'],
    }),

    getNewsDetail: builder.query<NewsDetailsData, string>({
      query: (id: string) => `/api/news/${id}`,
      providesTags: ['News'],
    }),

    // TODO: добавить mutation postFeedback
    // builder.mutation<FeedbackResponse, FeedbackPayload>({
    //   query: (body) => ({ url: '/api/feedback', method: 'POST', body })
    // })
    // FQ36: mutation (не query) — потому что POST изменяет данные на сервере
  }),
})

// TODO: добавить usePostFeedbackMutation в деструктуризацию
export const { useGetNewsQuery, useGetNewsDetailQuery } = newsApi
