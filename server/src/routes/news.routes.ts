import { Router } from 'express'
import { z } from 'zod'
import type { AggregatorResult } from '../services/newsAggregator'
import { aggregateNews } from '../services/newsAggregator'
import { allSourceNames, SourceName } from '../types/news.types'
import { getCached, setCached } from '../utils/cache'

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

    res.json({ ...result, cached: false })
  } catch (error) {
    console.error('[GET /api/news] Error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})
