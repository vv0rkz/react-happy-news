# US 2.1.1 — Live-лента новостей через SSE

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#36`
**Покрывает вопросы:** Q10 (real-time данные), Q59 (без перезагрузки), Q82 (кроме REST), Q90 (WS vs SSE vs long poll)

**Acceptance Criteria:**
- [ ] Backend: cron каждые 5 минут фетчит свежие новости → фильтрует → пушит через SSE
- [ ] Backend: `GET /api/news/stream` — SSE endpoint
- [ ] Backend: sseManager управляет подключениями (Map клиентов) и heartbeat
- [ ] Frontend: `features/live-news/useLiveNews.ts` — EventSource + cleanup
- [ ] Frontend: `features/live-news/LiveIndicator.tsx` — `● Live` / `○ Offline`
- [ ] Новые новости вставляются вверх ленты в `NewsFeedContainer`
- [ ] EventSource закрывается при unmount (cleanup в useEffect)

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (создать от `main`)
**Issue:** `#36`

```powershell
git checkout main
git checkout -b v2.1.0-live-sse-feed
```

---

## Архитектура

```
server/src/
├── utils/
│   └── sseManager.ts          ← Map клиентов, send(), broadcast(), heartbeat
├── services/
│   └── newsCron.ts            ← node-cron: fetch → filter → broadcast
└── routes/
    └── newsStream.routes.ts   ← GET /api/news/stream

client/src/
└── features/
    └── live-news/
        ├── useLiveNews.ts     ← EventSource, onmessage, cleanup, статус
        ├── LiveIndicator.tsx  ← UI индикатор (● Live / ○ Offline)
        └── index.ts           ← barrel (auto-generated)
```

---

## Шаг 1: sseManager

**Файл:** `server/src/utils/sseManager.ts`

**FSD-аналогия:** утилита без зависимостей от конкретных роутов — переиспользуется cron'ом и роутом.

```typescript
// Типы
type SseClient = {
  id: string
  response: express.Response
}

// Что должен уметь sseManager:
// - clients: Map<string, SseClient> — все активные подключения
// - addClient(id, res): установить SSE-заголовки, добавить в Map
// - removeClient(id): удалить из Map
// - broadcast(data): отправить всем клиентам строку в формате SSE
// - startHeartbeat(): setInterval → каждые 30с send ":\n\n" (keep-alive)
```

**SSE-формат сообщения:**
```
data: {"id":"...","title":"..."}\n\n
```

**Подводный камень:** SSE требует специфических заголовков:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```
Без них браузер не распознает поток.

**Подводный камень:** при дисконнекте клиента `req.on('close', ...)` → нужно вызвать `removeClient`, иначе Map растёт вечно.

### Коммит
```powershell
git add server/src/utils/sseManager.ts
git commit -m "feat: #36 sseManager — управление SSE-подключениями"
```

---

## Шаг 2: SSE endpoint

**Файл:** `server/src/routes/newsStream.routes.ts`

```typescript
// GET /api/news/stream
// 1. Сгенерировать уникальный clientId (crypto.randomUUID())
// 2. Вызвать sseManager.addClient(clientId, res)
// 3. При req.on('close') → sseManager.removeClient(clientId)
// 4. Не закрывать res — соединение держится открытым
```

**Подключить в `app.ts`:**
```typescript
app.use('/api/news/stream', newsStreamRouter)
```

**Подводный камень:** роут `/api/news/stream` должен быть зарегистрирован **до** роута `/api/news/:id`, иначе Express поймает `stream` как `:id`.

### Коммит
```powershell
git add server/src/routes/newsStream.routes.ts server/src/app.ts
git commit -m "feat: #36 GET /api/news/stream — SSE endpoint"
```

---

## Шаг 3: Cron-задача

**Файл:** `server/src/services/newsCron.ts`

**Установить зависимость:**
```powershell
pnpm --filter react-happy-news-server add node-cron
pnpm --filter react-happy-news-server add -D @types/node-cron
```

```typescript
// Что делает cron:
// 1. cron.schedule('*/5 * * * *', async () => { ... })
// 2. Вызвать aggregateNews() — существующий сервис
// 3. Получить только новые новости (те, которых ещё не было)
//    → простой способ: сравнить по id с lastSeenIds: Set<string>
// 4. Для каждой новой: sseManager.broadcast(JSON.stringify(newsItem))
// 5. Обновить lastSeenIds
```

**Запустить в `index.ts`:**
```typescript
import { startNewsCron } from './services/newsCron'
startNewsCron()
```

**Подводный камень:** cron запускается при старте сервера — первый тик будет через 5 минут. Для дев-режима можно добавить немедленный вызов при старте или уменьшить интервал через env-переменную.

**Подводный камень:** `aggregateNews` уже кэширует результат на 5 минут. Cron должен инвалидировать кэш перед вызовом или использовать отдельный метод без кэша.

### Коммит
```powershell
git add server/src/services/newsCron.ts server/src/index.ts
git commit -m "feat: #36 newsCron — cron-задача для live-ленты"
```

---

## Шаг 4: useLiveNews

**Файл:** `client/src/features/live-news/useLiveNews.ts`

**FSD:** feature-слой, не знает о конкретных страницах.

```typescript
type LiveNewsStatus = 'connecting' | 'connected' | 'error' | 'closed'

