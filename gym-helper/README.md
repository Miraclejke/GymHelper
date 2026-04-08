# GymHelper

Учебный full-stack проект для 7 лабораторных работ по backend-разработке.

Проект объединяет:
- `NestJS` backend;
- `React SPA` в папке `frontend/`;
- `PostgreSQL + Prisma`;
- `REST API`, `Swagger`, `GraphQL`, `SSE`;
- две учебные `Handlebars`-страницы для ЛР1 и ЛР6.

## Что важно

- Основной пользовательский интерфейс: `React SPA`.
- `Handlebars` сохранены как отдельный учебный серверный слой.
- Файлы и `S3/Object Storage` сознательно не реализуются.
- Внешний auth-провайдер не используется: для учебного проекта оставлена простая session-based auth.

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` по примеру `.env.example` и указать `DATABASE_URL`.

3. Применить миграции и заполнить демо-данные:

```bash
npm run prisma:migrate:dev
npm run prisma:seed
```

4. Запустить проект:

```bash
npm run start:dev
```

## Основные команды

```bash
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run prisma:migrate:deploy
npm run prisma:seed
```

## Точки входа

- React SPA: `/`
- ЛР1 Handlebars: `/lab1`, `/lab1/exercises`
- REST API: `/api/...`
- Swagger UI: `/api/docs`
- Swagger JSON: `/api/docs-json`
- GraphQL / GraphiQL: `/graphql`
- SSE: `/api/dashboard/stream`

## Документация

- обзор проекта: [docs/PROJECT_DESCRIPTION.md](./docs/PROJECT_DESCRIPTION.md)
- реализация проекта по лабораторным: [docs/PROJECT_IMPLEMENTATION.md](./docs/PROJECT_IMPLEMENTATION.md)
- полная настройка и проверка: [docs/FULL_TEST_GUIDE.md](./docs/FULL_TEST_GUIDE.md)
- сценарий показа преподавателю: [docs/TEACHER_TEST_PLAN.md](./docs/TEACHER_TEST_PLAN.md)
- аудит ЛР1-ЛР7: [docs/context/LAB1_LAB7_AUDIT.md](./docs/context/LAB1_LAB7_AUDIT.md)
- onboarding по коду: [docs/context/CODEX_ONBOARDING.md](./docs/context/CODEX_ONBOARDING.md)
- исходные методички: [docs/source-labs](./docs/source-labs)
- исторические отчеты: [docs/reports](./docs/reports)
