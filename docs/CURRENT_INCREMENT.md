# US 2.0.1 — Агрегация новостей с нескольких источников

**Статус:** `in_progress`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Покрывает вопросы:** Q22, Q23, Q85

**Acceptance Criteria:**
- [ ] Backend агрегирует новости из Guardian API, NewsAPI, HackerNews
- [ ] Запросы к внешним API идут параллельно (Promise.allSettled)
- [ ] Если одна из API недоступна — остальные всё равно работают
- [ ] Фильтрация позитивных новостей на сервере
- [ ] Кэш: повторный запрос за те же данные не долбит внешние API

---

<details>
<summary>✅ Шаг 0: Подготовка монорепо — выполнено</summary>

> Выполняется один раз для всего v2.0. После — переходишь сразу к Шагу 1.

### 0.1 Переместить React-проект в `client/`

```powershell
# В корне проекта
New-Item -ItemType Directory -Path client

# Переносим всё кроме .git, node_modules, docs, .cursor
Move-Item src, public, index.html, vite.config.js, tsconfig.json `
          package.json, package-lock.json, scripts, .husky, `
          .env, .env.development -Destination client\
```

### 0.2 Создать корневой `package.json`

Создать файл `package.json` в корне:

```json
{
  "name": "react-happy-news",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "dev": "npm run dev:server & npm run dev:client"
  }
}
```

### 0.3 Создать папку `server/`

```powershell
New-Item -ItemType Directory -Path server
New-Item -ItemType Directory -Path server\src
New-Item -ItemType Directory -Path server\src\routes
New-Item -ItemType Directory -Path server\src\services
New-Item -ItemType Directory -Path server\src\utils
New-Item -ItemType Directory -Path server\src\types
```

</details>

---

<details>
<summary>✅ Шаг 1: Инициализация сервера — выполнено</summary>

### 1.1 Создать `server/package.json`

```json
{
  "name": "react-happy-news-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "morgan": "^1.10.0",
    "node-cache": "^5.1.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.14.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.2"
  }
}
```

> Версия zod здесь `^3.x` — отдельная от клиента, в монорепо каждый workspace ставит свои зависимости.

### 1.2 Создать `server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Установить зависимости

```powershell
cd server
npm install
cd ..
```

</details>

---

<details>
<summary>✅ Шаг 2: Переменные окружения — выполнено</summary>

### 2.1 Создать `server/.env`

```env
PORT=3001

# Guardian API — текущий ключ из client/.env
GUARDIAN_API_KEY=80916ee3-6aff-4f84-8b2e-60ca869a734e
GUARDIAN_BASE_URL=https://content.guardianapis.com

# NewsAPI — зарегистрироваться на https://newsapi.org/register (бесплатно)
NEWSAPI_KEY=your_newsapi_key_here
NEWSAPI_BASE_URL=https://newsapi.org/v2

# HackerNews — публичное API, ключ не нужен
HACKERNEWS_BASE_URL=https://hacker-news.firebaseio.com/v0
```

### 2.2 Создать `server/.env.example`

```env
PORT=3001
GUARDIAN_API_KEY=
GUARDIAN_BASE_URL=https://content.guardianapis.com
NEWSAPI_KEY=
NEWSAPI_BASE_URL=https://newsapi.org/v2
HACKERNEWS_BASE_URL=https://hacker-news.firebaseio.com/v0
```

### 2.3 Получить API-ключи

