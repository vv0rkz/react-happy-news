# React Happy News — Текущий инкремент v2.0

**Статус:** `v1.5.0 → v2.0`
**Ветка:** `Release/2.0.0-backend-rest-api`
**Полный roadmap:** [react-happy-news-ROADMAP.md](./ROADMAP.md)
**Покрытие:** 34 вопроса из 90 (37.8%)
**Оценка времени:** 3-4 дня

---

## Зачем

Сейчас React-приложение ходит напрямую в Guardian API: один источник новостей, API-ключ лежит в клиентском коде, фильтрация тратит трафик пользователя, кэша нет. Backend-прослойка на Express устраняет все эти проблемы и открывает дверь для real-time фич в следующих релизах.

---

## Задачи

### US 2.0.1: Агрегация новостей с нескольких источников

- [ ] Backend агрегирует новости из Guardian API, NewsAPI, HackerNews
- [ ] Запросы к внешним API идут параллельно (Promise.allSettled)
- [ ] Если одна из API недоступна — остальные всё равно работают
- [ ] Фильтрация позитивных новостей на сервере
- [ ] Кэш: повторный запрос за те же данные не долбит внешние API

### US 2.0.2: RESTful API с правильными HTTP-методами и статусами

- [ ] `GET /api/news` — список новостей (query: source, page, limit)
- [ ] `GET /api/news/:id` — детали новости
- [ ] `POST /api/feedback` — отправка обратной связи (body: JSON)
- [ ] `GET /api/health` — статус сервера
- [ ] Правильные HTTP-статусы: 200, 201, 400, 404, 422, 500
- [ ] Валидация query-параметров → 400 при невалидных
- [ ] Серверная ошибка → 500 с сообщением (без stack trace в проде)

### US 2.0.3: CORS между фронтом и бэкендом

- [ ] Backend настраивает CORS-заголовки (Access-Control-Allow-Origin)
- [ ] Preflight-запрос (OPTIONS) виден в DevTools → Network
- [ ] Без CORS-конфига фронт получает ошибку → починить → увидеть разницу
- [ ] В проде CORS ограничен конкретным доменом (не \*)

### US 2.0.4: Swagger-документация API

- [ ] Swagger UI доступен по `/api/docs`
- [ ] Все endpoints описаны с примерами запросов и ответов
- [ ] OpenAPI spec генерируется из JSDoc-комментариев (swagger-jsdoc)
- [ ] Типы на фронте можно генерировать из OpenAPI (openapi-typescript)

### US 2.0.5: HTTPS и безопасность

- [ ] Локально: понимание разницы HTTP vs HTTPS через DevTools
- [ ] В проде: HTTPS через Let's Encrypt / Cloudflare
- [ ] API-ключи хранятся только на сервере (.env), не попадают в клиент

---

## Архитектура монорепо

```
react-happy-news/
├── client/                    ← текущий React-проект (переносим сюда)
│   ├── src/
│   │   ├── app/
│   │   ├── entities/news/
│   │   ├── features/
│   │   ├── pages/
│   │   └── shared/
│   ├── vite.config.js
│   └── package.json
│
├── server/                    ← НОВЫЙ Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── news.routes.ts
│   │   │   ├── feedback.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── services/
│   │   │   ├── newsAggregator.ts     ← агрегация из нескольких API
│   │   │   ├── guardianApi.ts
│   │   │   ├── newsApi.ts
│   │   │   └── hackerNewsApi.ts
│   │   ├── middleware/
│   │   │   ├── cors.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── utils/
│   │   │   └── positivityFilter.ts   ← перенос фильтра на сервер
│   │   ├── swagger/
│   │   │   └── openapi.yaml
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
└── package.json               ← workspace root (npm workspaces)
```

---

## Стек v2.0

| Компонент    | Технология                         |
| ------------ | ---------------------------------- |
| Runtime      | Node.js 20+                        |
| Framework    | Express                            |
| Язык         | TypeScript                         |
| HTTP-клиент  | node-fetch / undici                |
| Кэш          | node-cache (in-memory)             |
| Документация | swagger-jsdoc + swagger-ui-express |
| Валидация    | Zod (уже используется на фронте)   |
| Логирование  | Morgan                             |
| Env          | dotenv                             |

---

## Покрытие вопросов (34 шт.)

| #   | Вопрос                         | Как закрывается                                  |
| --- | ------------------------------ | ------------------------------------------------ |
| Q1  | HTTPS                          | HTTPS на сервере, TLS, сертификат                |
| Q4  | 400 vs 500                     | Валидация → 400, crash → 500                     |
| Q5  | CORS                           | cors middleware между портами                    |
| Q9  | OPTIONS                        | Preflight виден в DevTools                       |
| Q11 | GET vs POST                    | GET /news, POST /feedback                        |
| Q12 | HTTP vs HTTPS                  | Сравнение в DevTools                             |
| Q13 | Шифрование                     | Header + Body шифруются, Target частично         |
| Q15 | REST аббревиатура              | Representational State Transfer                  |
| Q16 | REST правила                   | Stateless, uniform interface, и т.д.             |
| Q17 | Code on Demand                 | Теория: сервер может отдать JS                   |
| Q18 | Протокол REST                  | HTTP/HTTPS                                       |
| Q19 | OSI уровень HTTP               | Application (L7)                                 |
| Q20 | Структура HTTP-запроса         | Request line + Headers + Body                    |
| Q21 | Коды ошибок                    | 200, 201, 400, 404, 422, 500                     |
| Q22 | Параллельные запросы           | Promise.allSettled для 3 API                     |
| Q23 | Способы взаимодействия с бэком | RTK Query, fetch, axios                          |
| Q33 | Где хранится документация      | Swagger UI на /api/docs                          |
| Q34 | Инструменты документирования   | swagger-jsdoc, Swagger UI                        |
| Q35 | Postman                        | Тестирование API через Postman                   |
| Q36 | Изменение API-контрактов       | OpenAPI spec + версионирование                   |
| Q37 | Same-origin policy             | Разные порты = разные origin                     |
| Q38 | Части origin                   | protocol + host + port                           |
| Q39 | Обход CORS                     | CORS-заголовки, proxy                            |
| Q45 | Почему не auth через GET       | Данные в URL → логи, referrer                    |
| Q46 | Query vs body                  | Фильтры в query, данные в body                   |
| Q47 | Query при HTTPS                | Зашифрованы, но в логах сервера                  |
| Q48 | HTTP-методы                    | GET, POST, PUT, PATCH, DELETE                    |
| Q49 | Body в HTTP-методах            | GET обычно без body                              |
| Q72 | Зачем ограничение cross-origin | Безопасность: защита от чужих скриптов           |
| Q73 | HTTP-протокол                  | Request-response, методы                         |
| Q78 | Принципы REST                  | Stateless, cacheable, uniform interface          |
| Q79 | Frontend ↔ REST                | RTK Query → Express                              |
| Q85 | Что на сервере при запросе     | Middleware chain: logger → cors → auth → handler |
| Q88 | Проектирование API-контракта   | OpenAPI spec → codegen                           |

---

## Следующий релиз

**v2.1 — SSE + Polling** (12 вопросов, нарастающий: 51.1%)
