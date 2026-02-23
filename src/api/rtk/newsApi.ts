import { RawNewsItemArraySchema, RawNewsItemSchema } from '@/api/schemas'
import { transformNewsData, transformNewsDetailsData } from '@/api/apiNews/utils/transforms'
import type { NewsDetailsData } from '@/api/apiNews/utils/transforms.types'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_KEY: string = import.meta.env.VITE_NEWS_API_KEY
const BASE_URL: string = import.meta.env.VITE_NEWS_BASE_API_URL

interface CustomFetchArgs extends FetchArgs {
  dataPath?: string
}

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
})

const extractDataByPath = (data: unknown, dataPath: string): unknown => {
  const keys = dataPath.split('.')
  let result: unknown = data

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      throw new Error(`Invalid data path: cannot access "${key}" on ${typeof result}`)
    }

    result = (result as Record<string, unknown>)[key]

    if (result === undefined) {
      throw new Error(`Invalid data path: missing key "${key}"`)
    }
  }

  return result
}

const customBaseQuery: BaseQueryFn<CustomFetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const res = await baseQuery(args, api, extraOptions)

  if (res.error) {
    return res
  }

  if (args.dataPath && res.data) {
    try {
      const extractedData = extractDataByPath(res.data, args.dataPath)

      return {
        ...res,
        data: extractedData,
      }
    } catch (error) {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          error: error instanceof Error ? error.message : String(error),
        } as FetchBaseQueryError,
      }
    }
  }

  return res
}

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsDetailsData[], void>({
      query: (): CustomFetchArgs => ({
        url: '/search',
        params: {
          'api-key': API_KEY,
          'show-fields': 'thumbnail,trailText,byline',
          section: 'science|environment|culture|technology|lifeandstyle',
          'page-size': 50,
        },
        dataPath: 'response.results',
      }),
      transformResponse: (response: unknown): NewsDetailsData[] => {
        const validatedData = RawNewsItemArraySchema.parse(response)
        return transformNewsData(validatedData)
      },
      providesTags: ['News'],
    }),

    getNewsDetail: builder.query<NewsDetailsData, string>({
      query: (id: string): CustomFetchArgs => ({
        url: `/${id}`,
        params: {
          'api-key': API_KEY,
          'show-fields': 'thumbnail,trailText,byline',
        },
        dataPath: 'response.content',
      }),
      transformResponse: (response: unknown): NewsDetailsData => {
        const validatedData = RawNewsItemSchema.parse(response)
        return transformNewsDetailsData(validatedData)
      },
      providesTags: ['News'],
    }),
  }),
})

export const { useGetNewsQuery, useGetNewsDetailQuery } = newsApi

