import type { NewsItem } from '../types/news.types'
import { isPositiveNews } from '../utils/positivityFilter'
import { fetchGuardianNews } from './guardianApi'
import { fetchHackerNews } from './hackerNewsApi'
import { fetchNewsApiNews } from './newsApi'

export interface AggregatorResult {
  news: NewsItem[]
  sources: {
    guardian: 'ok' | 'error'
    newsapi: 'ok' | 'error'
    hackernews: 'ok' | 'error'
  }
}

export async function aggregateNews(): Promise<AggregatorResult> {
  // 1. Все три источника параллельно — если один упадёт, остальные продолжат
  const [guardianResult, newsApiResult, hnResult] = await Promise.allSettled([
    fetchGuardianNews(),
    fetchNewsApiNews(),
    fetchHackerNews(),
  ])

  // 2. Статус каждого источника
  const sources: AggregatorResult['sources'] = {
    guardian: guardianResult.status === 'fulfilled' ? 'ok' : 'error',
    newsapi: newsApiResult.status === 'fulfilled' ? 'ok' : 'error',
    hackernews: hnResult.status === 'fulfilled' ? 'ok' : 'error',
  }

  // 3. Лог ошибок недоступных источников
  if (guardianResult.status === 'rejected') console.error('[Guardian]', guardianResult.reason)
  if (newsApiResult.status === 'rejected') console.error('[NewsAPI]', newsApiResult.reason)
  if (hnResult.status === 'rejected') console.error('[HackerNews]', hnResult.reason)

  // 4. Объединяем только fulfilled — каждый result.value это NewsItem[]
  const allNews: NewsItem[] = [
    ...(guardianResult.status === 'fulfilled' ? guardianResult.value : []),
    ...(newsApiResult.status === 'fulfilled' ? newsApiResult.value : []),
    ...(hnResult.status === 'fulfilled' ? hnResult.value : []),
  ]

  // 5. Фильтрация на сервере
  const positiveNews = allNews.filter((item) => isPositiveNews(item.title, item.description))

  if (positiveNews.length === 0) {
    console.warn(`[Aggregator] No positive news found out of ${allNews.length} total`)
  }

  // 6. Статистика
  console.log(`[Aggregator] total=${allNews.length} positive=${positiveNews.length}`)

  // 7.
  return { news: positiveNews, sources }
}
