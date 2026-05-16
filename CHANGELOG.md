# Changelog

## v2.1.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.4.0...v2.1.0)

### ✨ Новые фичи

- #5 добавлена основа для бэкенда ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 поддержка ?sources= в GET /api/news ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 фича source-filter ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 SourceBadge, NewsFeed, empty state, MSW и тесты хэндлеров ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 GET /api/news/:id — поиск по id в кэше ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 POST /api/feedback, errorHandler middleware ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 FeedbackForm + postFeedback mutation ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 Footer + FeedbackForm + MSW mock ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 Swagger UI на /api/docs через zod-to-openapi ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 OpenAPI-типы клиента (openapi-typescript) + gen:openapi скрипты ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #36 sseManager — управление SSE-подключениями ([#36](https://github.com/vv0rkz/react-happy-news/issues/36))
- #36 GET /api/news/stream — SSE endpoint ([#36](https://github.com/vv0rkz/react-happy-news/issues/36))
- #36 newsCron — cron-задача для live-ленты ([#36](https://github.com/vv0rkz/react-happy-news/issues/36))
- #36 ReadersCount — бейдж live-читателей на NewsDetail ([#36](https://github.com/vv0rkz/react-happy-news/issues/36))
- #36 миграция на named exports и завершение SSE-шагов ([#36](https://github.com/vv0rkz/react-happy-news/issues/36))
- #36 health-check — polling, StatusBadge, OfflineBanner, Toast ([#36](https://github.com/vv0rkz/react-happy-news/issues/36))
- #39 useDebounce — generic debounced value hook ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- #39 SearchInput — debounced search input ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- #39 SortSelect — sort by date or source ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- #39 useNewsFilter — объединяет search + sort + sources ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- #39 бэкенд — query-параметры q, sort, category ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- Close #39 подключение news-filter в NewsFeed ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- #41 newsQueries — useQuery/useMutation replacing RTK endpoints ([#41](https://github.com/vv0rkz/react-happy-news/issues/41))
- #41 QueryClientProvider replaces Redux Provider, store.ts removed ([#41](https://github.com/vv0rkz/react-happy-news/issues/41))
- #41 QueryClientProvider replaces Redux Provider, store.ts removed ([#41](https://github.com/vv0rkz/react-happy-news/issues/41))
- #42 SQLite schema — news_items table + WAL mode ([#42](https://github.com/vv0rkz/react-happy-news/issues/42))
- #42 newsRepository — findById, upsertMany ([#42](https://github.com/vv0rkz/react-happy-news/issues/42))
- #52 extend NewsItem — url, body, hasFullContent; Rss added, NewsApi/HackerNews removed from enum ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))
- #52 remove NewsAPI/HackerNews adapters; Guardian — url + body + hasFullContent ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))
- #52 rssApi — Positive News UK + Good News Network ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))
- #52 newsAggregator — register RSS source + filter hasFullContent ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))
- #52 OpenAPI schema — url, body, hasFullContent, rss source ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))
- Close #52 NewsDetailView — DOMPurify body render + read-original link ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))

### ⚡ Оптимизация

- Close #40 rendering optimizations — memo, MSW prod fix, bundle analysis ([#40](https://github.com/vv0rkz/react-happy-news/issues/40))

### 🐛 Исправления

- #5 CORS для 127.0.0.1:5173, Vite host 127.0.0.1, EADDRINUSE сообщение ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 MSW mock режим доступен в production (demo mode) ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #52 rssApi — unique id via md5, extract image from content:encoded ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))

### ♻️ Рефакторинг

