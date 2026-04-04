# React Happy News — Roadmap v2.x

## Текущее состояние (v1.5.0)

| Что есть | Детали |
|---|---|
| **Стек** | React + Vite + TypeScript |
| **State** | RTK Query |
| **Архитектура** | FSD (Feature-Sliced Design) |
| **API** | Guardian API (напрямую с клиента) |
| **Моки** | MSW (browser) |
| **Валидация** | Zod schemas |
| **Страницы** | Главная (лента) + Детальная новость |
| **Фичи** | Keyword-фильтр позитивных новостей, пагинация, skeleton, error handling |
| **Тесты** | Unit (vitest) |
| **CI/CD** | Нет |
| **Backend** | Нет |

---

## Концепция развития

**Проблема сейчас:** фронт напрямую ходит в Guardian API → фильтрация по ключевым словам на клиенте → один источник → нет real-time → нет бэкенда.

**Куда растём:**

```
[Guardian API] ──┐
[NewsAPI]        ├──→  Node.js Backend  ──→  React Frontend
[HackerNews API]─┘     (агрегатор)          (v1.5 → v2.x)
                        │
                        ├─ REST API (основные данные)
                        ├─ SSE (live-обновления)
                        ├─ WebSocket (онлайн-читатели)
                        ├─ GraphQL (аналитика)
                        ├─ JWT Auth (персональный трекер)
                        └─ Swagger (документация)
```

**Killer Feature — "Positivity Stream":** не просто фильтр новостей, а живой трекер позитивности. Бэкенд каждые N минут агрегирует новости из нескольких API, фильтрует, и пушит свежие позитивные статьи подписанным клиентам. Счётчик "сегодня X% новостей — позитивные" обновляется в реальном времени.

---

## Инвентарь вопросов (90 шт.)

Каждому вопросу присвоен номер. Этот номер используется дальше в маппинге к релизам.

### Блок 1

| # | Вопрос |
|---|---|
| Q1 | Что такое протокол HTTPS? |
| Q2 | Назовите три метода аутентификации пользователя |
| Q3 | Что такое авторизация? |
| Q4 | Чем по смыслу отличаются 400 и 500 ошибки HTTP? |
| Q5 | Что такое CORS? |
| Q6 | Отличия куки от session storage? |
| Q7 | При каких механизмах авторизации существует опасность CSRF атаки? |
| Q8 | Где хранятся сессии и cookie? |
| Q9 | Зачем используется запрос с методом OPTIONS? |
| Q10 | Как получать информацию в реальном времени? |

### Блок 2

| # | Вопрос |
|---|---|
| Q11 | Чем отличаются GET и POST-запросы? |
| Q12 | Чем HTTP отличается от HTTPS? |
| Q13 | При разборе запроса на Target, Body и Header — что шифруется? |
| Q14 | С помощью какой библиотеки можно работать с web sockets? |
| Q15 | Что означает аббревиатура REST? |
| Q16 | Какие правила включает REST-архитектурный стиль? |
| Q17 | Что такое Code on Demand в REST? |
| Q18 | По какому протоколу работает REST? |
| Q19 | На каком уровне модели OSI находится HTTP? |
| Q20 | Из каких структурных частей состоит HTTP-запрос? |

### Блок 3

| # | Вопрос |
|---|---|
| Q21 | Что такое коды ошибок и зачем они нужны? |
| Q22 | Два параллельных запроса: как объединить результаты без Promise.all? |
| Q23 | Какими способами можно взаимодействовать с backend (axios, fetch и т.д.)? |
| Q24 | Какие этапы происходят после ввода URL в браузере? |
| Q25 | Что такое Cookie и для чего они используются? |
| Q26 | Что такое JWT-авторизация и как она работает? |
| Q27 | Какие токены используются в JWT-авторизации? |
| Q28 | В чём разница между access token и refresh token? |
| Q29 | Где рекомендуется хранить access token и refresh token и почему? |
| Q30 | Почему refresh token часто хранят в httpOnly cookies? |

### Блок 4

| # | Вопрос |
|---|---|
| Q31 | Какой HTTP-статус код возвращается при невалидном access token? |
| Q32 | В какой момент access token добавляется в HTTP-запросы? |
| Q33 | Где обычно хранится документация по REST API? |
| Q34 | Какие инструменты используются для документирования API? |
| Q35 | Для чего используется Postman? |
| Q36 | Как решаются проблемы при изменении API-контрактов? |
| Q37 | Что такое same origin policy? |
| Q38 | Из каких частей состоит origin? |
| Q39 | Как на практике обходят CORS-ограничения? |
| Q40 | Как устроен блокчейн и зачем он нужен? |

### Блок 5

| # | Вопрос |
|---|---|
| Q41 | В чем отличие WebSocket от REST? |
| Q42 | Проблемы при полном переходе с REST на WebSocket? |
| Q43 | Какие риски у постоянного WebSocket-соединения? |
| Q44 | Почему нестабильное соединение критично для WebSocket? |
| Q45 | Почему авторизацию нельзя делать через GET-запрос? |
| Q46 | Разница передачи данных через query-параметры и body? |
| Q47 | Насколько безопасны query-параметры при HTTPS? |
| Q48 | Какие HTTP-методы ты знаешь и чем они отличаются? |
| Q49 | Есть ли ограничения на использование body в HTTP-методах? |
| Q50 | Как правильно хранить пароли пользователей? |

### Блок 6

| # | Вопрос |
|---|---|
| Q51 | Альтернативы классической парольной авторизации? |
| Q52 | Какие риски у passwordless-авторизации (email / SMS)? |
| Q53 | Что такое GraphQL и зачем он нужен? |
| Q54 | Преимущества GraphQL по сравнению с REST? |
| Q55 | Как GraphQL уменьшает количество запросов? |
| Q56 | Потенциальные недостатки GraphQL? |
| Q57 | Почему GraphQL увеличивает связанность фронта и бэка? |
| Q58 | Риски при изменении схемы данных в GraphQL? |
| Q59 | Как отобразить изменения в БД без перезагрузки страницы? |
| Q60 | В каких случаях стоит использовать WebSocket? |

