# US 2.0.3 — RESTful API

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Покрывает вопросы:** Q4 (400 vs 500), Q11 (GET vs POST), Q21 (коды ошибок), Q46 (query vs body), Q48 (HTTP-методы), Q85 (middleware chain)

**Acceptance Criteria:**
- [ ] `GET /api/news/:id` — детали новости, 404 если не найдена
- [ ] `POST /api/feedback` — принимает JSON body, возвращает 201
- [ ] `GET /api/health` — уже есть ✅
- [ ] HTTP-статусы: 200, 201, 400, 404, 500
- [ ] Валидация body через Zod (feedback)
- [ ] Global error handler — 500 без stack trace в проде
- [ ] Форма обратной связи на клиенте (FeedbackForm)

---

## Git

**Ветка:** `v2.0.0-backend-and-many-news-api-filter` (текущая)
**Issue:** `#5`

```powershell
git checkout v2.0.0-backend-and-many-news-api-filter
git status
```

---

## Шаг 1: `GET /api/news/:id` — поиск в кэше

### Изменить `server/src/routes/news.routes.ts`

**Подводный камень:** `GET /:id` нужно зарегистрировать _после_ `GET /` — иначе Express может конфликтовать.

**Подводный камень 2:** `id` новости — строка типа `technology/2025-01-01/news-title`. Слэши внутри id могут сломать роутинг. Нужно проверить, как хранятся id в кэше.

Как работает id-кэш: когда `GET /` агрегирует и кладёт результат в кэш по ключу `news:guardian,...` — нужно **параллельно** положить каждый `item` по ключу `newsItem:${item.id}`. Тогда `GET /:id` просто делает lookup.

```typescript
// 1. В GET '/' — после setCached(cacheKey, result) добавить:
//    result.news.forEach(...) — для каждого item сделать setCached(`newsItem:${item.id}`, item)

// 2. Добавить новый роут:
newsRouter.get('/:id', (req, res) => {
  // 1. Достать item из кэша: getCached(`newsItem:${req.params.id}`)
  // 2. Если нет — res.status(404).json(...)
  // 3. Если есть — res.json(item)
})
```

### Коммит

```powershell
git add server/src/routes/news.routes.ts
git commit -m "feat: #5 GET /api/news/:id — поиск по id в кэше"
```

---

## Шаг 2: `POST /api/feedback`

### Создать `server/src/routes/feedback.routes.ts`

**Q46:** Данные формы — в body, не в query string. Здесь и нужен POST.
**Q21:** Успешное создание ресурса → 201 Created (не 200).

```typescript
import { Router } from 'express'
import { z } from 'zod'

export const feedbackRouter = Router()

// Zod-схема: message обязателен (min 10, max 1000), email опциональный
const feedbackSchema = z.object({
  // ...
})

feedbackRouter.post('/', (req, res) => {
  // 1. feedbackSchema.safeParse(req.body)
  // 2. Если !parsed.success → res.status(400).json({ error: parsed.error.flatten() })
  // 3. console.log('[Feedback]', parsed.data)
  // 4. res.status(201).json({ ok: true, message: '...' })
})
```

---

## Шаг 3: Global error handler middleware

### Создать `server/src/middleware/errorHandler.ts`

**Q4:** Неожиданная ошибка (crash) → 500. Это отличается от ошибки валидации (400) — там мы сами вернули ответ.
**Подводный камень:** Express error handler — это функция с **4 аргументами**: `(err, req, res, next)`. Если написать 3 — Express не распознает его как error handler.

```typescript
import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1. console.error('[Unhandled Error]', err)
  // 2. isProd = process.env.NODE_ENV === 'production'
  // 3. res.status(500).json({
  //      error: 'Internal Server Error',
  //      // в проде — только message без stack trace
  //      // в dev — добавить message из err для отладки
  //    })
}
```

---

## Шаг 4: Подключить новые роуты в `app.ts`

### Изменить `server/src/app.ts`

**Подводный камень:** `errorHandler` должен быть **последним** `app.use()` — он ловит то, что не было поймано раньше.

```typescript
// После app.use('/api/news', newsRouter) добавить:
// app.use('/api/feedback', feedbackRouter)

// В самом конце, перед return app:
// app.use(errorHandler)
```

### Проверка

