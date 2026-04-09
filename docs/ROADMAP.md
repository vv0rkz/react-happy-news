# React Happy News — Roadmap

---

## Текущее состояние

### Что работает

| Область         | Детали                                                              |
| --------------- | ------------------------------------------------------------------- |
| **Frontend**    | React 19 + Vite 7 + TypeScript (strict)                             |
| **Архитектура** | FSD (app → pages → widgets → features → entities → shared)          |
| **State**       | RTK Query (newsApi)                                                 |
| **CSS**         | CSS Modules + classnames                                            |
| **Роутинг**     | React Router 7 (createBrowserRouter, Outlet)                        |
| **Валидация**   | Zod schemas                                                         |
| **Моки**        | MSW (browser + vitest node)                                         |
| **Тесты**       | Vitest + RTL (6 файлов)                                             |
| **Backend**     | Express + TypeScript, node-cache                                    |
| **API Sources** | Guardian API + NewsAPI + HackerNews (агрегация, Promise.allSettled) |
| **CI/CD**       | Нет                                                                 |

### Текущие фичи

| Фича                              | Статус      | Описание                                                  |
| --------------------------------- | ----------- | --------------------------------------------------------- |
| Лента позитивных новостей         | ✅ Работает | Главная страница, фильтр позитива на сервере              |
| Поиск по ключевым словам          | ✅ Работает | Keyword-фильтр по title/description                       |
| Пагинация                         | ✅ Работает | Generic + render-prop паттерн                             |
| Skeleton loading                  | ✅ Работает | Скелетоны при загрузке                                    |
| Error handling                    | ✅ Работает | ErrorComponent + retry                                    |
| Mock-режим                        | ✅ Работает | Переключатель MSW в Header                                |
| Backend-агрегация                 | ✅ Работает | 3 API → единый формат → позитивный фильтр → кэш           |
| Детальная страница новости        | ⚠️ Частично | Работает через MSW, на бэке нет `GET /api/news/:id`       |
| **Выбор источников (API filter)** | 🔴 Нет UI   | Backend возвращает `source` в каждой новости, UI не готов |

### Главная проблема

Backend уже агрегирует новости из 3 источников, но пользователь:

- **Не может выбрать**, из каких источников получать новости
- **Не видит**, из какого источника пришла новость
- **Не получает** обновления в реальном времени
- **Не может** сохранить понравившуюся новость
- **Не имеет** аккаунта и персональной статистики

Проект пока — "статичная газета", а не "живой трекер позитивности".

---

## Концепция: от газеты к живому трекеру

```
[Guardian API] ──┐
[NewsAPI]        ├──→  Node.js Backend  ──→  React Frontend
[HackerNews API]─┘     (агрегатор)          (v2.x)
                        │                    │
                        ├─ REST API          ├─ Выбор источников
                        ├─ SSE (live)        ├─ Live-лента
                        ├─ WebSocket         ├─ Счётчик читателей
                        ├─ GraphQL           ├─ Аналитика позитивности
                        ├─ JWT Auth          ├─ Личный кабинет
                        └─ Docker + CI/CD    └─ Закладки + Streak
```

**Killer Feature — "Positivity Stream":** живой трекер позитивности. Бэкенд каждые N минут агрегирует свежие новости, фильтрует, пушит подписанным клиентам. Счётчик "сегодня X% новостей — позитивные" обновляется в реальном времени.

---

## Обзор релизов

| Релиз     | Название            | Ключевые фичи для пользователя                                     | Срок           |
| --------- | ------------------- | ------------------------------------------------------------------ | -------------- |
| **v2.0**  | Multi-Source News   | Выбор источников, source badges, детальная страница, feedback      | 4–5 дн.        |
| **v2.1**  | Positivity Stream   | Живая лента (SSE), health-индикатор, продвинутый поиск, сортировка | 3–4 дн.        |
| **v2.2**  | Social & Engagement | Live-читатели (WS), "сейчас на сайте", share                       | 3–4 дн.        |
| **v2.3**  | Персонализация      | Аккаунт, закладки, Positivity Tracker, streak, тёмная тема         | 4–5 дн.        |
| **v2.4**  | Analytics           | Дашборд позитивности, графики, Protocol Comparison                 | 3–4 дн.        |
| **v2.5**  | Production          | Accessibility, Docker, CI/CD, performance audit                    | 3–4 дн.        |
| **ИТОГО** |                     |                                                                    | **~20–26 дн.** |

---

## Что исключено и почему

| Тема                      | Причина                                                |
| ------------------------- | ------------------------------------------------------ |
| Next.js / SSR / SSG / ISR | Проект — SPA на Vite, миграция не оправдана            |
| Vue / Angular             | Не в стеке                                             |
| React Native              | Не web                                                 |
| Micro-frontends           | Избыточно для масштаба проекта                         |
| gRPC (реализация)         | Backend-to-backend, нет второго бэкенда. Теория в v2.4 |
| InversifyJS               | DI-контейнер избыточен                                 |

---

# RELEASE v2.0 — Multi-Source News

> Пользователь выбирает, из каких источников читать новости. Видит, откуда каждая новость. Может открыть детальную страницу и оставить feedback.

## Фичи v2.0

### F2.0.1: Выбор источников новостей (API Source Selector)

**Статус:** Backend готов → Frontend не начат

**Что видит пользователь:**

- В шапке ленты — тогглы: ☑ Guardian ☑ NewsAPI ☑ HackerNews
- По умолчанию все включены
- Снял галочку с HackerNews → новости из HN исчезают
- Выбор сохраняется между сессиями

**Что нужно сделать:**

| Сторона  | Задача                                                                       |
| -------- | ---------------------------------------------------------------------------- |
| Backend  | Query-параметр `?sources=guardian,newsapi` в `GET /api/news`                 |
| Backend  | Агрегатор фильтрует по `sources` до запроса к внешним API                    |
| Frontend | FSD-фича `features/source-filter/`: `SourceFilter.tsx`, `useSourceFilter.ts` |
| Frontend | Передать выбранные sources в RTK Query endpoint как query-параметр           |
| Frontend | Сохранение выбора в localStorage через `useLocalStorage`                     |

### F2.0.2: Source Badges

**Что видит пользователь:**

- На каждой карточке новости — цветной badge: "Guardian" / "NewsAPI" / "HN"
- Разные цвета для разных источников
- В детальной странице тоже виден badge

**Что нужно сделать:**

- Компонент `SourceBadge` в `entities/news/`
- Обновить `NewsItem` и `NewsBanner` — добавить badge
- Маппинг `source → { label, color }`

### F2.0.3: Детальная страница через бэкенд

**Что видит пользователь:**

- Клик по новости → `/news/:id` → полная информация из реального API
- Сейчас работает только через MSW-моки

**Что нужно сделать:**

- Backend: `GET /api/news/:id` — поиск в кэше агрегированных новостей
- Frontend: `useGetNewsDetailQuery` уже есть, подключить к реальному эндпоинту

### F2.0.4: Форма обратной связи

**Что видит пользователь:**

- Кнопка "Обратная связь" в footer
- Простая форма: textarea + submit
- После отправки — "Спасибо за отзыв!"

**Что нужно сделать:**

- Backend: `POST /api/feedback` (JSON body, статус 201)
- Frontend: фича `features/feedback/`, RTK mutation

### F2.0.5: Swagger-документация API

**Что видит пользователь / разработчик:**

- `/api/docs` — интерактивная документация всех endpoints
- Можно тестировать запросы прямо в браузере

**Что нужно сделать:**

- swagger-jsdoc + swagger-ui-express
- JSDoc-аннотации на каждом роуте

