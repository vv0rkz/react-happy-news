# Руководство по аналогиям в docs

> Source of truth для метафор в `CURRENT_INCREMENT.md` и будущих инкрементов.
> Research, Module Map, ADR — **без аналогий**, только баллы и схемы.

---

## Checklist (7 пунктов — ручное ревью после AI)

1. **Один узел diagram = одна идея** — не `LoginForm + Header + ProtectedRoute` в одном блоке.
2. **Ось diagram = время** (сценарий пассажира), не слои FSD / «этажи».
3. **Сначала «зачем два токена»**, потом где лежат access / refresh.
4. **Каждый образ — «было в жизни?»** (check-in, посадочный, gate — да; «карман охранника» — нет).
5. **Таблица «Образ → термин → файл → где ломается»** — после каждого блока аналогий.
6. **Research / Module Map / ADR** — без метафор.
7. **Единый домен** — для Auth Foundation только **аэропорт**; не смешивать с офисом, лобби, бизнес-центром.

---

## Глоссарий «Аэропорт Happy News»

| Термин | В аэропорту | В коде | Где ломается |
| ------ | ----------- | ------ | ------------ |
| Identification | Имя/email при бронировании | поле email | — |
| Authentication | Check-in: паспорт проверен | `POST /login`, bcrypt | — |
| Authorization | У gate / в VIP-зал без талона — нельзя | middleware, `ProtectedRoute` | — |
| Access token | **Посадочный талон** (~15 мин) | `tokenMemory`, Bearer header | В жизни талон часто на весь рейс |
| Refresh token | **Профиль в системе авиакомпании** («запомнить меня» 7 дней) | httpOnly cookie | — |
| tokenMemory | Талон **на экране приложения** (RAM вкладки) | `getAccessToken()` | Не переживает F5 — восстанавливается через refresh |
| httpOnly cookie | Система авиакомпании; браузер предъявляет at kiosk — JS не читает | `Set-Cookie`, `credentials: include` | — |
| Context | Экран: «Добро пожаловать, Ivan» | `AuthProvider`, user | — |
| LoginForm | **Бланк check-in** (email + пароль) | `LoginForm` | — |
| Header | **Табло/вывеска** + «вы вошли как …» | `Header` | — |
| ProtectedRoute | **Gate в VIP-зал (избранное)** — без талона назад к стойке | redirect `/login`, `/favorites` | — |
| apiFetch | **Единая процедура** у каждого gate | `shared/api/apiFetch.ts` | — |
| Interceptor | «Талон?» → просрочен → **киоск refresh** → снова к gate | 401 → `/refresh` → retry | — |
| TanStack Query | **Табло рейсов** — список рейсов/новостей, не талон | `newsQueries` | Табло не хранит ваш паспорт |
| localStorage | Номер талона **на лбу маркером** | не используем (XSS) | — |
| JWT | **Штрихкод** на талоне — авиакомпания проверяет подпись | jwt.verify | — |

### Проблема → решение (два токена)

- **Один талон на год:** украли — летаешь чужим именем долго.
- **Талон на 15 мин без «запомнить»:** каждые 15 мин заново check-in с паспортом.
- **Компромисс:** короткий boarding pass + долгий профиль в системе для **тихого** перевыпуска talon.

> **Где ломается аналогия:** в жизни часто один boarding pass на весь рейс; в JWT два документа **специально** для безопасности.

---

## Prompt-snippet для будущих increment

```
Domain: airport only. Timeline first. One node one concept.
Explain two-token problem before storage. Add "breaks" callout.
Map to files in table. Research/ADR — no metaphors.
UI: «избранное»; code/API: favorites (not bookmarks).
```

---

## Связанные документы

- [CURRENT_INCREMENT.md](./CURRENT_INCREMENT.md) — секция «На пальцах»
- [INCREMENT_TEMPLATE.md](./templates/INCREMENT_TEMPLATE.md) — структура секций
- [MODULE_MAP.md](../architecture/MODULE_MAP.md) — архитектура без метафор