### Блок 7

| # | Вопрос |
|---|---|
| Q61 | Что такое polling и periodic polling? |
| Q62 | Когда polling предпочтительнее WebSocket? |
| Q63 | Какие проблемы могут возникнуть при polling? |
| Q64 | Как обрабатывать падение сервера при polling? |
| Q65 | Как избежать постоянного показа ошибок при недоступном API? |
| Q66 | Как реализовать retry-логику при ошибках запроса? |
| Q67 | Почему важно учитывать время ответа сервера при polling? |
| Q68 | Как отменить запрос, если предыдущий ещё не завершился? |
| Q69 | Как браузер определяет IP-адрес сайта? Роль DNS? |
| Q70 | Какие этапы проходит браузер после получения HTML? |

### Блок 8

| # | Вопрос |
|---|---|
| Q71 | Чем WebSocket отличается от HTTP-запросов? |
| Q72 | Почему браузер ограничивает доступ к ресурсам других доменов? |
| Q73 | Что такое протокол HTTP и какие запросы можно отправить? |
| Q74 | Как реализуется механизм автоматического обновления токенов? |
| Q75 | Что такое домены верхнего уровня? Роль в DNS-резолвинге? |
| Q76 | Как устанавливается TCP-соединение? Где используется HTTP/HTTPS? |
| Q77 | Как задается время жизни cookie и где оно устанавливается? |
| Q78 | Какие основные принципы REST API? |
| Q79 | Как frontend взаимодействует с REST-backend? |
| Q80 | Что происходит в браузере с момента ввода URL до отображения? |

### Блок 9

| # | Вопрос |
|---|---|
| Q81 | Чем отличаются LocalStorage, IndexedDB, cookies и sessionStorage? |
| Q82 | Способы взаимодействия клиента и сервера кроме REST? |
| Q83 | Что такое gRPC и для каких задач применяется? |
| Q84 | Что происходит после получения IP-адреса? |
| Q85 | Что происходит на сервере, когда HTTP-запрос поступает? |
| Q86 | Что влияет на первую отрисовку страницы? |
| Q87 | Подходы для оптимизации первой отрисовки? |
| Q88 | Как проектируют и согласовывают API-контракт? |
| Q89 | Как устроен reconnect WebSocket после разрыва? |
| Q90 | Чем WebSocket отличается от SSE и long polling? |

---

## Сводка покрытия по релизам

| Релиз | Фокус | Вопросов | % от общего | Нарастающий % |
|---|---|---|---|---|
| **v2.0** | Backend + REST API + Swagger | 34 | 37.8% | 37.8% |
| **v2.1** | SSE + Polling + Health Check | 12 | 13.3% | 51.1% |
| **v2.2** | WebSocket | 8 | 8.9% | 60.0% |
| **v2.3** | Auth (JWT) + Storage | 19 | 21.1% | 81.1% |
| **v2.4** | GraphQL + gRPC (теория) | 7 | 7.8% | 88.9% |
| **v2.5** | Deploy + CI/CD + Performance | 9 | 10.0% | 98.9% |
| — | Теория (блокчейн) | 1 | 1.1% | 100% |
| **ИТОГО** | | **90** | **100%** | |

**Покрытие на практике: 89/90 = 98.9%**

Единственный вопрос, который не реализуется в проекте: Q40 (блокчейн) — чисто теоретический, к сетям отношения не имеет.

---

# RELEASE v2.0 — Node.js Backend + REST API

## Покрытие: 34 вопроса (37.8%)

```
Q1, Q4, Q5, Q9, Q11, Q12, Q13, Q15, Q16, Q17, Q18, Q19, Q20,
Q21, Q22, Q23, Q33, Q34, Q35, Q36, Q37, Q38, Q39, Q45, Q46,
Q47, Q48, Q49, Q72, Q73, Q78, Q79, Q85, Q88
```

## Зачем

Сейчас React-приложение ходит напрямую в Guardian API. Это:
- Один источник новостей
- API-ключ лежит в клиентском коде (небезопасно)
- Фильтрация на клиенте (тратит трафик пользователя)
- Нет кэширования (каждый запрос = запрос к Guardian)

Backend-прослойка решает все эти проблемы + открывает дверь для real-time фич.

## User Stories

### US 2.0.1: Агрегация новостей с нескольких источников

**Как** читатель
**Я хочу** видеть позитивные новости из разных источников (не только Guardian)
**Чтобы** получать более полную картину хороших событий

**Acceptance Criteria:**
- [ ] Backend агрегирует новости из Guardian API, NewsAPI, HackerNews
- [ ] Запросы к внешним API идут параллельно (Promise.allSettled)
- [ ] Если одна из API недоступна — остальные всё равно работают
- [ ] Фильтрация позитивных новостей на сервере
- [ ] Кэш: повторный запрос за те же данные не долбит внешние API

**Вопросы, которые закрываются на практике:**
- Q22 — параллельные запросы, объединение результатов (Promise.allSettled вместо Promise.all)
- Q23 — fetch на бэкенде, RTK Query на фронте, можно попробовать axios
- Q85 — видишь весь путь запроса через Express middleware chain

### US 2.0.2: RESTful API с правильными HTTP-методами и статусами

**Как** фронтенд-разработчик
**Я хочу** работать с предсказуемым REST API
**Чтобы** понимать, что значит каждый endpoint, метод и статус

