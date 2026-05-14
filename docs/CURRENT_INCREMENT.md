# US 2.1.6 — SQLite-персистентность новостей

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#42`
**Покрывает вопросы:** Q22 (параллельные запросы + кэш), Q64 (падение сервера), Q65 (скрытие ошибок)

**Acceptance Criteria:**

- [ ] `better-sqlite3` установлен на сервере
- [ ] Таблица `news_items (id, source, data TEXT, fetched_at INTEGER)` создаётся при старте
- [ ] `upsertMany` вызывается в `getNewsList` после каждой агрегации
- [ ] `getNewsDetail`: L1 node-cache → L2 SQLite → 404
- [ ] Прямая ссылка `/news/:id` работает после рестарта сервера (`pnpm dev:server`)
- [ ] Lazy TTL-cleanup: записи старше 7 дней удаляются при `upsertMany`

---

## Концепция

```
Сейчас:
  GET /api/news → aggregateNews → node-cache (TTL 5 мин)
  GET /api/news/:id → getCached('newsItem:id') → 404 если нет в кэше
                   ↑ после рестарта сервера кэш пуст → все прямые ссылки ломаются

После:
  GET /api/news → aggregateNews → node-cache (L1) + SQLite upsert (L2)
  GET /api/news/:id → L1: getCached → MISS?
                    → L2: db.findById(id) → нашли → setCached обратно → вернуть
                    → оба MISS → 404

  Рестарт сервера:
    L1 (node-cache) пуст
    L2 (SQLite) содержит все когда-либо агрегированные новости
    → прямая ссылка работает
```

**Почему SQLite, а не PostgreSQL:**
Нет сетевого сервера, нет migrations-runner — один файл `.db` рядом с приложением.
`better-sqlite3` — синхронный драйвер, не нужен `async/await` для простых запросов.
PostgreSQL обоснован только при горизонтальном масштабировании (US 2.5).

**Почему `data TEXT` (JSON-строка), а не отдельные колонки:**
`NewsItem` будет расширяться (US 2.1.7: `body`, `url`, `hasFullContent`).
Хранить JSON — гибко, не нужны ALTER TABLE при каждом добавлении поля.
Поиск идёт только по `id` — индекс по `id` достаточен.

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (продолжаем в той же ветке)
**Issue:** `#42`

---

## Архитектура

```
server/src/
├── db/                              ← НОВАЯ ПАПКА
│   ├── schema.ts                    ← НОВЫЙ: CREATE TABLE + открытие БД
│   └── newsRepository.ts            ← НОВЫЙ: findById, upsertMany, cleanup
├── routes/news/
│   └── handlers.ts                  ← ИЗМЕНИТЬ: upsertMany после агрегации + L2 в getNewsDetail
└── types/
    └── news.types.ts                ← без изменений
```

**FSD:** только серверные изменения, клиент не затрагивается.

---

## Шаг 1: Установка better-sqlite3

```bash
pnpm --filter react-happy-news-server add better-sqlite3
pnpm --filter react-happy-news-server add -D @types/better-sqlite3
```

```bash
git add server/package.json pnpm-lock.yaml
git commit -m "build: #42 add better-sqlite3"
```

---

## Шаг 2: schema.ts — открытие БД и создание таблицы

**Файл:** `server/src/db/schema.ts`