## User Stories v2.0

### US 2.0.1: Агрегация новостей с нескольких источников — ✅ DONE

**Как** читатель
**Я хочу** видеть позитивные новости из разных источников
**Чтобы** получать более полную картину

**Acceptance Criteria:**

- [x] Backend агрегирует Guardian API, NewsAPI, HackerNews
- [x] Запросы параллельно (Promise.allSettled)
- [x] Если одна API недоступна — остальные работают
- [x] Фильтрация позитивных новостей на сервере
- [x] Кэш: повторный запрос не долбит внешние API

### US 2.0.2: Выбор источников (фронтенд + бэкенд)

**Как** читатель
**Я хочу** выбирать, из каких источников получать новости
**Чтобы** настроить ленту под себя

**Acceptance Criteria:**

- [ ] Тогглы для каждого источника в UI (Guardian, NewsAPI, HackerNews)
- [ ] По умолчанию все включены
- [ ] При отключении источника — его новости исчезают
- [ ] Выбор сохраняется в localStorage
- [ ] `GET /api/news?sources=guardian,newsapi` — бэкенд фильтрует
- [ ] Source badge на каждой карточке

### US 2.0.3: RESTful API

**Как** фронтенд-разработчик
**Я хочу** работать с предсказуемым REST API
**Чтобы** понимать каждый endpoint, метод и статус

**Acceptance Criteria:**

- [ ] `GET /api/news` — список (query: sources, page, limit)
- [ ] `GET /api/news/:id` — детали
- [ ] `POST /api/feedback` — обратная связь (body: JSON)
- [ ] `GET /api/health` — статус сервера (✅ уже есть)
- [ ] HTTP-статусы: 200, 201, 400, 404, 422, 500
- [ ] Валидация query-параметров через Zod
- [ ] Серверная ошибка → 500 без stack trace в проде

### US 2.0.4: CORS — ✅ Базово DONE

**Как** разработчик
**Я хочу** правильно настроить CORS
**Чтобы** фронт (localhost:5173) мог обращаться к бэку (localhost:3001)

**Acceptance Criteria:**

- [x] CORS-заголовки настроены
- [ ] Preflight (OPTIONS) виден в DevTools
- [ ] В проде — CORS ограничен конкретным доменом

### US 2.0.5: Swagger-документация + OpenAPI codegen

**Как** разработчик
**Я хочу** интерактивную документацию API и автогенерацию типов
**Чтобы** тестировать endpoints без Postman и не писать типы вручную

**Acceptance Criteria:**

- [ ] Swagger UI на `/api/docs`
- [ ] Все endpoints описаны с примерами
- [ ] OpenAPI spec из JSDoc (swagger-jsdoc)
- [ ] `openapi-typescript` генерирует типы клиента из spec → убираем ручные типы (`NewsDetailsData` и др.)
- [ ] Закрывает Q88: "OpenAPI spec → codegen" на практике

### US 2.0.6: HTTPS и безопасность

**Как** пользователь
**Я хочу** чтобы данные передавались безопасно

**Acceptance Criteria:**

- [ ] Понимание HTTP vs HTTPS через DevTools
- [x] API-ключи только на сервере (.env)
- [ ] В проде: HTTPS (финализация в v2.5)

### US 2.0.7: Архитектурный рефакторинг (в ходе реализации фич)

**Как** разработчик
**Я хочу** привести код в соответствие с SOLID и FSD
**Чтобы** код был масштабируемым

**Acceptance Criteria:**

- [ ] Container/Presentational: `NewsFeedContainer` (логика) + `NewsFeedView` (рендеринг)
- [ ] FSD Public API: каждый слой экспортирует через `index.ts`
- [ ] Error Boundaries вокруг NewsFeed и NewsDetail
- [ ] Семантические теги: `<article>`, `<main>`, `<nav>`

## Архитектура v2.0

```
server/src/
├── routes/
│   ├── news.routes.ts        ← GET / (+ query: sources), GET /:id
│   ├── feedback.routes.ts    ← POST /
│   └── health.routes.ts
├── services/
│   ├── newsAggregator.ts     ✅ (+ фильтрация по sources)
│   ├── guardianApi.ts        ✅
│   ├── newsApi.ts            ✅
│   └── hackerNewsApi.ts      ✅
├── middleware/
│   ├── errorHandler.ts
│   └── validateQuery.ts      ← Zod-валидация
├── swagger/
│   └── openapi.yaml
├── utils/
│   ├── cache.ts              ✅
│   └── positivityFilter.ts   ✅
├── app.ts                    ✅ (расширить)
└── index.ts                  ✅

client/src/
├── features/
│   ├── source-filter/        ← НОВАЯ ФИЧА
│   │   ├── SourceFilter.tsx
│   │   ├── useSourceFilter.ts
│   │   └── index.ts
│   ├── feedback/             ← НОВАЯ ФИЧА
│   │   ├── FeedbackForm.tsx
│   │   └── index.ts
│   └── paginate-news/        ✅
├── entities/news/
│   ├── SourceBadge/          ← НОВЫЙ КОМПОНЕНТ
│   ├── NewsBanner/           ✅ (+ badge)
│   ├── NewsItem/             ✅ (+ badge)
│   └── NewsList/             ✅
├── pages/
│   ├── Main/
│   │   ├── NewsFeedContainer.tsx  ← логика + data
│   │   └── NewsFeedView.tsx       ← чистый рендеринг
│   └── NewsDetail/           ✅ (подключить к бэкенду)
└── widgets/
    └── Header/               ✅
```

## Стек v2.0

| Компонент        | Технология                         |
| ---------------- | ---------------------------------- |
| Runtime          | Node.js 20+                        |
| Framework        | Express                            |
| Кэш              | node-cache                         |
| Документация API | swagger-jsdoc + swagger-ui-express |
| Валидация        | Zod                                |
| Логирование      | Morgan                             |
| Error Boundaries | react-error-boundary               |

## Закрываемые темы v2.0

<details>
<summary>Backend: 34 вопроса</summary>

| #   | Тема                         | Как закрывается                         |
| --- | ---------------------------- | --------------------------------------- |
| Q1  | HTTPS                        | TLS, сертификат                         |
| Q4  | 400 vs 500                   | Валидация → 400, crash → 500            |
| Q5  | CORS                         | cors middleware между портами           |
| Q9  | OPTIONS                      | Preflight виден в DevTools              |
| Q11 | GET vs POST                  | GET /news, POST /feedback               |
| Q12 | HTTP vs HTTPS                | Сравнение в DevTools                    |
| Q13 | Шифрование запроса           | Header + Body зашифрованы               |
| Q15 | REST аббревиатура            | Representational State Transfer         |
| Q16 | REST правила                 | Stateless, uniform interface, и т.д.    |
| Q17 | Code on Demand               | Теория                                  |
| Q18 | Протокол REST                | HTTP/HTTPS                              |
| Q19 | OSI уровень HTTP             | Application (L7)                        |
| Q20 | Структура HTTP-запроса       | Request line + Headers + Body           |
| Q21 | Коды ошибок                  | 200, 201, 400, 404, 422, 500            |
| Q22 | Параллельные запросы         | Promise.allSettled для 3 API            |
| Q23 | Способы общения с бэком      | RTK Query, fetch, axios                 |
| Q33 | Документация API             | Swagger UI на /api/docs                 |
| Q34 | Инструменты документирования | swagger-jsdoc, Swagger UI               |
| Q35 | Postman                      | Тестирование API                        |
| Q36 | Изменение API-контрактов     | OpenAPI spec + версионирование          |
| Q37 | Same-origin policy           | Разные порты = разные origin            |
| Q38 | Части origin                 | protocol + host + port                  |
| Q39 | Обход CORS                   | CORS-заголовки, proxy                   |
| Q45 | Почему не auth через GET     | Данные в URL → логи, referrer           |
| Q46 | Query vs body                | Фильтры в query, данные в body          |
| Q47 | Query при HTTPS              | Зашифрованы, но видны в логах           |
| Q48 | HTTP-методы                  | GET, POST, PUT, PATCH, DELETE           |
| Q49 | Body в HTTP-методах          | GET обычно без body                     |
| Q72 | Зачем cross-origin           | Безопасность                            |
| Q73 | HTTP-протокол                | Request-response                        |
| Q78 | Принципы REST                | Stateless, cacheable, uniform interface |
| Q79 | Frontend ↔ REST              | RTK Query → Express                     |
| Q85 | Что на сервере при запросе   | Middleware chain                        |
| Q88 | Проектирование API-контракта | OpenAPI spec → codegen                  |