**Acceptance Criteria:**
- [ ] `GET /api/news` — список новостей (query: source, page, limit)
- [ ] `GET /api/news/:id` — детали новости
- [ ] `POST /api/feedback` — отправка обратной связи (body: JSON)
- [ ] `GET /api/health` — статус сервера
- [ ] Правильные HTTP-статусы: 200, 201, 400, 404, 422, 500
- [ ] Валидация query-параметров → 400 при невалидных
- [ ] Серверная ошибка → 500 с сообщением (без stack trace в проде)

**Вопросы, которые закрываются на практике:**
- Q4 — 400 (клиент прислал невалидные данные) vs 500 (сервер упал)
- Q11 — GET для получения данных, POST для отправки feedback
- Q15, Q16, Q18, Q78 — REST-принципы реализованы в API
- Q17 — Code on Demand: теоретически объясняешь, что сервер мог бы отдать JS
- Q20, Q73 — структура запроса видна в DevTools
- Q45 — feedback через POST, а не GET (данные в body, а не в URL)
- Q46 — фильтры через query (?source=guardian), feedback через body
- Q47 — query-параметры зашифрованы при HTTPS (но видны в логах сервера)
- Q48, Q49 — GET, POST, PUT, DELETE + ограничения body в GET
- Q79 — RTK Query на фронте ↔ Express на бэке

### US 2.0.3: CORS между фронтом и бэкендом

**Как** разработчик
**Я хочу** правильно настроить CORS
**Чтобы** фронт (localhost:5173) мог обращаться к бэку (localhost:3001)

**Acceptance Criteria:**
- [ ] Backend настраивает CORS-заголовки (Access-Control-Allow-Origin)
- [ ] Preflight-запрос (OPTIONS) виден в DevTools → Network
- [ ] Без CORS-конфига фронт получает ошибку → починить → увидеть разницу
- [ ] В проде CORS ограничен конкретным доменом (не *)

**Вопросы, которые закрываются на практике:**
- Q5 — CORS настроен и объяснён
- Q9 — OPTIONS preflight видно в DevTools
- Q37 — same-origin policy: фронт и бэк на разных портах = разные origin
- Q38 — origin = protocol + host + port
- Q39 — CORS-заголовки, прокси-сервер
- Q72 — зачем браузер ограничивает cross-origin

### US 2.0.4: Swagger-документация API

**Как** разработчик
**Я хочу** иметь интерактивную документацию API
**Чтобы** тестировать endpoints без Postman и видеть контракт

**Acceptance Criteria:**
- [ ] Swagger UI доступен по `/api/docs`
- [ ] Все endpoints описаны с примерами запросов и ответов
- [ ] OpenAPI spec генерируется из JSDoc-комментариев (swagger-jsdoc)
- [ ] Типы на фронте можно генерировать из OpenAPI (openapi-typescript)

**Вопросы, которые закрываются на практике:**
- Q33 — документация по API: Swagger UI
- Q34 — инструменты: swagger-jsdoc, Swagger UI, Redoc
- Q35 — Postman используется для тестирования API
- Q36 — API-контракт фиксируется в OpenAPI, версионирование
- Q88 — contract-first подход: сначала spec, потом код

### US 2.0.5: HTTPS и безопасность

**Как** пользователь
**Я хочу** чтобы мои данные передавались безопасно
**Чтобы** никто не мог перехватить трафик

**Acceptance Criteria:**
- [ ] Локально: понимание разницы HTTP vs HTTPS через DevTools
- [ ] В проде: HTTPS через Let's Encrypt / Cloudflare
- [ ] API-ключи хранятся только на сервере (.env), не попадают в клиент

**Вопросы, которые закрываются на практике:**
- Q1 — HTTPS: TLS-шифрование, сертификат
- Q12 — HTTP vs HTTPS: шифрование
- Q13 — при HTTPS шифруются Header + Body (Target виден частично в SNI)
- Q19 — HTTP на уровне Application (L7) модели OSI
- Q76 — TCP handshake → TLS handshake → HTTP request

## Архитектура v2.0

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

## Стек v2.0

| Компонент | Технология |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express |
| Язык | TypeScript |
| HTTP-клиент | node-fetch / undici |
| Кэш | node-cache (in-memory) |
| Документация | swagger-jsdoc + swagger-ui-express |
| Валидация | Zod (уже используется на фронте) |
| Логирование | Morgan |
| Env | dotenv |

## Оценка времени: 3-4 дня

---

# RELEASE v2.1 — Real-time: SSE + Polling

## Покрытие: 12 вопросов (13.3%) → нарастающий: 46 из 90 (51.1%)

```
Q10, Q59, Q61, Q62, Q63, Q64, Q65, Q66, Q67, Q68, Q82, Q90
```

## Зачем

"Positivity Stream" — ключевая фича, которая превращает статичный сайт в живой продукт. Бэкенд периодически подтягивает свежие новости и пушит обновления подписанным клиентам.

Также: индикатор здоровья API — если бэкенд лёг, пользователь видит это, а не бесконечный спиннер.

## User Stories

### US 2.1.1: Live-обновления новостей через SSE

**Как** читатель
**Я хочу** видеть новые позитивные новости без перезагрузки страницы
**Чтобы** быть в курсе в реальном времени

**Acceptance Criteria:**
- [ ] Backend: cron-задача каждые 5 минут фетчит свежие новости
- [ ] Backend: SSE endpoint `GET /api/news/stream` отправляет новые статьи
- [ ] Frontend: EventSource подписывается на поток
- [ ] UI: новая новость плавно появляется вверху ленты с анимацией
- [ ] Индикатор: "Live ●" когда SSE-соединение активно
- [ ] При закрытии вкладки — EventSource корректно закрывается

**Вопросы, которые закрываются на практике:**
- Q10 — получение информации в реальном времени (SSE)
- Q59 — изменения отображаются без перезагрузки
- Q82 — SSE как альтернатива REST для real-time
- Q90 — на практике реализуешь SSE, объясняешь отличия от WS и long polling

