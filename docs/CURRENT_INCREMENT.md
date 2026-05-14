# US 2.1.7 — Богатая детальная страница

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#52`
**Покрывает вопросы:** FQ68 (XSS/DOMPurify), Q82 (RSS как источник)

**Acceptance Criteria:**

- [ ] `NewsItem` расширен: `url: string`, `body?: string | null`, `hasFullContent: boolean`
- [ ] `guardianApi.ts`: `show-fields` включает `body`, маппинг `url` и `hasFullContent`
- [ ] `newsApi.ts` и `hackerNewsApi.ts`: маппинг `url`, `body: null`, `hasFullContent: false`
- [ ] `rss-parser` установлен, `rssApi.ts` парсит Positive News UK + Good News Network
- [ ] `SourceName.Rss` добавлен, RSS зарегистрирован в `SOURCES`
- [ ] OpenAPI схема обновлена, `openapi.d.ts` пересобран
- [ ] Клиентский `SourceName` в `transforms.types.ts` содержит `Rss`
- [ ] `NewsDetailView`: Guardian → рендер HTML через DOMPurify, остальные → "Читать оригинал"

---

## Концепция

```
Сейчас:
  NewsDetail → показывает только title, description, image
  Guardian body недоступен
  Нет ссылки на оригинал
  Нет RSS-источников

После:
  Guardian: body приходит с сервера → DOMPurify.sanitize(body) → dangerouslySetInnerHTML
  NewsAPI / HackerNews / RSS: hasFullContent = false → кнопка "Читать оригинал" → открывает url
  RSS: два новых источника (Positive News UK + Good News Network)
```

**Почему DOMPurify:**
Guardian возвращает HTML-разметку (`<p>`, `<b>`, `<a>`, `<figure>`). Вставлять через
`dangerouslySetInnerHTML` без очистки — XSS-уязвимость. DOMPurify удаляет
`<script>`, `onerror=`, `javascript:href` и другие опасные конструкции.

**Почему `hasFullContent`, а не проверка `body != null`:**
Явный флаг понятнее при рендере условий в компоненте. RSS в будущем может
добавить `body` (content:encoded) — изменить один флаг проще чем трогать логику рендера.

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (продолжаем в той же ветке)
**Issue:** `#52`

---

## Архитектура

```
server/src/
├── types/
│   └── news.types.ts          ← ИЗМЕНИТЬ: url, body, hasFullContent + SourceName.Rss
├── services/
│   ├── guardianApi.ts         ← ИЗМЕНИТЬ: show-fields body + webUrl
│   ├── newsApi.ts             ← ИЗМЕНИТЬ: url, body: null, hasFullContent: false
│   ├── hackerNewsApi.ts       ← ИЗМЕНИТЬ: url, body: null, hasFullContent: false
│   └── rssApi.ts              ← НОВЫЙ: rss-parser, два фида
├── swagger/
│   └── schemas.ts             ← ИЗМЕНИТЬ: новые поля + rss в enum
└── services/
    └── newsAggregator.ts      ← ИЗМЕНИТЬ: добавить RSS в SOURCES

client/src/
├── shared/api/
│   ├── openapi.json           ← ОБНОВИТЬ: новые поля NewsItem
│   └── openapi.d.ts          ← РЕГЕНЕРИРОВАТЬ: pnpm gen:openapi
├── entities/news/api/apiNews/utils/
│   └── transforms.types.ts   ← ИЗМЕНИТЬ: SourceName.Rss
└── pages/NewsDetail/
    └── NewsDetailView.tsx     ← ИЗМЕНИТЬ: body рендер + "Читать оригинал"
```

---

## Шаг 1: Зависимости

```bash
pnpm --filter react-happy-news-server add rss-parser
pnpm --filter react-happy-news-client add dompurify
pnpm --filter react-happy-news-client add -D @types/dompurify
```

```bash
git add server/package.json client/package.json pnpm-lock.yaml
git commit -m "build: #52 install rss-parser + dompurify"
```

---

## Шаг 2: Расширить типы сервера

**Файл:** `server/src/types/news.types.ts`

```typescript
// Добавить SourceName.Rss = 'rss'
// Добавить в NewsItem:
//   url: string
//   body?: string | null
//   hasFullContent: boolean
```

**Подводный камень:** `allSourceNames = Object.values(SourceName)` автоматически включит `rss`.
Клиентский `SourceName` в `transforms.types.ts` — зеркало, добавить вручную.

```bash
git add server/src/types/news.types.ts
git commit -m "feat: #52 extend NewsItem — url, body, hasFullContent + SourceName.Rss"
```

