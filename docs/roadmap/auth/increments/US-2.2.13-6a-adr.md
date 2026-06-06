# US 2.2.13 #6a — Managed Auth ADR (выбор провайдера)

> **Рабочий план:** станет [CURRENT_INCREMENT.md](../../CURRENT_INCREMENT.md), когда #2–#5 ✅  
> **ADR:** [MANAGED_AUTH_ADR.md](../MANAGED_AUTH_ADR.md)

**Статус:** `pending`  
**Релиз:** [CURRENT_RELEASE.md](../../CURRENT_RELEASE.md) — auth-трек **#6a**  
**Полная спека:** [CURRENT_RELEASE.md](../../CURRENT_RELEASE.md) — § US 2.2.13 (#6a)  
**Issue:** [#74](https://github.com/vv0rkz/react-happy-news/issues/74)  
**Предусловие:** US 2.2.1 #2–#5 ✅ (Session, Forms, ProtectedRoute, Security)

---

## Контекст за 30 секунд

| Вопрос | Ответ |
| ------ | ----- |
| Зачем 6a? | Выбрать провайдера **до** кода миграции (#6b) |
| Можно отложить? | Да — Decision в ADR **TBD**, пока не active |
| Что не делаем | Код, npm install Clerk/Auth0 |
| Артефакт | Подписанный [MANAGED_AUTH_ADR.md](../MANAGED_AUTH_ADR.md) |

---

## Acceptance Criteria

- [ ] Прочитать матрицу в [MANAGED_AUTH_ADR.md](../MANAGED_AUTH_ADR.md)
- [ ] (Опционально) 30-min spike: Clerk dashboard + Auth0 dashboard — signup, Google toggle
- [ ] Заполнить **Decision** в ADR (Clerk default / Auth0 / остаться DIY)
- [ ] Обновить статус ADR: `proposed` → `accepted`
- [ ] Зафиксировать superseded: 2.2.7, 2.2.8, 2.2.10 для v2.2

---

## Практика

### Шаг 1: Матрица

Сверить scoring в ADR с вашим приоритетом:

- Pet + React → Clerk часто #1  
- Enterprise resume → Auth0  
- Не Supabase (SQLite + pause)  
- DIY — если отказываетесь от #6b

### Шаг 2: Spike (optional)

```text
Clerk:  clerk.com → Application → Google OAuth
Auth0:  auth0.com → Application → SPA + API
```

Записать 3 буллета: setup time, React SDK, Express JWKS docs URL.

### Шаг 3: Decision в ADR

```markdown
## Decision
**Accepted:** Clerk | Auth0 | DIY (остаёмся на 2.2.10)
**Дата:** YYYY-MM-DD
**Причина:** …
```

---

## Проверка и тесты

- [ ] ADR status = `accepted`
- [ ] CURRENT_RELEASE #6a можно отметить done
- [ ] Следующий инкремент: [US-2.2.13-6b-migrate.md](./US-2.2.13-6b-migrate.md)

---

## Следующий шаг

[US-2.2.13-6b-migrate.md](./US-2.2.13-6b-migrate.md) — код миграции