| API | Где получить | Стоимость |
|---|---|---|
| **Guardian API** | Уже есть в `client/.env` | Бесплатно |
| **NewsAPI** | [newsapi.org/register](https://newsapi.org/register) | Бесплатно (dev tier) |
| **HackerNews** | Не нужен | Публичное API |

> **Важно:** добавить `server/.env` в `.gitignore` корня.

</details>

---

<details>
<summary>✅ Шаг 3: Общие типы — выполнено</summary>

### Создать `server/src/types/news.types.ts`

```typescript
export interface NewsItem {
  id: string
  title: string
  image: string
  description: string
  published: string
  author: string
  tag: string
  source: 'guardian' | 'newsapi' | 'hackernews'
}
```

> `source` — дополнительное поле, которого нет на клиенте. Клиент его проигнорирует, но полезно для отладки.

</details>

---

<details>
<summary>✅ Шаг 4: Фильтр позитивных новостей — выполнено</summary>

### Создать `server/src/utils/positivityFilter.ts`

Скопировать содержимое из `client/src/entities/news/helpers/filterPositiveNews.ts` — файл переносится без изменений.

> Оба файла пока существуют: на клиенте (для MSW-режима разработки), на сервере (для реальной фильтрации). В следующих US фильтрацию на клиенте уберём.

</details>

---

<details>
<summary>✅ Шаг 5: Кэш — выполнено</summary>

### Создать `server/src/utils/cache.ts`

```typescript
import NodeCache from 'node-cache'

// Кэш с TTL 5 минут
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key)
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value)
}
```

</details>

---

<details>
<summary>✅ Шаг 6: Адаптеры внешних API — выполнено</summary>

### 6.1 Создать `server/src/services/guardianApi.ts`

Переносит логику из `client/src/entities/news/api/rtk/newsApi.ts`, но теперь это серверный `fetch` без RTK Query.

```typescript
import type { NewsItem } from '../types/news.types'

const BASE_URL = process.env.GUARDIAN_BASE_URL!
const API_KEY = process.env.GUARDIAN_API_KEY!

interface GuardianFields {
  thumbnail?: string
  trailText?: string
  byline?: string
}

interface GuardianResult {
  id: string
  webTitle: string
  webPublicationDate: string
  sectionName: string
  fields?: GuardianFields | null
}

interface GuardianResponse {
  response: {
    results: GuardianResult[]
  }
}

export async function fetchGuardianNews(): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    'show-fields': 'thumbnail,trailText,byline',
    section: 'science|environment|culture|technology|lifeandstyle',
    'page-size': '50',
  })

  const res = await fetch(`${BASE_URL}/search?${params}`)

  if (!res.ok) {
    throw new Error(`Guardian API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as GuardianResponse

  return data.response.results.map((item) => ({
    id: `guardian-${item.id}`,
    title: item.webTitle,
    image: item.fields?.thumbnail ?? '',
    description: item.fields?.trailText ?? '',
    published: item.webPublicationDate,
    author: item.fields?.byline ?? 'Unknown',
    tag: item.sectionName,
    source: 'guardian' as const,
  }))
}
```

### 6.2 Создать `server/src/services/newsApi.ts`

```typescript
import type { NewsItem } from '../types/news.types'

const BASE_URL = process.env.NEWSAPI_BASE_URL!
const API_KEY = process.env.NEWSAPI_KEY!

interface NewsApiArticle {
  title: string | null
  description: string | null
  urlToImage: string | null
  publishedAt: string
  author: string | null
  source: { name: string }
  url: string
}

interface NewsApiResponse {
  status: string
  articles: NewsApiArticle[]
}

export async function fetchNewsApiNews(): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    language: 'en',
    pageSize: '50',
    category: 'science,technology,health,entertainment',
  })

  const res = await fetch(`${BASE_URL}/top-headlines?${params}`)

  if (!res.ok) {
    throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as NewsApiResponse

  return data.articles
    .filter((a) => a.title && a.title !== '[Removed]')
    .map((article, i) => ({
      id: `newsapi-${article.url}-${i}`,
      title: article.title ?? '',
      image: article.urlToImage ?? '',
      description: article.description ?? '',
      published: article.publishedAt,
      author: article.author ?? article.source.name,
      tag: article.source.name,
      source: 'newsapi' as const,
    }))
}
```

### 6.3 Создать `server/src/services/hackerNewsApi.ts`

```typescript
import type { NewsItem } from '../types/news.types'