</details>

<details>
<summary>Frontend: 16 вопросов</summary>

| #    | Тема                     | Как закрывается                                |
| ---- | ------------------------ | ---------------------------------------------- |
| FQ1  | SOLID                    | SRP в компонентах, OCP в API-адаптерах         |
| FQ2  | Design Patterns          | Module (FSD), Observer (SSE/WS), Factory (API) |
| FQ4  | FSD                      | app → pages → widgets → features → entities    |
| FQ5  | FSD vs альтернативы      | Почему FSD, а не Atomic Design                 |
| FQ6  | Container/Presentational | NewsFeedContainer + NewsFeedView               |
| FQ9  | Render Props             | Pagination: `children: (data) => ReactNode`    |
| FQ13 | Mediator/Middleware      | Express middleware, RTK middleware             |
| FQ14 | Virtual DOM              | Основа React через DevTools Profiler           |
| FQ17 | JSX → createElement      | Babel REPL демонстрация                        |
| FQ21 | Иммутабельность          | `[...prev, new]` vs `push`                     |
| FQ23 | React Fragments          | `<>...</>` для списков                         |
| FQ35 | Redux/Flux flow          | dispatch → reducer → state → UI                |
| FQ36 | RTK Query                | Кэш, dedupe, loading states                    |
| FQ55 | Error Boundaries         | NewsFeed, NewsDetail обёрнуты                  |
| FQ72 | .env файлы               | VITE\_\* vs серверные переменные               |
| FQ78 | Семантическая вёрстка    | article, main, nav, header                     |

</details>

**Оценка: 4–5 дней**

---

# RELEASE v2.1 — Positivity Stream

> Лента оживает: новые позитивные новости появляются без перезагрузки. Пользователь видит, работает ли сервер. Может сортировать и искать по категориям.

## Фичи v2.1

### F2.1.1: Живая лента новостей (SSE)

**Что видит пользователь:**

- Индикатор "● Live" в углу — соединение активно
- Каждые 5 минут в ленте плавно появляются новые позитивные новости
- Новая новость — анимация вставки вверху списка
- При закрытии вкладки — соединение корректно закрывается

**Что нужно сделать:**

| Сторона  | Задача                                                                |
| -------- | --------------------------------------------------------------------- |
| Backend  | Cron-задача: каждые 5 мин fetch → filter → push через SSE             |
| Backend  | `GET /api/news/stream` — SSE endpoint                                 |
| Backend  | sseManager: управление подключениями, heartbeat                       |
| Frontend | FSD-фича `features/live-news/`: `useLiveNews.ts`, `LiveIndicator.tsx` |
| Frontend | EventSource подписка + cleanup при unmount                            |
| Frontend | Анимация вставки новой новости                                        |

### F2.1.2: Health-индикатор

**Что видит пользователь:**

- В header — зелёный/красный кружок: сервер работает / недоступен
- Если сервер упал — "Показываем кэшированные данные"
- При восстановлении — автоматический refetch

**Что нужно сделать:**

| Сторона  | Задача                                                           |
| -------- | ---------------------------------------------------------------- |
| Frontend | `features/health-check/`: `useHealthCheck.ts`, `StatusBadge.tsx` |
| Frontend | Polling `GET /api/health` каждые 30 сек                          |
| Frontend | Retry с exponential backoff (1с → 2с → 4с → 8с → max 30с)        |
| Frontend | AbortController: отмена при переходе между страницами            |

### F2.1.3: Расширенный поиск + сортировка

**Что видит пользователь:**

- Поле поиска с debounce (без лагов при вводе)
- Сортировка: по дате / по источнику / по категории
- Фильтр по категории (Science, Technology, Culture, ...)

**Что нужно сделать:**

- Backend: query-параметры `?q=keyword&sort=date&category=science`
- Frontend: расширить `features/source-filter/` → `features/news-filter/`
- Debounce для поля поиска (custom hook или lodash.debounce)

### F2.1.4: Виртуализированная лента

**Что видит пользователь:**

- Лента из 100+ новостей скроллится плавно, без тормозов
- 60fps при 500+ элементах

**Что нужно сделать:**

- react-window: рендерить только видимые карточки
- Fallback для отключённого JS

## User Stories v2.1

### US 2.1.1: Live-обновления через SSE

**Как** читатель
**Я хочу** видеть новые позитивные новости без перезагрузки
**Чтобы** быть в курсе в реальном времени

**Acceptance Criteria:**

- [ ] Backend: cron каждые 5 минут фетчит свежие новости
- [ ] Backend: SSE endpoint `GET /api/news/stream`
- [ ] Frontend: EventSource подписывается на поток
- [ ] Новая новость плавно появляется вверху ленты
- [ ] "Live ●" индикатор, когда SSE-соединение активно
- [ ] При закрытии вкладки — EventSource закрывается (cleanup)

### US 2.1.2: Polling health-check + retry

**Как** пользователь
**Я хочу** видеть, работает ли сервер
**Чтобы** понимать, когда проблема временная

**Acceptance Criteria:**

- [ ] Polling `GET /api/health` каждые 30 сек
- [ ] Зелёный/красный индикатор в header
- [ ] Retry с exponential backoff
- [ ] При N ошибках → "offline mode" (кэшированные данные)
- [ ] При восстановлении → автоматический refetch
- [ ] AbortController: отмена при навигации
- [ ] Не отправлять следующий запрос, пока текущий не завершился

### US 2.1.3: Расширенный поиск

**Как** читатель
**Я хочу** искать новости по ключевым словам и фильтровать по категории
**Чтобы** находить интересующие темы

**Acceptance Criteria:**

- [ ] Debounced поле поиска (300мс задержка)
- [ ] Фильтр по категории (Science, Technology, Culture, ...)
- [ ] Сортировка: по дате / по источнику
- [ ] Query-параметры на бэкенде: `?q=...&sort=...&category=...`

### US 2.1.4: Оптимизация рендеринга

**Как** пользователь
**Я хочу** чтобы при SSE-обновлениях страница не тормозила
**Чтобы** UX оставался плавным

**Acceptance Criteria:**

- [ ] NewsItem обёрнут в React.memo
- [ ] useMemo для фильтрованного/отсортированного списка
- [ ] useCallback для стабилизации колбэков
- [ ] react-window для виртуализации при 100+ новостей
- [ ] Profiler API: замер рендеров до/после оптимизации
- [ ] React.lazy + Suspense для страниц (code splitting)
- [ ] vite-bundle-visualizer: анализ бандла

## Архитектура v2.1

