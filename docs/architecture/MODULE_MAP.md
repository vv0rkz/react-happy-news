# Module Map — React Happy News (frontend)

> Living diagram. Без аналогий — только модули и зависимости.
> Решение зафиксировано в [ADR-001](../roadmap/ADR-001-frontend-module-map.md).

## Принцип

**Module Map lite** — не strict flat FSD, не DDD. Четыре домена + `app` shell.

**Colocation rule:** код живёт рядом с страницей (`pages/Feature/`). Extract в `features/` — только если используется из **2+** мест.

## Модули

```mermaid
flowchart TB
  subgraph appShell [app]
    router["router.tsx"]
    ProtectedRoute["ProtectedRoute"]
    providers["providers/"]
    layoutHeader["layout/Header"]
    healthCheck["lib/health-check"]
  end

  subgraph core [core]
    apiFetch["shared/api/apiFetch.ts"]
    queryClient["shared/api/queryClient.ts"]
    authSchemas["shared/api/authSchemas.ts"]
  end

  subgraph auth [auth]
    AuthProvider["providers/AuthProvider.tsx"]
    tokenMemory["pages/Auth/lib/tokenMemory.ts"]
    authPages["pages/Auth/*"]
  end

  subgraph catalog [catalog]
    newsApi["entities/news/api/"]
    newsUi["entities/news/ui/"]
  end

  subgraph engagement [engagement]
    favorites["pages/Favorites/ — US 2.2.2"]
    dashboard["pages/Dashboard/ — US 2.2.3"]
  end

  subgraph catalogPages [catalog pages]
    mainFilters["pages/Main/lib + ui"]
    newsDetail["pages/NewsDetail/"]
  end

  appShell --> auth
  appShell --> catalog
  appShell --> engagement
  auth --> core
  catalog --> core
  engagement --> core
  engagement --> auth
```

| Модуль | Ответственность | Ключевые пути |
| ------ | --------------- | ------------- |
| **core** | HTTP, query client, shared Zod schemas | `shared/api/` |
| **auth** | Сессия, forms, tokenMemory | `pages/Auth/`, `app/providers/AuthProvider.tsx` |
| **catalog** | Новости, фильтры, деталь | `entities/news/api/`, `entities/news/ui/`, `pages/Main/` (lib + ui), `pages/NewsDetail/` |
| **engagement** | Избранное, tracker, streak | `pages/Favorites/`, `pages/Dashboard/` |
| **app** | Router, layout, health, providers, MSW boot | `app/`, `app/layout/Header/`, `app/lib/health-check/` |

## Зависимости (правила)

1. `catalog` и `engagement` → `core` (apiFetch)
2. `engagement` → `auth` (protected routes, user id)
3. `auth` → `core` (apiFetch, schemas)
4. `app` → все модули (wiring only)
5. **Запрещено:** `core` → `auth` / `catalog` / `engagement`

## Физическая раскладка `shared`

| Подпапка | Назначение |
| -------- | ---------- |
| `shared/api/` | **core** — HTTP, QueryClient, OpenAPI |
| `shared/config/` | routes и прочий config |
| `shared/hooks/` | доменно-нейтральные хуки |
| `shared/lib/` | чистые утилиты (`formatTimeAgo`) |
| `shared/ui/` | UI-kit без бизнес-логики |

Слой `widgets/` **не используется** — shell в `app/layout/`.

## FSD aliases (совместимость)

Tsconfig aliases (`@app`, `@pages`, `@features`, `@entities`, `@shared`) остаются. Слои: `app → pages → features → entities → shared` (без `widgets`). Module Map — **логическая** группировка поверх физических папок.

## Enforcement

Автопроверки: [GOVERNANCE.md](./GOVERNANCE.md) — `pnpm lint:arch`, `pnpm arch:validate`, `pnpm arch:report`.

## Backend (кратко)

```
server/src/
├── routes/auth.routes.ts      — auth module
├── routes/news.routes.ts      — catalog module
├── routes/favorites.routes.ts — engagement (US 2.2.2)
└── middleware/authenticate.ts — auth → catalog/engagement
```

## Changelog

| Дата | Изменение |
| ---- | --------- |
| 2026-05 | Initial Module Map lite (Auth Foundation docs v5) |
| 2026-05 | Physical layout: `app/layout/Header`, `entities/news/ui`, `shared/{hooks,ui,lib}`; ESLint + dep-cruiser |
| 2026-05 | Colocation: catalog filters → `pages/Main/`; health → `app/lib/health-check/`; live-readers → `pages/NewsDetail/` |
