# US 2.0.7 — Архитектурный рефакторинг

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Покрывает вопросы:** FQ1 (SOLID/SRP), FQ4 (FSD), FQ5 (FSD vs Atomic), FQ6 (Container/Presentational), FQ55 (Error Boundaries), FQ78 (семантические теги)

**Acceptance Criteria:**
- [x] Container/Presentational: `NewsFeed` (контейнер) + `NewsFeedView` (рендеринг)
- [x] Error Boundaries вокруг NewsFeed и NewsDetail
- [x] Семантические теги: `<article>`, `<ul>`/`<li>`, `<main>` (fixed двойной `<main>` в ErrorComponent)
- [ ] Vercel деплой клиента работает (monorepo `vercel.json`)
- [ ] Релиз v2.0.0 смерджен в `main`

---

## Git

**Ветка:** `v2.0.0-backend-and-many-news-api-filter` (текущая)
**Issue:** `#5`

---

## Шаг 1: Container/Presentational в `pages/Main`

**FQ6:** Container знает о данных и состоянии; Presentational — только рендеринг через props. Это SRP на уровне компонентов.

### Что сейчас

Посмотри на `client/src/pages/Main/` — там наверняка один компонент, который одновременно делает RTK Query хук и рендерит UI.

### Что сделать

Разбить на два файла:

```
pages/Main/
├── NewsFeedContainer.tsx   ← логика: useGetNewsQuery, useSourceFilter, фильтрация, пагинация
└── NewsFeedView.tsx        ← рендеринг: принимает props, ничего не знает об API
```

Сигнатуры:

```typescript
// NewsFeedView.tsx
interface NewsFeedViewProps {
  news: NewsDetailsData[]
  isLoading: boolean
  isError: boolean
  // ...pagination props, source filter props
}

const NewsFeedView = (props: NewsFeedViewProps): React.ReactNode => { ... }

// NewsFeedContainer.tsx
const NewsFeedContainer = (): React.ReactNode => {
  // хуки, RTK Query, useSourceFilter, usePaginateNews
  // → передаёт всё в NewsFeedView через props
}
```

**Подводный камень:** `NewsFeedContainer` должен быть дефолтным экспортом страницы (подключён в роутере), `NewsFeedView` — переиспользуемый компонент.

### Коммит

```powershell
git add client/src/pages/Main/
git commit -m "refactor: #5 Container/Presentational для NewsFeed"
```

---

## Шаг 2: Error Boundaries

**FQ55:** Error Boundary ловит JS-ошибки в дочерних компонентах во время рендера. Без них — белый экран.

### Установить `react-error-boundary`

```powershell
pnpm --filter react-happy-news-client add react-error-boundary
```

### Обернуть NewsFeed и NewsDetail

```typescript
import { ErrorBoundary } from 'react-error-boundary'

// В роутере или в самих страницах:
<ErrorBoundary fallback={<ErrorComponent message="Что-то пошло не так" />}>
  <NewsFeedContainer />
</ErrorBoundary>
```

⚠️ **Подводный камень:** RTK Query ошибки (`isError`) — это НЕ то, что ловит Error Boundary. EB ловит исключения во время рендера. Оба механизма нужны.

### Коммит

```powershell
git add client/src/
git commit -m "refactor: #5 Error Boundaries вокруг NewsFeed и NewsDetail"
```

---

## Шаг 3: Семантические теги

**FQ78:** `<article>`, `<main>`, `<nav>`, `<header>`, `<footer>` — важны для доступности и SEO.

### Что проверить и исправить

| Компонент | Что заменить |
|---|---|
| `App.tsx` | `<>` → `<main>` вокруг `<Outlet />` |
| `Header` | убедиться что обёрнут в `<header>` |
| Карточка новости | `<div>` → `<article>` |
| Список новостей | `<div>` → `<ul>` + `<li>` |
| Footer с FeedbackForm | уже `<footer>` ✅ |

### Коммит

```powershell
git add client/src/
git commit -m "refactor: #5 семантические теги (article, main, nav)"
```

---

## Шаг 4: Vercel деплой (monorepo)

**Контекст:** Проект стал pnpm-монорепом (`client/` + `server/`). Vercel раньше мог видеть `index.html` в корне — теперь его нет. Нужен `vercel.json`, который объясняет Vercel где искать клиент.

**Важно:** Сервер Express на Vercel не живёт как обычный процесс — Vercel Serverless Functions работают иначе. Поэтому деплоим **только клиент** (статика), сервер остаётся либо на Railway/Render, либо рассматриваем позже. Клиент через `VITE_API_BASE_URL` в Vercel env vars указывает на внешний сервер.

### Структура решения

```json
// vercel.json в корне монорепо
{
  "buildCommand": "pnpm build:client",
  "outputDirectory": "client/dist",
  "installCommand": "pnpm install",
  "framework": null
}
```

### Что нужно сделать

1. Создать `vercel.json` в корне (содержимое выше)
2. В Vercel Dashboard → Settings → Environment Variables добавить `VITE_API_BASE_URL` → URL продакшн-сервера
3. Проверить что `client/dist` появляется после `pnpm build:client`
4. Для SPA-роутинга (React Router) добавить в `vercel.json` rewrites:

```json
{
  "buildCommand": "pnpm build:client",
  "outputDirectory": "client/dist",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

⚠️ **Подводный камень:** без `rewrites` прямой переход на `/news/123` даст 404 от Vercel, а не от React Router.

### Коммит

```powershell
git add vercel.json
git commit -m "build: #5 vercel.json для monorepo деплоя клиента"
```

---

## Шаг 5: Release v2.0.0 → merge в main

Это **завершающий инкремент** релиза v2.0. После мержа ветка `v2.0.0-*` уходит в `main`.

### Workflow (через `jst`)

```powershell
# 1. Убедиться что все коммиты на ветке
git log --oneline main..HEAD

# 2. Сгенерировать CHANGELOG + обновить README + создать тег
npm run _ release

# 3. Запушить тег и ветку
npm run _ push-release

# 4. Создать PR или смерджить напрямую (зависит от настроек репо)
git checkout main
git merge --no-ff v2.0.0-backend-and-many-news-api-filter
git push origin main
```

⚠️ **Подводный камень:** `pre-push` хук проверяет формат ветки `v{version}-{name}`. На `main` этой проверки нет — пушить можно.

⚠️ **Подводный камень:** `npm run _ release` читает коммиты с момента последнего тега. Убедись что все нужные коммиты есть на ветке перед запуском.

---

## Итог: что должно работать

| Критерий | Результат |
|---|---|
| `NewsFeedContainer` + `NewsFeedView` | Логика и UI разделены |
| Error Boundary на ленте | Ошибка рендера → fallback, не белый экран |
| Семантические теги | article, main, header, nav, footer |
| Vercel деплой | Клиент доступен по Vercel URL |
| main актуален | v2.0.0 смерджен, тег создан |

---

## Следующий шаг

**US 2.0.2** — Выбор источников (source filter UI + source badges) — уже в следующем релизе.

---

## История коммитов этого инкремента

```
chore: #5 merge v2.0.0 в main                       ← Шаг 5 (pending)
build: #5 vercel.json для monorepo деплоя            ← Шаг 4 (pending)
refactor: #5 Container/Presentational для NewsFeed  ← Шаги 1-3 ✅ 85cf024
```
