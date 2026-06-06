# ШАБЛОН: CURRENT_RELEASE.md

> Скопируй этот файл в CURRENT_RELEASE.md при старте нового релиза.
> Удали все строки с `>` перед коммитом.
> **ROADMAP** — только long-term overview; **полная спека релиза** живёт здесь.

---

# React Happy News — Релиз vX.X — [Название релиза]

**Статус:** `in progress`
**Ветка релиза:** `vX.X.0-*`
**Long-term roadmap:** [ROADMAP.md](./ROADMAP.md) — обзор релизов
**Рабочий инкремент:** [CURRENT_INCREMENT.md](./CURRENT_INCREMENT.md) — активный шаг + WIP
**Покрытие:** …
**Оценка времени:** N–M дней

---

## Зачем

> Одно-два предложения: что меняется для пользователя после этого релиза.

---

## Структура релиза

| Фаза | US | Когда | Статус |
| ---- | -- | ----- | ------ |
| … | … | … | … |

**Текущий инкремент:** [CURRENT_INCREMENT.md](./CURRENT_INCREMENT.md)

---

## Фаза 1: [Название фазы]

<a id="us-x-x-x"></a>
### US X.X.X: [Название]

**Статус:** `pending` | `active` | `done`
**Предусловие:** …

#### Acceptance Criteria

- [ ] …

> **Не в этом US:** …

#### На схеме

| Файл | Действие |
| ---- | -------- |
| `file.ts` | новый / изменить |

#### Практика

> Сигнатуры, типы, `//` шаги — см. [PRACTICE_MODE.md](./guides/PRACTICE_MODE.md)

```typescript
export type Example = { … }

export function example() {
  // Шаг 1: …
}
```

#### Проверка и тесты

| # | Input | Output |
| - | ----- | ------ |
| 1 | … | … |

- [ ] ручная проверка
- [ ] vitest (если применимо)

#### Запуск

```bash
pnpm dev
```

---

## Не в scope vX.X (superseded / optional)

| US | Статус | Причина |
| -- | ------ | ------- |
| … | … | … |

---

## Закрываемые темы vX.X

**Backend:** …

**Frontend:** …

---

## Следующий релиз

**vX.Y — [Название]** — после закрытия всех US этого релиза

---

## Шаг ФИНАЛЬНЫЙ: Закрыть релиз

### 1. Демо

```bash
ls docs/demo/vX.X.0.gif
```

### 2. CHANGELOG + тег

```bash
npm run _ release
```

### 3. Push + GitHub Release

```bash
npm run _ push-release
```

### 4. Документация

```bash
# CURRENT_RELEASE.md → DONE
# CURRENT_INCREMENT.md → первый US vX.Y
# ROADMAP.md → обновить таблицу статусов US (без Practice)
git add docs/
git commit -m "docs: vX.X.0 released"
```

---

## Достаточность материалов (аудит)

| US | AC | На схеме | Практика | Проверка | Запуск |
| -- | -- | -------- | -------- | -------- | ------ |
| … | … | … | … | … | … |