### US 2.1.2: Polling для health-check + retry-логика

**Как** пользователь
**Я хочу** видеть, работает ли сервер, и не видеть бесконечные ошибки
**Чтобы** понимать, когда проблема временная

**Acceptance Criteria:**
- [ ] Frontend: polling `GET /api/health` каждые 30 секунд
- [ ] Индикатор в UI: зелёный/красный статус сервера
- [ ] При ошибке: retry с exponential backoff (1с → 2с → 4с → 8с → max 30с)
- [ ] При N ошибках подряд: переход в "offline mode" (показ кэшированных данных)
- [ ] При восстановлении: автоматический refetch свежих данных
- [ ] AbortController: при переходе между страницами — отмена текущего polling-запроса
- [ ] Если предыдущий polling-запрос не завершился — не отправлять новый

**Вопросы, которые закрываются на практике:**
- Q61 — polling реализован (periodic health check)
- Q62 — polling лучше WS для health check: не нужно постоянное соединение ради одного запроса
- Q63 — проблемы polling: нагрузка, задержка, дублирование запросов
- Q64 — обработка падения сервера: backoff + offline mode
- Q65 — вместо ошибок показываем "сервер недоступен, показываем кэш"
- Q66 — retry с exponential backoff
- Q67 — если ответ идёт дольше интервала → не отправлять следующий запрос
- Q68 — AbortController для отмены запросов

## Архитектура v2.1

```
server/src/
├── services/
│   └── newsCron.ts            ← cron-задача: fetch → filter → push
├── routes/
│   ├── newsStream.routes.ts   ← SSE endpoint
│   └── health.routes.ts       ← health check (уже есть)
└── utils/
    └── sseManager.ts          ← управление SSE-подключениями

client/src/
├── features/
│   ├── live-news/
│   │   ├── useLiveNews.ts     ← хук: подписка на SSE
│   │   ├── LiveIndicator.tsx  ← компонент "● Live"
│   │   └── index.ts
│   └── health-check/
│       ├── useHealthCheck.ts  ← хук: polling + retry + backoff
│       ├── StatusBadge.tsx    ← зелёный/красный индикатор
│       └── index.ts
└── shared/
    └── useAbortablePolling.ts ← generic polling хук с AbortController
```

## Стек v2.1

| Компонент | Технология |
|---|---|
| SSE (сервер) | Нативный Node.js (res.write + text/event-stream) |
| SSE (клиент) | EventSource API (браузер) |
| Cron | node-cron |
| AbortController | Нативный Web API |

## Оценка времени: 2-3 дня

---

# RELEASE v2.2 — WebSocket: Live Readers

## Покрытие: 8 вопросов (8.9%) → нарастающий: 54 из 90 (60.0%)

```
Q14, Q41, Q42, Q43, Q44, Q60, Q71, Q89
```

## Зачем

Обоснование WebSocket в этом проекте: **"Ты не один"**. Когда читаешь статью — видишь, сколько ещё людей её сейчас читают. Это создаёт ощущение комьюнити вокруг позитивных новостей.

SSE здесь не подходит: нужна двусторонняя связь (клиент сообщает, какую статью открыл/закрыл).

## User Stories

### US 2.2.1: Счётчик онлайн-читателей

**Как** читатель
**Я хочу** видеть, сколько людей сейчас читают ту же статью
**Чтобы** чувствовать, что позитивные новости важны не только мне

**Acceptance Criteria:**
- [ ] WebSocket-сервер отслеживает, кто какую статью читает
- [ ] При открытии статьи: клиент отправляет `{ type: "join", articleId }`
- [ ] При закрытии: `{ type: "leave", articleId }`
- [ ] Все подписчики статьи получают обновлённый счётчик: `{ readers: 5 }`
- [ ] Общий счётчик "сейчас на сайте: N человек" в хедере
- [ ] Reconnect при разрыве соединения (exponential backoff)
- [ ] Максимум 3 попытки reconnect → затем fallback на polling

**Вопросы, которые закрываются на практике:**
- Q14 — библиотека: ws (lightweight) или Socket.io (с reconnect из коробки)
- Q41 — WebSocket vs REST: REST для данных, WS для live-счётчика
- Q42 — если всё перевести на WS: нет кэширования, нет HTTP-статусов, сложнее дебажить
- Q43 — риски: память на сервере, scaling (каждый коннект = ресурс)
- Q44 — нестабильное соединение: теряем heartbeat → reconnect
- Q60 — WebSocket оправдан: двусторонняя связь, частые мелкие обновления
- Q71 — WebSocket: persistent connection, бинарный фрейминг vs HTTP: request-response
- Q89 — reconnect: detect disconnect → backoff → reconnect → re-subscribe

### US 2.2.2: Нагрузочное тестирование WebSocket

**Как** разработчик
**Я хочу** проверить, как сервер справляется с множеством WS-подключений
**Чтобы** понимать лимиты и настроить reconnect-логику

**Acceptance Criteria:**
- [ ] Скрипт `simulate-readers.ts`: создаёт N ботов, каждый открывает случайную статью
- [ ] Мониторинг: сколько соединений сервер держит, latency, memory
- [ ] Тест: отключение интернета (throttle) → поведение reconnect
- [ ] Тест: убийство серверного процесса → клиент переживает и восстанавливается

## Архитектура v2.2

```
server/src/
├── ws/
│   ├── wsServer.ts             ← WebSocket-сервер на том же порту
│   ├── readersTracker.ts       ← Map<articleId, Set<connectionId>>
│   └── heartbeat.ts            ← ping/pong для проверки живых соединений
└── scripts/
    └── simulate-readers.ts     ← нагрузочный скрипт

client/src/
├── features/
│   └── live-readers/
│       ├── useWebSocket.ts     ← generic хук с reconnect
│       ├── useArticleReaders.ts ← подписка на конкретную статью
│       ├── ReadersCounter.tsx  ← "👥 5 читают сейчас"
│       ├── OnlineCounter.tsx   ← "🟢 142 на сайте"
│       └── index.ts
```

