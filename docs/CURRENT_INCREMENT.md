# US 2.0.5 — Swagger-документация + OpenAPI codegen

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Покрывает вопросы:** Q33 (документация API), Q34 (swagger-jsdoc), Q88 (OpenAPI spec → codegen)

**Подход:** `@asteasolutions/zod-to-openapi` — генерация spec из Zod-схем (единственный источник правды).

**Acceptance Criteria:**
- [ ] Swagger UI доступен на `GET /api/docs`
- [ ] Все endpoints описаны через реальные Zod-схемы — без JSDoc-комментариев
- [ ] `openapi-typescript` генерирует типы клиента из spec
- [ ] Клиент использует сгенерированные типы вместо ручных

---

## Git

**Ветка:** `v2.0.0-backend-and-many-news-api-filter` (текущая)
**Issue:** `#5`

---

## Шаг 1: Установить зависимости

```powershell
pnpm --filter react-happy-news-server add @asteasolutions/zod-to-openapi swagger-ui-express
pnpm --filter react-happy-news-server add -D @types/swagger-ui-express

pnpm --filter react-happy-news-client add -D openapi-typescript
```

### Коммит

```powershell
git add server/package.json client/package.json pnpm-lock.yaml
git commit -m "build: #5 добавить zod-to-openapi, swagger-ui-express, openapi-typescript"
```

---

## Шаг 2: Создать `server/src/swagger/registry.ts`

Это центральный файл, где регистрируются все схемы и пути.

```typescript
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

// Singleton-реестр — все роуты импортируют его и регистрируют свои схемы
export const registry = new OpenAPIRegistry()
```

---

## Шаг 3: Создать `server/src/swagger/schemas.ts`

Здесь регистрируем переиспользуемые схемы (компоненты). Они будут отображаться в разделе `#/components/schemas`.

```typescript
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry'
import { SourceName } from '../types/news.types'

// ⚠️  Вызвать extendZodWithOpenApi(z) ОДИН РАЗ — до любого использования .openapi()
extendZodWithOpenApi(z)

export const NewsItemSchema = registry.register(
  'NewsItem',
  z.object({
    id:          z.string().openapi({ example: 'technology/2025/jan/01/news-title' }),
    title:       z.string().openapi({ example: 'Scientists discover new renewable energy source' }),
    description: z.string(),
    image:       z.string().url(),
    published:   z.string().datetime(),
    author:      z.string(),
    tag:         z.string().openapi({ example: 'Technology' }),
    source:      z.nativeEnum(SourceName),
  }),
)

export const FeedbackPayloadSchema = registry.register(
  'FeedbackPayload',
  z.object({
    message: z.string().min(10).max(1000).openapi({ example: 'Отличный сайт, очень позитивно!' }),
    email:   z.string().email().optional().openapi({ example: 'user@example.com' }),
  }),
)

export const FeedbackResponseSchema = registry.register(
  'FeedbackResponse',
  z.object({
    ok:      z.boolean(),
    message: z.string(),
  }),
)
```

⚠️ **Подводный камень:** `extendZodWithOpenApi(z)` нужно вызвать **до** первого `.openapi()`. Лучше делать это в `schemas.ts` при импорте.

---

## Шаг 4: Зарегистрировать пути в роутах

### Изменить `server/src/routes/news.routes.ts`

```typescript
import { z } from 'zod'
import { registry } from '../swagger/registry'
import { NewsItemSchema } from '../swagger/schemas'
import { SourceName } from '../types/news.types'

// Регистрация пути для GET /api/news
registry.registerPath({
  method: 'get',
  path: '/api/news',
  tags: ['News'],
  summary: 'Получить агрегированные позитивные новости',
  request: {
    query: z.object({
      sources: z.string().optional().openapi({
        example: 'guardian,newsapi',
        description: 'Источники через запятую. Доступные: guardian, newsapi, hackernews',
      }),
    }),
  },
  responses: {
    200: {
      description: 'Список позитивных новостей',
      content: {
        'application/json': {
          schema: z.object({
            news:    z.array(NewsItemSchema),
            sources: z.record(z.nativeEnum(SourceName), z.enum(['ok', 'error', 'skipped'])),
            cached:  z.boolean(),
          }),
        },
      },
    },
    400: { description: 'Невалидный параметр sources' },
  },
})

// Регистрация пути для GET /api/news/:id
registry.registerPath({
  method: 'get',
  path: '/api/news/{id}',
  tags: ['News'],
  summary: 'Получить новость по id',
  request: {
    params: z.object({ id: z.string().openapi({ example: 'technology/2025/jan/01/title' }) }),
  },
  responses: {
    200:  { description: 'Данные новости', content: { 'application/json': { schema: NewsItemSchema } } },
    404:  { description: 'Новость не найдена' },
  },
})
```

