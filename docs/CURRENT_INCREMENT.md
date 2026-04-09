# US 2.0.2 — Выбор источников новостей

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Покрывает вопросы:** Q46 (query vs body), Q79 (RTK Query → REST), FQ4 (FSD), FQ21 (иммутабельность)

**Acceptance Criteria:**
- [ ] Тогглы для каждого источника в UI (Guardian, NewsAPI, HackerNews)
- [ ] По умолчанию все включены
- [ ] При отключении источника — его новости исчезают
- [ ] Выбор сохраняется в localStorage
- [x] `GET /api/news?sources=guardian,newsapi` — бэкенд фильтрует
- [ ] Source badge на каждой карточке

---

## Git

**Ветка:** `v2.0.0-backend-and-many-news-api-filter` (текущая)
**Issue:** `#5`

```powershell
git checkout v2.0.0-backend-and-many-news-api-filter
git status
```

---

## ✅ Шаг 1: Обновить агрегатор — принять `sources` параметр

### Изменить `server/src/services/newsAggregator.ts`

Добавить параметр `sources` — массив включённых источников. Если не передан → все три.

```typescript
import type { NewsItem } from '../types/news.types'
import { isPositiveNews } from '../utils/positivityFilter'
import { fetchGuardianNews } from './guardianApi'
import { fetchHackerNews } from './hackerNewsApi'
import { fetchNewsApiNews } from './newsApi'

export type SourceName = 'guardian' | 'newsapi' | 'hackernews'

export interface AggregatorResult {
  news: NewsItem[]
  sources: {
    guardian: 'ok' | 'error' | 'skipped'
    newsapi: 'ok' | 'error' | 'skipped'
    hackernews: 'ok' | 'error' | 'skipped'
  }
}

const ALL_SOURCES: SourceName[] = ['guardian', 'newsapi', 'hackernews']

export async function aggregateNews(
  sources: SourceName[] = ALL_SOURCES,
): Promise<AggregatorResult> {
  // Запрашиваем только выбранные источники — остальные skipped
  const [guardianResult, newsApiResult, hnResult] = await Promise.allSettled([
    sources.includes('guardian') ? fetchGuardianNews() : Promise.reject('skipped'),
    sources.includes('newsapi') ? fetchNewsApiNews() : Promise.reject('skipped'),
    sources.includes('hackernews') ? fetchHackerNews() : Promise.reject('skipped'),
  ])

  const toStatus = (
    result: PromiseSettledResult<NewsItem[]>,
    name: SourceName,
  ): 'ok' | 'error' | 'skipped' => {
    if (!sources.includes(name)) return 'skipped'
    return result.status === 'fulfilled' ? 'ok' : 'error'
  }

  const sourcesStatus: AggregatorResult['sources'] = {
    guardian: toStatus(guardianResult, 'guardian'),
    newsapi: toStatus(newsApiResult, 'newsapi'),
    hackernews: toStatus(hnResult, 'hackernews'),
  }

  if (guardianResult.status === 'rejected' && sources.includes('guardian')) {
    console.error('[Guardian]', guardianResult.reason)
  }
  if (newsApiResult.status === 'rejected' && sources.includes('newsapi')) {
    console.error('[NewsAPI]', newsApiResult.reason)
  }
  if (hnResult.status === 'rejected' && sources.includes('hackernews')) {
    console.error('[HackerNews]', hnResult.reason)
  }

  const allNews: NewsItem[] = [
    ...(guardianResult.status === 'fulfilled' ? guardianResult.value : []),
    ...(newsApiResult.status === 'fulfilled' ? newsApiResult.value : []),
    ...(hnResult.status === 'fulfilled' ? hnResult.value : []),
  ]

  const positiveNews = allNews.filter((item) => isPositiveNews(item.title, item.description))

  if (positiveNews.length === 0) {
    console.warn(`[Aggregator] No positive news found out of ${allNews.length} total`)
  }

  console.log(
    `[Aggregator] sources=[${sources}] total=${allNews.length} positive=${positiveNews.length}`,
  )

  return { news: positiveNews, sources: sourcesStatus }
}
```

---

## ✅ Шаг 2: Обновить роут — принять и валидировать `?sources=`

