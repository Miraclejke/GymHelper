# Codex Onboarding: GymHelper

## 1. Что это за проект

`GymHelper` - учебный full-stack проект для учета:
- недельного плана тренировок;
- выполненных тренировок по датам;
- питания по датам;
- сна и восстановления;
- агрегированной статистики на дашборде;
- аутентификации, ролей и admin-сценариев.

Архитектура проекта:

- `React SPA`
- `NestJS backend`
- `PostgreSQL + Prisma`

## 2. Главная архитектурная идея

В проекте есть два UI-слоя:

1. Основной пользовательский интерфейс:
- `frontend/`
- React SPA
- используется как основной UI продукта

2. Учебный серверный UI:
- `views/`
- Handlebars
- нужен для ЛР1 и части ЛР6
- не является основным интерфейсом приложения

То есть проект не является классическим SSR/MVC-приложением. Основной UX идет через React, а Handlebars сохранен как учебный демонстрационный слой.

## 3. Что важно понимать новому чату

- Источником истины для данных является backend.
- Frontend больше не работает через mock как основной режим.
- Основной API для frontend - `REST`.
- `GraphQL` добавлен как дополнительный слой доступа к тем же сервисам.
- В проекте есть `SSE` для live-обновлений dashboard.
- Функциональности файлов, S3, аватаров и object storage в актуальной версии нет.
- Конфигурация проекта упрощена под учебный формат: для запуска достаточно `DATABASE_URL`.

## 4. Ключевые точки входа

### Backend bootstrap

- `src/main.ts`
- `src/app.module.ts`
- `src/app.setup.ts`

### Основные модули

- `src/auth`
- `src/admin`
- `src/plan`
- `src/workout`
- `src/nutrition`
- `src/rest`
- `src/dashboard`
- `src/graphql`
- `src/prisma`
- `src/common`

### Frontend

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/api/*`

## 5. REST маршруты

### Auth

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/password`

### Admin

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`

### Plan

- `GET /api/plan`
- `GET /api/plan/suggestions`
- `GET /api/plan/:weekday`
- `PUT /api/plan/:weekday`

### Workouts

- `GET /api/workouts/suggestions`
- `GET /api/workouts`
- `GET /api/workouts/:date`
- `PUT /api/workouts/:date`

### Nutrition

- `GET /api/nutrition`
- `GET /api/nutrition/:date`
- `PUT /api/nutrition/:date`

### Rest

- `GET /api/rest`
- `GET /api/rest/:date`
- `PUT /api/rest/:date`

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/stream`

## 6. GraphQL слой

GraphQL расположен в `src/graphql` и работает в режиме `code-first`.

Реализованы:
- auth queries/mutations
- weekly plan
- plan day
- plan suggestions
- workout day
- workouts pagination
- save workout day
- dashboard summary

Не реализованы и сознательно не входят в объем GraphQL:
- nutrition через GraphQL
- rest через GraphQL
- subscriptions
- admin-сценарии через GraphQL

## 7. Аутентификация и авторизация

Используется `express-session`.

Ключевые файлы:
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/session-auth.guard.ts`
- `src/auth/roles.decorator.ts`
- `src/auth/roles.guard.ts`
- `src/graphql/guards/gql-session-auth.guard.ts`

Что важно:
- логин и регистрация создают cookie-сессию `gymhelper.sid`;
- пароли хранятся через `scrypt`;
- обычный пользователь имеет роль `user`;
- администратор имеет роль `admin`;
- backend сам проверяет доступ к admin-endpoint'ам.

Frontend после загрузки приложения запрашивает текущую сессию через `AuthContext`.

## 8. База данных

БД описана в `prisma/schema.prisma`.

Основные сущности:
- `User`
- `PlanDay`
- `PlanExercise`
- `WorkoutDay`
- `WorkoutExercise`
- `WorkoutSet`
- `NutritionDay`
- `MealEntry`
- `RestDay`

## 9. Что реализовано по ЛР6

### Измерение времени

- глобальный HTTP interceptor: `src/common/interceptors/request-timing.interceptor.ts`
- GraphQL timing plugin: `src/graphql/plugins/request-timing.plugin.ts`
- Handlebars-страницы показывают server/client elapsed time
- REST и GraphQL возвращают `X-Elapsed-Time`

### Клиентский HTTP cache

- `ETag` через `src/common/interceptors/etag.interceptor.ts`
- `Cache-Control` на suggestions endpoint'ах

### Server-side cache

- `CacheModule` подключен в `DashboardModule`
- summary кэшируется in-memory
- после изменений workout/nutrition/rest кэш сбрасывается вручную

## 10. Что реализовано по ЛР7

### Backend

- усилено хранение паролей через `scrypt`
- добавлены `PATCH /api/auth/profile`
- добавлены `PATCH /api/auth/password`
- добавлен `@Roles(...)`
- добавлен `RolesGuard`
- добавлен `AdminModule`
- добавлены admin-endpoint'ы для списка пользователей и смены роли

### Frontend

- добавлена страница `/profile`
- добавлена страница `/admin/users`
- меню показывает admin-раздел только администратору
- role-based access дублируется на уровне маршрутов через `ProtectedRoute`

## 11. Что уже проверено автоматически

Есть:
- unit tests
- e2e tests
- проверка REST
- проверка Swagger
- проверка GraphQL
- проверка SSE-косвенно через модуль dashboard events
- проверка `X-Elapsed-Time`
- проверка `ETag` и `304 Not Modified`
- проверка `PATCH /api/auth/profile`
- проверка `PATCH /api/auth/password`
- проверка `401` и `403` для admin API
- проверка admin-сценария смены роли

Основной e2e файл:
- `test/app.e2e-spec.ts`

## 12. На что смотреть в первую очередь при новом диалоге

Если нужен быстрый вход:

1. `README.md`
2. `LAB1_LAB7_AUDIT.md`
3. `src/app.module.ts`
4. `src/app.setup.ts`
5. `test/app.e2e-spec.ts`
6. нужный доменный модуль (`auth`, `admin`, `plan`, `workout`, `nutrition`, `rest`, `dashboard`)

Если нужен исторический контекст по лабораторным:

1. `../reports/REPORT_LR1_LR3.md`
2. `../reports/REPORT_LR4.md`
3. `../reports/REPORT_LR5.md`
4. `../reports/REPORT_LR6.md`
5. `../reports/REPORT_LR7.md`

## 13. Известные особенности

- `README.md` и этот файл являются актуальным кратким контекстом.
- Исторические отчеты могут содержать формулировки уровня конкретной лабораторной, а не текущего состояния проекта.
- В миграциях есть временные следы старого эксперимента с `avatarUrl`; это не актуальная функциональность.
- Конфигурация сессии упрощена для учебного проекта и не требует `SESSION_SECRET` и `NODE_ENV`.
