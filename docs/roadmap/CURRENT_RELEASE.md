# React Happy News — Релиз v2.2 — Персонализация

**Статус:** `in progress`
**Ветка релиза:** `v2.2.0-auth`
**Полный roadmap:** [ROADMAP.md](./ROADMAP.md)
**Покрытие:** Auth, JWT, bcrypt, TanStack Query, React Router, RHF, безопасность
**Оценка времени:** 5–6 дней

> **Примечание:** порядок релизов скорректирован — Auth реализуется раньше WebSocket-реакций.
> WS-реакции (ранее v2.2) перенесены в v2.3 и будут привязаны к авторизованным пользователям.

---

## Зачем

Пользователь получает аккаунт: может сохранять новости в **избранное**, видеть персональную статистику позитивности и стрик. Все последующие фичи (WS-реакции, Premium) строятся на идентификации пользователя.

---

## User Stories

### US 2.2.1: Auth Foundation — 🔄 ACTIVE

**Текущий инкремент:** [CURRENT_INCREMENT.md](./CURRENT_INCREMENT.md) — **Client Session** (#2)  
**Полная спека:** [ROADMAP.md](./ROADMAP.md) — § US 2.2.1 (под-инкременты #1–#6)  
**Справочник:** [auth/AUTH_REFERENCE.md](./auth/AUTH_REFERENCE.md)

Auth split на 6 инкрементов (1 US = 1 `CURRENT_INCREMENT`):

| # | US | Содержание | Статус |
| - | -- | ---------- | ------ |
| 1 | 2.2.1 | Backend: schema, authService, routes | **done** |
| 2 | 2.2.1 | Client: authenticate + tokenMemory + apiFetch + AuthProvider | **active** |
| 3 | 2.2.4 | RHF + Zod forms | pending |
| 4 | 2.2.5 | ProtectedRoute + lazy Auth | pending |
| 5 | 2.2.6 | SameSite, abort on logout | pending |
| 6 | 2.2.10 | OAuth Google | pending |

### US 2.2.2: Избранное — ⏳ PENDING

- [ ] `POST /api/favorites` — сохранить
- [ ] `GET /api/favorites` — список
- [ ] `DELETE /api/favorites/:id` — удалить
- [ ] Кнопка "В избранное / Убрать" на карточке
- [ ] Страница `/favorites` со списком

### US 2.2.3: Positivity Tracker — ⏳ PENDING

- [ ] `POST /api/reading-history` — каждый просмотр статьи
- [ ] Страница `/dashboard`: прочитано за неделю / месяц
- [ ] Streak: "5 дней подряд позитивных новостей"
- [ ] Топ тем, которые вдохновляют

### US 2.2.4: Формы авторизации (RHF + Zod) — ⏳ PENDING

> Инкремент #3. Детали: [ROADMAP.md](./ROADMAP.md) — § US 2.2.4

### US 2.2.5: Protected Routes + Lazy Loading — ⏳ PENDING

> Инкремент #4. Детали: [ROADMAP.md](./ROADMAP.md) — § US 2.2.5

### US 2.2.6: Frontend Security — ⏳ PENDING

> Инкремент #5. Детали: [ROADMAP.md](./ROADMAP.md) — § US 2.2.6

### US 2.2.7: Email verification — ⏳ PENDING

- [ ] `users.email_verified` + `users.verify_token` (TTL 24ч)
- [ ] При регистрации — отправка письма (dev: лог в консоль)
- [ ] `GET /api/auth/verify-email?token=...`
- [ ] `POST /api/auth/resend-verification` — rate-limit 1 req/60s
- [ ] Банер "Подтвердите email" в Header

### US 2.2.8: Password reset — ⏳ PENDING

- [ ] `POST /api/auth/forgot-password` — всегда 200 (anti-enumeration)
- [ ] `POST /api/auth/reset-password` — валидация токена + bcrypt
- [ ] Страницы `/auth/forgot-password` и `/auth/reset-password`

### US 2.2.9: GDPR / Right to delete — ⏳ PENDING

- [ ] `DELETE /api/account` — каскадное удаление данных пользователя
- [ ] Подтверждение через пароль в UI

### US 2.2.10: OAuth — Войти через Google `[CORE]` — ⏳ PENDING

> Инкремент #6. Детали: [ROADMAP.md](./ROADMAP.md) — § US 2.2.10

---

## Закрываемые темы v2.2

**Backend:** JWT (access + refresh), bcrypt, httpOnly cookie, refresh-rotation, rate-limit auth endpoints
**Frontend:** TanStack Query, React Hook Form, Zod resolver, Protected Routes, React.lazy, useLayoutEffect, AbortController, Context + tokenMemory

---

## Следующий релиз

**v2.3 — Social & Engagement** (WS-реакции + anti-spam — для авторизованных пользователей) — после закрытия всех US этого релиза.

---

## Шаг ФИНАЛЬНЫЙ: Закрыть релиз

### 1. Записать демо-материалы

```bash
# Добавить в docs/demo/:
# v2.2.0.gif — регистрация, логин, избранное, дашборд
ls docs/demo/v2.2.0.gif
```

### 2. Сгенерировать CHANGELOG + тег + поднять версию

```bash
npm run _ release
```

### 3. Запушить тег + создать GitHub Release

```bash
npm run _ push-release
```

### 4. Обновить документацию

```bash
# CURRENT_RELEASE.md → статус DONE
# CURRENT_INCREMENT.md → первый US v2.3 (WS-реакции)
git add docs/
git commit -m "docs: v2.2.0 released"
```
