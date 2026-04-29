import { z } from 'zod'
import { Router } from 'express'
import type { AggregatorResult } from '../services/newsAggregator'
import { aggregateNews } from '../services/newsAggregator'
import { allSourceNames, SourceName, type NewsItem } from '../types/news.types'
import { getCached, setCached } from '../utils/cache'
import { registry } from '../swagger/registry'
import { NewsItemSchema, NewsListResponseSchema } from '../swagger/schemas'

registry.registerPath({
  method: 'get',
  path: '/api/news',
  tags: ['News'],
  summary: 'Получить агрегированные позитивные новости',
  request: {
    query: z.object({
      sources: z.string().optional().openapi({
        example: 'guardian,newsapi',
        description: 'Источники через запятую. Доступные: guardian, newsapi, hackernews',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Список позитивных новостей',
      content: { 'application/json': { schema: NewsListResponseSchema } },
    },
    400: { description: 'Невалидный параметр sources' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/news/{id}',
  tags: ['News'],
  summary: 'Получить новость по id',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'technology/2025/jan/01/title' }),
    }),
  },
  responses: {
    200: {
      description: 'Данные новости',
      content: { 'application/json': { schema: NewsItemSchema } },
    },
    404: { description: 'Новость не найдена' },
  },
})

export const newsRouter = Router()

const newsQuerySchema = z.object({
  sources: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : allSourceNames))
    .pipe(z.array(z.nativeEnum(SourceName)).min(1)),
})

newsRouter.get('/', async (req, res) => {
  const parsed = newsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { sources } = parsed.data
  const cacheKey = `news:${sources.sort().join(',')}`

  try {
    const cached = getCached<AggregatorResult>(cacheKey)
    if (cached) {
      console.log('[Cache] HIT — returning cached news')
      res.json({ ...cached, cached: true })
      return
    }

    console.log('[Cache] MISS — fetching from APIs')
    const result = await aggregateNews(sources)

    setCached(cacheKey, result)
    result.news.forEach((item) => setCached(`newsItem:${item.id}`, item))

    res.json({ ...result, cached: false })
  } catch (error) {
    console.error('[GET /api/news] Error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

newsRouter.get('/*', (req, res) => {
  const id = req.path.slice(1)
  const item = getCached<NewsItem>(`newsItem:${id}`)
  if (!item) {
    res.status(404).json({ error: 'News item not found' })
    return
  }
  res.json(item)
})
