import { http, HttpResponse } from 'msw'
import mockNewsData from '@/api/apiNews/mocks/newsData.json'
import mockNewsDetailsData from '@/api/apiNews/mocks/newsDetailsData.json'

const BASE_URL: string = import.meta.env.VITE_NEWS_BASE_API_URL

export const handlers = [
  http.get(`${BASE_URL}/search`, () => {
    return HttpResponse.json(mockNewsData)
  }),

  http.get(`${BASE_URL}/:id`, () => {
    return HttpResponse.json(mockNewsDetailsData)
  }),
]

