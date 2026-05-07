# US 2.1.1 — Live-счётчик читателей через SSE

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#36`
**Покрывает вопросы:** Q10 (real-time данные), Q59 (без перезагрузки), Q82 (кроме REST), Q90 (WS vs SSE vs long poll)

**Acceptance Criteria:**

- [x] Backend: `sseManager` управляет подключениями (Map клиентов) и heartbeat
- [x] Backend: `readersTracker` — per-article комнаты (`Map<articleId, Set<clientId>>`)
- [x] Backend: `GET /api/news/readers?articleId=` — SSE endpoint
- [ ] Frontend: `features/live-readers/useLiveReaders.ts` — EventSource + cleanup
- [x] Frontend: `features/live-readers/ReadersCount.tsx` — бейдж "● N читают сейчас"
- [x] Бейдж появляется на детальной странице новости
- [ ] EventSource закрывается при unmount (cleanup в useEffect)
- [ ] При закрытии вкладки счётчик у оставшихся читателей уменьшается

---

## Концепция

```
Клиент открыл статью
  → GET /api/news/readers?articleId=<id>  (SSE-соединение)
  → readersTracker.join(articleId, clientId, res)
  → broadcast в room: { articleId, count: N }
  → бейдж показывает "● N читают сейчас"

Клиент закрыл вкладку
  → req.on('close') → readersTracker.leave(articleId, clientId)
  → broadcast в room: { articleId, count: N-1 }
```

**Почему SSE, а не WebSocket:**
Поток односторонний — сервер → клиент. Клиент не отправляет данные; сам факт SSE-подключения = "join", разрыв = "leave". WebSocket здесь избыточен.

**Почему `?articleId=` query param, а не `/:id/readers`:**
Guardian article ID содержит слеши (`technology/2026/may/01/title`). Wildcard-роут `/*` в newsRouter перехватил бы вложенный путь. Query param решает проблему без дополнительных роутеров.

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (уже создана)
**Issue:** `#36`

---

## Архитектура

```
server/src/
├── utils/
│   ├── sseManager.ts          ← Map клиентов, addClient(), removeClient(),
│   │                             send(), broadcast(), startHeartbeat()
│   └── readersTracker.ts      ← rooms: Map<articleId, Set<clientId>>
│                                  join(), leave(), broadcastCount()
└── routes/
    └── news.routes.ts         ← GET /readers (перед wildcard /*)

client/src/
└── features/
    └── live-readers/
        ├── useLiveReaders.ts  ← EventSource, onmessage, cleanup, статус
        ├── ReadersCount.tsx   ← бейдж "● N читают сейчас"
        └── index.ts           ← barrel
```

---

## Шаг 1: sseManager (✅ готово)

**Файл:** `server/src/utils/sseManager.ts`

```typescript
type SseClient = {
  id: string
  response: express.Response
}

// - clients: Map<string, SseClient>
// - addClient(id, res): SSE-заголовки + добавить в Map
// - removeClient(id): удалить из Map
// - send(id, data): отправить одному клиенту
// - broadcast(data): отправить всем клиентам
// - startHeartbeat(): каждые 30с → ":\n\n" (keep-alive)
```

---

## Шаг 2: readersTracker (✅ готово)

**Файл:** `server/src/utils/readersTracker.ts`

```typescript
// rooms: Map<articleId, Set<clientId>>

// join(articleId, clientId, res):
//   → sseManager.addClient(clientId, res)
//   → добавить clientId в room articleId
//   → broadcastCount(articleId)

// leave(articleId, clientId):
//   → sseManager.removeClient(clientId)
//   → удалить clientId из room
//   → если room пуста — удалить из Map
//   → broadcastCount(articleId)

// broadcastCount(articleId):
//   → count = room.size
//   → для каждого clientId в room: sseManager.send(clientId, JSON.stringify({ articleId, count }))
```

**Подводный камень:** `broadcastCount` вызывается до удаления room при leave — иначе broadcast уйдёт в пустоту. В текущей реализации: сначала удаляем clientId из room, потом broadcast (если room не пуста), потом удаляем room (если пуста).

---

## Шаг 3: SSE endpoint (✅ готово)

**Файл:** `server/src/routes/news/handlers.ts` → `getReadersSSE`, зарегистрирован в `routes.ts`

```typescript
// GET /readers — зарегистрирован ДО wildcard /*
// 1. Проверить req.query.articleId — если нет → 400
// 2. clientId = crypto.randomUUID()
// 3. readersTracker.join(articleId, clientId, res)
// 4. req.on('close') → readersTracker.leave(articleId, clientId)
// 5. Не закрывать res — соединение держится открытым
```

**Подводный камень:** `/readers` должен быть до `/*`, иначе Express примет `readers` как articleId.

---

## Шаг 4: useLiveReaders

**Файл:** `client/src/features/live-readers/useLiveReaders.ts`

```typescript
type LiveStatus = 'connecting' | 'connected' | 'error' | 'closed'

interface UseLiveReadersReturn {
  count: number
  status: LiveStatus
}

// Внутри хука:
// 1. useState для count и status
// 2. useEffect(() => {
//      const url = `${BASE_URL}/api/news/readers?articleId=${encodeURIComponent(articleId)}`
//      const es = new EventSource(url)
//      es.onopen = () => setStatus('connected')
//      es.onmessage = (e) => setCount(JSON.parse(e.data).count)
//      es.onerror = () => { if (es.readyState === CLOSED) setStatus('error') }
//      return () => { es.close(); setStatus('closed') }
//    }, [articleId])
```

**Подводный камень:** `encodeURIComponent(articleId)` — обязательно, иначе слеши в Guardian ID сломают URL.

**Подводный камень:** `es.onerror` срабатывает при каждом авто-реконнекте. Проверять `es.readyState === EventSource.CLOSED` перед установкой статуса `error`.

---

## Шаг 5: ReadersCount

**Файл:** `client/src/features/live-readers/ReadersCount.tsx`

```typescript
// Props: { articleId: string }
// Рендер:
//   count > 0 && connected → <span>● N читают сейчас</span>
//   иначе → null (не показывать ничего)
```

**Где размещён:** в `NewsDetailView` над `<NewsBanner />`.

**FSD:** `pages` → импортирует из `features` (ReadersCount) и `entities` (NewsBanner) — слои соблюдены.

---

## Шаг 6: Миграция на named exports (после завершения readers count)

**Статус шага:** отложен до завершения US 2.1.1

**Цель:** закрепить единый стиль `named exports` в клиенте и включить lint-правило, чтобы новые `default export` не появлялись.

```typescript
// План:
// 1. Обновить ESLint-конфиг клиента так, чтобы он покрывал TS/TSX.
// 2. Подключить eslint-plugin-import.
// 3. Включить правило import/no-default-export сначала как "warn".
// 4. Мигрировать экспорт/импорт по слоям FSD:
//    shared -> entities -> features -> widgets -> pages -> app.
// 5. Обновить barrel-экспорты после миграции.
// 6. Прогнать lint + type-check.
// 7. После стабилизации переключить правило на "error".
```

**Подводные камни:**

- Если используется `React.lazy`, динамически импортируемый модуль обычно ожидает `default`.
- Массовую миграцию делать частями, чтобы проще локализовать регрессии.
- После изменений в экспорт/импорт обязательно перепроверять автогенерацию barrel-файлов.

