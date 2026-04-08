# GymHelper Backend

Backend-часть учебного проекта `GymHelper`, объединяющая:
- `NestJS` backend;
- `React SPA` в папке `frontend/`;
- `PostgreSQL + Prisma`;
- `REST API`, `GraphQL`, `Swagger`, `SSE`;
- две демонстрационные `Handlebars`-страницы для ЛР1.

## Быстрый статус

ЛР1-ЛР6 в проекте реализованы.

Важно:
- ЛР3 и ЛР6 адаптированы под реальный проект, а не повторяют методичку буквально.
- В ЛР6 файловая часть сознательно исключена: в домене проекта нет необходимости в загрузке файлов.

Подробности:
- аудит выполнения: `LAB1_LAB6_AUDIT.md`
- onboarding для нового чата: `CODEX_ONBOARDING.md`
- исторические отчеты: `REPORT_LR1_LR3.md`, `REPORT_LR4.md`, `REPORT_LR5.md`, `REPORT_LR6.md`

## Стек

- `NestJS 11`
- `Prisma 7`
- `PostgreSQL`
- `React + Vite`
- `Swagger / OpenAPI`
- `GraphQL (code-first, Apollo)`
- `express-session`
- `Handlebars`

## Основные команды

```bash
npm install
npm run prisma:generate
npm run start:dev
```

Полезные команды:

```bash
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run prisma:migrate:dev
npm run prisma:seed
```

Frontend собирается из `frontend/` автоматически через `npm run build`.

## Что где лежит

- `src/` - backend-код NestJS
- `frontend/` - React SPA
- `views/` - Handlebars-шаблоны для ЛР1
- `prisma/` - схема, миграции, seed
- `test/` - e2e-тесты
- `REPORT_LR*.md` - отчеты по лабораторным

## Точки входа

- REST API: `/api/...`
- Swagger UI: `/api/docs`
- Swagger JSON: `/api/docs-json`
- GraphQL / GraphiQL: `/graphql`
- SSE: `/api/dashboard/stream`
- ЛР1 Handlebars pages: `/lab1`, `/lab1/exercises`
- React SPA: `/`

## Текущее состояние проекта

Проект уже не использует загрузку файлов, S3 и аватары. Если в истории миграций встречаются временные миграции на `avatarUrl`, это след от промежуточного эксперимента, а не актуальная часть доменной модели.
