# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo with two packages:

- `client/` — React 19 + Vite 7 + TypeScript (strict), TanStack Query, MSW, Vitest. Package name: `react-happy-news-client`.
- `server/` — Express + TypeScript + `node-cache`, aggregates Guardian / NewsAPI / HackerNews. Package name: `react-happy-news-server`.

All root scripts proxy into workspaces via `pnpm --filter`.

## Commands

From the repo root (use pnpm — the lockfile is `pnpm-lock.yaml`):

```bash
pnpm dev              # runs server + client concurrently
pnpm dev:client       # Vite dev server (5173)
pnpm dev:server       # Express with tsx watch (3001)
pnpm build:client
pnpm lint             # eslint on client
pnpm lint:arch        # eslint boundaries only (errors)
pnpm arch:lint        # folder convention + colocation (client)
pnpm arch:validate    # dependency-cruiser (client)
pnpm arch:report      # docs/architecture/generated/report.md
pnpm type-check       # tsc --noEmit on client
pnpm test             # vitest on client
pnpm knip             # dead code (strict)
pnpm knip:report      # dead code audit, exit 0

# OpenAPI-клиентские типы (`client/src/shared/api/openapi.{json,d.ts}`)
pnpm gen:openapi      # пересобрать .d.ts из закоммиченного openapi.json (без сервера)
pnpm gen:openapi:sync  # скачать spec с http://localhost:3001 + обновить json и d.ts (нужен запущенный сервер)
```

Run a single client test:

```bash
pnpm --filter react-happy-news-client exec vitest run path/to/file.test.tsx
# or watch a single file:
pnpm --filter react-happy-news-client exec vitest path/to/file.test.tsx
```

Server has no test runner configured; `pnpm --filter react-happy-news-server build` compiles with `tsc`.

## Environment variables

- `client/.env` → `VITE_API_BASE_URL` (points at the Express server, defaults `http://localhost:3001`). MSW handlers and TanStack Query both read this.
- `server/.env` (see `server/.env.example`) → `PORT`, `GUARDIAN_API_KEY` / `GUARDIAN_BASE_URL`, `NEWSAPI_KEY` / `NEWSAPI_BASE_URL`, `HACKERNEWS_BASE_URL`. Missing keys will 500 the aggregator for that source only — the other sources still return data because of `Promise.allSettled`.

## Backend architecture (`server/src`)

- `index.ts` → `app.ts` (`createApp` — kept separate so tests can bootstrap without listening).
- `routes/news.routes.ts` — `GET /api/news` validates `?sources=` with a Zod enum, builds a sorted cache key, and calls `aggregateNews`. `GET /:id` is planned (TODOs in-file).
- `services/newsAggregator.ts` — single `SOURCES` array is the extension point; `Promise.allSettled` means one failing provider yields `sources: { name: 'error' }` in the response but does not abort the request. After aggregation, `utils/positivityFilter.isPositiveNews` applies a keyword-based negative→positive filter (negative keywords short-circuit first).
- `utils/cache.ts` — `node-cache` with 5min TTL, one shared instance. The news list and (planned) individual items both live here.
- `types/news.types.ts` — `SourceName` enum is the single source of truth for source identifiers; the client re-declares a mirror in `model/news/api/apiNews/utils/transforms.types.ts`. Keep them in sync.

## Frontend architecture (`client/src`)

Feature-Sliced Design layers, imported via tsconfig path aliases (enforced; do not use deep relative paths):

```
app → pages → features → model → shared
```

Physical layout: `app/layout/Header` (shell), `app/lib/health-check`, `pages/Main/{lib,components}` (catalog filters), `model/news/{api,components,lib}`, `shared/{api,config,components,lib}`. Details: `docs/architecture/MODULE_MAP.md`, enforcement: `docs/architecture/GOVERNANCE.md`.

Aliases: `@app/*`, `@pages/*`, `@features/*`, `@model/*`, `@shared/*`, plus `@/*`. Lower layers must not import higher ones. Enforced by ESLint `eslint-plugin-boundaries` + dependency-cruiser.

Key wiring:

- `app/main.tsx` boots MSW **only** when `import.meta.env.DEV` **and** `localStorage.happyNews_mockMode === 'true'`. Toggling the button in `app/layout/Header` writes localStorage synchronously and calls `window.location.reload()` — MSW only starts on boot.
- `app/main.tsx` wraps the app in `QueryClientProvider` (`shared/api/queryClient.ts`). All server IO goes through TanStack Query hooks; auth session is **not** in the query cache (see `shared/api/apiFetch.ts` + `features/auth/tokenMemory.ts`).
- `model/news/api/tanstack/newsQueries.ts` — news list/detail/feedback hooks. Uses `shared/api/apiFetch.ts` for fetch + 401 refresh. `VITE_API_BASE_URL`; endpoints hit `/api/news` and `/api/news/:id`.
- `app/mocks/handlers.ts` mirrors the server routes for MSW. The detail handler uses a wildcard because Guardian IDs contain slashes (`environment/2026/jan/14/...`) — see `model/news/api/apiPaths.ts` for the `NEWS_MSW_PATTERNS` comment.
- `pages/Main/lib/useNewsFilterParams.ts` — URL state for catalog filters (`sources`, `q`, `category`); widgets in `pages/Main/components/` (SearchInput, SourceFilter, CategoryFilter, NewsFilterBar). Header is shell only (no filters).
- `app/lib/health-check/` — `useHealthCheck`; widgets in `components/StatusBadge`, `OfflineBanner` (used by App + Header).
- `pages/NewsDetail/components/ReadersCount/` — ReadersCount + `useLiveReaders.ts` (live SSE counter).