---

## Шаг 3: Обновить API-адаптеры

**`guardianApi.ts`:**
```typescript
// show-fields: 'thumbnail,trailText,byline,body'
// GuardianFields: добавить body?: string
// GuardianResult: добавить webUrl: string
// map: url: item.webUrl, body: item.fields?.body ?? null, hasFullContent: Boolean(item.fields?.body)
```

**`newsApi.ts`** и **`hackerNewsApi.ts`:**
```typescript
// url: article.url (newsapi) / item.url ?? `https://news.ycombinator.com/item?id=${item.id}` (hn)
// body: null
// hasFullContent: false
```

```bash
git add server/src/services/guardianApi.ts server/src/services/newsApi.ts server/src/services/hackerNewsApi.ts
git commit -m "feat: #52 API adapters — url + body + hasFullContent"
```

---

## Шаг 4: rssApi.ts

**Файл:** `server/src/services/rssApi.ts`

```typescript
// import Parser from 'rss-parser'
// const RSS_FEEDS = [
//   { url: 'https://www.positive.news/feed/', tag: 'Positive' },
//   { url: 'https://www.goodnewsnetwork.org/feed/', tag: 'Good News' },
// ]
//
// export async function fetchRssNews(): Promise<NewsItem[]>
//   Promise.allSettled по фидам → flatMap fulfilled
//   parser.parseURL(feedUrl) → items
//   id: `rss-${Buffer.from(item.link).toString('base64').slice(0, 20)}`
//   source: SourceName.Rss, hasFullContent: false, body: null
```

```bash
git add server/src/services/rssApi.ts
git commit -m "feat: #52 rssApi — Positive News UK + Good News Network"
```

---

## Шаг 5: Зарегистрировать RSS в агрегаторе

**Файл:** `server/src/services/newsAggregator.ts`

```typescript
// import { fetchRssNews } from './rssApi'
// SOURCES: добавить { name: SourceName.Rss, fetch: fetchRssNews }
```

```bash
git add server/src/services/newsAggregator.ts
git commit -m "feat: #52 newsAggregator — register RSS source"
```

---

## Шаг 6: Обновить OpenAPI схему + регенерировать типы

**`swagger/schemas.ts`:** добавить в `NewsItemSchema`:
```typescript
// url:            z.string().openapi({ example: 'https://www.theguardian.com/...' }),
// body:           z.string().nullable().optional().openapi({ example: '<p>Full article...</p>' }),
// hasFullContent: z.boolean().openapi({ example: true }),
// source:         z.nativeEnum(SourceName) — уже включает Rss после шага 2
```

Обновить `openapi.json` вручную + пересобрать:
```bash
pnpm gen:openapi
```

```bash
git add server/src/swagger/schemas.ts client/src/shared/api/openapi.json client/src/shared/api/openapi.d.ts
git commit -m "feat: #52 OpenAPI schema — url, body, hasFullContent, rss source"
```

---

## Шаг 7: Клиентские изменения

**`transforms.types.ts`:**
```typescript
// SourceName.Rss = 'rss'
```

**`NewsDetailView.tsx`:**
```tsx
// if (data.hasFullContent && data.body) {
//   return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.body) }} />
// }
// return <a href={data.url} target="_blank" rel="noopener noreferrer">Читать оригинал</a>
```

```bash
git add client/src/entities/news/api/apiNews/utils/transforms.types.ts
git add client/src/pages/NewsDetail/NewsDetailView.tsx
git commit -m "feat: close #52 NewsDetailView — DOMPurify body render + read-original link"
```

---

## Подводные камни

- **Guardian `body` может быть `null`** — Guardian free API иногда не возвращает тело статьи. `hasFullContent: Boolean(item.fields?.body)` корректно обрабатывает этот случай.
- **RSS таймаут** — внешние фиды могут отвечать медленно. `Promise.allSettled` в `fetchRssNews` изолирует сбой одного фида. Общий `Promise.allSettled` в агрегаторе изолирует сбой всего RSS-источника.
- **DOMPurify в SSR** — у нас SPA, `window` доступен, проблем нет. При SSR нужен `isomorphic-dompurify`.
- **`@types/dompurify` deprecated** — начиная с DOMPurify 3.x типы поставляются в самом пакете. `@types/dompurify` можно убрать, но он не мешает.
- **`openapi.d.ts` вручную** — поскольку сервер не запущен, `gen:openapi:sync` не работает. Обновляем `openapi.json` вручную и запускаем `gen:openapi`.
