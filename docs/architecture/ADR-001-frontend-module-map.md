# ADR-001: Frontend Module Map lite

**Статус:** Accepted  
**Дата:** 2026-05  
**Контекст:** US 2.2.1 Auth Foundation (mega-increment)

## Проблема

Strict Feature-Sliced Design с плоским `features/*` для каждой US даёт boilerplate в учебном проекте. Strict DDD — overkill. Нужен баланс: portfolio-ready структура без выгорания.

## Решение

**Module Map lite** — четыре домена:

- `core` — HTTP, query client, shared validation
- `auth` — сессия, forms, tokenMemory (colocation в `pages/Auth/`)
- `catalog` — новости
- `engagement` — избранное, tracker, streak

**Colocation rule:** extract to `features/` при **2+ consumer zones**; код в `shared/` — только при **2+ zones**, иначе colocate.

**Auth paths:**

- `pages/Auth/lib/tokenMemory.ts`
- `app/providers/AuthProvider.tsx`
- `shared/api/apiFetch.ts` (alias `core/http/` при будущем рефакторе)

## Альтернативы

| # | Подход | Σ (weighted) | Итог |
| - | ------ | ------------ | ---- |
| 1 | Module Map lite | 8.5 | **Выбрано** |
| 2 | Colocation-only (no named modules) | 8.0 | Допустимо, но хуже для onboarding |
| 3 | Flat FSD `features/*` | 6.5 | Отклонено — лишние папки |

## Физические пути (client)

- Shell: `app/layout/Header/` (не `widgets/`)
- Pages: `pages/<Page>/{lib,components}/` — page VM в `lib/`, widgets в `components/<Name>/`
- Catalog: `model/news/{api,components,lib}/`
- Shared: `shared/api/` (core), `shared/config/`, `shared/components/`, `shared/lib/`
- Запрещённые segments: `ui/`, `hooks/`, `helpers/`, `widgets/`

## Последствия

- Living diagram: [MODULE_MAP.md](./MODULE_MAP.md)
- Enforcement: [GOVERNANCE.md](./GOVERNANCE.md) — ESLint `boundaries`, **arch:lint**, dependency-cruiser, `arch:report`
- `CURRENT_INCREMENT.md` — диаграммы Module Map, не FSD-слои
- US 2.2.2 Избранное: `pages/Favorites/` или `features/favorites/` при 2+ consumers
- Терминология UI: **избранное**; API/code: **favorites**

## Связанные документы

- [CURRENT_INCREMENT.md](../roadmap/CURRENT_INCREMENT.md)
- [ANALOGY_GUIDE.md](../roadmap/guides/ANALOGY_GUIDE.md) — аналогии отдельно от архитектуры
