# ADR: Managed Identity Provider (US 2.2.13)

**Статус:** `proposed` — **Decision: TBD** (выбор провайдера в инкременте #6a)  
**Дата:** 2026-05-28  
**Контекст:** [CURRENT_RELEASE.md](../CURRENT_RELEASE.md) — auth-трек #6  
**Issue:** [#74](https://github.com/vv0rkz/react-happy-news/issues/74)  
**Инкременты:** [US-2.2.13-6a-adr.md](./increments/US-2.2.13-6a-adr.md) | [US-2.2.13-6b-migrate.md](./increments/US-2.2.13-6b-migrate.md)

---

## Context

Happy News: **Vite React 19 SPA** + **Express** + **SQLite**. Собственный auth (#1 done): `authService`, JWT access + refresh rotation, [`routes/auth/`](../../../server/src/routes/auth/).

**Проблема:** US 2.2.7 (email verify), 2.2.8 (password reset), 2.2.10 (passport Google) — много security-обвязки для pet-проекта.

**Решение v2.2:** инкремент **#6** — managed identity вместо passport OAuth; #2–#5 остаются на **своём JWT** для учёбы «по ниточке».

---

## Decision drivers

| Критерий | Вес |
|----------|-----|
| Fit Express + SQLite (без смены news API) | высокий |
| Vite SPA DX | высокий |
| Google OAuth без passport | высокий |
| Email verify + password reset без своего SMTP | средний |
| Free tier / $0 pet | средний |
| Нет pause всего проекта (Supabase) | средний |
| Учебная прозрачность токенов | средний |
| Сигнал «как в проде» (резюме) | низкий |

---

## Options considered

| ID | Вариант | Тип |
|----|---------|-----|
| **0** | DIY — довести 2.2.7, 2.2.8, 2.2.10 | Самописный |
| 1 | **Clerk** | Managed, React-first |
| 2 | **Auth0** | Managed, enterprise OIDC |
| 3 | Supabase Auth | BaaS (Auth + Postgres) |
| 4 | Firebase Auth | Google BaaS |
| 5 | Keycloak | Self-hosted OIDC |
| 6 | Auth.js | Отклонён для Vite SPA (заточен под Next) |

---

## Scoring matrix (1–5)

| | **0 DIY** | **Clerk** | **Auth0** | **Supabase** | **Firebase** | **Keycloak** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Express + SQLite | 5 | 4 | 4 | 2 | 3 | 4 |
| Vite SPA DX | 5 | 5 | 4 | 4 | 4 | 2 |
| Google без passport | 1* | 5 | 5 | 5 | 5 | 4 |
| Verify/reset без кода | 1* | 5 | 5 | 4 | 4 | 4 |
| Free pet | 5 | 5 | 4 | 4 | 5 | 3 |
| No project sleep | 5** | 5 | 5 | 1 | 4 | 5*** |
| Учёба (ниточка) | 5 | 3 | 3 | 3 | 2 | 4 |
| Prod / resume | 3 | 4 | 5 | 4 | 4 | 5 |
| Already in repo | 5 | 0 | 0 | 0 | 0 | 0 |
| **Σ** | **35** | **36** | **35** | **27** | **31** | **31** |

\* Нужны US 2.2.7, 2.2.8, 2.2.10 (~3–5 дн. после #5).  
\** Pause только если сервер не запущен.  
\*** Ops: Docker, свой OIDC endpoint.

### Ранжирование (v2.2)

1. **Clerk** — default, если не передумали в 6a  
2. DIY + только 2.2.10  
3. Auth0  
4. Firebase  
5. Keycloak  
6. Supabase — **отклонён**: SQLite + Express + pause проекта на free tier  

---

## Option 0 — DIY (остаться на своём auth)

**Уже есть:** `authService`, `routes/auth/`, bcrypt, refresh cookie.

**Ещё нужно:** 2.2.1 #2–#5 (active), 2.2.10, 2.2.7, 2.2.8; 2.2.9 GDPR — в любом случае.

**Плюсы:** $0 SaaS, максимум учёбы. **Минусы:** security owner, редко дописывают verify/reset в pet.

---

## Free tier и «отпадёт ли auth»

| | DIY | Clerk/Auth0 | Supabase |
|---|-----|-------------|----------|
| npm SDK | бесплатно | бесплатно | бесплатно |
| Облако | — | freemium (MAU) | freemium + **pause проекта** |
| Pet забросили на месяц | сервер выключен | тенант обычно жив | **весь проект sleep** |

---

## Decision

**TBD** — заполнить в инкременте **#6a** после прохождения #2–#5.

**Рекомендация плана (default):** **Clerk**, если приоритет — быстрый React SPA + Google из dashboard.  
**Альтернатива:** **Auth0**, если приоритет — enterprise OIDC на резюме.

---

## Consequences (после #6b, любой managed победитель)

- Client: `ClerkProvider` / `Auth0Provider`; Bearer в `apiFetch`
- Server: `authenticate` → JWKS; `users.id` = `sub` из claims
- Deprecated: `POST /api/auth/register|login|refresh`; таблица `refresh_tokens`
- **Superseded в v2.2:** 2.2.7, 2.2.8, 2.2.10 (passport)
- **Остаётся:** 2.2.9 GDPR, `ProtectedRoute`, избранное

---

## Superseded US

| US | Статус после 2.2.13 |
|----|---------------------|
| 2.2.10 OAuth (passport) | Cancelled в v2.2 |
| 2.2.7 Email verification | Superseded |
| 2.2.8 Password reset | Superseded |
| 2.2.9 GDPR | Остаётся |

---

## Links

- [CURRENT_RELEASE.md](../CURRENT_RELEASE.md) — § US 2.2.13 (#6a/6b)  
- [AUTH_REFERENCE.md](./AUTH_REFERENCE.md) — legacy-фаза 7  
- [TOKENS_AND_JWT.md](../guides/TOKENS_AND_JWT.md)
