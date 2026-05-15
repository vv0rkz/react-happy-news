# US 2.1.8 — Виртуализация ленты

**Статус:** `active` 🔒 ЗАБЛОКИРОВАН
**Релиз:** [CURRENT_RELEASE.md](./CURRENT_RELEASE.md)
**Issue:** TBD
**Покрывает вопросы:** FQ44 (виртуализация)

**Acceptance Criteria:**

- [ ] MSW seed: генератор 500+ новостей для demo-режима
- [ ] Profiler без виртуализации: зафиксировать frame drops при скролле 500+ элементов
- [ ] Установить `react-window`, обернуть `NewsList`
- [ ] Profiler после: убедиться в 60fps

---

## Концепция

```
Сейчас:
  NewsList рендерит все элементы сразу
  При 50–100 новостях — ок
  При 200+ — начинаются frame drops при скролле

После:
  react-window VariableSizeList / FixedSizeList
  DOM содержит только видимые + overscan элементы
  60fps при 500+ элементах
```

**Блокер:** US открывается когда выполнено одно из условий:
- SQLite накопил 200+ записей (органически, после US 2.1.6)
- MSW seed генерирует 500+ элементов (первый шаг этого US)

---

## Git

**Ветка:** `v2.1.0-live-sse-feed` (продолжаем в той же ветке)
**Issue:** TBD

---

## Архитектура

```
client/src/
├── entities/news/api/apiNews/mocks/
│   └── newsData.json              ← ИЗМЕНИТЬ: seed 500+ новостей (генератор)
├── pages/Main/
│   └── NewsList/
│       └── NewsList.tsx           ← ИЗМЕНИТЬ: обернуть в react-window
└── shared/
    └── VirtualList/ (опционально) ← НОВЫЙ: абстракция над react-window
```

---

## Шаг 1: MSW seed

Написать скрипт или inline-генератор в `newsData.json` → 500+ элементов.
Варианты:
- `scripts/gen-mock-news.js` → записывает `newsData.json`
- Или генерировать прямо в `handlers.ts` через `Array.from({ length: 500 }, ...)`

---

## Шаг 2: Профилирование без виртуализации

React DevTools Profiler → записать рендер при скролле 500 элементов.
Зафиксировать: среднее время фрейма, количество dropped frames.

---

## Шаг 3: Установить react-window

```bash
pnpm --filter react-happy-news-client add react-window
pnpm --filter react-happy-news-client add -D @types/react-window
```

Обернуть `NewsList` в `FixedSizeList` (если карточки одинаковой высоты)
или `VariableSizeList` (если разная высота).

---

## Шаг 4: Профилирование после

Повторить замер — убедиться в 60fps.

---

## Подводные камни

- **`react-window` требует фиксированной высоты контейнера** — нужно задать `height` в px или vh
- **CSS Modules + виртуализация** — стили применяются к элементу, а не к контейнеру списка
- **Infinite scroll** — если появится пагинация, `react-window` + `react-window-infinite-loader`
- **`VariableSizeList` медленнее** `FixedSizeList` — начать с Fixed, перейти к Variable только если нужно
