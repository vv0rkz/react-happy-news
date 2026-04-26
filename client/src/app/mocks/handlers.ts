import { http, HttpResponse } from 'msw'
import mockNewsData from '@entities/news/api/apiNews/mocks/newsData.json'
import mockNewsDetailsData from '@entities/news/api/apiNews/mocks/newsDetailsData.json'
import { transformMockNewsData, transformNewsDetailsData } from '@entities/news/api/apiNews/utils/transforms'
import type { RawNewsItem } from '@entities/news/api/schemas'
import { SourceName } from '@entities/news/api/apiNews/utils/transforms.types'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const handlers = [
  http.get(`${BASE_URL}/api/news`, () => {
    const news = transformMockNewsData(mockNewsData.response.results as RawNewsItem[])
    return HttpResponse.json({
      news,
      sources: {
        [SourceName.Guardian]: 'ok',
        [SourceName.NewsApi]: 'skipped',
        [SourceName.HackerNews]: 'skipped',
      },
      cached: false,
    })
  }),

  http.get(`${BASE_URL}/api/news/:id`, () => {
    const item = transformNewsDetailsData(mockNewsDetailsData.response.content as RawNewsItem)
    return HttpResponse.json(item)
  }),

  http.post(`${BASE_URL}/api/feedback`, async ({ request }) => {
    const body = (await request.json()) as { message?: string; email?: string }
    if (!body.message || body.message.length < 10) {
      return HttpResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }
    return HttpResponse.json({ ok: true, message: 'Спасибо за отзыв!' }, { status: 201 })
  }),
]
