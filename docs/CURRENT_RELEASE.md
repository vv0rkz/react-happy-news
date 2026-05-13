# React Happy News — Релиз v2.1 — Positivity Stream

**Статус:** `in progress` (US 2.1.4 active)
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

### US 2.1.5: Миграция RTK Query → TanStack Query — 🔄 ACTIVE

- [ ] Установить `@tanstack/react-query`, удалить `@reduxjs/toolkit` + `react-redux`
- [ ] Создать `client/src/shared/api/queryClient.ts` + `QueryClientProvider` в `main.tsx`
- [ ] Создать `client/src/entities/news/api/tanstack/newsQueries.ts`, удалить `rtk/newsApi.ts` и `store.ts`
- [ ] Упростить `useHealthCheck.ts`: убрать кастомный polling/backoff → `refetchInterval` + `retryDelay`
- [ ] Добавить `ReactQueryDevtools` в dev-режиме
- [ ] Проверить что все компоненты работают: список, детальная страница, offline mode

### US 2.1.6: SQLite-персистентность новостей — ⏳ PENDING

- [ ] Установить `better-sqlite3` на сервере
- [ ] Создать `server/src/db/schema.ts` — таблица `news_items (id, source, data, fetched_at)`
- [ ] Создать `server/src/db/newsRepository.ts` — `findById`, `upsertMany` + lazy TTL-cleanup (7 дней)
- [ ] `getNewsList`: после агрегации вызывать `newsRepository.upsertMany(result.news)`
- [ ] `getNewsDetail`: при L1-miss смотреть в SQLite, восстанавливать в L1
- [ ] Прямая ссылка `/news/:id` работает после рестарта сервера

### US 2.1.7: Богатая детальная страница — ⏳ PENDING

- [ ] Расширить `NewsItem`: добавить `body?: string | null`, `url: string`, `hasFullContent: boolean`
- [ ] `guardianApi.ts`: добавить `body` в `show-fields`
- [ ] Установить `rss-parser`, создать `server/src/services/rssApi.ts` (Positive News UK + GNN)
- [ ] Добавить `SourceName.Rss` и зарегистрировать в `newsAggregator.ts`
- [ ] `NewsDetail`: если `hasFullContent` → рендер HTML через DOMPurify, иначе → "Читать оригинал"
- [ ] Обновить зеркальный тип на фронте (`transforms.types.ts`)

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
