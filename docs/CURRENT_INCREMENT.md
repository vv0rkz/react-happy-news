# US 2.1.4 — Оптимизация рендеринга

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#40`
**Покрывает вопросы:** FQ16 (shallow comparison), FQ20 (batching), FQ41 (React.memo), FQ42 (useMemo/useCallback), FQ43 (Profiler API), FQ44 (виртуализация), FQ46 (code splitting), FQ47 (bundle analysis), FQ48 (tree shaking)

**Acceptance Criteria:**

- [ ] `NewsItem` обёрнут в `React.memo` — не ререндерится при смене несвязанных пропов
- [ ] `useCallback` для колбэков, передаваемых в `NewsItem` (чтобы `React.memo` работал)
- [ ] `useMemo` для отфильтрованного/подготовленного списка новостей
- [ ] `React.lazy` + `Suspense` для страниц — code splitting (Main, NewsDetail)
- [ ] `vite-bundle-visualizer` — анализ бандла до/после
- [ ] React Profiler: сравнение render count до и после мемоизации

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
// RTK Query уже возвращает мемоизированный массив (не пересоздаёт при том же кэш-ключе).
// useMemo нужен если есть тяжёлая трансформация данных перед рендером:
//
// const processedNews = useMemo(() => {
//   if (!news) return []
//   // ... slice, map, sort — O(n) операции
//   return news.slice(0, LIMIT)
// }, [news])
//
// Если обработки нет — useMemo не нужен (не стоит добавлять ради галочки).
// Документируй вывод: "RTK Query кэширует, useMemo не требуется" — тоже валидный ответ.
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
// Main можно оставить статическим — это критический путь.
// NewsDetail грузить лениво — пользователь не переходит туда сразу.
```

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
// Смотреть: что занимает больше всего места, разделились ли чанки.
```

**Подводный камень:** `visualizer` работает только при сборке (`build`), не при dev.
В dev-режиме плагин ничего не делает.

```bash
git add client/vite.config.js client/package.json
git commit -m "perf: close #40 bundle visualizer — анализ и code splitting"
```

---

## Подводные камни

- **React.memo и контекст:** если `NewsItem` читает контекст напрямую через `useContext` — `memo` не поможет. `memo` проверяет только пропы, не значения контекста.
- **Стабильность ключей:** `key` в списке должен быть стабильным ID, не индексом. Нестабильный `key` сбрасывает стейт и провоцирует полный ремаунт.
- **useMemo и deps:** если deps некорректны — баг сложнее отладить, чем без мемоизации. Будь аккуратен.
- **Suspense и SSR:** нас это не касается (SPA), но знать стоит: React.lazy + Suspense не работают на сервере без React Server Components.
- **code splitting и prefetch:** Vite автоматически добавляет `<link rel="modulepreload">` для lazy-чанков. Смотреть в DevTools → Network → Filter: JS.
