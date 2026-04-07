import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsDetailsData[], void>({
      query: () => '/api/news',
      transformResponse: (response: { news: NewsDetailsData[] }) => response.news,
      providesTags: ['News'],
    }),

    // getNewsDetail — роут /api/news/:id будет реализован в US 2.0.2
    getNewsDetail: builder.query<NewsDetailsData, string>({
      query: (id: string) => `/api/news/${id}`,
      providesTags: ['News'],
    }),
  }),
})

export const { useGetNewsQuery, useGetNewsDetailQuery } = newsApi