## Barrels are auto-generated — do not edit them

`client/scripts/gen-barrels.js` runs in the `pre-commit` hook and writes `index.ts` for every folder that contains `FolderName/FolderName.tsx`. `client/scripts/update-imports.js` runs next. Then **lint-staged** (eslint on staged ts/tsx). Both barrel scripts re-stage automatically. Don't hand-author barrel re-exports for that pattern; they'll be overwritten.

## Git hooks (quality gates)

- **pre-commit:** gen:barrels → fix:imports → lint-staged
- **pre-push:** type-check → lint:arch → arch:validate → test run → validate-branch

Knip (`pnpm knip:report`) — audit before release, not in hooks. Policy: `docs/architecture/DEAD_CODE.md`.

## TypeScript config notes

`client/tsconfig.json` has `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, and `isolatedModules` enabled. In practice: always narrow array-index access, and always use `import type` for type-only imports.

## Workflow (jst / js-template)

The repo is managed by `@vv0rkz/js-template`. All operational commands go through `npm run _` (alias for `jst`):

```bash
npm run _ create-task "Title"   # creates a GitHub issue with 'task' label
npm run _ create-bug  "Title"
npm run _ release               # changelogen + README auto-update + tag
npm run _ push-release
```

- **Branch name** must match `v{version}-{name}` (e.g. `v2.3.0-normalize-numbers`) — `pre-push` enforces this.
- **Commit format** is commitlint + `jst` validated in `commit-msg`. `feat` and `fix` **require an issue reference**: `feat: #9 добавлена нормализация чисел`. Use `close` to auto-close: `feat: close #9 ...`. Other types (`refactor`, `perf`, `chore`, `docs`, `build`) are free-form.

## Frontend Module Map (lite)

Logical modules (not strict flat FSD): `core` / `auth` / `catalog` / `engagement`. Living diagram: `docs/architecture/MODULE_MAP.md`, ADR: `docs/architecture/ADR-001-frontend-module-map.md`.

- **Colocation:** code lives in `pages/Feature/`; extract to `features/` only when used from 2+ places.
- **Auth:** `pages/Auth/lib/tokenMemory.ts`, `app/providers/AuthProvider.tsx`, `shared/api/apiFetch.ts`.
- **Terminology:** UI/docs — **избранное**; code/API — **favorites** (not bookmarks).
- **Docs analogies:** airport domain only in increment «На пальцах» — see `docs/roadmap/guides/ANALOGY_GUIDE.md`.

## Docs to read during a task

1. `docs/roadmap/CURRENT_INCREMENT.md` — **read first**. Active US: WIP-прогресс + **На схеме**, **Практика**, **Проверка и тесты**, **Запуск**.
2. `docs/roadmap/CURRENT_RELEASE.md` — **полная спека релиза**: AC, типы, Практика, проверки для всех US v2.2.
3. `docs/roadmap/guides/PRACTICE_MODE.md` — правила Practice (код + тесты); US не done без пройденной проверки.
4. `docs/roadmap/auth/AUTH_REFERENCE.md` — **один раз** при старте auth (аналогии, research, архитектура).
5. `docs/roadmap/ROADMAP.md` — long-term plan only (обзор релизов, без Practice-блоков).
6. `docs/roadmap/guides/ANALOGY_GUIDE.md` — checklist «На пальцах».
7. `docs/roadmap/guides/TOKENS_AND_JWT.md` — при путанице access / refresh / JWT (не обязателен каждый US).

**Правило:** 1 US = 1 `CURRENT_INCREMENT` (~200–280 строк). **Проверка и тесты обязательны** — минимум ручной чеклист; client auto с US #2.

When `CURRENT_INCREMENT.md` has Practice blocks and matching `// TODO(increment-...):` in code, those **are** the spec. **Do not mark US complete** until «Проверка и тесты» checklists are done. In teaching mode, help write tests — do not skip verification.

## Teaching Mode (default behaviour)

This project is a learning workspace. **When the user asks for help implementing something, do not write the full code.** Instead respond with:

1. Architecture — which FSD layer, file path, relationship to other modules.
2. TypeScript signatures / interfaces.
3. Pseudocode comments inside the function or component bodies (step-by-step hints).
4. Pitfalls — edge cases, ordering constraints, common mistakes.

Only write the full implementation when the user explicitly asks: phrases like "сделай за меня", "do it for me", "implement it", "ok сделай". Clarifying questions, refactors at the user's request, and fixing your own output do not need this gate.

## Initiative Reset on Context Transitions

When the user says "идем дальше", "let's move on", "next step" or similar context-transition phrases **after you've completed a teaching-mode guide**, reset your initiative:

- Do NOT automatically start implementing the next step
- Do NOT provide unsolicited code suggestions for the next task
- Wait for explicit instructions: "реализуй [X]", "сделай за меня", "implement", or direct task assignment

This keeps the learning loop interactive and respects the user's pace.
