# Dead code policy (client)

Knip = **аудитор**, не блокер commit/push. Политика triage перед удалением.

## Команды

```bash
pnpm knip:report   # отчёт, exit 0 — для регулярного аудита
pnpm knip          # strict, exit 1 при findings — для CI (когда подключишь)
```

## Triage A / B / C

| Уровень | Критерий | Действие |
| ------- | -------- | -------- |
| **A — безопасно удалить** | knip unused + нет пункта в CURRENT_INCREMENT + файл не свежий задел | chore delete |
| **B — задел под US** | код в roadmap, скоро подключится | `client/package.json` → `knip.ignore` + коммент `# US x.x` в этом файле |
| **C — неясно** | «может пригодится» | `git log -1 -- path` + подождать 30–60 дней |

## Перед удалением (уровень A)

```bash
git log -1 --format="%ci %s" -- path/to/file.tsx
git log -S "SymbolName" --oneline -- client/src
```

**Не удалять** только по одному knip finding.

## Текущие ignore (уровень B)

| Путь | Причина |
| ---- | ------- |
| `src/features/feedback/**` | US feedback — форма не подключена к роуту |
| `usePostFeedbackMutation` export | задел FeedbackForm — см. `knip.ignoreIssues` в `client/package.json` |

**Pre-existing (triage C — не удалять без review):** `apiPaths.ts`, `Toast/` — проверить `git log` перед решением.

Обновляй таблицу при triage после `pnpm knip:report`.

## Когда гонять knip

- после большого refactor / AI-сессии
- перед release / tag
- **не** каждый commit/push

См. также [GOVERNANCE.md](./GOVERNANCE.md) — git hooks.