```
server/src/
├── services/
│   └── newsCron.ts            ← cron: fetch → filter → push
├── routes/
│   └── newsStream.routes.ts   ← SSE endpoint
└── utils/
    └── sseManager.ts          ← управление SSE-подключениями

client/src/
├── features/
│   ├── live-news/             ← НОВАЯ ФИЧА
│   │   ├── useLiveNews.ts
│   │   ├── LiveIndicator.tsx
│   │   └── index.ts
│   ├── health-check/          ← НОВАЯ ФИЧА
│   │   ├── useHealthCheck.ts
│   │   ├── StatusBadge.tsx
│   │   └── index.ts
│   └── news-filter/           ← РАСШИРЕНИЕ source-filter
│       ├── SearchInput.tsx
│       ├── CategoryFilter.tsx
│       ├── SortSelect.tsx
│       └── index.ts
└── shared/
    └── useAbortablePolling.ts ← generic polling с AbortController
```

## Стек v2.1

| Компонент       | Технология                      |
| --------------- | ------------------------------- |
| SSE (сервер)    | Нативный Node.js (res.write)    |
| SSE (клиент)    | EventSource API                 |
| Cron            | node-cron                       |
| Виртуализация   | react-window                    |
| Bundle analysis | vite-bundle-visualizer          |
| Debounce        | lodash.debounce или custom hook |
| Profiling       | React DevTools Profiler         |

## Закрываемые темы v2.1

<details>
<summary>Backend: 12 вопросов</summary>

| #   | Тема                   | Как закрывается                                |
| --- | ---------------------- | ---------------------------------------------- |
| Q10 | Real-time данные       | SSE для live-новостей                          |
| Q59 | Без перезагрузки       | SSE push → UI                                  |
| Q61 | Polling                | Health check каждые 30с                        |
| Q62 | Polling > WebSocket    | Health: не нужен постоянный канал              |
| Q63 | Проблемы polling       | Нагрузка, задержка, дублирование               |
| Q64 | Падение сервера        | Backoff + offline mode                         |
| Q65 | Скрытие ошибок         | "Сервер недоступен" вместо stack trace         |
| Q66 | Retry-логика           | Exponential backoff: 1→2→4→8→30с               |
| Q67 | Время ответа + polling | Не слать следующий, пока текущий не завершился |
| Q68 | Отмена запроса         | AbortController                                |
| Q82 | Кроме REST             | SSE, WebSocket, GraphQL                        |
| Q90 | WS vs SSE vs long poll | SSE реализован, остальное — объяснение         |

</details>

<details>
<summary>Frontend: 15 вопросов</summary>

| #    | Тема                  | Как закрывается                               |
| ---- | --------------------- | --------------------------------------------- |
| FQ15 | Триггеры перерендера  | state, props, context, parent                 |
| FQ16 | Shallow comparison    | React.memo для NewsItem                       |
| FQ20 | Batching              | SSE-обработчик: несколько setState → 1 рендер |
| FQ41 | React.memo            | NewsItem мемоизация                           |
| FQ42 | useMemo/useCallback   | Фильтрованный список, стабильные колбэки      |
| FQ43 | Profiler API          | Замер до/после оптимизации                    |
| FQ44 | Виртуализация         | react-window для ленты 100+                   |
| FQ45 | Debounce/throttle     | Поиск по новостям                             |
| FQ46 | Code Splitting        | React.lazy для страниц                        |
| FQ47 | Bundle analysis       | vite-bundle-visualizer                        |
| FQ48 | Tree Shaking          | Проверка бандла                               |
| FQ51 | Reflow/Repaint        | Batch-обновления при SSE                      |
| FQ52 | Event Loop            | Macro/microtasks в контексте SSE              |
| FQ53 | Critical Rendering    | HTML → CSSOM → Render → Paint                 |
| FQ54 | Transform vs top/left | CSS-анимации карточек                         |

</details>

**Оценка: 3–4 дня**

---

# RELEASE v2.2 — Social & Engagement

> Пользователь видит, что он не один: сколько людей читают ту же статью, сколько людей на сайте прямо сейчас.

## Фичи v2.2

### F2.2.1: Счётчик читателей статьи (Live Readers)

**Что видит пользователь:**

- На странице статьи: "5 читают сейчас"
- Счётчик обновляется в реальном времени
- При уходе со страницы — число уменьшается

**Что нужно сделать:**

| Сторона  | Задача                                                              |
| -------- | ------------------------------------------------------------------- |
| Backend  | WebSocket-сервер на том же порту                                    |
| Backend  | Трекер: `Map<articleId, Set<connectionId>>`                         |
| Backend  | Heartbeat (ping/pong) для проверки живых соединений                 |
| Frontend | `features/live-readers/`: `useWebSocket.ts`, `useArticleReaders.ts` |
| Frontend | Клиент → `{ type: "join", articleId }` при открытии статьи          |
| Frontend | Клиент → `{ type: "leave", articleId }` при закрытии                |
| Frontend | Reconnect при разрыве (exponential backoff, max 3 попытки)          |

### F2.2.2: Онлайн-счётчик в Header

**Что видит пользователь:**

- В header: "142 на сайте"
- Число обновляется live через тот же WebSocket

### F2.2.3: Поделиться новостью (Share)

**Что видит пользователь:**

- На карточке новости — кнопка "Поделиться"
- Копирует ссылку в буфер обмена (или Web Share API на мобильных)
- Уведомление "Ссылка скопирована!"

## User Stories v2.2

### US 2.2.1: Счётчик онлайн-читателей

**Как** читатель
**Я хочу** видеть, сколько людей читают ту же статью
**Чтобы** чувствовать, что позитивные новости важны не только мне

**Acceptance Criteria:**

- [ ] WebSocket-сервер отслеживает, кто какую статью читает
- [ ] При открытии: `{ type: "join", articleId }`
- [ ] При закрытии: `{ type: "leave", articleId }`
- [ ] Подписчики получают обновлённый счётчик
- [ ] Общий "сейчас на сайте: N" в header
- [ ] Reconnect при разрыве (exponential backoff)
- [ ] Max 3 попытки → fallback на polling

### US 2.2.2: Нагрузочное тестирование WS

**Как** разработчик
**Я хочу** проверить лимиты WS-сервера
**Чтобы** настроить reconnect

**Acceptance Criteria:**

- [ ] Скрипт `simulate-readers.ts`: N ботов, случайные статьи
- [ ] Мониторинг: соединения, latency, memory
- [ ] Тест: throttle → reconnect
- [ ] Тест: kill server → клиент переживает

### US 2.2.3: React Patterns на практике

**Как** разработчик
**Я хочу** реализовать паттерны в контексте live-readers
**Чтобы** уметь выбирать паттерн под задачу

**Acceptance Criteria:**

- [ ] **Provider**: `<WebSocketProvider>` — Context с WS-соединением
- [ ] **Compound**: `<ReadersInfo>` + `<ReadersInfo.Count />` + `<ReadersInfo.Badge />`
- [ ] **Observer**: WS = Subject, компоненты = Observers
- [ ] **HOC**: `withReaderCount(Component)` — сравнить с hook-подходом
- [ ] **Factory**: `createApiAdapter(source)` — фабрика для API-адаптеров
- [ ] **useSyncExternalStore**: WS store → React rendering

## Архитектура v2.2

```
server/src/
├── ws/
│   ├── wsServer.ts             ← WebSocket-сервер
│   ├── readersTracker.ts       ← Map<articleId, Set<connectionId>>
│   └── heartbeat.ts            ← ping/pong
└── scripts/
    └── simulate-readers.ts     ← нагрузочный скрипт

client/src/
├── features/
│   ├── live-readers/           ← НОВАЯ ФИЧА
│   │   ├── useWebSocket.ts     ← generic: connect, send, reconnect
│   │   ├── useArticleReaders.ts
│   │   ├── ReadersCounter.tsx
│   │   ├── OnlineCounter.tsx
│   │   ├── ShareButton.tsx
│   │   └── index.ts
```

