# US 2.1.3 — Расширенный поиск + сортировка

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#37`
**Покрывает вопросы:** FQ45 (debounce/throttle), FQ42 (useMemo/useCallback), FQ15 (триггеры рендера)

**Acceptance Criteria:**

- [ ] Debounced поле поиска (300мс)
- [ ] Фильтр по категории (Science, Technology, Culture...)
- [ ] Сортировка: по дате / по источнику
- [ ] Query-параметры на бэкенде: `?q=...&sort=...&category=...`

---

## Концепция

```
Пользователь вводит "climate"
  → debounce 300мс (не слать на каждый символ)
  → GET /api/news?q=climate&sources=guardian,newsapi&sort=date&category=science
  → RTK Query кэширует результат
  → список обновляется без перезагрузки

Пользователь меняет сортировку
  → новый запрос с новым sort= параметром
  → RTK Query смотрит кэш: такой ключ уже есть? → отдаёт кэш
  → нет → новый запрос
```

**Почему debounce, а не throttle:**
Поиск — это реакция на окончание ввода. Нам не нужно "слать каждые N мс", нам нужно "подождать паузу". Это debounce.
Throttle уместен для событий с высокой частотой которые нельзя пропускать (scroll, mousemove).

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (продолжаем в той же ветке)
**Issue:** `#37`

---

## Архитектура

```
server/src/
└── routes/
    └── news.routes.ts      ← добавить валидацию ?q= ?sort= ?category=

client/src/
├── features/
│   └── news-filter/        ← НОВАЯ ФИЧА (расширяет source-filter)
│       ├── SearchInput.tsx       ← debounced input
│       ├── SortSelect.tsx        ← select: date | source
│       ├── useNewsFilter.ts      ← объединяет search + sort + sources
│       └── index.ts
└── shared/
    └── useDebounce.ts      ← generic debounce hook
```

**FSD:** `features/news-filter` → используется в `pages/Main/NewsFeedView`

---

## Шаг 1: useDebounce (shared)

**Файл:** `client/src/shared/useDebounce.ts`

```typescript
// Generic hook: принимает value и delay
// Возвращает debouncedValue — обновляется только после паузы в delay мс
//
// Внутри:
// 1. useState для debouncedValue (начальное = value)
// 2. useEffect: при изменении value → setTimeout(delay) → setDebouncedValue(value)
// 3. cleanup: clearTimeout — важно! иначе после unmount setState на мёртвый компонент
```

**Подводный камень:** TypeScript — хук generic `<T>`, чтобы работал и со строкой, и с числом, и с объектом.

---

## Шаг 2: SearchInput

**Файл:** `client/src/features/news-filter/SearchInput.tsx`

```typescript
// Props: { value: string; onChange: (value: string) => void }
// Рендер: <input type="search" />
// Внутри: локальный state для raw value (что пишет пользователь)
// useDebounce(rawValue, 300) → при изменении debouncedValue → вызывать onChange
//
// Важно: onChange вызывается только с debouncedValue, не с каждым нажатием клавиши
```

---

## Шаг 3: SortSelect

**Файл:** `client/src/features/news-filter/SortSelect.tsx`

```typescript
type SortOption = 'date' | 'source'

// Props: { value: SortOption; onChange: (value: SortOption) => void }
// Рендер: <select> с двумя опциями
//   date   → "По дате"
//   source → "По источнику"
```

---

## Шаг 4: useNewsFilter

**Файл:** `client/src/features/news-filter/useNewsFilter.ts`

```typescript
// Объединяет: search + sort + selectedSources (из useSourceFilter)
// Возвращает:
//   searchQuery: string
//   setSearchQuery: (q: string) => void
//   sort: SortOption
//   setSort: (s: SortOption) => void
//   selectedSources: SourceName[]
//   toggleSource: (s: SourceName) => void
//   queryParams: string  ← итоговый параметр для RTK Query
//
// queryParams строится из: sources + q + sort
// Персистить: search — нет (сессионный), sort — localStorage ('news-sort')
```

**Подводный камень:** `queryParams` должен быть стабильным при одинаковых значениях — иначе RTK Query не попадает в кэш. Сортировать sources перед join (уже делается в useSourceFilter).

---

## Шаг 5: Бэкенд — query-параметры

**Файл:** `server/src/routes/news.routes.ts`

Добавить к существующей Zod-валидации:
```typescript
// q: строка, опциональная, trim
// sort: enum('date', 'source'), опциональный, default 'date'
// category: строка, опциональная
```

В `newsAggregator.ts` — применить фильтрацию и сортировку после агрегации:
```
// q → фильтровать по title + description (toLowerCase includes)
// sort=date → сортировать по published desc
// sort=source → сортировать по sourceName asc
// category → фильтровать по тегу/категории если поле есть в новости
```

---

## Шаг 6: Подключение в NewsFeed

**Файл:** `client/src/pages/Main/NewsFeed.tsx`

```typescript
// Заменить useSourceFilter → useNewsFilter
// Передать queryParams в useGetNewsQuery вместо sourcesParam
// Передать search/sort props в NewsFeedView
```

**NewsFeedView** — добавить `<SearchInput />` и `<SortSelect />` над лентой.

---

## Подводные камни

- **RTK Query и кэш:** каждая уникальная строка `queryParams` — отдельная запись в кэше. Это ожидаемое поведение.
- **debounce и React StrictMode:** в StrictMode эффекты запускаются дважды — cleanup (clearTimeout) критически важен, иначе дебаунс не работает.
- **Пустой поиск:** когда `q=""` — не передавать параметр вообще, чтобы не ломать кэш-ключ.
- **category на бэкенде:** Guardian возвращает `sectionName`, NewsAPI — `category`, HN — нет. Нормализовать поле при агрегации.