### Изменить `server/src/routes/news.routes.ts`

```typescript
import { Router } from 'express'
import { z } from 'zod'
import type { AggregatorResult, SourceName } from '../services/newsAggregator'
import { aggregateNews } from '../services/newsAggregator'
import { getCached, setCached } from '../utils/cache'

export const newsRouter = Router()

const VALID_SOURCES = ['guardian', 'newsapi', 'hackernews'] as const

const newsQuerySchema = z.object({
  sources: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? (val.split(',').filter((s) => VALID_SOURCES.includes(s as SourceName)) as SourceName[])
        : (['guardian', 'newsapi', 'hackernews'] as SourceName[]),
    ),
})

newsRouter.get('/', async (req, res) => {
  const parsed = newsQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.issues })
    return
  }

  const { sources } = parsed.data

  // Ключ кэша включает список источников — разные наборы не мешают друг другу
  const cacheKey = `news:${sources.sort().join(',')}`

  try {
    const cached = getCached<AggregatorResult>(cacheKey)
    if (cached) {
      console.log(`[Cache] HIT — ${cacheKey}`)
      res.json({ ...cached, cached: true })
      return
    }

    console.log(`[Cache] MISS — ${cacheKey}`)
    const result = await aggregateNews(sources)

    setCached(cacheKey, result)

    res.json({ ...result, cached: false })
  } catch (error) {
    console.error('[GET /api/news] Error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})
```

> **Q46:** Фильтр источников — параметр запроса (не данные), поэтому идёт в query string, а не в body.

### Проверка

```powershell
cd server && npm run dev

curl "http://localhost:3001/api/news?sources=guardian,hackernews"
curl "http://localhost:3001/api/news?sources=newsapi"
curl "http://localhost:3001/api/news"
```

### Коммит

```powershell
git add server/src/services/newsAggregator.ts server/src/routes/news.routes.ts
git commit -m "feat: #5 поддержка ?sources= в GET /api/news"
```

---

## ✅ Шаг 3: Добавить `source` в тип NewsDetailsData на клиенте

### Изменить `client/src/entities/news/api/apiNews/utils/transforms.types.ts`

```typescript
export type NewsSource = 'guardian' | 'newsapi' | 'hackernews'

/** Трансформированные данные новости */
export interface NewsDetailsData {
  id: string
  title: string
  image: string
  description: string
  published: string
  author: string
  tag: string
  source?: NewsSource
}
```

> `source` опциональный — MSW-моки его не возвращают, чтобы не ломать dev-режим.

---

## ✅ Шаг 4: Создать `useSourceFilter` hook

### Создать `client/src/features/source-filter/useSourceFilter.ts`

```typescript
import { useLocalStorage } from '@shared/useLocalStorage'
import type { NewsSource } from '@entities/news/api/apiNews/utils/transforms.types'

export const ALL_SOURCES: NewsSource[] = ['guardian', 'newsapi', 'hackernews']

export function useSourceFilter() {
  const [selectedSources, setSelectedSources] = useLocalStorage<NewsSource[]>(
    'news-sources',
    ALL_SOURCES,
  )

  const toggle = (source: NewsSource) => {
    setSelectedSources((prev) => {
      // Нельзя снять все — оставляем хотя бы один источник
      if (prev.includes(source) && prev.length === 1) return prev
      return prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    })
  }

  const isSelected = (source: NewsSource) => selectedSources.includes(source)

  // Строка для query param: "guardian,newsapi" — пересортированная, чтобы кэш был стабильным
  const sourcesParam = [...selectedSources].sort().join(',')

  return { selectedSources, sourcesParam, toggle, isSelected }
}
```

---

## ✅ Шаг 5: Создать компонент `SourceFilter`

### Создать `client/src/features/source-filter/SourceFilter.tsx`