## Стек v2.2

| Компонент                | Технология               |
| ------------------------ | ------------------------ |
| WS (сервер)              | ws (нативный)            |
| WS (клиент)              | WebSocket API (нативный) |
| State management         | useReducer + Context     |
| Нагрузочное тестирование | Кастомный скрипт         |

## Закрываемые темы v2.2

<details>
<summary>Backend: 8 вопросов</summary>

| #   | Тема                    | Как закрывается                       |
| --- | ----------------------- | ------------------------------------- |
| Q14 | WS-библиотека           | ws (нативный)                         |
| Q41 | WebSocket vs REST       | REST для данных, WS для live-счётчика |
| Q42 | Полный переход на WS    | Нет кэша, статусов, сложнее дебаг     |
| Q43 | Риски persistent WS     | Память, scaling                       |
| Q44 | Нестабильное соединение | heartbeat → reconnect                 |
| Q60 | Когда WebSocket         | Двусторонняя связь, частые обновления |
| Q71 | WS vs HTTP              | Persistent vs request-response        |
| Q89 | Reconnect WS            | Detect → backoff → reconnect → re-sub |

</details>

<details>
<summary>Frontend: 14 вопросов</summary>

| #    | Тема                 | Как закрывается                        |
| ---- | -------------------- | -------------------------------------- |
| FQ7  | HOC Pattern          | withReaderCount — сравнение с хуком    |
| FQ8  | Compound Pattern     | ReadersInfo.Count + ReadersInfo.Badge  |
| FQ10 | Provider Pattern     | WebSocketProvider                      |
| FQ11 | Observer Pattern     | WS = Subject, компоненты = Observers   |
| FQ12 | Factory Pattern      | createApiAdapter(source)               |
| FQ24 | Основные хуки        | Обзор всех используемых                |
| FQ26 | Custom hooks         | useWebSocket, useArticleReaders        |
| FQ27 | useReducer           | WS-состояние: status, readers, error   |
| FQ28 | Rules of Hooks       | Linked list — почему нельзя в условиях |
| FQ29 | Cleanup useEffect    | Закрытие WS при unmount                |
| FQ30 | Deps useEffect       | Stale closure, бесконечный цикл        |
| FQ31 | useRef               | WS instance, interval ID               |
| FQ32 | useSyncExternalStore | WS store → React                       |
| FQ33 | Lifecycle → hooks    | componentDidMount → useEffect          |

</details>

**Оценка: 3–4 дня**

---

# RELEASE v2.3 — Персонализация

> Пользователь создаёт аккаунт. Сохраняет любимые новости. Видит свою статистику позитивности и streak.

## Фичи v2.3

### F2.3.1: Регистрация и логин

**Что видит пользователь:**

- Кнопка "Войти" в header
- Формы логина и регистрации (email + пароль)
- Real-time валидация: "пароль слишком короткий"
- Серверные ошибки: "email уже занят"
- После логина — имя пользователя в header

### F2.3.2: Закладки

**Что видит пользователь:**

- На каждой карточке — кнопка "Сохранить"
- Страница "Мои закладки" (`/bookmarks`)
- Закладки синхронизированы между устройствами (привязаны к аккаунту)

### F2.3.3: Positivity Tracker

**Что видит пользователь:**

- Страница "Мой прогресс" (`/dashboard`)
- Сколько позитивных новостей прочитано за неделю / месяц
- Какие темы больше всего вдохновляют
- **Streak**: "7 дней подряд читаешь позитив!"

### F2.3.4: Тёмная / светлая тема

**Что видит пользователь:**

- Переключатель темы в header
- Тёмный / светлый режим
- Сохраняется в localStorage

### F2.3.5: Protected Routes

**Что видит пользователь:**

- `/bookmarks` и `/dashboard` доступны только после логина
- Без авторизации — редирект на `/login`
- После логина — возврат на ту страницу, откуда был редирект

## User Stories v2.3

### US 2.3.1: Регистрация и логин

**Как** читатель
**Я хочу** создать аккаунт и войти
**Чтобы** мой прогресс сохранялся

**Acceptance Criteria:**

- [ ] `POST /api/auth/register` — email + password → аккаунт
- [ ] `POST /api/auth/login` → access + refresh tokens
- [ ] `POST /api/auth/refresh` → новый access token
- [ ] `POST /api/auth/logout` → очистка refresh cookie
- [ ] Пароль: bcrypt-хеш
- [ ] Access token: в памяти приложения
- [ ] Refresh token: httpOnly secure cookie (7 дней)
- [ ] При 401: auto refresh + retry

### US 2.3.2: Закладки

**Как** авторизованный пользователь
**Я хочу** сохранять понравившиеся новости
**Чтобы** вернуться к ним позже

**Acceptance Criteria:**

- [ ] `POST /api/bookmarks` — сохранить
- [ ] `GET /api/bookmarks` — список
- [ ] `DELETE /api/bookmarks/:id` — удалить
- [ ] Кнопка "Сохранить/Убрать" на карточке
- [ ] Страница `/bookmarks` со списком

### US 2.3.3: Positivity Tracker

**Как** авторизованный пользователь
**Я хочу** видеть статистику чтения
**Чтобы** понимать, насколько позитивен мой информационный поток

**Acceptance Criteria:**

- [ ] `POST /api/reading-history` — каждый просмотр статьи
- [ ] Страница `/dashboard`: прочитано за неделю / месяц
- [ ] Streak: "5 дней подряд позитивных новостей"
- [ ] Топ тем, которые вдохновляют

### US 2.3.4: Сравнение хранилищ

**Как** разработчик
**Я хочу** использовать разные хранилища для разных целей

**Acceptance Criteria:**

- [ ] Access token → в переменной JS
- [ ] Тема (dark/light) → localStorage
- [ ] Состояние формы → sessionStorage
- [ ] Refresh token → httpOnly cookie
- [ ] Кэш статей (offline) → IndexedDB

### US 2.3.5: Формы авторизации

**Как** пользователь
**Я хочу** удобные формы логина и регистрации

**Acceptance Criteria:**

- [ ] React Hook Form для Login и Register
- [ ] Zod-схемы: email, password (min 8, uppercase, digit) — shared фронт + бэк
- [ ] Real-time валидация
- [ ] Серверные ошибки отображаются в форме
- [ ] useLayoutEffect: проверка auth до первого рендера (без мерцания)

### US 2.3.6: Protected Routes + Navigation

**Как** разработчик
**Я хочу** разграничить доступ к страницам

**Acceptance Criteria:**

- [ ] `<ProtectedRoute>` → проверка auth → redirect `/login`
- [ ] Nested Routes: `/dashboard/*`
- [ ] Lazy loading: Dashboard, Auth — по требованию
- [ ] errorElement: кастомная 404
- [ ] useNavigate: программная навигация после логина
- [ ] useLocation: сохранение пути для redirect

### US 2.3.7: Frontend Security

**Как** пользователь
**Я хочу** чтобы мои данные были защищены

**Acceptance Criteria:**

- [ ] XSS: DOMPurify для HTML в описаниях новостей
- [ ] CSRF: SameSite=Strict на refresh cookie
- [ ] Race conditions: cleanup при logout во время запроса
- [ ] AbortController: отмена запросов при logout

## Архитектура v2.3

