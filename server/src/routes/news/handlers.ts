import type { RequestHandler } from 'express'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { newsRepository } from '../../db/newsRepository'
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
  q: z.string().trim().optional(),
  sort: z.enum(['date', 'source']).optional().default('date'),
  category: z.string().trim().optional(),
})

export const newsListQueryOpenApiSchema = z.object({
  sources: z.string().optional().openapi({
    example: 'guardian,newsapi',
    description: 'Источники через запятую. Доступные: guardian, newsapi, hackernews',
  }),
  q: z.string().optional().openapi({ example: 'climate', description: 'Поисковый запрос' }),
  sort: z.enum(['date', 'source']).optional().openapi({ example: 'date', description: 'Сортировка: date | source' }),
  category: z.string().optional().openapi({ example: 'science', description: 'Фильтр по категории/тегу' }),
})

export const getNewsList: RequestHandler = async (req, res) => {
  const parsed = newsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { sources, q, sort, category } = parsed.data
  const cacheKey = `news:${sources.sort().join(',')}`

  try {
    let result: AggregatorResult

    const cached = getCached<AggregatorResult>(cacheKey)
    if (cached) {
      console.log('[Cache] HIT — returning cached news')
      result = cached
    } else {
      console.log('[Cache] MISS — fetching from APIs')
      result = await aggregateNews(sources)
      setCached(cacheKey, result)
      result.news.forEach((item) => setCached(`newsItem:${item.id}`, item))
      newsRepository.upsertMany(result.news)
    }

    let news = result.news

    if (q) {
      const qLower = q.toLowerCase()
      news = news.filter(
        (item) => item.title.toLowerCase().includes(qLower) || item.description.toLowerCase().includes(qLower),
      )
    }

    if (category) {
      const catLower = category.toLowerCase()
      news = news.filter((item) => item.tag.toLowerCase().includes(catLower))
    }

    if (sort === 'source') {
      news = [...news].sort((a, b) => a.source.localeCompare(b.source))
    } else {
      news = [...news].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
    }

    res.json({ ...result, news, cached: Boolean(cached) })
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
  req.on('close', () => {
    readersTracker.leave(articleId, clientId)
  })
}

export const getNewsDetail: RequestHandler = (req, res) => {
  const id = req.path.slice(1)

  const cached = getCached<NewsItem>(`newsItem:${id}`)
  if (cached) {
    res.json(cached)
    return
  }

  const fromDb = newsRepository.findById(id)
  if (!fromDb) {
    res.status(404).json({ error: 'News item not found' })
    return
  }

  setCached(`newsItem:${id}`, fromDb)
  res.json(fromDb)
}
