# Practice-режим — инкременты и тесты

> Формат [`CURRENT_INCREMENT.md`](../CURRENT_INCREMENT.md); полная **Практика** — [`ROADMAP.md`](../ROADMAP.md) § US 2.2.x.  
> Справочник auth: [`AUTH_REFERENCE.md`](../auth/AUTH_REFERENCE.md).

## Правило закрытия US

**US не закрывается**, пока не пройдена секция **«Проверка и тесты»** в инкременте:

1. **Ручная** — всегда (curl / UI / DevTools).
2. **Авто** — когда есть runner и осмысленный assert (client Vitest с US #2; server — по ситуации).
3. **`pnpm test`** — финал auth-трека (#1–#6).

**Порядок:** сначала руками убедиться → потом автотест на то же поведение.

---

## Practice: код

### Можно

- Заголовки: `export function register()`, `export function LoginForm()`, `authRouter.post(...)`.
- Вложенность заголовков.
- Внутри `{ }` — **только** текстовые `//` комментарии.

### Нельзя

- Тела на TS/JS/JSX (реальные выражения, JSX-теги, вызовы API).
- Таблицы «Файл | Действие | Что писать» в секции **Практика** (компактная таблица `Файл | Действие` в **На схеме** — разрешена).

### Блоки файла

```typescript
// ====== КОД ИЗ [предыдущий US / baseline] (без изменений) ======
// export const db = new Database(DB_PATH)
// CREATE TABLE news_items ...
// ER до/после — секция «Схема БД» в CURRENT_INCREMENT (шаблон: DB_SCHEMA_DIFF.md)

// ====== НОВЫЙ/ИЗМЕНЁННЫЙ БЛОК [текущий US] ======

export function register(email: string, password: string) {
  // Шаг 1: bcrypt.hash(password, 12)
  // Кратко: сохранить password_hash в users, не plain text.

  // Шаг 2: выдать access JWT (15m) + refresh (7d)
  // Кратко: refresh в refresh_tokens; access в return value.
}
```

React-компонент:

```tsx
export function LoginForm() {
  // Шаг 1: useForm + zodResolver(loginSchema)
  // Кратко: native form, autocomplete current-password.

  // render: form + email field + password field + submit button
}
```

---

## Practice: тесты

Тот же режим для `*.test.ts` / `*.test.tsx` в секции **«Проверка и тесты → Автотесты»**:

```typescript
describe('authService.register', () => {
  it('returns accessToken and stores refresh in db', () => {
    // Arrange: in-memory sqlite или mock db.prepare
    // Act: register(validEmail, validPassword)
    // Assert: result.accessToken defined; row in users; row in refresh_tokens
  })

  it('throws conflict when email already exists', () => {
    // Arrange: user with email уже в БД
    // Act + Assert: register → 409 / duplicate error
  })
})
```

Образец живого MSW-теста: [`client/src/app/mocks/handlers.test.ts`](../../client/src/app/mocks/handlers.test.ts).

---

## Секции инкремента (обязательные)

| Секция | Содержание |
| ------ | ---------- |
| **На схеме** | progress-mermaid (fill: WIP/later, done без fill); таблица «В этом US» (`Файл \| Действие`); «После US»; «Сцена timeline» |
| **Зачем этот US** | 2–3 предложения |
| **Практика** | Practice-скелеты по файлам |
| **Схема БД (до/после)** | Если US трогает `schema.ts`: полный блок Before/After/diff/проверка в `CURRENT_INCREMENT` перед `schema.ts`; [DB_SCHEMA_DIFF.md](./DB_SCHEMA_DIFF.md) — шаблон и общие правила |
| **Проверка и тесты** | Ручная (чеклист `- [ ]`) + Автотесты + команды vitest/curl |
| **Запуск** | порядок терминалов, `pnpm dev:*` |
| **Самопроверка US** | 3–5 вопросов |

---

## Server vs client: автотесты

| Пакет | Runner | US #1 Backend | US #2+ client |
| ----- | ------ | ------------- | ------------- |
| `server/` | **нет** (пока) | curl обязателен; supertest — если добавишь vitest | — |
| `client/` | Vitest + MSW + RTL | — | автотесты **обязательны** в инкременте |

Запуск одного client-теста:

```bash
pnpm --filter react-happy-news-client exec vitest run src/pages/Auth/lib/tokenMemory.test.ts
```