```
server/src/
├── routes/
│   ├── auth.routes.ts         ← register, login, refresh, logout
│   ├── bookmarks.routes.ts    ← CRUD закладок
│   └── readingHistory.routes.ts
├── middleware/
│   ├── authenticate.ts        ← проверка JWT
│   └── csrfProtection.ts
├── services/
│   └── authService.ts         ← bcrypt, jwt sign/verify
└── db/
    └── schema.ts              ← SQLite (better-sqlite3 или Prisma)

client/src/
├── features/
│   ├── auth/                  ← НОВАЯ ФИЧА
│   │   ├── useAuth.ts
│   │   ├── AuthInterceptor.ts ← RTK baseQuery с auto-refresh
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── index.ts
│   ├── bookmarks/             ← НОВАЯ ФИЧА
│   │   ├── useBookmarks.ts
│   │   ├── BookmarkButton.tsx
│   │   └── index.ts
│   ├── positivity-tracker/    ← НОВАЯ ФИЧА
│   │   ├── useReadingStats.ts
│   │   ├── PositivityDashboard.tsx
│   │   ├── StreakCounter.tsx
│   │   └── index.ts
│   └── theme-toggle/          ← НОВАЯ ФИЧА
│       ├── useTheme.ts
│       ├── ThemeToggle.tsx
│       └── index.ts
├── pages/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Bookmarks/
│   │   └── Bookmarks.tsx
│   └── Dashboard/
│       └── Dashboard.tsx
```

## Стек v2.3

| Компонент      | Технология                |
| -------------- | ------------------------- |
| JWT            | jsonwebtoken              |
| Хеширование    | bcrypt                    |
| Cookies        | cookie-parser             |
| БД             | SQLite + better-sqlite3   |
| Формы          | React Hook Form           |
| Валидация форм | @hookform/resolvers + Zod |
| Санитизация    | DOMPurify                 |

## Закрываемые темы v2.3

<details>
<summary>Backend: 19 вопросов</summary>

| #   | Тема                     | Как закрывается                              |
| --- | ------------------------ | -------------------------------------------- |
| Q2  | 3 метода аутентификации  | Password, JWT, OAuth                         |
| Q3  | Авторизация              | Проверка прав: guest vs user                 |
| Q6  | Cookie vs sessionStorage | Cookie для refresh, sessionStorage для draft |
| Q7  | CSRF                     | Cookie-based auth + SameSite=Strict          |
| Q8  | Где хранятся сессии      | JWT (stateless) + cookie (браузер)           |
| Q25 | Cookie                   | httpOnly, secure, maxAge, SameSite           |
| Q26 | JWT                      | Header.Payload.Signature                     |
| Q27 | Токены JWT               | Access + Refresh                             |
| Q28 | Access vs Refresh        | 15 мин vs 7 дней                             |
| Q29 | Где хранить токены       | Access: memory, Refresh: httpOnly            |
| Q30 | httpOnly для refresh     | JS не может прочитать → защита от XSS        |
| Q31 | Статус невалидного token | 401 Unauthorized                             |
| Q32 | Когда добавлять token    | Interceptor в каждый запрос                  |
| Q50 | Хранение паролей         | bcrypt + salt                                |
| Q51 | Альтернативы паролю      | OAuth, magic link, WebAuthn                  |
| Q52 | Passwordless риски       | Перехват SMS, задержка email                 |
| Q74 | Авто-обновление          | Interceptor: 401 → refresh → retry           |
| Q77 | Время жизни cookie       | maxAge, expires, session cookie              |
| Q81 | LS vs IDB vs cookie      | Каждое используется в проекте                |

</details>

<details>
<summary>Frontend: 21 вопрос</summary>

| #    | Тема                        | Как закрывается                                   |
| ---- | --------------------------- | ------------------------------------------------- |
| FQ3  | MVC/MVVM в React            | Auth: Model=state, View=form, Controller=handlers |
| FQ19 | Controlled vs Uncontrolled  | Login = controlled, file = uncontrolled           |
| FQ22 | Event handling              | preventDefault, stopPropagation                   |
| FQ25 | useLayoutEffect             | Auth check до первого рендера                     |
| FQ34 | Context API                 | AuthContext                                       |
| FQ37 | Context vs Redux            | Auth (Context), News (RTK Query)                  |
| FQ38 | Server vs Client state      | JWT = server, theme = client                      |
| FQ39 | Single source of truth      | Auth только в AuthContext                         |
| FQ40 | Альтернативы Redux          | Zustand — теория, RTK подходит                    |
| FQ56 | Suspense                    | Fallback при проверке авторизации                 |
| FQ57 | Race conditions             | Cleanup при logout                                |
| FQ58 | AbortController             | Отмена при logout/навигации                       |
| FQ59 | React Router                | createBrowserRouter                               |
| FQ61 | Protected Routes            | ProtectedRoute → redirect /login                  |
| FQ62 | Lazy routes                 | React.lazy для Dashboard, Auth                    |
| FQ63 | useNavigate/Location/Params | Навигация, redirect, newsId                       |
| FQ64 | Error routes                | errorElement для 404                              |
| FQ65 | Формы                       | Controlled inputs                                 |
| FQ66 | React Hook Form             | Производительные формы                            |
| FQ67 | Zod + RHF                   | Единая валидация фронт + бэк                      |
| FQ68 | XSS                         | DOMPurify                                         |

</details>

**Оценка: 4–5 дней**

---

# RELEASE v2.4 — Analytics

> Пользователь видит аналитику позитивности: графики, тренды, топ-темы. Разработчик — страницу сравнения протоколов.

## Фичи v2.4

### F2.4.1: Дашборд позитивности (Analytics)

**Что видит пользователь:**

- Страница `/analytics`
- Графики: тренд позитивности за 30 дней
- Топ-10 тем с количеством статей
- Разбивка по источникам: сколько позитива из Guardian / NewsAPI / HN
- "Сегодня X% новостей — позитивные"

### F2.4.2: Protocol Comparison (для разработчика)

**Что видит пользователь / разработчик:**

- Страница `/protocols`
- Таблица: REST vs GraphQL vs WebSocket vs SSE vs gRPC
- Для каждого: когда использовать, плюсы, минусы, пример из проекта
- gRPC — теоретическое описание (binary, protobuf)

### F2.4.3: Storybook

**Что получает разработчик:**

- Живая документация UI-компонентов
- Stories для: NewsItem, Skeleton, ErrorComponent, Pagination, LoginForm, SourceBadge

## User Stories v2.4

### US 2.4.1: Аналитический дашборд (GraphQL)

**Как** авторизованный пользователь
**Я хочу** видеть аналитику позитивности
**Чтобы** понимать, откуда берутся хорошие новости

**Acceptance Criteria:**

- [ ] GraphQL endpoint: `POST /api/graphql`
- [ ] Query: `topTopics(period: "week")` → `[{ topic, count, sources }]`
- [ ] Query: `positivityTrend(days: 30)` → `[{ date, positive, total, percent }]`
- [ ] Query: `readingHistory(userId)` → `[{ article, readAt }]`
- [ ] Apollo Client для GraphQL
- [ ] Визуализация: recharts (lazy-loaded)

### US 2.4.2: Protocol Comparison

**Как** разработчик
**Я хочу** страницу-шпаргалку протоколов
**Чтобы** объяснять выбор технологий на интервью

**Acceptance Criteria:**

- [ ] Страница `/protocols`
- [ ] REST vs GraphQL vs WebSocket vs SSE vs gRPC
- [ ] Для каждого: описание, плюсы, минусы, пример из проекта
- [ ] gRPC — теория (binary, protobuf, backend-to-backend)

### US 2.4.3: Testing Pyramid

**Как** разработчик
**Я хочу** полноценную стратегию тестирования
**Чтобы** быть уверенным в качестве кода

