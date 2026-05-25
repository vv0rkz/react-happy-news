# Architecture governance (client)

Инструменты и команды для соблюдения [Module Map](./MODULE_MAP.md) и FSD без слоя `widgets`.

## Структура папок

```
client/src/
├── app/
│   ├── layout/Header/       # shell (title, health badge, theme, mock)
│   └── lib/health-check/    # server health UI
├── pages/
│   ├── Main/
│   │   ├── lib/             # useNewsFilterParams, categories
│   │   └── ui/              # SearchInput, SourceFilter, CategoryFilter, NewsFilterBar
│   └── NewsDetail/          # ReadersCount, useLiveReaders
├── features/                # extract only when 2+ consumers (см. ADR-001)
├── entities/news/
│   ├── api/
│   ├── helpers/
│   └── ui/
└── shared/
    ├── api/                 # core (Module Map)
    ├── config/
    ├── hooks/
    ├── lib/
    └── ui/
```

## Git hooks (solo-dev — основная линия обороны)

| Hook | Проверки | ~время |
| ---- | -------- | ------ |
| **pre-commit** | gen:barrels, fix:imports, lint-staged (eslint на staged ts/tsx) | 5–12 с |
| **pre-push** | type-check → lint:arch → arch:validate → test run → validate-branch | 30–60 с |

**Не в hooks:** knip (аудит по запросу), arch:report (advisory), full `pnpm lint` (warnings).

### Pre-push = будущий CI contract

Когда подключишь GitHub Actions — те же команды, что pre-push, плюс опционально `pnpm knip` (strict). См. комментарий в [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

## Команды

Из корня монорепо:

```bash
pnpm lint                              # ESLint (client)
pnpm lint:arch                         # boundaries, errors only
pnpm arch:validate                     # dependency-cruiser
pnpm arch:report                       # markdown + colocation hints
pnpm type-check
pnpm test run
pnpm knip:report                       # dead code audit, exit 0
pnpm knip                              # strict (CI позже)
```

`arch:report` → `docs/architecture/generated/report.md` (в `.gitignore`).

## Что проверяется

| Инструмент | Файл | Gate? |
| ---------- | ---- | ----- |
| ESLint boundaries | [architecture.config.js](../../client/eslint/architecture.config.js) | pre-push (`lint:arch`) |
| dependency-cruiser | [.dependency-cruiser.cjs](../../client/.dependency-cruiser.cjs) | pre-push |
| vitest | `client/` | pre-push |
| knip | [client/package.json](../../client/package.json) (`knip`) | audit only → [DEAD_CODE.md](./DEAD_CODE.md) |
| arch-report | [arch-report.mjs](../../client/scripts/arch-report.mjs) | advisory (colocation + misplaced features) |

Colocation rule (ADR-001): extract to `features/` only at **2+ consumers**. Не enforced ESLint; hints в arch-report.

## CI

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml): lint → lint:arch → arch:validate → type-check → test.

`knip` — добавить в CI после clean baseline (US 2.5.6).
