# US 2.1.4 — Оптимизация рендеринга

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#40`
**Покрывает вопросы:** FQ16 (shallow comparison), FQ20 (batching), FQ41 (React.memo), FQ42 (useMemo/useCallback), FQ43 (Profiler API), FQ46 (code splitting), FQ47 (bundle analysis), FQ48 (tree shaking)

> **FQ44 (виртуализация) перенесён в US 2.1.8** — виртуализация обоснована только при 200+ элементах. Реализуется после накопления данных в SQLite (US 2.1.6).

**Acceptance Criteria:**

- [x] Фильтры (sources, q, category) читаются из URL search params (`useNewsFilterParams`)
- [x] `NewsFilterContext` и `localStorage` для sources удалены
- [x] URL `/?q=climate&category=science&sources=guardian` работает при прямом переходе
- [x] `NewsItem` обёрнут в `React.memo` — shallow comparison пропов работает корректно
- [x] `useCallback` — **не нужен сейчас**: `NewsItem` не принимает колбэков из родителя. Перенесён в US 2.3.2 (BookmarkButton), где появится `onBookmark` + `isBookmarked`
- [x] `useMemo` — **не нужен сейчас**: RTK Query кэширует массив, трансформации нет. Перенесён в US 2.3.2 (закладки), где `news.map(item => ({ ...item, isBookmarked }))` создаст новые объекты и сломает `React.memo` без `useMemo`
- [x] `React.lazy` — **не нужен сейчас**: `NewsDetail` = 1.47 kB (0.07% бандла), выигрыш незаметен. Перенесён в US 2.3.6, где появятся Auth + Dashboard + recharts (~200–300 kB)
- [x] `vite-bundle-visualizer` — ✅ выполнено. До: 1.93 MB root (browser MSW + index). После удаления MSW из prod: 1.42 MB. MSW исключён через `import.meta.env.DEV` в `main.tsx`
- [ ] React Profiler: зафиксировать количество renders с `isBookmarked` prop до/после `memo` + `useCallback` — перенесён в US 2.3.2

---

## Концепция

```
Без оптимизации:
  Пользователь открывает попап ⚙️ (Источники)
  → SourceFilter перерендеривается
  → NewsFilterContext обновляется
  → NewsFeedView ререндерится
  → каждый из 20+ NewsItem ререндерится
  → Profiler: 20+ wasted renders

После React.memo + useCallback:
  → только изменившийся NewsItem ререндерится
  → остальные 19 — мемоизированы, пропущены

Code splitting:
  Сейчас: один бандл ~300KB
  После React.lazy: Main грузится сразу, NewsDetail — по требованию
  → Первая загрузка быстрее
```

**Почему React.memo, а не useMemo для компонентов:**
`React.memo` — HOC для компонентов, делает shallow comparison пропов.
`useMemo` — для вычисляемых значений внутри компонента.
Оба про кэш, но на разных уровнях.

**Почему code splitting через React.lazy, а не отдельные entrypoints:**
Vite умеет делать dynamic import автоматически. `React.lazy` — декларативный способ сказать React «грузи это по требованию». Работает в связке с `Suspense`, который показывает fallback пока чанк загружается.

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (продолжаем в той же ветке)
**Issue:** `#40`

---

## Архитектура

```
client/src/
├── app/
│   ├── router.tsx              ← ИЗМЕНИТЬ: React.lazy для страниц
│   └── main.tsx                ← без изменений
├── entities/news/
│   └── NewsItem/
│       └── NewsItem.tsx        ← ИЗМЕНИТЬ: React.memo
├── entities/news/
│   └── NewsList/
│       └── NewsList.tsx        ← ИЗМЕНИТЬ: useCallback для колбэков
├── pages/Main/
│   └── NewsFeed.tsx            ← ИЗМЕНИТЬ: useMemo для списка
└── shared/
    └── Skeleton/
        └── Skeleton.tsx        ← без изменений (Suspense fallback)
```