interface UseLiveNewsReturn {
  newItems: NewsDetailsData[]   // накопленные новые новости
  status: LiveNewsStatus
  clearNewItems: () => void     // сбросить после вставки в основной список
}

// Внутри хука:
// 1. useState для newItems и status
// 2. useEffect(() => {
//      const es = new EventSource(`${VITE_API_BASE_URL}/api/news/stream`)
//      es.onopen = () => setStatus('connected')
//      es.onmessage = (e) => {
//        const item = JSON.parse(e.data) as NewsDetailsData
//        setNewItems(prev => [item, ...prev])
//      }
//      es.onerror = () => setStatus('error')
//      return () => { es.close(); setStatus('closed') }  // cleanup!
//    }, [])
```

**Подводный камень:** `EventSource` не поддерживает кастомные заголовки (в отличие от fetch). Авторизация через query-параметр или cookie, не через Authorization header.

**Подводный камень:** `es.onerror` срабатывает и при reconnect — браузер сам переподключается. Не нужно делать reconnect вручную. Отличить временную ошибку от окончательной можно по `es.readyState`.

### Коммит
```powershell
git add client/src/features/live-news/useLiveNews.ts
git commit -m "feat: #36 useLiveNews — EventSource подписка"
```

---

## Шаг 5: LiveIndicator

**Файл:** `client/src/features/live-news/LiveIndicator.tsx`

```typescript
interface LiveIndicatorProps {
  status: LiveNewsStatus
}

// Рендер:
// 'connected' → <span>● Live</span>  (зелёный)
// 'connecting' → <span>○ Connecting...</span>  (серый)
// 'error' | 'closed' → <span>○ Offline</span>  (красный)
```

**Где разместить:** в `widgets/Header` или над лентой в `NewsFeedView` — на усмотрение, главное не в entities (это feature-слой).

### Коммит
```powershell
git add client/src/features/live-news/LiveIndicator.tsx
git commit -m "feat: #36 LiveIndicator — статус SSE-соединения"
```

---

## Шаг 6: Подключить в NewsFeedContainer

**Файл:** `client/src/pages/Main/NewsFeedContainer.tsx`

```typescript
// 1. const { newItems, status, clearNewItems } = useLiveNews()
// 2. useEffect(() => {
//      if (newItems.length > 0) {
//        // вставить newItems в начало основного списка
//        // очистить newItems через clearNewItems()
//      }
//    }, [newItems])
// 3. Передать status в NewsFeedView → LiveIndicator
```

**Подводный камень:** данные RTK Query и данные SSE — две разные системы. Не нужно инвалидировать RTK-кэш. Просто объединяй: `[...newItems, ...rtkData]`.

**Подводный камень:** дублирование. Если cron присылает новость, которая уже есть в RTK-кэше (например, при первой загрузке) — нужно дедуплицировать по `id`.

### Коммит
```powershell
git add client/src/pages/Main/NewsFeedContainer.tsx client/src/pages/Main/NewsFeedView.tsx
git commit -m "feat: #36 подключить useLiveNews в NewsFeedContainer"
```

---

## Итог: что должно работать

| Критерий | Результат |
|---|---|
| `GET /api/news/stream` | Открытое SSE-соединение, заголовки text/event-stream |
| Cron каждые 5 мин | Новые новости приходят без перезагрузки |
| `● Live` в UI | Виден когда соединение активно |
| Закрытие вкладки | EventSource закрывается (cleanup) |
| Дедупликация | Одна новость не появляется дважды |

---

## История коммитов этого инкремента

```
feat: #36 подключить useLiveNews в NewsFeedContainer   ← Шаг 6 (pending)
feat: #36 LiveIndicator — статус SSE-соединения        ← Шаг 5 (pending)
feat: #36 useLiveNews — EventSource подписка           ← Шаг 4 (pending)
feat: #36 newsCron — cron-задача для live-ленты        ← Шаг 3 (pending)
feat: #36 GET /api/news/stream — SSE endpoint          ← Шаг 2 (pending)
feat: #36 sseManager — управление SSE-подключениями   ← Шаг 1 (pending)
```
