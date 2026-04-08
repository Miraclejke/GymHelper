# Codex Onboarding: GymHelper

## 1. Что это за проект

`GymHelper` - учебный full-stack проект для учета:
- недельного плана тренировок;
- выполненных тренировок по датам;
- питания по датам;
- сна и восстановления;
- агрегированной статистики на дашборде.

Архитектурно проект построен как `React SPA + NestJS backend + PostgreSQL/Prisma`.

## 2. Главная архитектурная идея

В проекте одновременно существуют два UI-слоя:

1. Основной пользовательский интерфейс:
- `frontend/`
- React SPA
- используется в реальной работе приложения

2. Учебный серверный UI:
- `views/`
- Handlebars
- нужен для ЛР1 и части ЛР6
- не является основным интерфейсом продукта

То есть проект не является классическим SSR-приложением. Основной UX идет через React, а Handlebars сохранен как учебный демонстрационный слой.

## 3. Что важно понимать новому чату

- Источником истины для данных является backend.
- Frontend больше не работает через mock как основной режим.
- REST используется React-клиентом как основной API.
- GraphQL добавлен как отдельный способ доступа к тем же сервисам.
- В проекте есть SSE для live-обновлений dashboard.
- Функциональности файлов, S3, аватаров и object storage в актуальной версии нет.

## 4. Ключевые точки входа

### Backend bootstrap

- `src/main.ts`
- `src/app.module.ts`
- `src/app.setup.ts`

### Основные модули

- `src/auth`
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
- `GET /api/dashboard/stream` as SSE

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

## 7. Аутентификация

Используется `express-session`.

Ключевые файлы:
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/session-auth.guard.ts`
- `src/graphql/guards/gql-session-auth.guard.ts`

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

### Что не входит в ЛР6 в этом проекте

- загрузка файлов
- object storage
- S3

Это осознанное упрощение под предметную область проекта.

## 10. Что уже проверено автоматически

Есть:
- unit tests
- e2e tests
- проверка REST
- проверка Swagger
- проверка GraphQL
- проверка SSE-косвенно через модуль dashboard events
- проверка `X-Elapsed-Time`
- проверка `ETag` и `304 Not Modified`

Основной e2e файл:
- `test/app.e2e-spec.ts`

## 11. На что смотреть в первую очередь при новом диалоге

Если нужен быстрый вход:

1. `README.md`
2. `LAB1_LAB6_AUDIT.md`
3. `src/app.module.ts`
4. `src/app.setup.ts`
5. `test/app.e2e-spec.ts`
6. нужный доменный модуль (`plan`, `workout`, `nutrition`, `rest`, `dashboard`)

Если нужен исторический контекст по лабораторным:

1. `REPORT_LR1_LR3.md`
2. `REPORT_LR4.md`
3. `REPORT_LR5.md`
4. `REPORT_LR6.md`

## 12. Известные особенности

- `README.md` и этот файл являются актуальным кратким контекстом.
- Исторические отчеты могут содержать формулировки уровня конкретной лабораторной, а не текущего состояния проекта.
- В миграциях есть пара временных миграций про `avatarUrl`; это не актуальная функциональность, а след промежуточного эксперимента, который затем был удален.
