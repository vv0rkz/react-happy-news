# Changelog

## v2.0.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.4.0...v2.0.0)

### ✨ Новые фичи

- #5 добавлена основа для бэкенда ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 поддержка ?sources= в GET /api/news ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 фича source-filter ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 SourceBadge, NewsFeed, empty state, MSW и тесты хэндлеров ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 GET /api/news/:id — поиск по id в кэше ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 POST /api/feedback, errorHandler middleware ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 FeedbackForm + postFeedback mutation ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 Footer + FeedbackForm + MSW mock ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 Swagger UI на /api/docs через zod-to-openapi ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 OpenAPI-типы клиента (openapi-typescript) + gen:openapi скрипты ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 🐛 Исправления

- #5 CORS для 127.0.0.1:5173, Vite host 127.0.0.1, EADDRINUSE сообщение ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 MSW mock режим доступен в production (demo mode) ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### ♻️ Рефакторинг

- #18 сделана миграция на typescript ([#18](https://github.com/vv0rkz/react-happy-news/issues/18))
- Fsd ([357fa75](https://github.com/vv0rkz/react-happy-news/commit/357fa75))
- #5 Container/Presentational для NewsFeed ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 📖 Documentation

- Update README with demo releases ([ed093a9](https://github.com/vv0rkz/react-happy-news/commit/ed093a9))
- Обновлен ROADMAP ([3f97609](https://github.com/vv0rkz/react-happy-news/commit/3f97609))
- #5 обновить CURRENT_INCREMENT на US 2.0.5 Swagger ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 обновить план US 2.0.5 под zod-to-openapi ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 📦 Build

- Добавелны базовые тесты ([9af334b](https://github.com/vv0rkz/react-happy-news/commit/9af334b))
- Добавлен rtk query, msw ([322c81e](https://github.com/vv0rkz/react-happy-news/commit/322c81e))
- Исправлен настройка для тестов ([280a539](https://github.com/vv0rkz/react-happy-news/commit/280a539))
- #5 zod-to-openapi v7, swagger-ui-express, openapi-typescript ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))
- #5 vercel.json для monorepo деплоя клиента ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### 🏡 Chore

- Jst, pnpm ([adab4eb](https://github.com/vv0rkz/react-happy-news/commit/adab4eb))
- Jst, pnpm ([34d5f17](https://github.com/vv0rkz/react-happy-news/commit/34d5f17))
- #5 версия 2.0.0, demo в docs/demo ([#5](https://github.com/vv0rkz/react-happy-news/issues/5))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.4.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.3.0...v1.4.0)

### ✨ Новые фичи

- #8 сделана отдельная страница по новости ([#8](https://github.com/vv0rkz/react-happy-news/issues/8))

### ♻️ Рефакторинг

- Make mock available on all enviroments ([e36d566](https://github.com/vv0rkz/react-happy-news/commit/e36d566))
- Api ([78659e5](https://github.com/vv0rkz/react-happy-news/commit/78659e5))

### 📚 Документация

- Update README with demo releases ([56b83c6](https://github.com/vv0rkz/react-happy-news/commit/56b83c6))
- Demo v1.4.0 ([1db8433](https://github.com/vv0rkz/react-happy-news/commit/1db8433))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.3.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.2.0...v1.3.0)

### ✨ Новые фичи

- #7 сделал базовую пагинацию для новостей ([#7](https://github.com/vv0rkz/react-happy-news/issues/7))

### ♻️ Рефакторинг

- UseFetch hook ([8ab226f](https://github.com/vv0rkz/react-happy-news/commit/8ab226f))
- UseFetch hook ([f04d13f](https://github.com/vv0rkz/react-happy-news/commit/f04d13f))
- Error component ([0f8b674](https://github.com/vv0rkz/react-happy-news/commit/0f8b674))

### 📚 Документация

- Update README with demo releases ([e02bee8](https://github.com/vv0rkz/react-happy-news/commit/e02bee8))
- Update README with demo releases ([cf7d70f](https://github.com/vv0rkz/react-happy-news/commit/cf7d70f))
- Демо для v1.3.0 ([9b3524d](https://github.com/vv0rkz/react-happy-news/commit/9b3524d))

### 🛠️ Технические задачи

- Js-template ([567f041](https://github.com/vv0rkz/react-happy-news/commit/567f041))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.2.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.1.0...v1.2.0)

### ✨ Новые фичи

- #4 сделаны моки для первого запроса, чтобы работало без бэка ([#4](https://github.com/vv0rkz/react-happy-news/issues/4))

### 📚 Документация

- Update README with demo releases ([f8d209c](https://github.com/vv0rkz/react-happy-news/commit/f8d209c))
- Readme, changelog ([60a7b23](https://github.com/vv0rkz/react-happy-news/commit/60a7b23))
- Добавлено демо для v1.2.0 ([5faceaa](https://github.com/vv0rkz/react-happy-news/commit/5faceaa))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>

## v1.1.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/v1.0.0...v1.1.0)

### ✨ Новые фичи

- #10 добавлен skeleton для новостей ([#10](https://github.com/vv0rkz/react-happy-news/issues/10))
- #10 обновлен skeleton ([#10](https://github.com/vv0rkz/react-happy-news/issues/10))

### 📚 Документация

- Update README with demo releases ([e2c3eb0](https://github.com/vv0rkz/react-happy-news/commit/e2c3eb0))
- Поправлено демо для 1.0.0 версии ([7ed7929](https://github.com/vv0rkz/react-happy-news/commit/7ed7929))
- Обновлено демо для v1.1.0 ([93dc52f](https://github.com/vv0rkz/react-happy-news/commit/93dc52f))

### 🏗️ Инфраструктура

- Поменял changelog config ([6afec20](https://github.com/vv0rkz/react-happy-news/commit/6afec20))
- Поменял changelog config ([bedd7de](https://github.com/vv0rkz/react-happy-news/commit/bedd7de))

### 🛠️ Технические задачи

- Js-template ([2fa4dcb](https://github.com/vv0rkz/react-happy-news/commit/2fa4dcb))

### ❤️ Contributors

- Vv0rkz <ivanchebykin4@gmail.com>
- Ione_chebkn <ivanchebykin4@gmail.com>

## v1.0.0

[compare changes](https://github.com/vv0rkz/react-happy-news/compare/0c57863...v1.0.0)

### ✨ Новые фичи

- #2 добалено базовое представление NewsBanner ([#2](https://github.com/vv0rkz/react-happy-news/issues/2))
- #1 добавлена базовая фильтрация на позитивные новости ([#1](https://github.com/vv0rkz/react-happy-news/issues/1))
- #3 сделал базовое отображение списка новостей ([#3](https://github.com/vv0rkz/react-happy-news/issues/3))

### 📚 Документация

- Обновлен README ([a145171](https://github.com/vv0rkz/react-happy-news/commit/a145171))
- Добавлено демо для 1.0.0 версии ([17a8dbd](https://github.com/vv0rkz/react-happy-news/commit/17a8dbd))

### 🛠️ Технические задачи

- Js-template ([29d2be5](https://github.com/vv0rkz/react-happy-news/commit/29d2be5))
- Js-template ([7c149a6](https://github.com/vv0rkz/react-happy-news/commit/7c149a6))
- Добавлены относительные пути и vite-tsconfig-paths ([5435453](https://github.com/vv0rkz/react-happy-news/commit/5435453))

### ❤️ Contributors

- Ione_chebkn <ivanchebykin4@gmail.com>