## Стек v2.2

| Компонент | Технология |
|---|---|
| WS (сервер) | ws (нативный, без Socket.io — для лучшего понимания протокола) |
| WS (клиент) | WebSocket API (нативный) |
| Нагрузочное тестирование | Кастомный скрипт на Node.js (или k6 с ws-плагином) |

## Оценка времени: 2-3 дня

---

# RELEASE v2.3 — Auth: JWT + Персональный трекер

## Покрытие: 19 вопросов (21.1%) → нарастающий: 73 из 90 (81.1%)

```
Q2, Q3, Q6, Q7, Q8, Q25, Q26, Q27, Q28, Q29, Q30,
Q31, Q32, Q50, Q51, Q52, Q74, Q77, Q81
```

## Зачем (обоснование для новостного сайта)

Зачем регистрация на новостном сайте? **"Positivity Tracker"** — твой персональный счётчик позитивности:
- Сколько позитивных новостей ты прочитал за неделю?
- Какие темы тебя больше всего вдохновляют?
- Streak: "7 дней подряд читаешь только позитив"
- Закладки: сохраняй лучшие новости

Это не натянутая фича — Medium, NYTimes, Guardian сами требуют авторизацию для персонализации.

Для сохранения данных между устройствами и сессиями нужен аккаунт. LocalStorage не переживает смену браузера.

## User Stories

### US 2.3.1: Регистрация и логин

**Как** читатель
**Я хочу** создать аккаунт и войти
**Чтобы** мой прогресс позитивности сохранялся

**Acceptance Criteria:**
- [ ] `POST /api/auth/register` — email + password → создание аккаунта
- [ ] `POST /api/auth/login` — email + password → access + refresh tokens
- [ ] `POST /api/auth/refresh` — refresh token → новый access token
- [ ] `POST /api/auth/logout` — очистка refresh token cookie
- [ ] Пароль хранится в bcrypt-хеше (не plaintext)
- [ ] Access token: в памяти приложения (переменная)
- [ ] Refresh token: в httpOnly secure cookie (maxAge: 7 дней)
- [ ] При 401: автоматический refresh + retry исходного запроса

**Вопросы, которые закрываются на практике:**
- Q2 — три метода аутентификации: password-based, token-based (JWT), OAuth
- Q3 — авторизация: проверка прав (authenticated vs guest)
- Q25 — Cookie: хранит refresh token, httpOnly, secure, sameSite
- Q26 — JWT: подпись, payload, expiration
- Q27 — access token + refresh token
- Q28 — access: короткоживущий (15 мин), refresh: долгоживущий (7 дней)
- Q29 — access в памяти, refresh в httpOnly cookie
- Q30 — httpOnly: JS не может прочитать → защита от XSS
- Q31 — 401 Unauthorized при невалидном access token
- Q32 — access token добавляется в Authorization header через interceptor
- Q50 — bcrypt для хеширования паролей, salt rounds
- Q74 — interceptor: поймал 401 → POST /refresh → retry

### US 2.3.2: Персональный трекер позитивности

**Как** авторизованный пользователь
**Я хочу** видеть статистику моего чтения
**Чтобы** понимать, насколько позитивен мой информационный поток

**Acceptance Criteria:**
- [ ] Каждый просмотр статьи сохраняется: `POST /api/reading-history`
- [ ] Страница "Мой прогресс": прочитано за неделю / месяц
- [ ] Streak: "5 дней подряд только позитивные новости"
- [ ] Закладки: `POST /api/bookmarks`, `GET /api/bookmarks`
- [ ] Данные доступны с любого устройства (хранятся на сервере)

### US 2.3.3: Сравнение хранилищ на практике

**Как** разработчик
**Я хочу** использовать разные хранилища для разных целей
**Чтобы** объяснить на интервью, когда что применять

**Acceptance Criteria:**
- [ ] Access token → в переменной JS (не переживает refresh страницы — и это ок, refresh token восстановит)
- [ ] Тема оформления (dark/light) → localStorage (переживает закрытие)
- [ ] Состояние формы "в процессе заполнения" → sessionStorage (до закрытия вкладки)
- [ ] Refresh token → httpOnly cookie (JS не имеет доступа)
- [ ] Кэш прочитанных статей (offline) → IndexedDB (большой объём)

**Вопросы, которые закрываются на практике:**
- Q6 — cookie vs sessionStorage: время жизни, доступ с сервера
- Q7 — CSRF: опасен при cookie-based auth (refresh token в cookie → SameSite=Strict)
- Q8 — сессии на сервере (или JWT — stateless), cookie в браузере
- Q45 — авторизация не через GET: password виден в URL, логах, referrer
- Q51 — альтернативы: OAuth (Google/GitHub login), magic link, WebAuthn
- Q52 — passwordless риски: перехват SMS, задержка email
- Q77 — cookie lifetime: maxAge, expires, session cookie
- Q81 — localStorage vs IndexedDB vs cookies vs sessionStorage: всё используется в проекте

## Архитектура v2.3

