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
- [ ] `NewsItem` обёрнут в `React.memo` — не ререндерится при смене несвязанных пропов
- [ ] `useCallback` для колбэков, передаваемых в `NewsItem` (чтобы `React.memo` работал)
- [ ] `useMemo` для отфильтрованного/подготовленного списка (или задокументировано почему не нужен)
- [ ] `React.lazy` + `Suspense` для страниц — code splitting (NewsDetail)
- [ ] `vite-bundle-visualizer` — зафиксировать размер main chunk до и после splitting
- [ ] React Profiler: зафиксировать количество renders при открытии попапа ⚙️ до и после `React.memo`

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

## Шаг 1: React.memo для NewsItem

**Файл:** `client/src/entities/news/NewsItem/NewsItem.tsx`

```typescript
// Обернуть дефолтный экспорт в React.memo:
// export const NewsItem = memo(function NewsItem({ item }: NewsItemProps) { ... })
//
// React.memo делает shallow comparison всех пропов перед ререндером.
// Если пропы не изменились (по ссылке) — компонент пропускается.
//
// ВАЖНО: работает только если пропы стабильны.
// Если родитель передаёт inline-колбэк `() => onClick(id)` — он новый при каждом рендере.
// Поэтому шаг 1 неполный без шага 2 (useCallback).
```

**Как замерить:**
1. DevTools → Profiler → Settings → включить "Highlight updates when components render"
2. Открыть попап ⚙️ (Источники) — без memo все NewsItem подсвечиваются синим
3. После обёртки в `memo` — попап перерендерится, NewsItem — нет
4. Записать в коммит-сообщении: "было N renders → стало M renders при открытии попапа"

**Подводный камень:** после `memo` проверь в React Profiler — если `NewsItem` всё ещё мигает,
значит какой-то проп нестабилен (обычно колбэк).

```bash
git add client/src/entities/news/NewsItem/NewsItem.tsx
git commit -m "perf: #40 NewsItem — React.memo для предотвращения wasted renders"
```

---

## Шаг 2: useCallback в NewsList / NewsFeed

**Файл:** `client/src/entities/news/NewsList/NewsList.tsx` и/или `client/src/pages/Main/NewsFeed.tsx`

```typescript
// Если NewsItem принимает колбэки (onClick, onBookmark и т.п.) —
// стабилизировать их через useCallback в компоненте-родителе:
//
// const handleClick = useCallback((id: string) => {
//   navigate(`/news/${id}`)
// }, [navigate])
//
// Deps: включаем только то, что реально используется внутри.
// navigate из react-router стабилен — можно включить без опасений.
//
// Если колбэков нет — шаг можно пропустить.
```

**Подводный камень:** не оборачивай useCallback всё подряд — это преждевременная оптимизация.
Только то, что передаётся в мемоизированные дочерние компоненты.

```bash
git add client/src/entities/news/NewsList/NewsList.tsx client/src/pages/Main/NewsFeed.tsx
git commit -m "perf: #40 useCallback — стабилизация колбэков для React.memo"
```

---

## Шаг 3: useMemo для подготовки данных

**Файл:** `client/src/pages/Main/NewsFeed.tsx`

```typescript
// Query-библиотека (RTK Query сейчас, TanStack Query после US 2.1.5)
// возвращает мемоизированный массив — не пересоздаёт при том же кэш-ключе.
// useMemo нужен если есть тяжёлая трансформация данных перед рендером:
//
// const processedNews = useMemo(() => {
//   if (!news) return []
//   // ... slice, map, sort — O(n) операции
//   return news.slice(0, LIMIT)
// }, [news])
//
// Если обработки нет — useMemo не нужен. Задокументируй вывод явно:
// "Query-библиотека кэширует, дополнительный useMemo не требуется" — тоже валидный результат.
```

**Подводный камень:** `useMemo` не бесплатен — добавляет работу по сравнению deps.
Оправдан только если вычисление действительно дорогое (> 1ms) или результат передаётся в `memo`-компонент.

```bash
git add client/src/pages/Main/NewsFeed.tsx
git commit -m "perf: #40 useMemo — мемоизация подготовленного списка новостей"
```

---

## Шаг 4: React.lazy + Suspense (code splitting)

**Файл:** `client/src/app/router.tsx` (или где объявлен роутер)

```typescript
// Заменить статические импорты страниц на lazy:
//
// Было:
// import { NewsDetail } from '@pages/NewsDetail'
//
// Стало:
// const NewsDetail = lazy(() =>
//   import('@pages/NewsDetail').then(m => ({ default: m.NewsDetail }))
// )
//
// В роуте обернуть в Suspense с fallback:
// element: (
//   <Suspense fallback={<Skeleton type="item" count={5} height="100px" />}>
//     <NewsDetail />
//   </Suspense>
// )
//
// Main оставить статическим — это критический путь первой загрузки.
// NewsDetail грузить лениво — пользователь переходит туда после просмотра ленты.
```

**Как замерить:**
1. DevTools → Network → фильтр: `JS` → Hard Reload (Ctrl+Shift+R)
2. **До splitting:** один файл `main.js` ~300KB загружается при старте
3. **После splitting:** `main.js` меньше + отдельный `newsDetail.[hash].js` появляется только при первом клике на новость
4. Также в DevTools → Network → вкладка `newsDetail.[hash].js` — Vite автоматически добавляет `<link rel="modulepreload">` для предзагрузки

**Подводный камень:** `named export` + `lazy` требует `.then(m => ({ default: m.Component }))`.
Либо сделать `export default` в файле страницы.

```bash
git add client/src/app/router.tsx
git commit -m "perf: #40 React.lazy — code splitting для NewsDetail"
```

---

## Шаг 5: Bundle visualizer + анализ

**Установка:**

```bash
pnpm --filter react-happy-news-client add -D rollup-plugin-visualizer
```

**Файл:** `client/vite.config.js`

```javascript
// Добавить плагин:
// import { visualizer } from 'rollup-plugin-visualizer'
//
// plugins: [
//   react(),
//   tsconfigPaths(),
//   visualizer({ open: true, filename: 'dist/stats.html' }),
// ]
//
// Запустить: pnpm build:client
// Откроется stats.html — интерактивная карта бандла.
```

**Что смотреть в stats.html:**
- Самые большие прямоугольники — кандидаты на lazy load или замену
- Убедиться что `NewsDetail` выделился в отдельный чанк (виден как отдельный блок)
- Зафиксировать: размер main chunk **до** (записать число) и **после** splitting
- Если `@reduxjs/toolkit` или `react-redux` видны как большие блоки — это подтверждение что миграция на TanStack Query (US 2.1.5) уменьшит бандл

**Подводный камень:** `visualizer` работает только при сборке (`build`), не при dev.
В dev-режиме плагин ничего не делает.

```bash
git add client/vite.config.js client/package.json
git commit -m "perf: close #40 bundle visualizer — анализ и code splitting"
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
