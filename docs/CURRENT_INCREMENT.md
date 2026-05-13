# US 2.1.5 — Миграция RTK Query → TanStack Query

**Статус:** `active`
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** `#41`
**Покрывает вопросы:** FQ36 (RTK Query → TanStack Query), FQ38 (server vs client state), FQ24 (хуки)

**Acceptance Criteria:**

- [ ] `@tanstack/react-query` установлен, `@reduxjs/toolkit` и `react-redux` удалены
- [ ] `QueryClientProvider` в `main.tsx`, `store.ts` удалён
- [ ] `entities/news/api/tanstack/newsQueries.ts` заменяет `rtk/newsApi.ts`
- [ ] `useHealthCheck.ts`: кастомный polling/backoff заменён на `refetchInterval` + `retry` + `retryDelay`
- [ ] `ReactQueryDevtools` подключены в dev-режиме
- [ ] Все компоненты работают: лента, детальная страница, offline mode

---

## Концепция

```
Сейчас (RTK Query + Redux):
  store.ts → configureStore → newsApi.reducer + newsApi.middleware
  main.tsx → <Provider store={store}>
  newsApi.ts → createApi → useGetNewsQuery / useGetNewsDetailQuery
  useHealthCheck.ts → 60+ строк: fetch + AbortController + setTimeout + backoff вручную

После (TanStack Query):
  queryClient.ts → new QueryClient({ defaultOptions })
  main.tsx → <QueryClientProvider client={queryClient}>  (store.ts удалён)
  newsQueries.ts → useQuery / useMutation — нативный кэш, dedupe, loading states
  useHealthCheck.ts → useQuery({ refetchInterval, retry, retryDelay }) — 15 строк
```

**Почему TanStack Query, а не оставить RTK Query:**
RTK Query требует Redux-обвязки (`store`, `Provider`, `reducer`, `middleware`) даже для простого server state.
TanStack Query — специализированная библиотека для server state: встроенный polling, retry, devtools, меньше boilerplate.
Redux остаётся обоснованным только при наличии глобального client state (auth, UI-состояния) — это появится в v2.3.

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (продолжаем в той же ветке)
**Issue:** `#41`

---

## Архитектура

```
client/src/
├── app/
│   ├── main.tsx                    ← ИЗМЕНИТЬ: QueryClientProvider вместо Provider
│   └── store/
│       └── store.ts                ← УДАЛИТЬ полностью
├── shared/
│   └── api/
│       └── queryClient.ts          ← НОВЫЙ: new QueryClient с defaultOptions
├── entities/news/
│   └── api/
│       ├── rtk/
│       │   └── newsApi.ts          ← УДАЛИТЬ (заменяется tanstack/)
│       └── tanstack/               ← НОВАЯ ПАПКА
│           └── newsQueries.ts      ← useGetNewsQuery / useGetNewsDetailQuery / usePostFeedback
└── features/
    └── health-check/
        └── useHealthCheck.ts       ← ИЗМЕНИТЬ: useQuery вместо ручного polling
```

**FSD:** изменения только внутри слоёв, не нарушают границы. Public API (`index.ts`) остаётся прежним — компоненты выше не знают о смене библиотеки.

---

## Шаг 1: Установка и удаление зависимостей

```bash
pnpm --filter react-happy-news-client add @tanstack/react-query @tanstack/react-query-devtools
pnpm --filter react-happy-news-client remove @reduxjs/toolkit react-redux
```

**Подводный камень:** проверь что `@tanstack/react-query-devtools` добавлен только в `devDependencies`.
Если попал в `dependencies` — перенеси вручную в `package.json`.

```bash
git add client/package.json pnpm-lock.yaml
git commit -m "build: #41 replace RTK Query+Redux with TanStack Query"
```

---

## Шаг 2: QueryClient

**Файл:** `client/src/shared/api/queryClient.ts`

```typescript
// import { QueryClient } from '@tanstack/react-query'
//
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 5 * 60 * 1000,   // 5 минут — данные считаются свежими
//       retry: 2,                    // 2 попытки при ошибке
//       refetchOnWindowFocus: false, // не перезапрашивать при возврате на вкладку
//     },
//   },
// })
//
// staleTime 5 минут соответствует текущему node-cache TTL на сервере.
// Пользователь не увидит лишних запросов при переключении вкладок.
```

**Подводный камень:** `staleTime: 0` (дефолт) означает что данные сразу устаревают —
каждый переход на главную будет делать новый запрос даже если кэш есть.

```bash
git add client/src/shared/api/queryClient.ts
git commit -m "feat: #41 QueryClient with staleTime matching server cache TTL"
```

---

## Шаг 3: newsQueries.ts

**Файл:** `client/src/entities/news/api/tanstack/newsQueries.ts`

