import { SourceName, type NewsItem } from '../types/news.types'
import { isPositiveNews } from '../utils/positivityFilter'
import { fetchGuardianNews } from './guardianApi'
import {
  fetchAtlasObscura,
  fetchMongabay,
  fetchPositiveNews,
  fetchReasonsToBeCheerful,
  fetchScienceAlert,
  fetchTheConversation,
  fetchUpworthy,
} from './rssApi'

type SourceStatus = 'ok' | 'error' | 'skipped'

interface SourceConfig {
  name: SourceName
  fetch: () => Promise<NewsItem[]>
}

// Добавить новый источник = одна строка здесь
const SOURCES: SourceConfig[] = [
  { name: SourceName.Guardian, fetch: fetchGuardianNews },
  { name: SourceName.PositiveNews, fetch: fetchPositiveNews },
  { name: SourceName.ReasonsToBeCheerful, fetch: fetchReasonsToBeCheerful },
  { name: SourceName.Upworthy, fetch: fetchUpworthy },
  { name: SourceName.Mongabay, fetch: fetchMongabay },
  { name: SourceName.TheConversation, fetch: fetchTheConversation },
  { name: SourceName.AtlasObscura, fetch: fetchAtlasObscura },
  { name: SourceName.ScienceAlert, fetch: fetchScienceAlert },
]

export interface AggregatorResult {
  news: NewsItem[]
  sources: Record<SourceName, SourceStatus>
}

export async function aggregateNews(
  allowSources: SourceName[] = SOURCES.map((s) => s.name),
): Promise<AggregatorResult> {
  const active = SOURCES.filter((s) => allowSources.includes(s.name))
  const skipped = SOURCES.filter((s) => !allowSources.includes(s.name))

  // 1. Параллельные запросы только к активным источникам
  const results = await Promise.allSettled(active.map((s) => s.fetch()))

  // 2. Статусы и логи ошибок
  const sources = {} as Record<SourceName, SourceStatus>

  active.forEach((s, i) => {
    const result = results[i]
    if (result.status === 'rejected') console.error(`[${s.name}]`, result.reason)
    sources[s.name] = result.status === 'fulfilled' ? 'ok' : 'error'
  })

  skipped.forEach((s) => {
    sources[s.name] = 'skipped'
  })

  // 3. Собираем новости только из fulfilled
  const allNews: NewsItem[] = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

  // 4. Фильтрация на сервере
  const fullContentNews = allNews.filter((item) => item.hasFullContent)
  const positiveNews = fullContentNews.filter((item) => isPositiveNews(item.title, item.description))

  if (positiveNews.length === 0) {
    console.warn(`[Aggregator] No positive news found out of ${allNews.length} total`)
  }

  console.log(
    `[Aggregator] sources=[${allowSources}] total=${allNews.length} fullContent=${fullContentNews.length} positive=${positiveNews.length}`,
  )

  return { news: positiveNews, sources }
}