**FSD:** изменения только внутри слоёв, не нарушают границы.

---

## Шаг 1: React.memo для NewsItem ✅ DONE

**Файл:** `client/src/entities/news/NewsItem/NewsItem.tsx`

`React.memo` добавлен. `NewsItem` получает единственный проп `item` — колбэков из родителя нет,
shallow comparison работает корректно.

**Замер (Profiler + console.count):**
- В dev-режиме каждый item рендерится 4 раза при загрузке:
  - 2× — React Strict Mode намеренно double-invokes render при монтировании
  - 2× — реальный второй цикл (RTK Query: `isFetching: true` → `false`)
- Разница между с/без `memo` не видна в этом сценарии, потому что `item` объекты реально новые
  (RTK Query вернул свежий массив), а в дереве нет родителя с local state выше `NewsList`.
- `memo` вступит в силу в **US 2.3.2 (BookmarkButton)** — см. примечание ниже.

```bash
git add client/src/entities/news/NewsItem/NewsItem.tsx
git commit -m "perf: #40 NewsItem — React.memo, проф замер в US 2.3.2"
```

---

## Шаг 2: useCallback — отложено до US 2.3.2

**Почему сейчас не нужен:**
`NewsItem` принимает только `item` — никаких колбэков из родителя. `handleClick` определён
внутри самого `NewsItem`. `memo` уже работает корректно без `useCallback` в родителе.

**Когда станет нужен — US 2.3.2 (Закладки):**

```typescript
// NewsList будет передавать в NewsItem новые пропы:
// <NewsItem
//   item={item}
//   isBookmarked={bookmarkedIds.has(item.id)}   // ← boolean per-item
//   onBookmark={handleBookmark}                  // ← колбэк из родителя
// />
//
// Без useCallback: handleBookmark новый при каждом рендере родителя
// → React.memo видит изменение → все NewsItem ре-рендерятся
// → профит от memo обнуляется
//
// С useCallback: handleBookmark стабилен по ссылке
// → при клике на закладку статьи X ре-рендерится только NewsItem X
// → остальные 9 — пропускаются
```

**Как будет выглядеть Profiler до/после:**
- Без `useCallback`: клик "сохранить" → 10 цветных прямоугольников
- С `useCallback`: клик "сохранить" → 1 цветной прямоугольник

Этот шаг переносится в `CURRENT_INCREMENT` US 2.3.2.

---

## Шаг 3: useMemo — отложено до US 2.3.2

**Почему сейчас не нужен:**
RTK Query возвращает мемоизированный массив — не пересоздаёт объект при том же кэш-ключе.
`news` передаётся в `NewsList` напрямую, без трансформации. Добавлять `useMemo` без причины —
преждевременная оптимизация (лишняя работа по сравнению deps при каждом рендере).

> Вывод задокументирован: Query-библиотека кэширует, дополнительный `useMemo` не требуется.

**Когда станет нужен — US 2.3.2 (Закладки):**

```typescript
// Если bookmarkedIds встраивать в объект item перед передачей в NewsItem:
//
// const newsWithBookmarks = news.map(item => ({
//   ...item,
//   isBookmarked: bookmarkedIds.has(item.id),
// }))
// ← новый массив + новые объекты при каждом рендере родителя
// → React.memo на NewsItem видит новый item → все карточки ре-рендерятся
//
// Решение:
// const newsWithBookmarks = useMemo(() =>
//   news.map(item => ({ ...item, isBookmarked: bookmarkedIds.has(item.id) })),
//   [news, bookmarkedIds]
// )
// ← пересчитывается только когда news или bookmarkedIds реально изменились
// → React.memo работает как ожидается
//
// Альтернатива без useMemo: передавать isBookmarked отдельным пропом (boolean),
// не встраивая в item — тогда useMemo не нужен совсем.
// Какой подход выбрать — решается при реализации US 2.3.2.
```

Этот шаг переносится в `CURRENT_INCREMENT` US 2.3.2.