```typescript
// import Database from 'better-sqlite3'
// import path from 'node:path'
//
// const DB_PATH = path.join(process.cwd(), 'news.db')
//
// export const db = new Database(DB_PATH)
//
// // WAL-режим: улучшает конкурентные чтения
// db.pragma('journal_mode = WAL')
//
// // CREATE TABLE IF NOT EXISTS — безопасно вызывать при каждом старте
// db.exec(`
//   CREATE TABLE IF NOT EXISTS news_items (
//     id         TEXT PRIMARY KEY,
//     source     TEXT NOT NULL,
//     data       TEXT NOT NULL,       -- JSON.stringify(NewsItem)
//     fetched_at INTEGER NOT NULL     -- Date.now()
//   )
// `)
//
// // Индекс для быстрого cleanup по fetched_at
// db.exec(`
//   CREATE INDEX IF NOT EXISTS idx_fetched_at ON news_items (fetched_at)
// `)
```

**Подводный камень:** `new Database(DB_PATH)` — синхронный вызов, бросает если файл недоступен.
Оборачивать в try/catch не нужно — при ошибке БД сервер не должен стартовать.

```bash
git add server/src/db/schema.ts
git commit -m "feat: #42 SQLite schema — news_items table + WAL mode"
```

---

## Шаг 3: newsRepository.ts

**Файл:** `server/src/db/newsRepository.ts`

```typescript
// import { db } from './schema'
// import type { NewsItem } from '../types/news.types'
//
// const TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7 дней
//
// export const newsRepository = {
//
//   findById(id: string): NewsItem | undefined {
//     // SELECT data FROM news_items WHERE id = ?
//     // Если нашли — JSON.parse(row.data)
//   },
//
//   upsertMany(items: NewsItem[]): void {
//     // INSERT OR REPLACE INTO news_items (id, source, data, fetched_at)
//     // VALUES (?, ?, ?, ?)
//     //
//     // Использовать db.transaction() для batch-insert:
//     // const insert = db.prepare('INSERT OR REPLACE INTO ...')
//     // const insertAll = db.transaction((rows) => rows.forEach(insert.run))
//     // insertAll(items.map(item => [item.id, item.source, JSON.stringify(item), Date.now()]))
//     //
//     // После upsert — cleanup старых записей:
//     // db.prepare('DELETE FROM news_items WHERE fetched_at < ?').run(Date.now() - TTL_MS)
//   },
// }
```

**Подводный камень:** `better-sqlite3` — **синхронный** API. Не нужен `await`. Если попытаться
вернуть Promise — код будет работать но это антипаттерн для sync-драйвера.

**Подводный камень:** `db.transaction()` — атомарная операция. При 20 новостях это один `BEGIN/COMMIT`
вместо 20 отдельных транзакций. Без `transaction()` каждый `insert.run()` — отдельный commit → в 10x медленнее.

```bash
git add server/src/db/newsRepository.ts
git commit -m "feat: #42 newsRepository — findById, upsertMany, lazy TTL-cleanup"
```

---

## Шаг 4: Интеграция в handlers.ts

**Файл:** `server/src/routes/news/handlers.ts`

```typescript
// В getNewsList — после setCached:
// result.news.forEach((item) => setCached(`newsItem:${item.id}`, item))
// newsRepository.upsertMany(result.news)   // ← добавить эту строку
//
// В getNewsDetail — добавить L2 после L1 MISS:
// const item = getCached<NewsItem>(`newsItem:${id}`)
// if (!item) {
//   const fromDb = newsRepository.findById(id)   // ← L2
//   if (!fromDb) {
//     res.status(404).json({ error: 'News item not found' })
//     return
//   }
//   setCached(`newsItem:${id}`, fromDb)           // ← восстановить в L1
//   res.json(fromDb)
//   return
// }
// res.json(item)
```

**Подводный камень:** `upsertMany` вызывается только при CACHE MISS (строка 50 handlers.ts).
При повторных запросах кэш отдаёт данные без агрегации — upsert не вызывается.
Это корректно: данные уже в SQLite с прошлой агрегации.

```bash
git add server/src/routes/news/handlers.ts
git commit -m "feat: close #42 handlers — L2 SQLite for news detail + upsertMany after aggregation"
```

---

## Подводные камни

- **`better-sqlite3` и ESM:** сервер использует `"type": "module"` или `tsx`? Проверь `server/package.json`. `better-sqlite3` — CommonJS, при ESM нужен `createRequire` или `import { createRequire } from 'module'`. С `tsx` (который используется для dev) проблем обычно нет.
- **Путь к DB файлу:** `process.cwd()` зависит от того откуда запускается `tsx`. При `pnpm dev:server` из корня — `cwd` будет корень проекта, файл `news.db` создастся там. Лучше использовать `import.meta.url` + `path.dirname` или явный путь относительно `server/`.
- **Тесты:** серверных тестов нет, но убедись что `pnpm --filter react-happy-news-server build` проходит без ошибок TypeScript.
- **`.gitignore`:** добавить `news.db` — это runtime-файл, не должен быть в репозитории.