```typescript
import type { NewsSource } from '@entities/news/api/apiNews/utils/transforms.types'
import { ALL_SOURCES } from './useSourceFilter'
import styles from './styles.module.css'

const SOURCE_LABELS: Record<NewsSource, string> = {
  guardian: 'Guardian',
  newsapi: 'NewsAPI',
  hackernews: 'HackerNews',
}

interface SourceFilterProps {
  selectedSources: NewsSource[]
  onToggle: (source: NewsSource) => void
}

const SourceFilter = ({ selectedSources, onToggle }: SourceFilterProps): React.ReactNode => {
  return (
    <div className={styles.filter}>
      {ALL_SOURCES.map((source) => (
        <label key={source} className={styles.label}>
          <input
            type="checkbox"
            checked={selectedSources.includes(source)}
            onChange={() => onToggle(source)}
            className={styles.checkbox}
          />
          {SOURCE_LABELS[source]}
        </label>
      ))}
    </div>
  )
}

export default SourceFilter
```

### Создать `client/src/features/source-filter/styles.module.css`

```css
.filter {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 0;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.checkbox {
  cursor: pointer;
  width: 16px;
  height: 16px;
}
```

### Создать `client/src/features/source-filter/index.ts`

```typescript
export { default as SourceFilter } from './SourceFilter'
export { useSourceFilter } from './useSourceFilter'
```

---

## ✅ Шаг 6: Обновить RTK Query — принять `sources`

### Изменить `client/src/entities/news/api/rtk/newsApi.ts`

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsDetailsData[], string>({
      // sources — строка вида "guardian,newsapi,hackernews"
      query: (sources: string) => `/api/news?sources=${sources}`,
      transformResponse: (response: { news: NewsDetailsData[] }) => response.news,
      providesTags: ['News'],
    }),

    getNewsDetail: builder.query<NewsDetailsData, string>({
      query: (id: string) => `/api/news/${id}`,
      providesTags: ['News'],
    }),
  }),
})

export const { useGetNewsQuery, useGetNewsDetailQuery } = newsApi
```

### Коммит

```powershell
git add client/src/entities/news/api/apiNews/utils/transforms.types.ts `
        client/src/features/source-filter/ `
        client/src/entities/news/api/rtk/newsApi.ts
git commit -m "feat: #5 фича source-filter"
```

---

## ⚠️ Шаг 7: Создать `SourceBadge` компонент

### Создать `client/src/entities/news/SourceBadge/SourceBadge.tsx`

```typescript
import type { NewsSource } from '@entities/news/api/apiNews/utils/transforms.types'
import styles from './styles.module.css'

const SOURCE_CONFIG: Record<NewsSource, { label: string; colorClass: string }> = {
  guardian: { label: 'Guardian', colorClass: styles.guardian },
  newsapi: { label: 'NewsAPI', colorClass: styles.newsapi },
  hackernews: { label: 'HN', colorClass: styles.hackernews },
}

interface SourceBadgeProps {
  source: NewsSource
}

const SourceBadge = ({ source }: SourceBadgeProps): React.ReactNode => {
  const config = SOURCE_CONFIG[source]
  return <span className={`${styles.badge} ${config.colorClass}`}>{config.label}</span>
}

export default SourceBadge
```

### Создать `client/src/entities/news/SourceBadge/styles.module.css`

```css
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guardian {
  background-color: #005689;
  color: #fff;
}

.newsapi {
  background-color: #1a73e8;
  color: #fff;
}

.hackernews {
  background-color: #ff6600;
  color: #fff;
}
```

### Создать `client/src/entities/news/SourceBadge/index.ts`

```typescript
export { default as SourceBadge } from './SourceBadge'
```

---

## ❌ Шаг 8: Добавить badge в `NewsItem`

### Изменить `client/src/entities/news/NewsItem/NewsItem.tsx`

```typescript
import { generatePath, useNavigate } from 'react-router-dom'
import type { NewsSource } from '@entities/news/api/apiNews/utils/transforms.types'
import { APP_ROUTES } from '@shared/config/routes'
import Image from '@shared/Image'
import { SourceBadge } from '../SourceBadge'
import styles from './styles.module.css'

interface NewsItemProps {
  item: {
    id: string
    title: string
    description: string
    image: string
    published: string
    author: string
    tag: string
    source?: NewsSource
  }
}