---

## Шаг 4: React.lazy — отложено до US 2.3.6

**Почему сейчас не нужен:**
Анализ через `rollup-plugin-visualizer` показал: `NewsDetail` = 1.47 kB (0.07% бандла).
Выносить 1.5 kB в отдельный чанк — не оптимизация.

**Когда станет нужен — US 2.3.6 (Protected Routes):**
В `router.tsx` появятся новые тяжёлые страницы:

```typescript
// Auth (React Hook Form + Zod resolvers) — ~50–80 kB
// Dashboard (recharts) — ~200–300 kB
// Bookmarks — отдельная страница
//
// Все три не нужны при первом открытии главной.
// Без lazy — едут в index.js и грузятся всегда.
// С lazy — грузятся только при первом переходе.
//
// const Dashboard = lazy(() => import('@pages/Dashboard').then(m => ({ default: m.Dashboard })))
// const Auth = lazy(() => import('@pages/Auth').then(m => ({ default: m.Auth })))
//
// element: (
//   <Suspense fallback={<Skeleton type="item" count={3} height="80px" />}>
//     <Dashboard />
//   </Suspense>
// )
//
// Подводный камень: named export + lazy требует .then(m => ({ default: m.Component }))
```

Этот шаг переносится в `CURRENT_INCREMENT` US 2.3.6.

---

## Шаг 5: Bundle visualizer + анализ ✅ DONE

**Установлен:** `rollup-plugin-visualizer` в `vite.config.js` (`visualizer({ open: true, filename: 'dist/stats.html' })`).

**Результаты анализа:**

| | До | После |
|---|---|---|
| Root бандл (visualizer) | 1.93 MB | 1.42 MB |
| `browser-[hash].js` | 278 kB (MSW в prod!) | — (удалён) |
| `index-[hash].js` | 579 kB | 578 kB |

**Что нашли:**
- MSW (`browser-Dmc0mUnz.js`, 278 kB) попадал в production — динамический `import('./mocks/browser')` в `main.tsx` не был защищён `import.meta.env.DEV`
- **Фикс:** добавлен `if (!import.meta.env.DEV) return` — Vite заменяет на `false` при build и tree-shaking вырезает весь блок
- Весь `src/` = 29 kB (1.49% бандла) — основной вес несут зависимости (Mantine, React, Redux)
- `NewsDetail` = 1.47 kB → `React.lazy` перенесён в US 2.3.6

```bash
git add client/src/app/main.tsx
git commit -m "perf: close #40 MSW excluded from prod via import.meta.env.DEV — 278kB saved"
```

---

## Почему react-window отложен (перенесён в US 2.1.8)

`react-window` оправдан только при 100+ элементах — именно тогда в React Profiler видны реальные frame drops (FPS < 60). С текущими 10–20 новостями эффект невидим, а код усложняется.

**Когда откроется US 2.1.8:**
- SQLite (US 2.1.6) накопил 200+ записей, или
- MSW seed генерирует 500+ элементов для демо

Тогда последовательность будет наглядной: запустить Profiler без виртуализации → видеть тормоза → включить `react-window` → 60fps. Это и есть настоящее обоснование.

---

## Подводные камни

- **React.memo и контекст:** если `NewsItem` читает контекст напрямую через `useContext` — `memo` не поможет. `memo` проверяет только пропы, не значения контекста.
- **Стабильность ключей:** `key` в списке должен быть стабильным ID, не индексом. Нестабильный `key` сбрасывает стейт и провоцирует полный ремаунт.
- **useMemo и deps:** если deps некорректны — баг сложнее отладить, чем без мемоизации. Будь аккуратен.
- **Suspense и SSR:** нас это не касается (SPA), но знать стоит: React.lazy + Suspense не работают на сервере без React Server Components.
- **code splitting и prefetch:** Vite автоматически добавляет `<link rel="modulepreload">` для lazy-чанков. Смотреть в DevTools → Network → Filter: JS.