**Acceptance Criteria:**

- [ ] **Unit**: утилиты, хуки (positivityFilter, useAuth, useWebSocket)
- [ ] **Integration**: NewsFeedContainer с MSW, AuthFlow: login → redirect
- [ ] **E2E (Playwright)**: лента → клик → детали → назад; auth flow
- [ ] **MSW**: расширить моки (SSE, WS, GraphQL)
- [ ] Dynamic Import: recharts lazy-loaded (bundle analysis)

### US 2.4.4: Storybook

**Как** разработчик
**Я хочу** живую документацию компонентов
**Чтобы** разрабатывать изолированно

**Acceptance Criteria:**

- [ ] Storybook настроен
- [ ] Stories для ключевых компонентов
- [ ] CSP-заголовки настроены
- [ ] CSRF документация

## Архитектура v2.4

```
server/src/
├── graphql/
│   ├── schema.ts              ← type definitions
│   ├── resolvers/
│   │   ├── analytics.resolver.ts
│   │   └── readingHistory.resolver.ts
│   └── index.ts               ← Apollo Server setup

client/src/
├── pages/
│   ├── Analytics/             ← НОВАЯ СТРАНИЦА
│   │   ├── Analytics.tsx
│   │   ├── TopTopics.tsx
│   │   ├── PositivityTrend.tsx
│   │   └── index.ts
│   └── Protocols/             ← НОВАЯ СТРАНИЦА
│       ├── Protocols.tsx
│       └── index.ts
├── shared/
│   └── apollo/
│       └── client.ts          ← Apollo Client setup
```

## Стек v2.4

| Компонент        | Технология             |
| ---------------- | ---------------------- |
| GraphQL (сервер) | Apollo Server          |
| GraphQL (клиент) | Apollo Client          |
| Визуализация     | recharts (lazy-loaded) |
| E2E              | Playwright             |
| Storybook        | Storybook 8+           |

## Закрываемые темы v2.4

<details>
<summary>Backend: 7 вопросов</summary>

| #   | Тема               | Как закрывается                       |
| --- | ------------------ | ------------------------------------- |
| Q53 | GraphQL            | Schema + resolvers + single endpoint  |
| Q54 | GraphQL vs REST    | Один запрос для аналитики vs 3–4 REST |
| Q55 | Меньше запросов    | Nested query за один roundtrip        |
| Q56 | Недостатки GraphQL | Сложность кэша, N+1 queries           |
| Q57 | Связанность        | Фронт зависит от схемы                |
| Q58 | Изменение схемы    | Deprecation, breaking changes         |
| Q83 | gRPC               | Теория: binary, protobuf              |

</details>

<details>
<summary>Frontend: 9 вопросов</summary>

| #    | Тема            | Как закрывается                    |
| ---- | --------------- | ---------------------------------- |
| FQ49 | Dynamic Import  | recharts lazy-loaded               |
| FQ69 | CSRF (frontend) | SameSite + CSRF-token              |
| FQ70 | CSP             | Content-Security-Policy            |
| FQ71 | Санитизация     | DOMPurify (расширение)             |
| FQ73 | Пирамида тестов | Unit → Integration → E2E           |
| FQ74 | RTL             | render, screen, userEvent, waitFor |
| FQ75 | MSW моки        | HTTP + SSE + WS + GraphQL          |
| FQ76 | Playwright E2E  | Auth flow, News flow               |
| FQ77 | Storybook       | Stories для ключевых компонентов   |

</details>

**Оценка: 3–4 дня**

---

# RELEASE v2.5 — Production

> Проект деплоится, проходит аудит доступности и производительности. Доступен по HTTPS.

## Фичи v2.5

### F2.5.1: Accessibility

**Что видит / чувствует пользователь:**

- Все интерактивные элементы доступны с клавиатуры (Tab, Enter, Escape)
- Screen reader корректно читает новости и навигацию
- Skip-to-content ссылка
- ARIA-live для live-обновлений
- Контрастность: WCAG AA

### F2.5.2: Production Deploy

**Что получает пользователь:**

- Сайт доступен по реальному URL с HTTPS
- Быстрая загрузка (Lighthouse ≥ 90)
- Автоматический деплой при push в main

### F2.5.3: Performance Audit

**Результат:**

- Core Web Vitals в зелёной зоне (LCP, FID, CLS)
- Bundle size зафиксирован, тренд вниз
- Preload критических ресурсов
- CSS-анимации на transform/opacity (без reflow)

## User Stories v2.5

### US 2.5.1: Docker

**Как** разработчик
**Я хочу** запускать весь проект одной командой

**Acceptance Criteria:**

- [ ] Dockerfile для backend (multi-stage)
- [ ] Dockerfile для frontend (build → nginx)
- [ ] docker-compose.yml — оба сервиса + SQLite volume
- [ ] `docker-compose up` — проект работает

### US 2.5.2: CI/CD

**Как** разработчик
**Я хочу** автоматические тесты и деплой при push в main

**Acceptance Criteria:**

- [ ] GitHub Actions: lint → test → build → deploy
- [ ] Deploy target: Railway / Render / VPS
- [ ] PR workflow: только lint + test
- [ ] Secrets через GitHub Secrets

### US 2.5.3: Nginx + HTTPS + DNS

**Как** пользователь
**Я хочу** заходить по нормальному домену с HTTPS

**Acceptance Criteria:**

- [ ] Nginx: `/` → frontend, `/api` → backend
- [ ] Let's Encrypt / Cloudflare → HTTPS
- [ ] DNS: A-record

### US 2.5.4: Accessibility Audit

**Как** пользователь с ограниченными возможностями
**Я хочу** пользоваться сайтом через скринридер и клавиатуру

**Acceptance Criteria:**

- [ ] Lighthouse Accessibility ≥ 90
- [ ] Все элементы доступны с клавиатуры
- [ ] ARIA-атрибуты: aria-label, aria-live
- [ ] Контрастность: WCAG AA
- [ ] Skip-to-content
- [ ] Focus management: после закрытия модалки фокус возвращается

### US 2.5.5: Performance Audit

**Как** разработчик
**Я хочу** финальный аудит производительности

**Acceptance Criteria:**

- [ ] Lighthouse Performance ≥ 90
- [ ] Preload/Prefetch критических ресурсов
- [ ] Gzip/Brotli сжатие
- [ ] Bundle analysis: финальный отчёт
- [ ] Core Web Vitals: LCP, FID, CLS — зелёная зона
- [ ] Все списки используют стабильные id (не index)

## Архитектура v2.5

```
react-happy-news/
├── .github/
│   └── workflows/
│       ├── ci.yml             ← PR: lint + test
│       └── deploy.yml         ← main: lint + test + build + deploy
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx.conf
├── docker-compose.yml
├── client/
├── server/
└── package.json
```

## Стек v2.5

| Компонент       | Технология                 |
| --------------- | -------------------------- |
| Контейнеризация | Docker + Docker Compose    |
| CI/CD           | GitHub Actions             |
| Reverse proxy   | Nginx                      |
| HTTPS           | Let's Encrypt / Cloudflare |
| Хостинг         | Railway / Render / VPS     |
| Мониторинг      | Lighthouse CI              |

## Закрываемые темы v2.5

<details>
<summary>Backend: 9 вопросов</summary>