```powershell
cd server && npm run dev

# Список → потом взять реальный id из ответа
curl "http://localhost:3001/api/news"

# Детали по id
curl "http://localhost:3001/api/news/<id-из-предыдущего>"

# 404
curl "http://localhost:3001/api/news/fake-id"

# Feedback → 201
curl -X POST http://localhost:3001/api/feedback `
  -H "Content-Type: application/json" `
  -d '{"message":"Отличный сайт, очень позитивно!","email":"test@test.com"}'

# Ошибка валидации → 400
curl -X POST http://localhost:3001/api/feedback `
  -H "Content-Type: application/json" `
  -d '{"message":"коротко"}'
```

### Коммит

```powershell
git add server/src/routes/feedback.routes.ts `
        server/src/middleware/errorHandler.ts `
        server/src/app.ts
git commit -m "feat: #5 POST /api/feedback, errorHandler middleware"
```

---

## Шаг 5: `postFeedback` mutation в RTK Query

### Изменить `client/src/entities/news/api/rtk/newsApi.ts`

**FQ36:** Mutation (не query) — потому что меняет данные на сервере (POST).

```typescript
// Добавить интерфейсы:
interface FeedbackPayload {
  // message: string
  // email?: string
}

interface FeedbackResponse {
  // ok: boolean
  // message: string
}

// В endpoints добавить:
postFeedback: builder.mutation<FeedbackResponse, FeedbackPayload>({
  // query: (body) => ({ url: '/api/feedback', method: 'POST', body })
}),

// Экспортировать usePostFeedbackMutation
```

---

## Шаг 6: Компонент `FeedbackForm`

### Создать `client/src/features/feedback/FeedbackForm.tsx`

**Подводный камень:** `usePostFeedbackMutation` возвращает кортеж `[trigger, result]`.
`result` содержит `isLoading`, `isSuccess`, `isError`.

```typescript
const FeedbackForm = (): React.ReactNode => {
  // 1. useState для message и email
  // 2. const [postFeedback, { isLoading, isSuccess, isError }] = usePostFeedbackMutation()
  // 3. handleSubmit: e.preventDefault() → postFeedback({ message, email || undefined })
  // 4. Если isSuccess — показать "Спасибо!"
  // 5. Кнопка disabled когда isLoading или message.length < 10
}
```

### Создать `client/src/features/feedback/styles.module.css`

Нужны классы: `.form`, `.textarea`, `.input`, `.button`, `.button:disabled`, `.success`, `.error`

### Создать `client/src/features/feedback/index.ts`

```typescript
export { default as FeedbackForm } from './FeedbackForm'
```

### Коммит

```powershell
git add client/src/entities/news/api/rtk/newsApi.ts `
        client/src/features/feedback/
git commit -m "feat: #5 FeedbackForm + postFeedback mutation"
```

---

## Шаг 7: MSW handler для `POST /api/feedback`

### Изменить `client/src/app/mocks/handlers.ts`

```typescript
// Добавить в handlers[]:
http.post(`${BASE_URL}/api/feedback`, async ({ request }) => {
  // 1. const body = await request.json()
  // 2. Проверить длину message — если < 10, вернуть 400
  // 3. Вернуть { ok: true, message: '...' } со статусом 201
}),
```

---

## Шаг 8: Footer с `FeedbackForm` в `App.tsx`

### Изменить `client/src/app/App.tsx`

```typescript
// После <Outlet /> добавить <footer> с <FeedbackForm />
// Стиль footer — inline или отдельный CSS, по вкусу
```

### Коммит

```powershell
git add client/src/app/mocks/handlers.ts client/src/app/App.tsx
git commit -m "feat: #5 Footer + FeedbackForm + MSW mock"
```

---

## Итог: что должно работать

| Критерий | Результат |
|---|---|
| `GET /api/news/:id` | 200 с данными или 404 |
| `POST /api/feedback` | 201 при успехе, 400 при ошибке валидации |
| Error handler | 500 без stack trace в проде |
| FeedbackForm | Форма в footer, loading / success / error |

---

## Следующий шаг

**US 2.0.5** — Swagger-документация: `/api/docs`, JSDoc-аннотации на роутах, swagger-jsdoc + swagger-ui-express.

---

## История коммитов этого инкремента

```
feat: #5 Footer + FeedbackForm + MSW mock         ← Шаги 7–8 (pending)
feat: #5 FeedbackForm + postFeedback mutation      ← Шаги 5–6 (pending)
feat: #5 POST /api/feedback, errorHandler          ← Шаги 2–4 (pending)
feat: #5 GET /api/news/:id                         ← Шаг 1   (pending)
```