```
server/src/
├── routes/
│   ├── auth.routes.ts          ← register, login, refresh, logout
│   ├── bookmarks.routes.ts     ← CRUD закладок
│   └── readingHistory.routes.ts
├── middleware/
│   ├── authenticate.ts         ← проверка JWT из Authorization header
│   └── csrfProtection.ts       ← CSRF-защита для cookie-based auth
├── services/
│   └── authService.ts          ← bcrypt, jwt sign/verify
└── db/
    └── schema.ts               ← SQLite (Prisma / better-sqlite3)

client/src/
├── features/
│   ├── auth/
│   │   ├── useAuth.ts          ← логин/логаут/регистрация
│   │   ├── AuthInterceptor.ts  ← RTK Query baseQuery с auto-refresh
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── index.ts
│   ├── bookmarks/
│   │   ├── useBookmarks.ts
│   │   ├── BookmarkButton.tsx
│   │   └── index.ts
│   └── positivity-tracker/
│       ├── useReadingStats.ts
│       ├── PositivityDashboard.tsx
│       ├── StreakCounter.tsx
│       └── index.ts
└── shared/
    └── useLocalStorage.ts      ← уже есть
```

## Стек v2.3

| Компонент | Технология |
|---|---|
| JWT | jsonwebtoken |
| Хеширование | bcrypt |
| Cookies | cookie-parser |
| БД | SQLite + better-sqlite3 (или Prisma) |
| Формы | React Hook Form + Zod |

## Оценка времени: 3-4 дня

---

# RELEASE v2.4 — GraphQL: Аналитика

## Покрытие: 7 вопросов (7.8%) → нарастающий: 80 из 90 (88.9%)

```
Q53, Q54, Q55, Q56, Q57, Q58, Q83
```

## Зачем

REST уже есть для основных операций. GraphQL добавляется для аналитического дашборда, где пользователь может гибко запрашивать данные:

- "Покажи мне топ-10 тем за эту неделю, с количеством статей по каждой, из каких источников"
- "Статистика позитивности по дням за месяц с разбивкой по категориям"

Это один запрос в GraphQL vs 3-4 запроса в REST. Здесь GraphQL **обоснован**, а не прикручен ради галочки.

Также: страница "Protocol Comparison" — теоретическое сравнение REST vs GraphQL vs gRPC vs WebSocket vs SSE на основе реального опыта из этого проекта.

## User Stories

### US 2.4.1: Аналитический дашборд на GraphQL

**Как** авторизованный пользователь
**Я хочу** видеть аналитику: по каким темам больше позитива, тренды по дням
**Чтобы** понимать, откуда берутся хорошие новости

**Acceptance Criteria:**
- [ ] GraphQL endpoint: `POST /api/graphql`
- [ ] Query: topTopics(period: "week") → [{ topic, count, sources }]
- [ ] Query: positivityTrend(days: 30) → [{ date, positive, total, percent }]
- [ ] Query: readingHistory(userId) → [{ article, readAt }]
- [ ] Frontend: Apollo Client для GraphQL-запросов
- [ ] Визуализация: простые графики (recharts или CSS-based)

**Вопросы, которые закрываются на практике:**
- Q53 — GraphQL: schema, resolvers, single endpoint
- Q54 — преимущества: один запрос для сложной аналитики вместо 3-4 REST-запросов
- Q55 — уменьшение запросов: nested query за один roundtrip
- Q56 — недостатки: сложность кэширования, N+1 queries, overfetching решается, но underfetching тоже проблема
- Q57 — связанность: фронт зависит от точной структуры схемы
- Q58 — изменение схемы: deprecation, версионирование

### US 2.4.2: Страница "Protocol Comparison"

**Как** разработчик (и будущий кандидат на интервью)
**Я хочу** иметь страницу-шпаргалку, где сравниваются все протоколы, используемые в проекте
**Чтобы** объяснять выбор технологий на интервью

**Acceptance Criteria:**
- [ ] Страница `/protocols` — таблица сравнения
- [ ] REST vs GraphQL vs WebSocket vs SSE vs gRPC
- [ ] Для каждого: когда использовать, плюсы, минусы, пример из проекта
- [ ] gRPC — теоретическое описание (binary, protobuf, backend-to-backend)

**Вопросы, которые закрываются на практике:**
- Q83 — gRPC: binary protocol, protobuf, используется для backend-to-backend (не в этом проекте, но объясняешь)

## Архитектура v2.4

```
server/src/
├── graphql/
│   ├── schema.ts               ← type definitions
│   ├── resolvers/
│   │   ├── analytics.resolver.ts
│   │   └── readingHistory.resolver.ts
│   └── index.ts                ← Apollo Server setup

client/src/
├── pages/
│   ├── Analytics/
│   │   ├── Analytics.tsx
│   │   ├── TopTopics.tsx
│   │   ├── PositivityTrend.tsx
│   │   └── index.ts
│   └── Protocols/
│       ├── Protocols.tsx       ← страница сравнения протоколов
│       └── index.ts
├── shared/
│   └── apollo/
│       └── client.ts           ← Apollo Client setup
```

## Стек v2.4

| Компонент | Технология |
|---|---|
| GraphQL (сервер) | Apollo Server (express integration) |
| GraphQL (клиент) | Apollo Client |
| Визуализация | recharts или victory |

## Оценка времени: 2-3 дня

---

# RELEASE v2.5 — Deploy + CI/CD + Performance

## Покрытие: 9 вопросов (10.0%) → нарастающий: 89 из 90 (98.9%)

```
Q24, Q69, Q70, Q75, Q76, Q80, Q84, Q86, Q87
```

## Зачем

Проект живёт на реальном сервере, доступен по HTTPS, деплоится автоматически. Это не "локально работает" — это продукт.

## User Stories

### US 2.5.1: Docker-контейнеризация

**Как** разработчик
**Я хочу** запускать весь проект одной командой
**Чтобы** не настраивать окружение на каждой машине

**Acceptance Criteria:**
- [ ] `Dockerfile` для backend (multi-stage: build + production)
- [ ] `Dockerfile` для frontend (build → nginx serve)
- [ ] `docker-compose.yml` — оба сервиса + SQLite volume
- [ ] `docker-compose up` — проект работает целиком
- [ ] `.dockerignore` — node_modules, .git, .env

### US 2.5.2: CI/CD через GitHub Actions

