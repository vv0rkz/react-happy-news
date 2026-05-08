# React Happy News — Релиз v2.1 — Positivity Stream

**Статус:** `in progress` (US 2.1.2 active)
**Ветка релиза:** `v2.1.0-*`
**Полный roadmap:** [ROADMAP.md](./ROADMAP.md)
**Покрытие:** 27 вопросов (45.3% нарастающим после v2.0)
**Оценка времени:** 3–4 дня

---

## Зачем

Лента оживает: новые позитивные новости появляются без перезагрузки. Пользователь видит, работает ли сервер. Может сортировать и искать по категориям.

---

## User Stories

### US 2.1.1: Live-счётчик читателей через SSE — ✅ DONE

- [x] Backend: sseManager — управление подключениями, heartbeat
- [x] Backend: readersTracker — per-article комнаты `Map<articleId, Set<clientId>>`
- [x] Backend: SSE endpoint `GET /api/news/readers?articleId=`
- [x] Frontend: `features/live-readers/useLiveReaders.ts` — EventSource подписка
- [x] Frontend: `features/live-readers/ReadersCount.tsx` — бейдж "● N читают сейчас"
- [x] Бейдж на детальной странице новости
- [x] При закрытии вкладки EventSource закрывается (cleanup + счётчик уменьшается)

### US 2.1.2: Health-check + Offline Mode — ✅ DONE

- [x] Polling `GET /api/health` каждые 30 сек
- [x] `StatusBadge` в Header — зелёный/красный автоматически (без ручного тогла)
- [x] Retry с exponential backoff (1с → 2с → 4с → 8с → max 30с)
- [x] При N ошибках подряд → offline mode (RTK-кэш + `OfflineBanner`)
- [x] `OfflineBanner` — "Нет связи с сервером. Показываем данные от HH:MM"
- [x] AbortController: отмена при навигации / unmount
- [x] Не отправлять следующий запрос пока текущий не завершился
- [x] Toast-уведомления при смене статуса online/offline

### US 2.1.3: Расширенный поиск + сортировка — 🔄 ACTIVE

- [ ] Debounced поле поиска (300мс)
- [ ] Фильтр по категории (Science, Technology, Culture...)
- [ ] Сортировка: по дате / по источнику
- [ ] Query-параметры на бэкенде: `?q=...&sort=...&category=...`

### US 2.1.4: Оптимизация рендеринга — ⏳ pending

- [ ] NewsItem обёрнут в `React.memo`
- [ ] `useMemo` для фильтрованного/отсортированного списка
- [ ] `useCallback` для стабилизации колбэков
- [ ] `react-window` для виртуализации при 100+ новостей
- [ ] React Profiler: замер до/после
- [ ] `React.lazy` + `Suspense` для страниц (code splitting)

---

## Закрываемые темы v2.1

**Backend (12):** Q10, Q59, Q61, Q62, Q63, Q64, Q65, Q66, Q67, Q68, Q82, Q90

**Frontend (15):** FQ15, FQ16, FQ20, FQ41, FQ42, FQ43, FQ44, FQ45, FQ46, FQ47, FQ48, FQ51, FQ52, FQ53, FQ54

---

## Следующий релиз

**v2.2 — Social & Engagement** (WebSocket, Live Reactions, Share)