| #   | Тема               | Как закрывается                        |
| --- | ------------------ | -------------------------------------- |
| Q24 | После ввода URL    | DNS → TCP → TLS → HTTP → Render        |
| Q69 | DNS + IP           | A-record, DNS resolution               |
| Q70 | Этапы после HTML   | Parse → CSSOM → Render Tree → Paint    |
| Q75 | TLD + DNS          | .com, .ru → root → TLD → authoritative |
| Q76 | TCP + HTTP         | SYN-ACK → TLS → HTTP                   |
| Q80 | URL → отображение  | Полный цикл (DevTools)                 |
| Q84 | После получения IP | TCP handshake → TLS                    |
| Q86 | First paint        | Bundle size, blocking resources, TTFB  |
| Q87 | Оптимизация        | Code splitting, lazy, preconnect, gzip |

</details>

<details>
<summary>Frontend: 6 вопросов</summary>

| #    | Тема                    | Как закрывается               |
| ---- | ----------------------- | ----------------------------- |
| FQ18 | Keys                    | Стабильные id во всех списках |
| FQ47 | Bundle analysis (final) | Итоговый отчёт                |
| FQ50 | Preload/Prefetch        | Критические ресурсы           |
| FQ54 | Transform анимации      | Аудит CSS-анимаций            |
| FQ79 | Accessibility           | ARIA, keyboard, screen reader |
| FQ80 | CSS Modules             | Объяснение подхода            |

</details>

**Оценка: 3–4 дня**

---

# Сводка

## Полная карта фич по релизам

| Фича                                     | Релиз | Зависит от        |
| ---------------------------------------- | ----- | ----------------- |
| **Выбор источников (API Source Filter)** | v2.0  | —                 |
| **Source Badges**                        | v2.0  | —                 |
| **Детальная страница (бэкенд)**          | v2.0  | —                 |
| **Форма обратной связи**                 | v2.0  | —                 |
| **Swagger-документация**                 | v2.0  | —                 |
| **Живая лента (SSE)**                    | v2.1  | v2.0              |
| **Health-индикатор**                     | v2.1  | v2.0              |
| **Расширенный поиск + сортировка**       | v2.1  | v2.0              |
| **Виртуализация ленты**                  | v2.1  | —                 |
| **Счётчик читателей (WS)**               | v2.2  | v2.0              |
| **"Сейчас на сайте" (WS)**               | v2.2  | v2.2/WS           |
| **Поделиться новостью**                  | v2.2  | —                 |
| **Регистрация / Логин**                  | v2.3  | v2.0              |
| **Закладки**                             | v2.3  | v2.3/Auth         |
| **Positivity Tracker + Streak**          | v2.3  | v2.3/Auth         |
| **Тёмная / светлая тема**                | v2.3  | —                 |
| **Protected Routes**                     | v2.3  | v2.3/Auth         |
| **Дашборд позитивности (GraphQL)**       | v2.4  | v2.3/Auth         |
| **Protocol Comparison**                  | v2.4  | v2.2/WS, v2.1/SSE |
| **Storybook**                            | v2.4  | —                 |
| **Accessibility**                        | v2.5  | —                 |
| **Docker + CI/CD**                       | v2.5  | —                 |
| **HTTPS + DNS + Nginx**                  | v2.5  | —                 |

## Инвентарь вопросов

### Backend (90 вопросов, Q1–Q90)

| Блок | Диапазон | Темы                                               |
| ---- | -------- | -------------------------------------------------- |
| 1    | Q1–Q10   | HTTPS, Auth, CORS, Cookie, OPTIONS, Real-time      |
| 2    | Q11–Q20  | GET/POST, REST, OSI, HTTP-структура                |
| 3    | Q21–Q30  | Коды ошибок, Promise.all, JWT, токены              |
| 4    | Q31–Q40  | HTTP-статусы, Swagger, CORS, Same-origin, блокчейн |
| 5    | Q41–Q50  | WebSocket vs REST, HTTP-методы, пароли             |
| 6    | Q51–Q60  | Passwordless, GraphQL, real-time                   |
| 7    | Q61–Q70  | Polling, retry, AbortController, DNS               |
| 8    | Q71–Q80  | WS vs HTTP, Cookie lifetime, REST, URL→Page        |
| 9    | Q81–Q90  | Storage, gRPC, Server internals, Performance       |

### Frontend (80 вопросов, FQ1–FQ80)

| Блок | Диапазон  | Темы                                              |
| ---- | --------- | ------------------------------------------------- |
| B1   | FQ1–FQ13  | Архитектура, паттерны (SOLID, FSD, HOC, Compound) |
| B2   | FQ14–FQ23 | React Core (VDOM, рендер, JSX, keys, batching)    |
| B3   | FQ24–FQ33 | Хуки (useEffect, custom, useReducer, useRef)      |
| B4   | FQ34–FQ40 | State management (Context, Redux, RTK Query)      |
| B5   | FQ41–FQ54 | Производительность (memo, virtualization, CRP)    |
| B6   | FQ55–FQ58 | Обработка ошибок (Boundaries, Suspense, race)     |
| B7   | FQ59–FQ64 | Роутинг (protected, lazy, nested, error)          |
| B8   | FQ65–FQ67 | Формы и валидация (RHF + Zod)                     |
| B9   | FQ68–FQ72 | Безопасность (XSS, CSRF, CSP, .env)               |
| B10  | FQ73–FQ77 | Тестирование (pyramid, RTL, MSW, Playwright)      |
| B11  | FQ78–FQ80 | HTML, CSS, Accessibility                          |

### Покрытие по релизам

| Релиз     | Backend (Q) | Frontend (FQ) | Всего   | Нарастающий % |
| --------- | ----------- | ------------- | ------- | ------------- |
| **v2.0**  | 34          | 16            | 50      | 29.4%         |
| **v2.1**  | 12          | 15            | 27      | 45.3%         |
| **v2.2**  | 8           | 14            | 22      | 58.2%         |
| **v2.3**  | 19          | 21            | 40      | 81.8%         |
| **v2.4**  | 7           | 9             | 16      | 91.2%         |
| **v2.5**  | 9           | 6             | 15      | 100%          |
| —         | 1 (Q40)     | —             | 1       | —             |
| **ИТОГО** | **90**      | **80**        | **170** |               |

**Покрытие на практике: 169/170 = 99.4%** (Q40 — блокчейн — не реализуется)

## Итоговый таймлайн

| Релиз     | Фичи                                     | Срок       | Q   | FQ  | %     |
| --------- | ---------------------------------------- | ---------- | --- | --- | ----- |
| **v2.0**  | Source Filter, Badges, Detail, Feedback  | 4–5 дн.    | 34  | 16  | 29.4% |
| **v2.1**  | Live лента, Health, Поиск, Виртуализация | 3–4 дн.    | 12  | 15  | 45.3% |
| **v2.2**  | Live Readers, Online, Share              | 3–4 дн.    | 8   | 14  | 58.2% |
| **v2.3**  | Auth, Закладки, Tracker, Streak, Тема    | 4–5 дн.    | 19  | 21  | 81.8% |
| **v2.4**  | Analytics, Protocols, Storybook          | 3–4 дн.    | 7   | 9   | 91.2% |
| **v2.5**  | A11y, Docker, CI/CD, HTTPS               | 3–4 дн.    | 9   | 6   | 100%  |
| **ИТОГО** |                                          | **~20–26** | 89  | 80  | 99.4% |

## Порядок может меняться

Релизы v2.0 и v2.5 — обязательные (фундамент и финал).

Релизы v2.1–v2.4 можно перемещать:

- Хочешь live-фичи → начни с v2.1 (SSE)
- Хочешь персонализацию → начни с v2.3 (Auth)
- Хочешь закрыть React-паттерны → начни с v2.2 (WS)

Рекомендуемый порядок: **v2.0 → v2.1 → v2.2 → v2.3 → v2.4 → v2.5**