**Как** разработчик
**Я хочу** чтобы при push в main автоматически запускались тесты и деплой
**Чтобы** не деплоить вручную

**Acceptance Criteria:**
- [ ] GitHub Actions workflow: lint → test → build → deploy
- [ ] Deploy target: Railway / Render / VPS
- [ ] Отдельный workflow для PR: только lint + test (без deploy)
- [ ] Secrets: API keys, deploy tokens через GitHub Secrets

### US 2.5.3: Nginx + HTTPS + DNS

**Как** пользователь
**Я хочу** заходить по нормальному домену с HTTPS
**Чтобы** это выглядело как настоящий сайт

**Acceptance Criteria:**
- [ ] Nginx как reverse proxy: / → frontend, /api → backend
- [ ] Let's Encrypt / Cloudflare SSL → HTTPS
- [ ] DNS: настроить A-record на домен

**Вопросы, которые закрываются на практике:**
- Q24, Q80 — полный путь: DNS → IP → TCP → TLS → HTTP → Server → Response → Render
- Q69 — DNS resolution: рекурсивный запрос, root → TLD → authoritative
- Q75 — TLD (.com, .ru): верхний уровень DNS-иерархии
- Q76 — TCP handshake (SYN → SYN-ACK → ACK) → TLS → HTTP
- Q84 — после IP: TCP-соединение → TLS → HTTP-запрос

### US 2.5.4: Performance-оптимизация

**Как** пользователь
**Я хочу** чтобы сайт загружался быстро
**Чтобы** не ждать

**Acceptance Criteria:**
- [ ] Lighthouse аудит: цель ≥ 90 для Performance
- [ ] Gzip/Brotli сжатие на сервере
- [ ] Lazy loading для изображений (loading="lazy")
- [ ] Code splitting (React.lazy для страниц)
- [ ] Preconnect к API-домену
- [ ] Оптимизация bundle: анализ через vite-bundle-visualizer

**Вопросы, которые закрываются на практике:**
- Q70 — DOM parsing → CSSOM → Render Tree → Layout → Paint
- Q86 — first paint: размер bundle, количество блокирующих ресурсов, TTFB
- Q87 — оптимизация: code splitting, lazy loading, preconnect, compression

## Архитектура v2.5

