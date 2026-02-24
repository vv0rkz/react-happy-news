---
name: FSD Migration Plan
overview: Мигрировать проект с плоской component-based архитектуры на Feature-Sliced Design. Анализируем сверху вниз (pages → widgets → features → entities → shared), но реализуем снизу вверх, чтобы не ломать импорты на каждом шаге.
todos:
  - id: shared
    content: 'Создать shared/ слой: перенести Image, Skeleton, ErrorComponent, useLocalStorage, formatTimeAgo, вынести customBaseQuery'
    status: completed
  - id: entities
    content: 'Создать entities/news/: перенести API, schemas, transforms, filterPositiveNews, NewsBanner, NewsItem, NewsList'
    status: completed
  - id: features
    content: 'Создать features/: paginate-news (Pagination + usePagination), toggle-mock-mode (MockToggle из Header)'
    status: completed
  - id: widgets
    content: 'Создать widgets/: header/ (с MockToggle), news-feed/ (из Main.tsx логики), news-detail-view/ (из NewsDetail.tsx логики)'
    status: completed
  - id: pages
    content: Облегчить pages/main и pages/news-detail — делегировать в виджеты
    status: completed
  - id: app
    content: 'Создать app/ слой: перенести router, store, mocks, main.tsx, App.tsx'
    status: completed
  - id: aliases
    content: Обновить path aliases в tsconfig.json и vite.config.js на FSD-стиль
    status: completed
  - id: steiger
    content: 'Подключить Steiger — официальный FSD-линтер: установить пакет, добавить steiger.config.ts, добавить npm-скрипт "arch:check"'
    status: pending
  - id: depcruiser
    content: 'Подключить dependency-cruiser: настроить .dependency-cruiser.js с FSD-правилами, добавить npm-скрипты "arch:graph" (SVG) и "arch:validate"'
    status: pending
isProject: false
---

# Миграция на FSD

## Почему анализируем сверху вниз, а реализуем снизу вверх

**Анализ сверху вниз** — смотрим на страницы и спрашиваем: "что здесь происходит?" → понимаем границы слоёв.
**Реализация снизу вверх** — `shared` не зависит ни от кого, поэтому переносим его первым. Если начать с `pages`, они тут же сломаются, потому что `entities` ещё не существует.

## Правило зависимостей FSD (самое важное)

```
app → pages → widgets → features → entities → shared
```

Каждый слой импортирует **только из слоёв ниже себя**. Нарушение этого правила = нарушение FSD.

## Целевая структура

Маппинг текущих файлов на FSD:

- `**app/` (бутстрап приложения)
  - `src/main.tsx` → `app/main.tsx`
  - `src/App.tsx` + `App.css` → `app/App.tsx`
  - `src/router.tsx` → `app/router.tsx`
  - `src/store/store.ts` → `app/providers/store.ts`
  - `src/mocks/` → `app/mocks/`
- `**pages/` (тонкие оболочки над виджетами)
  - `pages/Main/Main.tsx` — станет делегировать в `widgets/news-feed`
  - `pages/NewsDetail/NewsDetail.tsx` — станет делегировать в `widgets/news-detail-view`
- `**widgets/` (сложные UI-блоки, комбинируют фичи + сущности)
  - `widgets/header/` ← `components/Header/` (Header — Layout-обёртка)
  - `widgets/news-feed/` ← логика Main.tsx (Banner + List + Pagination + Skeleton + Error)
  - `widgets/news-detail-view/` ← логика NewsDetail.tsx
- `**features/` (действия пользователя)
  - `features/toggle-mock-mode/` ← логика кнопки Toggle из Header.tsx
  - `features/paginate-news/` ← `components/Pagination/` + `hooks/usePagination.ts`
- `**entities/` (бизнес-сущности)
  - `entities/news/api/` ← `api/rtk/newsApi.ts` + `api/schemas.ts`
  - `entities/news/lib/` ← `api/apiNews/utils/transforms.ts` + `helpers/filterPositiveNews.ts`
  - `entities/news/ui/` ← `components/NewsBanner/`, `components/NewsItem/`, `components/NewsList/`
- `**shared/` (без бизнес-логики, переиспользуемое везде)
  - `shared/api/` ← `customBaseQuery` из newsApi.ts
  - `shared/ui/` ← `components/Image/`, `components/Skeleton/`, `components/ErrorComponent/`
  - `shared/hooks/` ← `hooks/useLocalStorage.ts`
  - `shared/lib/` ← `helpers/formatTimeAgo.ts`

## Порядок реализации (снизу вверх)

1. `**shared/` — перенести `Image`, `Skeleton`, `ErrorComponent`, `useLocalStorage`, `formatTimeAgo`, вынести `customBaseQuery`
2. `**entities/news/` — перенести API, schemas, transforms, filterPositiveNews, NewsBanner, NewsItem, NewsList
3. `**features/` — перенести `Pagination` + `usePagination`; вынести `MockToggle` из Header
4. `**widgets/` — собрать `Header` (с MockToggle внутри); создать `NewsFeed` и `NewsDetailView`
5. `**pages/` — облегчить Main и NewsDetail (делегировать в виджеты)
6. `**app/` — перенести router, store, mocks, main.tsx
7. **Обновить aliases** в `[tsconfig.json](tsconfig.json)` и `[vite.config.js](vite.config.js)`

## Обновление path aliases

Текущие → Новые:

- `@components/`_ → `@widgets/`*, `@entities/`*, `@shared/_` (по контексту)
- `@api/`_ → `@entities/news/api/`_
- `@hooks/`* → `@features/`*или`@shared/hooks/\`
- `@helpers/`_ → `@shared/lib/`_

Новый набор aliases:

```json
"@app/*": ["src/app/*"],
"@pages/*": ["src/pages/*"],
"@widgets/*": ["src/widgets/*"],
"@features/*": ["src/features/*"],
"@entities/*": ["src/entities/*"],
"@shared/*": ["src/shared/*"]
```

## Про `index.ts` в каждом слайсе

Каждая папка-слайс (`entities/news/`, `features/paginate-news/` и т.д.) должна иметь `index.ts` — публичный API слайса. Снаружи импортируем только через него, не заходим напрямую в `ui/`, `api/` и т.д.

## Тесты

После каждого этапа запускать `npm run test` — тесты служат страховкой, что ничего не сломали при переносе.

## Инструменты качества архитектуры

### Steiger — FSD-линтер (официальный)

Проверяет соответствие структуры папок и импортов правилам FSD. Запускается как CLI.

```bash
npm install --save-dev steiger @feature-sliced/steiger-plugin
```

Добавить `steiger.config.ts` в корне и скрипт в `package.json`:

```json
"arch:check": "steiger ./src"
```

Что проверяет: кросс-слайсовые импорты, нарушения порядка слоёв, отсутствие `index.ts` и другие FSD-правила. Удобно запускать в CI после миграции.

### dependency-cruiser — визуализация зависимостей

Генерирует граф зависимостей (SVG/HTML) — видно, кто от кого зависит, и нарушения архитектуры наглядно.

```bash
npm install --save-dev dependency-cruiser
npx depcruise --init
```

Скрипты в `package.json`:

```json
"arch:graph": "depcruise src --include-only \"^src\" --output-type dot | dot -T svg > arch.svg",
"arch:validate": "depcruise src --include-only \"^src\""
```

В `.dependency-cruiser.js` можно прописать запрет на импорты из более высоких FSD-слоёв (дублирует Steiger, но даёт визуальный отчёт).

> Для рендера SVG нужен Graphviz (`winget install graphviz` на Windows).
