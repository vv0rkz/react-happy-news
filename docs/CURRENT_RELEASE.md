# React Happy News — Релиз v2.1 — Positivity Stream

**Статус:** `in progress` (US 2.1.1 active)
**Ветка релиза:** `v2.1.0-*`
**Полный roadmap:** [ROADMAP.md](./ROADMAP.md)
**Покрытие:** 27 вопросов (45.3% нарастающим после v2.0)
**Оценка времени:** 3–4 дня

---

## Зачем

Лента оживает: новые позитивные новости появляются без перезагрузки. Пользователь видит, работает ли сервер. Может сортировать и искать по категориям.

---

## User Stories

### US 2.1.1: Live-лента через SSE — 🔄 ACTIVE

- [ ] Backend: cron каждые 5 минут фетчит свежие новости
- [ ] Backend: SSE endpoint `GET /api/news/stream`
- [ ] Backend: sseManager — управление подключениями, heartbeat
- [ ] Frontend: `features/live-news/` — `useLiveNews.ts`, `LiveIndicator.tsx`
- [ ] Новая новость плавно появляется вверху ленты
- [ ] `Live ●` индикатор когда SSE-соединение активно
- [ ] При закрытии вкладки EventSource закрывается (cleanup)

### US 2.1.2: Polling health-check + retry — ⏳ pending

- [ ] Polling `GET /api/health` каждые 30 сек
- [ ] Зелёный/красный индикатор в header
- [ ] Retry с exponential backoff (1с → 2с → 4с → 8с → max 30с)
- [ ] При N ошибках → "offline mode" (кэшированные данные)
- [ ] При восстановлении → автоматический refetch
- [ ] AbortController: отмена при навигации
- [ ] Не отправлять следующий запрос пока текущий не завершился

### US 2.1.3: Расширенный поиск + сортировка — ⏳ pending

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

**v2.2 — Social & Engagement** (WebSocket, Live Readers, Share)
