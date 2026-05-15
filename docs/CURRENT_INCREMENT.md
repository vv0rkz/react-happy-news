# US 2.2.1 — Live-реакции через WebSocket

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** TBD
**Покрывает вопросы:** FQ45 (WebSocket), React Patterns (Provider, Compound, Observer, HOC, Factory, useSyncExternalStore)

**Acceptance Criteria:**

- [ ] WebSocket-сервер обрабатывает `{ type: "react", articleId, emoji }`
- [ ] `reactionsTracker` хранит счётчики реакций per-article
- [ ] Broadcast обновлённых счётчиков всем в комнате статьи
- [ ] Heartbeat (ping/pong): сервер пингует каждые 30с
- [ ] Reconnect при разрыве (exponential backoff, max 3 попытки)
- [ ] Max 3 попытки → fallback (реакции недоступны, UI degrade gracefully)
- [ ] React Patterns: Provider, Compound, Observer, HOC, Factory, useSyncExternalStore

---

## Концепция

```
Сейчас:
  SSE — однонаправленный поток (сервер → клиент)
  Используется для: live-счётчик читателей

После:
  WebSocket — двунаправленный канал
  Клиент отправляет: { type: "react", articleId, emoji }
  Сервер делает broadcast: { type: "reactions", articleId, counts }
  Все читатели статьи видят реакции в реальном времени
```

**Блокера нет** — US открыт сразу.

---

## Git

**Ветка:** создать новую `v2.2.0-websocket-reactions`

---

## Архитектура

```
server/src/
├── ws/
│   ├── wsServer.ts          ← НОВЫЙ: createWsServer(httpServer)
│   └── reactionsTracker.ts  ← НОВЫЙ: Map<articleId, Record<emoji, count>>
└── index.ts                 ← ИЗМЕНИТЬ: подключить wsServer

client/src/
├── shared/ws/
│   └── wsClient.ts          ← НОВЫЙ: singleton WS-клиент + reconnect
├── app/
│   └── providers/
│       └── WebSocketProvider.tsx  ← НОВЫЙ: Context с WS (Provider pattern)
├── features/reactions/
│   ├── ReactionsPanel.tsx   ← НОВЫЙ: Compound component
│   ├── useReactions.ts      ← НОВЫЙ: useSyncExternalStore
│   └── withReactions.tsx    ← НОВЫЙ: HOC для сравнения с хуком
└── pages/NewsDetail/
    └── NewsDetailView.tsx   ← ИЗМЕНИТЬ: добавить <ReactionsPanel>
```

---

## Шаг 1: WebSocket-сервер

`ws` пакет на сервере. `createWsServer(httpServer)` — принимает существующий HTTP-сервер Express, апгрейдит соединение до WS.

`reactionsTracker.ts` — `Map<articleId, Record<emoji, count>>`. Методы: `addReaction`, `getCounts`.

При получении сообщения `{ type: "react", articleId, emoji }` → обновить трекер → broadcast всем в комнате.

---

## Шаг 2: Reconnect-логика на клиенте

`wsClient.ts` — singleton. Exponential backoff: 1s → 2s → 4s → max 3 попытки → `status: 'failed'`.

---

## Шаг 3: React Patterns

- **Provider**: `<WebSocketProvider>` → Context с WS-инстансом
- **Compound**: `<ReactionsPanel>` + `<ReactionsPanel.Button emoji="😊" />` + `<ReactionsPanel.Count emoji="😊" />`
- **Observer**: WS = Subject, компоненты = Observers через `useSyncExternalStore`
- **HOC**: `withReactions(Component)` — обёртка для сравнения с хук-подходом
- **Factory**: `createApiAdapter(source)` — фабрика адаптеров

---

## Подводные камни

- **WS + Express**: `ws` пакет требует передать `httpServer` — нельзя создать отдельно от Express
- **Compound компоненты**: статические поля на функциональном компоненте: `ReactionsPanel.Button = ...`
- **useSyncExternalStore**: нужен `subscribe` + `getSnapshot` — WS store должен их реализовать
- **MSW и WS**: MSW не перехватывает WS — для тестов нужен отдельный mock WS-сервер
- **Heartbeat vs SSE**: в SSE heartbeat — это просто `comment` в потоке; в WS — явный `ping/pong` протокол
