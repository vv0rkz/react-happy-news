import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'
import type { AggregatorResult } from '../../services/newsAggregator'
import { aggregateNews } from '../../services/newsAggregator'
import { allSourceNames, SourceName, type NewsItem } from '../../types/news.types'
import { getCached, setCached } from '../../utils/cache'
import { readersTracker } from '../../utils/readersTracker'

const newsQuerySchema = z.object({
  sources: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : allSourceNames))
    .pipe(z.array(z.nativeEnum(SourceName)).min(1)),
})

export const newsListQueryOpenApiSchema = z.object({
  sources: z.string().optional().openapi({
    example: 'guardian,newsapi',
    description: 'Источники через запятую. Доступные: guardian, newsapi, hackernews',
  }),
})

export const getNewsList: RequestHandler = async (req, res) => {
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
}

export const getReadersSSE: RequestHandler = (req, res) => {
  const { articleId } = req.query
  if (!articleId || typeof articleId !== 'string') {
    res.status(400).json({ error: 'articleId query param is required' })
    return
  }

  const clientId = randomUUID()
  readersTracker.join(articleId, clientId, res)
  req.on('close', () => { readersTracker.leave(articleId, clientId) })
}

export const getNewsDetail: RequestHandler = (req, res) => {
  const id = req.path.slice(1)
  const item = getCached<NewsItem>(`newsItem:${id}`)
  if (!item) {
    res.status(404).json({ error: 'News item not found' })
    return
  }
  res.json(item)
}