- #18 сделана миграция на typescript ([#18](https://github.com/vv0rkz/react-happy-news/issues/18))
- Fsd ([357fa75](https://github.com/vv0rkz/react-happy-news/commit/357fa75))
- #5 Container/Presentational для NewsFeed ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- Migrate UI to Mantine — Badge, Alert, Chip, TextInput, SegmentedControl, Skeleton, Button ([aeaf9fe](https://github.com/vv0rkz/react-happy-news/commit/aeaf9fe))
- Pagination → Mantine Pagination component ([aa0313c](https://github.com/vv0rkz/react-happy-news/commit/aa0313c))
- Dark/light theme toggle via Mantine colorSchemeManager ([9431432](https://github.com/vv0rkz/react-happy-news/commit/9431432))
- NewsItem, NewsBanner — Mantine CSS vars для dark mode ([5058c16](https://github.com/vv0rkz/react-happy-news/commit/5058c16))
- Category nav + search toggle in Header + sources popover ([390abbe](https://github.com/vv0rkz/react-happy-news/commit/390abbe))
- #40 filters to URL search params, remove Context + localStorage ([#40](https://github.com/vv0rkz/react-happy-news/issues/40))
- #41 apiFetch helper — deduplicate queryFn boilerplate ([#41](https://github.com/vv0rkz/react-happy-news/issues/41))
- #41 useHealthCheck — TanStack QueryStatus + dataUpdatedAt for lastOnlineAt ([#41](https://github.com/vv0rkz/react-happy-news/issues/41))
- Header.test обёрнут в MemoryRouter под useSearchParams ([113064b](https://github.com/vv0rkz/react-happy-news/commit/113064b))
- #52 SourceBadge + SourceFilter — remove NewsApi/HackerNews, add Rss ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))
- **rssApi:** 8 sources, smart body fallback, min 300 chars threshold ([6fe1fcb](https://github.com/vv0rkz/react-happy-news/commit/6fe1fcb))
- RSS tag → publication name; SourceBadge label prop; NewsBanner badge ([926fba8](https://github.com/vv0rkz/react-happy-news/commit/926fba8))
- Expand RSS from single source to 8 named sources ([17cb379](https://github.com/vv0rkz/react-happy-news/commit/17cb379))
- US 2.1.8 — react-virtuoso, MSW seed 500 items, Zod mock validation ([20a966c](https://github.com/vv0rkz/react-happy-news/commit/20a966c))
- Back button + ReadersCount в шапке детали, infinite list, восстановление скролла ([3ee2032](https://github.com/vv0rkz/react-happy-news/commit/3ee2032))

### 📖 Documentation

- Update README with demo releases ([ed093a9](https://github.com/vv0rkz/react-happy-news/commit/ed093a9))
- Обновлен ROADMAP ([e49a285](https://github.com/vv0rkz/react-happy-news/commit/e49a285))
- #5 обновить CURRENT_INCREMENT на US 2.0.5 Swagger ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 обновить план US 2.0.5 под zod-to-openapi ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- Update README with demo releases ([fc791c9](https://github.com/vv0rkz/react-happy-news/commit/fc791c9))
- Update README with demo releases ([1ac29d7](https://github.com/vv0rkz/react-happy-news/commit/1ac29d7))
- Update README with demo releases ([4c5fc06](https://github.com/vv0rkz/react-happy-news/commit/4c5fc06))
- Update README with demo releases ([b200d1d](https://github.com/vv0rkz/react-happy-news/commit/b200d1d))
- Demo GIFs в docs/ (откат из docs/demo) ([14434b6](https://github.com/vv0rkz/react-happy-news/commit/14434b6))
- Update README with demo releases ([256346e](https://github.com/vv0rkz/react-happy-news/commit/256346e))
- Update README with demo releases ([4ef3ea6](https://github.com/vv0rkz/react-happy-news/commit/4ef3ea6))
- Demo ([e7950b5](https://github.com/vv0rkz/react-happy-news/commit/e7950b5))
- Update README with demo releases ([7141094](https://github.com/vv0rkz/react-happy-news/commit/7141094))
- Переход к релизу v2.1, инкремент US 2.1.1 SSE live-лента ([3a54851](https://github.com/vv0rkz/react-happy-news/commit/3a54851))
- #39 CURRENT_INCREMENT US 2.1.3 + git steps + INCREMENT_TEMPLATE ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- #39 git-шаги перенесены внутрь каждого шага инкремента ([#39](https://github.com/vv0rkz/react-happy-news/issues/39))
- US 2.1.3 DONE → US 2.1.4 active (оптимизация рендеринга #40) ([#40](https://github.com/vv0rkz/react-happy-news/issues/40))
- US 2.1.5 increment — TanStack Query migration ([1ba0e9b](https://github.com/vv0rkz/react-happy-news/commit/1ba0e9b))
- US 2.1.5 DONE → US 2.1.6 active (SQLite persistence #42) ([#42](https://github.com/vv0rkz/react-happy-news/issues/42))
- US 2.1.6 DONE → US 2.1.7 active ([#52](https://github.com/vv0rkz/react-happy-news/pull/52))
- Add explicit issue-close step to increment template ([a331428](https://github.com/vv0rkz/react-happy-news/commit/a331428))
- Add explicit close-increment step to INCREMENT_TEMPLATE ([077920f](https://github.com/vv0rkz/react-happy-news/commit/077920f))
- US 2.1.7 DONE → US 2.1.8 active ([#52](https://github.com/vv0rkz/react-happy-news/pull/52))
- US 2.1.8 DONE → US 2.2.1 active ([a738cde](https://github.com/vv0rkz/react-happy-news/commit/a738cde))

### 📦 Build

- Добавелны базовые тесты ([9af334b](https://github.com/vv0rkz/react-happy-news/commit/9af334b))
- Добавлен rtk query, msw ([322c81e](https://github.com/vv0rkz/react-happy-news/commit/322c81e))
- Исправлен настройка для тестов ([280a539](https://github.com/vv0rkz/react-happy-news/commit/280a539))
- #5 zod-to-openapi v7, swagger-ui-express, openapi-typescript ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 vercel.json для monorepo деплоя клиента ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- **deps-dev:** Bump vitest from 4.1.2 to 4.1.5 ([#22](https://github.com/vv0rkz/react-happy-news/pull/22))
- **deps:** Bump react from 19.2.4 to 19.2.5 ([#20](https://github.com/vv0rkz/react-happy-news/pull/20))
- **deps:** Bump msw from 2.13.0 to 2.14.2 ([#23](https://github.com/vv0rkz/react-happy-news/pull/23))
- **deps:** Bump axios from 1.14.0 to 1.15.2 ([#25](https://github.com/vv0rkz/react-happy-news/pull/25))
- **deps:** Bump react-dom from 19.2.4 to 19.2.5 ([#30](https://github.com/vv0rkz/react-happy-news/pull/30))
- **deps-dev:** Bump eslint-plugin-react-hooks from 7.0.1 to 7.1.1 ([#31](https://github.com/vv0rkz/react-happy-news/pull/31))
- **deps-dev:** Bump @commitlint/config-conventional ([#34](https://github.com/vv0rkz/react-happy-news/pull/34))
- **deps-dev:** Bump eslint-plugin-react-refresh from 0.4.26 to 0.5.2 ([#32](https://github.com/vv0rkz/react-happy-news/pull/32))
- **deps:** Bump react-router-dom from 7.14.0 to 7.14.2 ([#33](https://github.com/vv0rkz/react-happy-news/pull/33))
- **deps-dev:** Bump @commitlint/cli from 20.5.0 to 20.5.3 ([#35](https://github.com/vv0rkz/react-happy-news/pull/35))
- #42 add better-sqlite3 ([#42](https://github.com/vv0rkz/react-happy-news/issues/42))
- #52 install rss-parser + dompurify ([#52](https://github.com/vv0rkz/react-happy-news/issues/52))

### 🏡 Chore

- Jst, pnpm ([8b12341](https://github.com/vv0rkz/react-happy-news/commit/8b12341))
- Jst, pnpm ([5a8356b](https://github.com/vv0rkz/react-happy-news/commit/5a8356b))
- #5 версия 2.0.0, demo в docs/demo ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- Add Dependabot auto-merge workflow for patch and minor updates ([40482cf](https://github.com/vv0rkz/react-happy-news/commit/40482cf))
- Ignore major dependency updates in Dependabot ([fc72a63](https://github.com/vv0rkz/react-happy-news/commit/fc72a63))
- Close #41 rtk/newsApi.ts removed — migration to TanStack Query complete ([#41](https://github.com/vv0rkz/react-happy-news/issues/41))
- Pre-push — type-check + server build + tests ([6513818](https://github.com/vv0rkz/react-happy-news/commit/6513818))
- Pin Node.js 24 via .nvmrc ([e6bbd2c](https://github.com/vv0rkz/react-happy-news/commit/e6bbd2c))
- Skip pre-push checks for docs-only changes, add news.db WAL to gitignore ([bc64fb0](https://github.com/vv0rkz/react-happy-news/commit/bc64fb0))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v2.0.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.4.0...v2.0.0)

### ✨ Новые фичи

- #5 добавлена основа для бэкенда ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 поддержка ?sources= в GET /api/news ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 фича source-filter ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 SourceBadge, NewsFeed, empty state, MSW и тесты хэндлеров ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 GET /api/news/:id — поиск по id в кэше ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 POST /api/feedback, errorHandler middleware ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 FeedbackForm + postFeedback mutation ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 Footer + FeedbackForm + MSW mock ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 Swagger UI на /api/docs через zod-to-openapi ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 OpenAPI-типы клиента (openapi-typescript) + gen:openapi скрипты ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 🐛 Исправления

- #5 CORS для 127.0.0.1:5173, Vite host 127.0.0.1, EADDRINUSE сообщение ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 MSW mock режим доступен в production (demo mode) ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### ♻️ Рефакторинг

- #18 сделана миграция на typescript ([#18](https://github.com/vv0rkz/react-happy-news/issues/18))
- Fsd ([357fa75](https://github.com/vv0rkz/react-happy-news/commit/357fa75))
- #5 Container/Presentational для NewsFeed ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 📖 Documentation

- Update README with demo releases ([ed093a9](https://github.com/vv0rkz/react-happy-news/commit/ed093a9))
- Обновлен ROADMAP ([3f97609](https://github.com/vv0rkz/react-happy-news/commit/3f97609))
- #5 обновить CURRENT_INCREMENT на US 2.0.5 Swagger ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 обновить план US 2.0.5 под zod-to-openapi ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 📦 Build

- Добавелны базовые тесты ([9af334b](https://github.com/vv0rkz/react-happy-news/commit/9af334b))
- Добавлен rtk query, msw ([322c81e](https://github.com/vv0rkz/react-happy-news/commit/322c81e))
- Исправлен настройка для тестов ([280a539](https://github.com/vv0rkz/react-happy-news/commit/280a539))
- #5 zod-to-openapi v7, swagger-ui-express, openapi-typescript ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 vercel.json для monorepo деплоя клиента ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 🏡 Chore

- Jst, pnpm ([adab4eb](https://github.com/vv0rkz/react-happy-news/commit/adab4eb))
- Jst, pnpm ([34d5f17](https://github.com/vv0rkz/react-happy-news/commit/34d5f17))
- #5 версия 2.0.0, demo в docs/demo ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.4.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.3.0...v1.4.0)

### ✨ Новые фичи

- #8 сделана отдельная страница по новости ([#8](https://github.com/vv0rkz/react-happy-news/issues/8))

### ♻️ Рефакторинг

- Make mock available on all enviroments ([e36d566](https://github.com/vv0rkz/react-happy-news/commit/e36d566))
- Api ([78659e5](https://github.com/vv0rkz/react-happy-news/commit/78659e5))

### 📚 Документация

- Update README with demo releases ([56b83c6](https://github.com/vv0rkz/react-happy-news/commit/56b83c6))
- Demo v1.4.0 ([1db8433](https://github.com/vv0rkz/react-happy-news/commit/1db8433))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.3.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.2.0...v1.3.0)

### ✨ Новые фичи

- #7 сделал базовую пагинацию для новостей ([#7](https://github.com/vv0rkz/react-happy-news/issues/7))

### ♻️ Рефакторинг

- UseFetch hook ([8ab226f](https://github.com/vv0rkz/react-happy-news/commit/8ab226f))
- UseFetch hook ([f04d13f](https://github.com/vv0rkz/react-happy-news/commit/f04d13f))
- Error component ([0f8b674](https://github.com/vv0rkz/react-happy-news/commit/0f8b674))

### 📚 Документация

- Update README with demo releases ([e02bee8](https://github.com/vv0rkz/react-happy-news/commit/e02bee8))
- Update README with demo releases ([cf7d70f](https://github.com/vv0rkz/react-happy-news/commit/cf7d70f))
- Демо для v1.3.0 ([9b3524d](https://github.com/vv0rkz/react-happy-news/commit/9b3524d))

### 🛠️ Технические задачи

- Js-template ([567f041](https://github.com/vv0rkz/react-happy-news/commit/567f041))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.2.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.1.0...v1.2.0)

### ✨ Новые фичи

- #4 сделаны моки для первого запроса, чтобы работало без бэка ([#4](https://github.com/vv0rkz/react-happy-news/issues/4))

### 📚 Документация

- Update README with demo releases ([f8d209c](https://github.com/vv0rkz/react-happy-news/commit/f8d209c))
- Readme, changelog ([60a7b23](https://github.com/vv0rkz/react-happy-news/commit/60a7b23))
- Добавлено демо для v1.2.0 ([5faceaa](https://github.com/vv0rkz/react-happy-news/commit/5faceaa))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.1.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.0.0...v1.1.0)

### ✨ Новые фичи

- #10 добавлен skeleton для новостей ([#10](https://github.com/vv0rkz/react-happy-news/issues/10))
- #10 обновлен skeleton ([#10](https://github.com/vv0rkz/react-happy-news/issues/10))

### 📚 Документация

- Update README with demo releases ([e2c3eb0](https://github.com/vv0rkz/react-happy-news/commit/e2c3eb0))
- Поправлено демо для 1.0.0 версии ([7ed7929](https://github.com/vv0rkz/react-happy-news/commit/7ed7929))
- Обновлено демо для v1.1.0 ([93dc52f](https://github.com/vv0rkz/react-happy-news/commit/93dc52f))

### 🏗️ Инфраструктура

- Поменял changelog config ([6afec20](https://github.com/vv0rkz/react-happy-news/commit/6afec20))
- Поменял changelog config ([bedd7de](https://github.com/vv0rkz/react-happy-news/commit/bedd7de))

### 🛠️ Технические задачи

- Js-template ([2fa4dcb](https://github.com/vv0rkz/react-happy-news/commit/2fa4dcb))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>
- Ione_chebkn <ivanchebykin4@gmail.com>

## v1.0.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/0c57863...v1.0.0)

### ✨ Новые фичи

- #2 добалено базовое представление NewsBanner ([#2](https://github.com/vv0rkz/react-happy-news/issues/2))
- #1 добавлена базовая фильтрация на позитивные новости ([#1](https://github.com/vv0rkz/react-happy-news/issues/1))
- #3 сделал базовое отображение списка новостей ([#3](https://github.com/vv0rkz/react-happy-news/issues/3))

### 📚 Документация

- Обновлен README ([a145171](https://github.com/vv0rkz/react-happy-news/commit/a145171))
- Добавлено демо для 1.0.0 версии ([17a8dbd](https://github.com/vv0rkz/react-happy-news/commit/17a8dbd))

### 🛠️ Технические задачи

- Js-template ([29d2be5](https://github.com/vv0rkz/react-happy-news/commit/29d2be5))
- Js-template ([7c149a6](https://github.com/vv0rkz/react-happy-news/commit/7c149a6))
- Добавлены относительные пути и vite-tsconfig-paths ([5435453](https://github.com/vv0rkz/react-happy-news/commit/5435453))

### ❤️ Contributors

- Ione_chebkn <ivanchebykin4@gmail.com>
