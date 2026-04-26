# React Happy News — Релиз v2.0 — Multi-Source News

**Статус:** `in progress` (US 2.0.1 ✅, US 2.0.3 ✅ → US 2.0.5 active)
**Ветка:** `v2.0.0-backend-and-many-news-api-filter`
**Полный roadmap:** [ROADMAP.md](./ROADMAP.md)
**Покрытие:** 50 вопросов из 170 (29.4%)
**Оценка времени:** 4–5 дней

---

## Зачем

Backend уже агрегирует новости из 3 источников — но пользователь этого не видит и не контролирует. В v2.0 добавляем управление источниками, source badges, детальную страницу через реальный бэкенд, форму обратной связи и Swagger-документацию.

---

## User Stories

### US 2.0.1: Агрегация новостей с нескольких источников — ✅ DONE

- [x] Backend агрегирует Guardian API, NewsAPI, HackerNews
- [x] Запросы параллельно (Promise.allSettled)
- [x] Если одна API недоступна — остальные работают
- [x] Фильтрация позитивных новостей на сервере
- [x] Кэш: повторный запрос не долбит внешние API

### US 2.0.2: Выбор источников (фронтенд + бэкенд) — 🔄 ACTIVE

- [ ] Тогглы для каждого источника в UI (Guardian, NewsAPI, HackerNews)
- [ ] По умолчанию все включены
- [ ] При отключении источника — его новости исчезают
- [ ] Выбор сохраняется в localStorage
- [ ] `GET /api/news?sources=guardian,newsapi` — бэкенд фильтрует
- [ ] Source badge на каждой карточке

### US 2.0.3: RESTful API — ✅ DONE

- [x] `GET /api/news` — список (query: sources)
- [x] `GET /api/news/:id` — детали новости, 404 если не найдена
- [x] `POST /api/feedback` — обратная связь (body: JSON), 201
- [x] `GET /api/health` — статус сервера ✅
- [x] HTTP-статусы: 200, 201, 400, 404, 500
- [x] Валидация query-параметров через Zod
- [x] Global error handler → 500 без stack trace в проде
- [x] FeedbackForm на клиенте (footer)
- [x] MSW handler для POST /api/feedback

### US 2.0.4: CORS — ⚠️ Базово DONE

- [x] CORS-заголовки настроены (localhost:5173)
- [ ] Preflight (OPTIONS) виден в DevTools
- [ ] В проде — CORS ограничен конкретным доменом

### US 2.0.5: Swagger-документация + OpenAPI codegen

- [ ] Swagger UI на `/api/docs`
- [ ] Все endpoints описаны с примерами
- [ ] OpenAPI spec из JSDoc-комментариев (swagger-jsdoc)
- [ ] `openapi-typescript` генерирует типы клиента из spec → убираем ручные типы (`NewsDetailsData` и др.)
- [ ] Закрывает Q88: "OpenAPI spec → codegen" на практике

### US 2.0.6: HTTPS и безопасность

- [ ] Понимание HTTP vs HTTPS через DevTools
- [x] API-ключи только на сервере (.env)
- [ ] В проде: HTTPS (финализация в v2.5)

### US 2.0.7: Архитектурный рефакторинг

- [ ] Container/Presentational: `NewsFeedContainer` (логика) + `NewsFeedView` (рендеринг)
- [ ] FSD Public API: каждый слой экспортирует через `index.ts`
- [ ] Error Boundaries вокруг NewsFeed и NewsDetail
- [ ] Семантические теги: `<article>`, `<main>`, `<nav>`

---

## Архитектура v2.0

```
server/src/
├── routes/
│   ├── news.routes.ts        ✅ (+ query: sources, GET /:id)
│   ├── feedback.routes.ts    ← НОВЫЙ
│   └── health.routes.ts
├── services/
│   ├── newsAggregator.ts     ✅ (+ фильтрация по sources)
│   ├── guardianApi.ts        ✅
│   ├── newsApi.ts            ✅
│   └── hackerNewsApi.ts      ✅
├── middleware/
│   ├── errorHandler.ts       ← НОВЫЙ
│   └── validateQuery.ts      ← НОВЫЙ (Zod-валидация)
├── swagger/
│   └── openapi.yaml          ← НОВЫЙ
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
│   │   ├── SourceBadge.tsx
│   │   └── index.ts
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

---

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

---

## Покрытие вопросов (50 шт.)

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

---

## Следующий релиз

**v2.1 — Positivity Stream** (27 вопросов, нарастающий: 45.3%)