const BASE_URL = process.env.HACKERNEWS_BASE_URL!

interface HnItem {
  id: number
  title?: string
  url?: string
  by?: string
  time?: number
  score?: number
  type?: string
}

async function fetchItem(id: number): Promise<HnItem | null> {
  try {
    const res = await fetch(`${BASE_URL}/item/${id}.json`)
    if (!res.ok) return null
    return (await res.json()) as HnItem
  } catch {
    return null
  }
}

export async function fetchHackerNews(): Promise<NewsItem[]> {
  const res = await fetch(`${BASE_URL}/topstories.json`)

  if (!res.ok) {
    throw new Error(`HackerNews API error: ${res.status} ${res.statusText}`)
  }

  const ids = (await res.json()) as number[]

  // Берём первые 30 ID — параллельно запрашиваем детали
  const items = await Promise.all(ids.slice(0, 30).map(fetchItem))

  return items
    .filter((item): item is HnItem => item !== null && item.type === 'story' && !!item.title)
    .map((item) => ({
      id: `hackernews-${item.id}`,
      title: item.title!,
      image: '',
      description: '',
      published: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
      author: item.by ?? 'Unknown',
      tag: 'Technology',
      source: 'hackernews' as const,
    }))
}
```

</details>

---

## Шаг 7: Агрегатор

### Создать `server/src/services/newsAggregator.ts`

Это ключевой файл US 2.0.1. Здесь `Promise.allSettled` + объединение + фильтрация.

```typescript
import { fetchGuardianNews } from './guardianApi'
import { fetchNewsApiNews } from './newsApi'
import { fetchHackerNews } from './hackerNewsApi'
import { isPositiveNews } from '../utils/positivityFilter'
import type { NewsItem } from '../types/news.types'

export interface AggregatorResult {
  news: NewsItem[]
  sources: {
    guardian: 'ok' | 'error'
    newsapi: 'ok' | 'error'
    hackernews: 'ok' | 'error'
  }
}

export async function aggregateNews(): Promise<AggregatorResult> {
  // Все три запроса идут параллельно.
  // Promise.allSettled — в отличие от Promise.all — не падает если одна из API недоступна.
  const [guardianResult, newsApiResult, hnResult] = await Promise.allSettled([
    fetchGuardianNews(),
    fetchNewsApiNews(),
    fetchHackerNews(),
  ])

  const sources: AggregatorResult['sources'] = {
    guardian: guardianResult.status === 'fulfilled' ? 'ok' : 'error',
    newsapi: newsApiResult.status === 'fulfilled' ? 'ok' : 'error',
    hackernews: hnResult.status === 'fulfilled' ? 'ok' : 'error',
  }

  // Логируем, какие источники недоступны — полезно при дебаге
  if (guardianResult.status === 'rejected') {
    console.error('[Guardian] Failed:', guardianResult.reason)
  }
  if (newsApiResult.status === 'rejected') {
    console.error('[NewsAPI] Failed:', newsApiResult.reason)
  }
  if (hnResult.status === 'rejected') {
    console.error('[HackerNews] Failed:', hnResult.reason)
  }

  // Объединяем только успешные результаты
  const allNews: NewsItem[] = [
    ...(guardianResult.status === 'fulfilled' ? guardianResult.value : []),
    ...(newsApiResult.status === 'fulfilled' ? newsApiResult.value : []),
    ...(hnResult.status === 'fulfilled' ? hnResult.value : []),
  ]

  // Фильтрация на сервере — трафик клиента не тратится
  const positiveNews = allNews.filter((item) => isPositiveNews(item.title, item.description))

  // Если фильтр убрал всё — возвращаем первые 10 без фильтра (fallback как на клиенте)
  const news = positiveNews.length > 0 ? positiveNews : allNews.slice(0, 10)

  console.log(`[Aggregator] Total: ${allNews.length}, Positive: ${positiveNews.length}, Returned: ${news.length}`)

  return { news, sources }
}
```

---

## Шаг 8: Роут

### Создать `server/src/routes/news.routes.ts`

```typescript
import { Router } from 'express'
import { aggregateNews } from '../services/newsAggregator'
import { getCached, setCached } from '../utils/cache'
import type { AggregatorResult } from '../services/newsAggregator'

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
```

---

## Шаг 9: Точка входа Express

### 9.1 Создать `server/src/app.ts`

```typescript
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { newsRouter } from './routes/news.routes'

