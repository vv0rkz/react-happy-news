# React Happy News — Релиз v2.1 — Positivity Stream

**Статус:** `in progress` (US 2.1.7 DONE, US 2.1.8 active)
**Ветка релиза:** `v2.1.0-*`
**Полный roadmap:** [ROADMAP.md](./ROADMAP.md)
**Покрытие:** 27 вопросов (45.3% нарастающим после v2.0) + новые US 2.1.5–2.1.8
**Оценка времени:** 7–10 дней (расширен)

---

## Зачем

Лента оживает: новые позитивные новости появляются без перезагрузки. Пользователь видит, работает ли сервер. Может сортировать и искать по категориям.

---

## User Stories

### US 2.1.1: Live-счётчик читателей через SSE — ✅ DONE

- [x] Backend: sseManager — управление подключениями, heartbeat
- [x] Backend: readersTracker — per-article комнаты `Map<articleId, Set<clientId>>`
- [x] Backend: SSE endpoint `GET /api/news/readers?articleId=`
- [x] Frontend: `features/live-readers/useLiveReaders.ts` — EventSource подписка
- [x] Frontend: `features/live-readers/ReadersCount.tsx` — бейдж "● N читают сейчас"
- [x] Бейдж на детальной странице новости
- [x] При закрытии вкладки EventSource закрывается (cleanup + счётчик уменьшается)

### US 2.1.2: Health-check + Offline Mode — ✅ DONE

- [x] Polling `GET /api/health` каждые 30 сек
- [x] `StatusBadge` в Header — зелёный/красный автоматически (без ручного тогла)
- [x] Retry с exponential backoff (1с → 2с → 4с → 8с → max 30с)
- [x] При N ошибках подряд → offline mode (RTK-кэш + `OfflineBanner`)
- [x] `OfflineBanner` — "Нет связи с сервером. Показываем данные от HH:MM"
- [x] AbortController: отмена при навигации / unmount
- [x] Не отправлять следующий запрос пока текущий не завершился
- [x] Toast-уведомления при смене статуса online/offline

### US 2.1.3: Расширенный поиск + сортировка — ✅ DONE

- [x] Debounced поле поиска (300мс)
- [x] Фильтр по категории (Природа, Технологии, Спорт, Наука, Общество)
- [x] Query-параметры на бэкенде: `?q=...&category=...`
- [x] `NewsFilterContext` — search доступен и в Header, и в ленте
- [x] Поиск → раскрывающийся `Collapse` в Header (🔍)
- [x] Источники → попап `⚙️` в Header

### US 2.1.4: Оптимизация рендеринга — ✅ DONE

- [x] `NewsItem` обёрнут в `React.memo` (shallow comparison, нет колбэков из родителя)
- [x] `useMemo` — не нужен сейчас, перенесён в US 2.3.2 (BookmarkButton)
- [x] `useCallback` — не нужен сейчас, перенесён в US 2.3.2 (BookmarkButton)
- [x] `React.lazy` — не нужен сейчас (NewsDetail = 1.47 kB), перенесён в US 2.3.6 (Auth + recharts)
- [x] `vite-bundle-visualizer`: MSW исключён из prod через `import.meta.env.DEV` — сохранено 278 kB (1.93 MB → 1.42 MB)

> `react-window` перенесён в **US 2.1.8** — обоснован только при 200+ элементах.

### US 2.1.5: Миграция RTK Query → TanStack Query — ✅ DONE

- [x] `@tanstack/react-query` установлен, `@reduxjs/toolkit` + `react-redux` удалены
- [x] `QueryClientProvider` в `main.tsx`, `store.ts` удалён
- [x] `entities/news/api/tanstack/newsQueries.ts` заменяет `rtk/newsApi.ts` (удалён)
- [x] `useHealthCheck.ts`: ручной polling/backoff заменён на `refetchInterval` + `retry` + `retryDelay`; статус использует TanStack `QueryStatus` напрямую
- [x] `ReactQueryDevtools` подключены в dev-режиме
- [x] `FeedbackForm` адаптирован под TanStack `useMutation` API

### US 2.1.6: SQLite-персистентность новостей — ✅ DONE

- [x] `better-sqlite3` установлен
- [x] `server/src/db/schema.ts` — таблица `news_items (id, source, data, fetched_at)`, WAL-режим
- [x] `server/src/db/newsRepository.ts` — `findById`, `upsertMany` (без TTL — накапливаем для аналитики)
- [x] `getNewsList`: `newsRepository.upsertMany(result.news)` после агрегации
- [x] `getNewsDetail`: L1 node-cache → L2 SQLite → 404
- [x] Прямая ссылка `/news/:id` работает после рестарта сервера
- [x] `news.db` добавлен в `.gitignore`

### US 2.1.7: Богатая детальная страница — ✅ DONE

- [x] `rss-parser` + `dompurify` установлены
- [x] `NewsItem`: `url`, `body`, `hasFullContent` + `SourceName.Rss`
- [x] `guardianApi.ts`: `show-fields=body`, `webUrl`, `hasFullContent`
- [x] `newsApi.ts` + `hackerNewsApi.ts`: удалены
- [x] `rssApi.ts`: Positive News UK + Good News Network, `content:encoded` → `body`
- [x] RSS зарегистрирован в `newsAggregator.ts`, фильтр `hasFullContent`
- [x] OpenAPI схема обновлена, `openapi.d.ts` пересобран
- [x] `transforms.types.ts`: `SourceName.Rss`
- [x] `NewsDetailView`: DOMPurify рендер body + ссылка "Читать оригинал"

### US 2.1.8: Виртуализация ленты — 🔒 ЗАБЛОКИРОВАН

> Открывается когда SQLite накопил 200+ записей (после US 2.1.6) или MSW seed генерирует 500+ элементов.

- [ ] MSW seed: генератор 500+ новостей для demo-режима
- [ ] Profiler без виртуализации: зафиксировать frame drops при скролле
- [ ] Установить `react-window`, обернуть `NewsList`
- [ ] Profiler после: убедиться в 60fps
- [ ] FQ44 (виртуализация) — закрывается этим US

---

## Закрываемые темы v2.1

**Backend (12):** Q10, Q59, Q61, Q62, Q63, Q64, Q65, Q66, Q67, Q68, Q82, Q90

**Frontend (15):** FQ15, FQ16, FQ20, FQ41, FQ42, FQ43, FQ44, FQ45, FQ46, FQ47, FQ48, FQ51, FQ52, FQ53, FQ54

---

## Следующий релиз

**v2.2 — Social & Engagement** (WebSocket, Live Reactions, Share) — после закрытия US 2.1.4–2.1.8
