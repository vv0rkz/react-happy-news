import { Router } from 'express'
import type { AggregatorResult } from '../services/newsAggregator'
import { aggregateNews } from '../services/newsAggregator'
import { getCached, setCached } from '../utils/cache'

export const newsRouter = Router()

const CACHE_KEY = 'news:all'

newsRouter.get('/', async (_req, res) => {
  try {
    // Проверяем кэш — если данные есть, внешние API не долбим
    const cached = getCached<AggregatorResult>(CACHE_KEY)
    if (cached) {
      console.log('[Cache] HIT — returning cached news')
      res.json({ ...cached, cached: true })
      return
    }

    console.log('[Cache] MISS — fetching from APIs')
    const result = await aggregateNews()

    setCached(CACHE_KEY, result)

    res.json({ ...result, cached: false })
  } catch (error) {
    console.error('[GET /api/news] Error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})
