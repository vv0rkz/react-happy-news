# ШАБЛОН: CURRENT_RELEASE.md

> Скопируй этот файл в CURRENT_RELEASE.md, заполни по инструкции ниже.
> Удали все строки с `>` перед коммитом.

---

# React Happy News — Релиз vX.X — [Название релиза]

> Название — краткая тема релиза: "Positivity Stream", "Social & Engagement", "Auth & Profiles"...

**Статус:** `in progress`
**Ветка релиза:** `vX.X.0-*`
**Полный roadmap:** [ROADMAP.md](./ROADMAP.md)
**Покрытие:** N вопросов (XX% нарастающим после vX.X) + новые US X.X.Y–X.X.Z
**Оценка времени:** N–M дней

---

## Зачем

> Одно-два предложения: что меняется для пользователя после этого релиза.

---

## User Stories

> Один блок на каждый US. Добавляй по ходе работы по мере написания CURRENT_INCREMENT.md.

### US X.X.1: [Название] — 🔄 ACTIVE

- [ ] ...
- [ ] ...

### US X.X.2: [Название] — ⏳ PENDING

- [ ] ...

> Статусы: 🔄 ACTIVE (текущий инкремент), ⏳ PENDING (ещё не начат), ✅ DONE (завершён)

---

## Закрываемые темы vX.X

> Берутся из ROADMAP.md → раздел соответствующего релиза.

**Backend (N):** QXX, QXX, ...

**Frontend (N):** FQXX, FQXX, ...

---

## Следующий релиз

**vX.Y — [Название]** ([краткое описание]) — после закрытия всех US этого релиза

---

## Шаг ФИНАЛЬНЫЙ: Закрыть релиз

> Выполняется когда все US выше помечены ✅ DONE.

### 1. Записать демо-материалы

Добавить в `docs/demo/`:

- `vX.X.0.gif` — запись новых фич в действии (обязательно)
- `vX.X.0.png` — опционально: если нет, `update-readme` сгенерирует PNG из первого кадра GIF через `sharp` автоматически

> `npm run _ release` проверяет наличие хотя бы одного из форматов (`gif` или `png`).
> Достаточно только GIF — PNG будет создан автоматически.
> Рекомендуемые инструменты: ShareX / LICEcap (Windows), Kap (macOS).

```bash
# Убедиться, что GIF на месте:
ls docs/demo/vX.X.0.gif
```

### 2. Сгенерировать CHANGELOG + тег + поднять версию

```bash
npm run _ release
```

Что происходит:
- `changelogen` читает коммиты с последнего тега → пишет секцию в `CHANGELOG.md`
- `package.json` `version` поднимается по semver (feat → minor, fix/refactor → patch)
- Создаётся локальный git-тег `vX.X.0`
- README обновляется ссылками на демо

### 3. Запушить тег + создать GitHub Release

```bash
npm run _ push-release
```

Что происходит:
- Пушится ветка + тег (`--follow-tags`)
- Создаётся PR в main (`gh pr create`)
- PR автоматически мержится (`gh pr merge --merge`)

### 4. Обновить документацию

```bash
# CURRENT_RELEASE.md — сменить статус и добавить ссылку на GitHub Release:
# **Статус:** `DONE` — [GitHub Release vX.X.0](https://github.com/vv0rkz/react-happy-news/releases/tag/vX.X.0)

# CURRENT_INCREMENT.md — переключить на первый US следующего релиза
# (по шаблону INCREMENT_TEMPLATE.md)

git add docs/
git commit -m "docs: vX.X.0 released"
```

> Шаг 3 (`push-release`) уже создаёт PR и мержит ветку в main — дополнительный `git merge` не нужен.
