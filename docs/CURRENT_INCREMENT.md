# US 2.0.5 — Swagger-документация + OpenAPI codegen

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Покрывает вопросы:** Q33 (документация API), Q34 (swagger-jsdoc), Q88 (OpenAPI spec → codegen)

**Acceptance Criteria:**
- [ ] Swagger UI доступен на `GET /api/docs`
- [ ] Все endpoints описаны: `/api/health`, `/api/news`, `/api/news/:id`, `/api/feedback`
- [ ] Каждый endpoint задокументирован: параметры, body, возможные статусы
- [ ] `openapi-typescript` генерирует типы клиента из spec
- [ ] Ручные типы `NewsItem`, `NewsDetailsData`, `FeedbackPayload` заменяются сгенерированными

---

## Git

**Ветка:** `v2.0.0-backend-and-many-news-api-filter` (текущая)
**Issue:** `#5`

---

## Шаг 1: Установить зависимости

```powershell
# Серверные зависимости
pnpm --filter react-happy-news-server add swagger-jsdoc swagger-ui-express
pnpm --filter react-happy-news-server add -D @types/swagger-jsdoc @types/swagger-ui-express

# Клиентская dev-зависимость (генерация типов из OpenAPI spec)
pnpm --filter react-happy-news-client add -D openapi-typescript
```

### Коммит

```powershell
git add server/package.json client/package.json pnpm-lock.yaml
git commit -m "build: #5 добавить swagger-jsdoc, swagger-ui-express, openapi-typescript"
```

---

## Шаг 2: Настроить Swagger в `app.ts`

### Изменить `server/src/app.ts`

**Q33:** Swagger UI = интерактивная документация API прямо в браузере. Без установки Postman.
**Q34:** `swagger-jsdoc` читает JSDoc-комментарии из роутов и собирает из них OpenAPI-спецификацию.

```typescript
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Конфигурация swagger-jsdoc
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'React Happy News API',
      version: '2.0.0',
      description: 'Aggregates positive news from Guardian, NewsAPI, HackerNews',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  // Глобус: где искать JSDoc-комментарии с @openapi
  apis: ['./src/routes/*.ts'],
})

// Подключить UI на /api/docs
// app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
```

⚠️ **Подводный камень:** `apis` — это путь **относительно CWD процесса** (обычно `server/`). Если запуск из корня монорепо — нужно `./server/src/routes/*.ts`.

### Коммит

```powershell
git add server/src/app.ts
git commit -m "feat: #5 подключить Swagger UI на /api/docs"
```

---

## Шаг 3: JSDoc-аннотации на роутах

### Изменить `server/src/routes/news.routes.ts`

Добавить JSDoc перед каждым роутом. Формат — YAML внутри `@openapi`:

```typescript
/**
 * @openapi
 * /api/news:
 *   get:
 *     summary: Получить агрегированные новости
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: sources
 *         schema:
 *           type: string
 *           example: "guardian,newsapi"
 *         description: Список источников через запятую
 *     responses:
 *       200:
 *         description: Список позитивных новостей
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsListResponse'
 *       400:
 *         description: Невалидный параметр sources
 */

/**
 * @openapi
 * /api/news/{id}:
 *   get:
 *     summary: Получить новость по id
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID новости (может содержать слэши)
 *     responses:
 *       200:
 *         description: Данные новости
 *       404:
 *         description: Новость не найдена
 */
```

### Изменить `server/src/routes/feedback.routes.ts`

```typescript
/**
 * @openapi
 * /api/feedback:
 *   post:
 *     summary: Отправить отзыв
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackPayload'
 *     responses:
 *       201:
 *         description: Отзыв принят
 *       400:
 *         description: Ошибка валидации
 */
```

### Добавить схемы компонентов в `app.ts` (или отдельный файл `swagger/schemas.ts`)

```typescript
// В definition.components.schemas:
NewsItem: {
  type: 'object',
  properties: {
    id:          { type: 'string' },
    title:       { type: 'string' },
    description: { type: 'string' },
    published:   { type: 'string', format: 'date-time' },
    source:      { type: 'string', enum: ['guardian', 'newsapi', 'hackernews'] },
    image:       { type: 'string' },
    author:      { type: 'string' },
    tag:         { type: 'string' },
  },
},
FeedbackPayload: {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', minLength: 10, maxLength: 1000 },
    email:   { type: 'string', format: 'email' },
  },
},
```

### Коммит

```powershell
git add server/src/routes/news.routes.ts server/src/routes/feedback.routes.ts server/src/app.ts
git commit -m "docs: #5 JSDoc-аннотации на всех endpoints"
```

---

## Шаг 4: Экспортировать OpenAPI spec как JSON

Swagger spec можно отдавать как JSON для последующей генерации типов:

```typescript
// В app.ts после swaggerUi.setup:
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec)
})
```

### Проверка

```powershell
pnpm dev:server
# Открыть в браузере:
# http://localhost:3001/api/docs        — Swagger UI
# http://localhost:3001/api/docs.json   — сырой spec (JSON)
```

---

## Шаг 5: Сгенерировать типы клиента из OpenAPI spec

**Q88:** OpenAPI spec → `openapi-typescript` → типы TypeScript. Ручные интерфейсы больше не нужны.

```powershell
# Скачать spec и сгенерировать типы
pnpm --filter react-happy-news-client exec npx openapi-typescript http://localhost:3001/api/docs.json -o src/shared/api/openapi.d.ts
```

⚠️ **Подводный камень:** сервер должен быть запущен при генерации (URL-источник).

Альтернатива — из файла:
```powershell
# Сохранить spec в файл
curl http://localhost:3001/api/docs.json -o client/src/shared/api/openapi.json

# Сгенерировать из файла (не нужен запущенный сервер)
pnpm --filter react-happy-news-client exec npx openapi-typescript client/src/shared/api/openapi.json -o client/src/shared/api/openapi.d.ts
```

После генерации можно использовать:

```typescript
import type { components } from '@/shared/api/openapi'

type NewsItem = components['schemas']['NewsItem']
type FeedbackPayload = components['schemas']['FeedbackPayload']
```

### Коммит

```powershell
git add client/src/shared/api/
git commit -m "feat: #5 сгенерировать OpenAPI-типы для клиента"
```

---

## Итог: что должно работать

| Критерий | Результат |
|---|---|
| `GET /api/docs` | Открывается Swagger UI |
| `GET /api/docs.json` | OpenAPI spec в JSON |
| Все 4 эндпоинта видны в UI | Можно тестировать прямо в браузере |
| `openapi.d.ts` в клиенте | Типы из spec, не вручную |

---

## Следующий шаг

**US 2.0.7** — Архитектурный рефакторинг: Container/Presentational, Error Boundaries, семантические теги.

---

## История коммитов этого инкремента

```
docs: #5 JSDoc-аннотации на всех endpoints          ← Шаги 3–4 (pending)
feat: #5 подключить Swagger UI на /api/docs          ← Шаг 2   (pending)
build: #5 swagger-jsdoc, openapi-typescript          ← Шаг 1   (pending)
```