const NewsItem = ({ item }: NewsItemProps): React.ReactNode => {
  const navigate = useNavigate()
  const handleClick = (): void => {
    navigate(generatePath(APP_ROUTES.NewsDetail, { id: item.id }))
  }
  return (
    <div className={styles.item} onClick={handleClick}>
      <Image image={item.image} className={styles.image ?? ''} />
      <div className={styles.info}>
        {item.source && <SourceBadge source={item.source} />}
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.extra}>{item.description}</p>
      </div>
    </div>
  )
}

export default NewsItem
```

### Коммит

```powershell
git add client/src/entities/news/SourceBadge/ `
        client/src/entities/news/NewsItem/NewsItem.tsx
git commit -m "feat: #5 компонент SourceBadge"
```

---

## ❌ Шаг 9: Интегрировать SourceFilter в NewsFeed

### Изменить `client/src/pages/Main/NewsFeed.tsx`

```typescript
import NewsBanner from '@entities/news/NewsBanner'
import NewsList from '@entities/news/NewsList'
import { useGetNewsQuery } from '@entities/news/api'
import { SourceFilter, useSourceFilter } from '@features/source-filter'
import Pagination from '@features/paginate-news/Pagination'
import ErrorComponent from '@shared/ErrorComponent'
import Skeleton from '@shared/Skeleton'

const NewsFeed = (): React.ReactNode => {
  const { selectedSources, sourcesParam, toggle } = useSourceFilter()

  const {
    data: news,
    isLoading: isInitialLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetNewsQuery(sourcesParam)

  const isLoading = isInitialLoading || isFetching
  const normalizedError = queryError ? new Error('Ошибка загрузки новостей') : null

  if (normalizedError && !isLoading) {
    return <ErrorComponent error={normalizedError} onRetry={refetch} />
  }

  return (
    <>
      <SourceFilter selectedSources={selectedSources} onToggle={toggle} />

      {isLoading ? <Skeleton count={1} type="banner" height="520px" /> : news?.[0] && <NewsBanner item={news[0]} />}

      {isLoading ? (
        <Skeleton type="item" count={10} height="100px" />
      ) : (
        news && <Pagination data={news}>{(data) => <NewsList news={data} />}</Pagination>
      )}
    </>
  )
}

export default NewsFeed
```

### Коммит

```powershell
git add client/src/pages/Main/NewsFeed.tsx
git commit -m "feat: #5 интеграция source-filter в NewsFeed"
```

---

## ❌ Шаг 10: Проверка

### 10.1 Запустить всё

```powershell
# Терминал 1 — сервер
cd server && npm run dev

# Терминал 2 — клиент
cd client && npm run dev
```

### 10.2 Чеклист проверки в браузере

| Критерий | Как проверить |
|---|---|
| Тогглы видны | В ленте над новостями — 3 чекбокса |
| Фильтрация работает | Снять HackerNews → HN-новости исчезают |
| Персистентность | Перезагрузить страницу → выбор сохранился |
| Query param | DevTools → Network → `GET /api/news?sources=guardian,newsapi` |
| Source badge | На каждой карточке — цветной badge с источником |
| Кэш по источникам | Повторный запрос с теми же sources → `"cached": true` |
| Нельзя снять все | Снять все источники невозможно — последний остаётся |

---

## Итог: что должно работать

| Критерий | Результат |
|---|---|
| Выбор источников в UI | 3 чекбокса, по умолчанию все включены |
| Фильтрация на бэкенде | `?sources=` принимается и обрабатывается |
| localStorage | Выбор сохраняется между сессиями |
| Source badges | Guardian = синий, NewsAPI = голубой, HN = оранжевый |
| Раздельный кэш | `news:guardian,newsapi` и `news:guardian` — разные записи |

---

## Следующий шаг

**US 2.0.3** — RESTful API: `GET /api/news/:id`, `POST /api/feedback`, Zod-валидация, правильные HTTP-статусы.

---

## История коммитов этого инкремента

```
feat: #5 интеграция source-filter в NewsFeed   ← Шаг 9    (pending)
feat: #5 компонент SourceBadge                 ← Шаги 7–8 (pending)
feat: #5 фича source-filter                    ← Шаги 3–6 ✅ bc0c6cf
feat: #5 поддержка ?sources= в GET /api/news   ← Шаги 1–2 ✅ 994d9c1
```
