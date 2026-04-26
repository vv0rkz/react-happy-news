# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo with two packages:

- `client/` — React 19 + Vite 7 + TypeScript (strict), RTK Query, MSW, Vitest. Package name: `react-happy-news-client`.
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
pnpm type-check       # tsc --noEmit on client
pnpm test             # vitest on client
```

Run a single client test:

```bash
pnpm --filter react-happy-news-client exec vitest run path/to/file.test.tsx
# or watch a single file:
pnpm --filter react-happy-news-client exec vitest path/to/file.test.tsx
```

Server has no test runner configured; `pnpm --filter react-happy-news-server build` compiles with `tsc`.

## Environment variables

- `client/.env` → `VITE_API_BASE_URL` (points at the Express server, defaults `http://localhost:3001`). MSW handlers and RTK Query both read this.
- `server/.env` (see `server/.env.example`) → `PORT`, `GUARDIAN_API_KEY` / `GUARDIAN_BASE_URL`, `NEWSAPI_KEY` / `NEWSAPI_BASE_URL`, `HACKERNEWS_BASE_URL`. Missing keys will 500 the aggregator for that source only — the other sources still return data because of `Promise.allSettled`.

## Backend architecture (`server/src`)

- `index.ts` → `app.ts` (`createApp` — kept separate so tests can bootstrap without listening).
- `routes/news.routes.ts` — `GET /api/news` validates `?sources=` with a Zod enum, builds a sorted cache key, and calls `aggregateNews`. `GET /:id` is planned (TODOs in-file).
- `services/newsAggregator.ts` — single `SOURCES` array is the extension point; `Promise.allSettled` means one failing provider yields `sources: { name: 'error' }` in the response but does not abort the request. After aggregation, `utils/positivityFilter.isPositiveNews` applies a keyword-based negative→positive filter (negative keywords short-circuit first).
- `utils/cache.ts` — `node-cache` with 5min TTL, one shared instance. The news list and (planned) individual items both live here.
- `types/news.types.ts` — `SourceName` enum is the single source of truth for source identifiers; the client re-declares a mirror in `entities/news/api/apiNews/utils/transforms.types.ts`. Keep them in sync.

## Frontend architecture (`client/src`)

Feature-Sliced Design layers, imported via tsconfig path aliases (enforced; do not use deep relative paths):

```
app → pages → widgets → features → entities → shared
```

Aliases: `@app/*`, `@pages/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`, plus `@/*`. Lower layers must not import higher ones.

Key wiring:

- `app/main.tsx` boots MSW **only** when `import.meta.env.DEV` **and** `localStorage.happyNews_mockMode === 'true'`. Toggling the button in `widgets/Header` writes localStorage synchronously and calls `window.location.reload()` — MSW only starts on boot.
- `app/store/store.ts` registers `newsApi` reducer + middleware. All server IO goes through RTK Query; there is no separate thunks/slices layer.
- `entities/news/api/rtk/newsApi.ts` is the single RTK Query API. `baseUrl` is `VITE_API_BASE_URL`; endpoints hit `/api/news` and `/api/news/:id`. `transformResponse` unwraps `{ news: [...] }` for the list query.
- `app/mocks/handlers.ts` mirrors the server routes for MSW. The detail handler uses a wildcard because Guardian IDs contain slashes (`environment/2026/jan/14/...`) — see `entities/news/api/apiPaths.ts` for the `NEWS_MSW_PATTERNS` comment.
- `features/source-filter/useSourceFilter.ts` persists selected sources to localStorage (`news-sources`); `sourcesParam` is **sorted** before join so the server cache key matches regardless of click order. At least one source is always selected (the toggle refuses to remove the last one).

## Barrels are auto-generated — do not edit them

`client/scripts/gen-barrels.js` runs in the `pre-commit` hook and writes `index.ts` for every folder that contains `FolderName/FolderName.tsx`. `client/scripts/update-imports.js` runs next. Both are re-staged automatically. Don't hand-author barrel re-exports for that pattern; they'll be overwritten.

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

## Docs to read during a task

- `docs/CURRENT_INCREMENT.md` — **read first when starting work**. Contains the active User Story, step-by-step plan, exact git commands, and known pitfalls. Often has TODO comments in code files that mirror the steps here.
- `docs/CURRENT_RELEASE.md` — overall status of the in-progress release (which US are done / active).
- `docs/ROADMAP.md` — long-term plan (v2.0–v2.5).

When `CURRENT_INCREMENT.md` exists with a pending step and the corresponding file has matching `// TODO:` comments, those comments **are** the spec — follow them rather than inventing an alternative approach.

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
