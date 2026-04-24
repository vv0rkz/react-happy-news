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

  // TODO: добавить handler для POST /api/feedback
  // http.post(`${BASE_URL}/api/feedback`, async ({ request }) => {
  //   1. const body = await request.json() as { message?: string; email?: string }
  //   2. Если body.message.length < 10 → HttpResponse.json({ error: '...' }, { status: 400 })
  //   3. Иначе → HttpResponse.json({ ok: true, message: '...' }, { status: 201 })
  // })
]
