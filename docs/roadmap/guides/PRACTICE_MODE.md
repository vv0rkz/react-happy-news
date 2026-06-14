# Practice-режим — инкременты и тесты

> Формат [`CURRENT_INCREMENT.md`](../CURRENT_INCREMENT.md); полная **Практика** релиза — [`CURRENT_RELEASE.md`](../CURRENT_RELEASE.md) § US / инкремент.  
> Справочник auth (аналогии, архитектура): [`AUTH_REFERENCE.md`](../auth/AUTH_REFERENCE.md). Long-term: [`ROADMAP.md`](../ROADMAP.md).

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
- **Импорты:** строки `import …` / `import type …` **над** экспортом (до `{ }`), по одному import на строку.
- Для React-компонентов — import map + `export function …` + только `//` внутри тела.
- Внутри `{ }` — **только** текстовые `//` комментарии.

> Import map не заменяет шаги внутри `{ }` — деструктуризацию из хуков (`register`, `handleSubmit`, `formState`) оставляй комментарием в теле.

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
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Stack, TextInput } from '@mantine/core'
import { useAuth } from '@pages/Auth/lib/useAuth'
import { loginSchema, type LoginFormValues } from '@shared/api/authSchemas'
import { useForm } from 'react-hook-form'

export function LoginForm() {
  // const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
  // Шаг 1: useForm + zodResolver(loginSchema)
  // Кратко: native form, autocomplete current-password.
  // render: form + email field + password field + submit button
}
```

---

## Practice: тесты

Тот же режим для `*.test.ts` / `*.test.tsx` в секции **«Проверка и тесты → Автотесты»** — import map над `describe`:

```typescript
import { AuthProvider } from '@app/providers/AuthProvider'
import { server } from '@app/mocks/server'
import { MantineProvider } from '@mantine/core'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { LoginForm } from './LoginForm'

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

| Секция                  | Содержание                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Прогресс**            | таблица `Файл \| Статус` (✅ в ветке / ⏳ WIP)                                                                                                                                  |
| **На схеме**            | progress-mermaid (fill: WIP/later, done без fill); таблица «В этом US» (`Файл \| Действие`); «После US»; «Сцена timeline»; ключевые решения / sequence                       |
| **Контракты**           | верхнеуровневые типы, сигнатуры, HTTP-таблицы, подводные камни — **без тел функций и без fetch/JSX**                                                                         |
| **Зачем этот US**       | 2–3 предложения                                                                                                                                                                |
| **Acceptance Criteria** | чеклист закрытия US                                                                                                                                                            |
| **Практика**            | Practice-скелеты по файлам; порядок сборки (мозаика); для ✅ в ветке — ссылка на файл, не полный код                                                                            |
| **Схема БД (до/после)** | Если US трогает `schema.ts`: полный блок Before/After/diff/проверка в `CURRENT_INCREMENT` перед `schema.ts`; [DB_SCHEMA_DIFF.md](./DB_SCHEMA_DIFF.md) — шаблон и общие правила |
| **Проверка и тесты**    | Ручная (чеклист `- [ ]`) + Автотесты + команды vitest/curl                                                                                                                     |
| **Запуск**              | порядок терминалов, `pnpm dev:*`                                                                                                                                               |
| **Самопроверка US**     | 3–5 вопросов                                                                                                                                                                   |

---

## Server vs client: автотесты

| Пакет     | Runner             | US #1 Backend                                     | US #2+ client                          |
| --------- | ------------------ | ------------------------------------------------- | -------------------------------------- |
| `server/` | **нет** (пока)     | curl обязателен; supertest — если добавишь vitest | —                                      |
| `client/` | Vitest + MSW + RTL | —                                                 | автотесты **обязательны** в инкременте |

Запуск одного client-теста:

```bash
pnpm --filter react-happy-news-client exec vitest run src/pages/Auth/lib/tokenMemory.test.ts
```