### Изменить `server/src/routes/feedback.routes.ts`

```typescript
import { registry } from '../swagger/registry'
import { FeedbackPayloadSchema, FeedbackResponseSchema } from '../swagger/schemas'

registry.registerPath({
  method: 'post',
  path: '/api/feedback',
  tags: ['Feedback'],
  summary: 'Отправить отзыв',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: FeedbackPayloadSchema } },
    },
  },
  responses: {
    201: { description: 'Принято', content: { 'application/json': { schema: FeedbackResponseSchema } } },
    400: { description: 'Ошибка валидации (message < 10 символов)' },
  },
})
```

⚠️ **Подводный камень:** Регистрации путей **должны быть выполнены до** того, как `OpenApiGeneratorV3` вызывается в `app.ts`. Импортируй роуты до генерации spec.

---

## Шаг 5: Подключить Swagger UI в `app.ts`

```typescript
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import swaggerUi from 'swagger-ui-express'
import { registry } from './swagger/registry'

// ⚠️  Импортируй роуты ПЕРЕД генерацией spec — они регистрируют пути в registry
import './routes/news.routes'       // side-effect: регистрация путей
import './routes/feedback.routes'   // то же

// Генерация spec из registry
const generator = new OpenApiGeneratorV3(registry.definitions)
const openApiSpec = generator.generateDocument({
  openapi: '3.0.0',
  info: { title: 'React Happy News API', version: '2.0.0' },
  servers: [{ url: 'http://localhost:3001' }],
})

// UI и JSON-эндпоинт
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
app.get('/api/docs.json', (_req, res) => res.json(openApiSpec))
```

⚠️ **Подводный камень с circular imports:** роуты уже импортируются в `app.ts` через `app.use(...)`. Регистрации путей в registry произойдут при первом импорте — убедись, что `registry` создан до импорта роутов.

### Коммит

```powershell
git add server/src/swagger/ server/src/routes/news.routes.ts server/src/routes/feedback.routes.ts server/src/app.ts
git commit -m "feat: #5 Swagger через zod-to-openapi, UI на /api/docs"
```

---

## Шаг 6: Сгенерировать типы для клиента

```powershell
# 1. Запустить сервер
pnpm dev:server

# 2. Сгенерировать типы из живого spec
pnpm --filter react-happy-news-client exec npx openapi-typescript http://localhost:3001/api/docs.json -o src/shared/api/openapi.d.ts
```

Или из файла (не нужен запущенный сервер):

```powershell
# Сохранить spec
curl http://localhost:3001/api/docs.json > client/src/shared/api/openapi.json

# Сгенерировать типы
pnpm --filter react-happy-news-client exec npx openapi-typescript client/src/shared/api/openapi.json -o client/src/shared/api/openapi.d.ts
```

Использование в клиенте:

```typescript
import type { components } from '@/shared/api/openapi'

type NewsItem = components['schemas']['NewsItem']
type FeedbackPayload = components['schemas']['FeedbackPayload']
```

### Коммит

```powershell
git add client/src/shared/api/
git commit -m "feat: #5 OpenAPI-типы для клиента"
```

---

## Итог: что должно работать

| Критерий | Результат |
|---|---|
| `GET /api/docs` | Swagger UI с реальными схемами |
| `GET /api/docs.json` | OpenAPI spec в JSON |
| Zod-схемы = документация | Не разойдутся никогда |
| `openapi.d.ts` в клиенте | Типы автогенерированы из spec |

---

## Следующий шаг

**US 2.0.7** — Архитектурный рефакторинг: Container/Presentational, Error Boundaries, семантические теги.

---

## История коммитов этого инкремента

```
feat: #5 OpenAPI-типы для клиента                    ← Шаг 6   (pending)
feat: #5 Swagger через zod-to-openapi, UI на /api/docs ← Шаги 2–5 (pending)
build: #5 zod-to-openapi, swagger-ui-express          ← Шаг 1   (pending)
```