export function createApp() {
  const app = express()

  app.use(morgan('dev'))
  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/news', newsRouter)

  return app
}
```

### 9.2 Создать `server/src/index.ts`

```typescript
import 'dotenv/config'
import { createApp } from './app'

const PORT = process.env.PORT ?? 3001

const app = createApp()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health: http://localhost:${PORT}/api/health`)
  console.log(`News:   http://localhost:${PORT}/api/news`)
})
```

---

## Шаг 10: Проверка сервера

### 10.1 Запустить

```powershell
cd server
npm run dev
```

Ожидаемый вывод:
```
Server running on http://localhost:3001
Health: http://localhost:3001/api/health
News:   http://localhost:3001/api/news
```

### 10.2 Тест через браузер или curl

```powershell
# Проверка health
curl http://localhost:3001/api/health

# Получить новости (первый запрос — идёт в API, ~2-3 сек)
curl http://localhost:3001/api/news

# Повторный запрос — должен вернуться мгновенно из кэша
curl http://localhost:3001/api/news
```

В ответе должно быть:
```json
{
  "news": [...],
  "sources": { "guardian": "ok", "newsapi": "ok", "hackernews": "ok" },
  "cached": false
}
```

При повторном запросе `"cached": true`.

### 10.3 Проверка fallback (одна API недоступна)

Временно испортить ключ NewsAPI в `server/.env`:
```
NEWSAPI_KEY=invalid_key
```

Перезапустить сервер, сделать запрос. Ожидается:
```json
{
  "sources": { "guardian": "ok", "newsapi": "error", "hackernews": "ok" },
  "news": [...]
}
```

В консоли: `[NewsAPI] Failed: NewsAPI error: 401 Unauthorized`

---

## Шаг 11: Обновить клиент

После того как сервер работает — переключить клиент с Guardian API на собственный бэкенд.

### 11.1 Добавить переменную в `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3001
```

Старые переменные `VITE_NEWS_API_KEY` и `VITE_NEWS_BASE_API_URL` можно закомментировать (нужны только для MSW-режима).

### 11.2 Обновить `client/src/entities/news/api/rtk/newsApi.ts`

Заменить весь файл на упрощённую версию — сервер теперь возвращает готовые данные:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { NewsDetailsData } from '../apiNews/utils/transforms.types'

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['News'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsDetailsData[], void>({
      query: () => '/api/news',
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

> `getNewsDetail` пока не работает (роут не реализован) — это задача US 2.0.2. MSW-моки по-прежнему покрывают случай разработки.

---

## Итог: что должно работать после этого шага

| Критерий | Как проверить |
|---|---|
| Агрегация из 3 источников | `GET /api/news` → `sources: { guardian: "ok", newsapi: "ok", hackernews: "ok" }` |
| Promise.allSettled (parallel) | В консоли сервера — все три API стартуют одновременно, не последовательно |
| Fallback при недоступной API | Сломать ключ NewsAPI → остальные новости всё равно приходят |
| Фильтрация на сервере | В консоли: `[Aggregator] Total: X, Positive: Y` |
| Кэш | Второй запрос мгновенный + `"cached": true` в ответе |

---

## Следующий шаг

**US 2.0.2** — RESTful API: добавить `GET /api/news/:id`, `POST /api/feedback`, `GET /api/health`, правильные HTTP-статусы, валидация query-параметров через Zod.
