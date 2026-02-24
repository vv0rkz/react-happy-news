import { http, HttpResponse } from 'msw'
import mockNewsData from '@entities/news/api/apiNews/mocks/newsData.json'
import mockNewsDetailsData from '@entities/news/api/apiNews/mocks/newsDetailsData.json'
import { NEWS_MSW_PATTERNS } from '@entities/news/api/apiPaths'

const BASE_URL: string = import.meta.env.VITE_NEWS_BASE_API_URL

export const handlers = [
  http.get(`${BASE_URL}${NEWS_MSW_PATTERNS.search}`, () => {
    return HttpResponse.json(mockNewsData)
  }),

  http.get(`${BASE_URL}${NEWS_MSW_PATTERNS.detail}`, () => {
    return HttpResponse.json(mockNewsDetailsData)
  }),
]
