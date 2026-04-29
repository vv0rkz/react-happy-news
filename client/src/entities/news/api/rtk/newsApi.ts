import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { components } from '@shared/api/openapi'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

type FeedbackPayload = components['schemas']['FeedbackPayload']
type FeedbackResponse = components['schemas']['FeedbackResponse']

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsDetailsData[], string>({
      query: (sources) => `/api/news?sources=${sources}`,
      transformResponse: (response: components['schemas']['NewsListResponse']) => response.news,
      providesTags: ['News'],
    }),

    getNewsDetail: builder.query<NewsDetailsData, string>({
      query: (id: string) => `/api/news/${id}`,
      providesTags: ['News'],
    }),

    postFeedback: builder.mutation<FeedbackResponse, FeedbackPayload>({
      query: (body) => ({ url: '/api/feedback', method: 'POST', body }),
    }),
  }),
})

export const { useGetNewsQuery, useGetNewsDetailQuery, usePostFeedbackMutation } = newsApi