```typescript
// import { useQuery, useMutation } from '@tanstack/react-query'
// import type { NewsDetailsData } from '../apiNews/utils/transforms.types'
// import type { components } from '@shared/api/openapi'
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL
//
// // Ключи запросов — массив, первый элемент — namespace
// export const newsKeys = {
//   list: (params: string) => ['news', 'list', params] as const,
//   detail: (id: string)   => ['news', 'detail', id] as const,
// }
//
// export function useGetNewsQuery(queryParams: string) {
//   return useQuery({
//     queryKey: newsKeys.list(queryParams),
//     queryFn: async () => {
//       const res = await fetch(`${BASE_URL}/api/news?${queryParams}`)
//       if (!res.ok) throw new Error('Failed to fetch news')
//       const data: components['schemas']['NewsListResponse'] = await res.json()
//       return data.news  // ← аналог transformResponse из RTK Query
//     },
//   })
// }
//
// export function useGetNewsDetailQuery(id: string) {
//   return useQuery({
//     queryKey: newsKeys.detail(id),
//     queryFn: async () => { ... },
//     enabled: Boolean(id),  // не запрашивать если id пустой
//   })
// }
//
// export function usePostFeedbackMutation() {
//   return useMutation({
//     mutationFn: async (body: FeedbackPayload) => { ... }
//   })
// }
```

**Подводный камень:** `queryKey` должен включать все переменные от которых зависит запрос.
`newsKeys.list(queryParams)` — queryParams меняется при смене фильтров → автоматически новый запрос.
Если забыть включить params в ключ — кэш будет всегда возвращать первый результат.

```bash
git add client/src/entities/news/api/tanstack/
git commit -m "feat: #41 newsQueries — useQuery/useMutation replacing RTK endpoints"
```

---

## Шаг 4: Обновить main.tsx и удалить store.ts

**Файл:** `client/src/app/main.tsx`

```typescript
// Удалить:
// import { Provider } from 'react-redux'
// import { store } from './store'
//
// Добавить:
// import { QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { queryClient } from '@shared/api/queryClient'
//
// Обернуть:
// <QueryClientProvider client={queryClient}>
//   ...приложение...
//   {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
// </QueryClientProvider>
//
// ReactQueryDevtools — только в dev (аналог того как мы исключили MSW из prod)
```

После этого удалить `client/src/app/store/store.ts` и всю папку `store/` если пуста.

**Подводный камень:** если где-то остался импорт из `react-redux` (useSelector, useDispatch) —
TypeScript сразу покажет ошибку. Это хороший сигнал что зависимость не удалена.

```bash
git add client/src/app/main.tsx
git rm client/src/app/store/store.ts
git commit -m "feat: #41 QueryClientProvider replaces Redux Provider, store.ts removed"
```

---

## Шаг 5: Упростить useHealthCheck.ts

**Файл:** `client/src/features/health-check/useHealthCheck.ts`

Текущая реализация — 60+ строк ручного polling:
- `useRef` для AbortController, isPolling, errorCount, timerId
- рекурсивный `setTimeout` с экспоненциальным backoff вручную
- ручная логика "не слать следующий запрос пока текущий не завершился"

TanStack Query заменяет всё это встроенными опциями:

```typescript
// export function useHealthCheck(): UseHealthCheckReturn {
//   const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null)
//
//   const { status: queryStatus } = useQuery({
//     queryKey: ['health'],
//     queryFn: async ({ signal }) => {
//       const res = await fetch(`${BASE_URL}/api/health`, { signal })
//       if (!res.ok) throw new Error('Server error')
//       return res.json()
//     },
//     refetchInterval: 30_000,   // polling каждые 30 секунд
//     retry: 3,                  // 3 попытки перед offline
//     retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000), // backoff
//   })
//
//   // queryStatus: 'pending' | 'success' | 'error'
//   // маппинг на HealthStatus: 'checking' | 'online' | 'offline'
// }
```

**Подводный камень:** TanStack Query не останавливает polling при потере сети — он продолжает
попытки согласно `retry`. `refetchOnReconnect: true` (дефолт) автоматически перезапросит
при восстановлении соединения. AbortController передаётся через `{ signal }` в `queryFn` — не нужно управлять вручную.

**Подводный камень:** `refetchInterval` работает только пока окно/вкладка активна.
При `refetchIntervalInBackground: false` (дефолт) polling приостанавливается когда вкладка скрыта.
Для health-check это приемлемо.

```bash
git add client/src/features/health-check/useHealthCheck.ts
git commit -m "feat: close #41 useHealthCheck — refetchInterval+retry replaces manual polling"
```

---

## Подводные камни

- **Public API barrel:** `entities/news/api/index.ts` экспортирует хуки. После миграции обнови экспорты — убери rtk-хуки, добавь tanstack-хуки. Компоненты выше должны импортировать из `@entities/news/api`, не из внутреннего пути.
- **Именование хуков:** RTK генерировал `useGetNewsQuery` автоматически. В TanStack Query называй руками — сохрани те же имена чтобы не менять вызывающий код.
- **`isFetching` vs `isPending`:** в TanStack Query v5 `isLoading` переименован в `isPending`. `isFetching: true` означает фоновый refetch (данные уже есть). `isPending: true` — первый запрос (данных нет). В `NewsFeed.tsx` используется `isInitialLoading || isFetching` — пересмотри логику.
- **MSW handlers:** `handlers.ts` использует `http.get` из MSW — он не зависит от RTK Query. После миграции MSW продолжает работать без изменений.
- **Тесты:** если тесты используют RTK `store` как часть провайдера — замени на `QueryClientProvider` с тестовым `queryClient`.