```
react-happy-news/
├── .github/
│   └── workflows/
│       ├── ci.yml              ← PR: lint + test
│       └── deploy.yml          ← main: lint + test + build + deploy
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

| Компонент | Технология |
|---|---|
| Контейнеризация | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Reverse proxy | Nginx |
| HTTPS | Let's Encrypt (certbot) или Cloudflare |
| Хостинг | Railway / Render / VPS |
| Мониторинг | Lighthouse CI |

## Оценка времени: 2-3 дня

---

# Общая сводка

## Покрытие вопросов по релизам (матрица)

### v2.0 — Backend + REST (34 вопроса)

| # | Вопрос | Как закрывается |
|---|---|---|
| Q1 | HTTPS | HTTPS на сервере, TLS, сертификат |
| Q4 | 400 vs 500 | Валидация → 400, crash → 500 |
| Q5 | CORS | cors middleware между портами |
| Q9 | OPTIONS | Preflight виден в DevTools |
| Q11 | GET vs POST | GET /news, POST /feedback |
| Q12 | HTTP vs HTTPS | Сравнение в DevTools |
| Q13 | Шифрование | Header + Body шифруются, Target частично |
| Q15 | REST аббревиатура | Representational State Transfer |
| Q16 | REST правила | Stateless, uniform interface, и т.д. |
| Q17 | Code on Demand | Теория: сервер может отдать JS |
| Q18 | Протокол REST | HTTP/HTTPS |
| Q19 | OSI уровень HTTP | Application (L7) |
| Q20 | Структура HTTP-запроса | Request line + Headers + Body |
| Q21 | Коды ошибок | 200, 201, 400, 404, 422, 500 |
| Q22 | Параллельные запросы | Promise.allSettled для 3 API |
| Q23 | Способы взаимодействия с бэком | RTK Query, fetch, axios |
| Q33 | Где хранится документация | Swagger UI на /api/docs |
| Q34 | Инструменты документирования | swagger-jsdoc, Swagger UI |
| Q35 | Postman | Тестирование API через Postman |
| Q36 | Изменение API-контрактов | OpenAPI spec + версионирование |
| Q37 | Same-origin policy | Разные порты = разные origin |
| Q38 | Части origin | protocol + host + port |
| Q39 | Обход CORS | CORS-заголовки, proxy |
| Q45 | Почему не auth через GET | Данные в URL → логи, referrer |
| Q46 | Query vs body | Фильтры в query, данные в body |
| Q47 | Query при HTTPS | Зашифрованы, но в логах сервера |
| Q48 | HTTP-методы | GET, POST, PUT, PATCH, DELETE |
| Q49 | Body в HTTP-методах | GET обычно без body |
| Q72 | Зачем ограничение cross-origin | Безопасность: защита от чужих скриптов |
| Q73 | HTTP-протокол | Request-response, методы |
| Q78 | Принципы REST | Stateless, cacheable, uniform interface |
| Q79 | Frontend ↔ REST | RTK Query → Express |
| Q85 | Что на сервере при запросе | Middleware chain: logger → cors → auth → handler |
| Q88 | Проектирование API-контракта | OpenAPI spec → codegen |

### v2.1 — SSE + Polling (12 вопросов)

| # | Вопрос | Как закрывается |
|---|---|---|
| Q10 | Real-time данные | SSE для live-новостей |
| Q59 | Изменения без перезагрузки | SSE push → обновление UI |
| Q61 | Polling | Health check каждые 30с |
| Q62 | Polling > WebSocket | Health check: не нужен постоянный канал |
| Q63 | Проблемы polling | Нагрузка, задержка, дубли |
| Q64 | Падение сервера + polling | Backoff + offline mode |
| Q65 | Не показывать ошибки | "Сервер недоступен" вместо error stack |
| Q66 | Retry-логика | Exponential backoff: 1→2→4→8→30с |
| Q67 | Время ответа + polling | Не слать следующий, пока текущий не ответил |
| Q68 | Отмена запроса | AbortController |
| Q82 | Кроме REST | SSE, WebSocket, GraphQL |
| Q90 | WS vs SSE vs long polling | SSE реализован, остальное объясняешь |

### v2.2 — WebSocket (8 вопросов)

| # | Вопрос | Как закрывается |
|---|---|---|
| Q14 | WS-библиотека | ws (нативный) |
| Q41 | WebSocket vs REST | REST для данных, WS для live-счётчика |
| Q42 | Перейти на WS полностью | Нет кэша, статусов, сложнее дебаг |
| Q43 | Риски persistent WS | Память, scaling |
| Q44 | Нестабильное соединение | Потеря heartbeat → reconnect |
| Q60 | Когда WebSocket | Двусторонняя связь, частые обновления |
| Q71 | WS vs HTTP | Persistent vs request-response |
| Q89 | Reconnect WS | Detect → backoff → reconnect → re-subscribe |

### v2.3 — Auth + JWT (19 вопросов)

| # | Вопрос | Как закрывается |
|---|---|---|
| Q2 | 3 метода аутентификации | Password, JWT, OAuth |
| Q3 | Авторизация | Проверка прав: guest vs user |
| Q6 | Cookie vs sessionStorage | Cookie для refresh, sessionStorage для draft |
| Q7 | CSRF | Cookie-based auth + SameSite=Strict |
| Q8 | Где хранятся сессии/cookie | Сервер (JWT stateless) + браузер (cookie) |
| Q25 | Cookie | httpOnly, secure, maxAge, SameSite |
| Q26 | JWT | Header.Payload.Signature, RS256/HS256 |
| Q27 | Токены JWT | Access + Refresh |
| Q28 | Access vs Refresh | 15 мин vs 7 дней |
| Q29 | Где хранить токены | Access: memory, Refresh: httpOnly cookie |
| Q30 | httpOnly для refresh | JS не может прочитать → защита от XSS |
| Q31 | Статус при невалидном token | 401 Unauthorized |
| Q32 | Когда добавлять access token | Interceptor в каждый запрос |
| Q50 | Хранение паролей | bcrypt + salt |
| Q51 | Альтернативы паролю | OAuth, magic link, WebAuthn |
| Q52 | Passwordless риски | Перехват SMS, задержка email |
| Q74 | Авто-обновление токенов | Interceptor: 401 → refresh → retry |
| Q77 | Время жизни cookie | maxAge, expires, session cookie |
| Q81 | LS vs IDB vs cookie vs SS | Каждое используется в проекте |

### v2.4 — GraphQL (7 вопросов)

| # | Вопрос | Как закрывается |
|---|---|---|
| Q53 | Что такое GraphQL | Schema + resolvers + single endpoint |
| Q54 | GraphQL vs REST | Один запрос для аналитики vs 3-4 REST |
| Q55 | Уменьшение запросов | Nested query за один roundtrip |
| Q56 | Недостатки GraphQL | Сложность кэша, N+1 queries |
| Q57 | Связанность | Фронт зависит от структуры схемы |
| Q58 | Изменение схемы | Deprecation, breaking changes |
| Q83 | gRPC | Теория: binary, protobuf, backend-to-backend |

### v2.5 — Deploy + Performance (9 вопросов)

| # | Вопрос | Как закрывается |
|---|---|---|
| Q24 | После ввода URL | DNS → TCP → TLS → HTTP → Render |
| Q69 | DNS + IP | Настройка A-record, DNS resolution |
| Q70 | Этапы после получения HTML | Parse → CSSOM → Render Tree → Paint |
| Q75 | TLD + DNS | .com, .ru → root → TLD → authoritative |
| Q76 | TCP + HTTP | SYN-ACK → TLS → HTTP request |
| Q80 | URL → отображение | Полный цикл (видишь в DevTools) |
| Q84 | После получения IP | TCP handshake → TLS |
| Q86 | Что влияет на first paint | Bundle size, blocking resources, TTFB |
| Q87 | Оптимизация first paint | Code splitting, lazy, preconnect, gzip |

### Не покрыто проектом (1 вопрос)

| # | Вопрос | Почему |
|---|---|---|
| Q40 | Блокчейн | Чисто теоретический вопрос, к сетям не относится |

---

## Итоговый таймлайн

| Релиз | Срок | Вопросов | Нарастающий % |
|---|---|---|---|
| **v2.0** Backend + REST | 3-4 дня | 34 | 37.8% |
| **v2.1** SSE + Polling | 2-3 дня | +12 | 51.1% |
| **v2.2** WebSocket | 2-3 дня | +8 | 60.0% |
| **v2.3** Auth + JWT | 3-4 дня | +19 | 81.1% |
| **v2.4** GraphQL | 2-3 дня | +7 | 88.9% |
| **v2.5** Deploy + CI/CD | 2-3 дня | +9 | 98.9% |
| **ИТОГО** | **~15-20 дней** | **89/90** | **98.9%** |

---

## Порядок может меняться

Релизы v2.0 и v2.5 — обязательные (фундамент и финал).

Релизы v2.1—v2.4 можно перемещать по приоритету:
- Если хочешь побыстрее ощутить real-time → начни с v2.1
- Если хочешь закрыть больше вопросов за раз → начни с v2.3 (Auth)
- Если хочешь разнообразие → чередуй

Рекомендуемый порядок (как в документе): v2.0 → v2.1 → v2.2 → v2.3 → v2.4 → v2.5 — от базы к финальному деплою.
