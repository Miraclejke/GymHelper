# Полное описание проекта GymHelper

## 1. Назначение проекта

`GymHelper` — учебный full-stack проект для учета:
- недельного плана тренировок;
- выполненных тренировок по датам;
- питания по датам;
- сна и восстановления;
- агрегированной статистики на дашборде;
- аутентификации, ролей и административного сценария.

Проект сделан как единая кодовая база для выполнения лабораторных работ `ЛР1`-`ЛР7`.

Исходные методички:
- [ЛР1](./source-labs/Lab1.md)
- [ЛР2](./source-labs/Lab2.md)
- [ЛР3](./source-labs/Lab3.md)
- [ЛР4](./source-labs/Lab4.md)
- [ЛР5](./source-labs/Lab5.md)
- [ЛР6](./source-labs/Lab6.md)
- [ЛР7](./source-labs/Lab7.md)

## 2. Главная архитектурная идея

В проекте есть два пользовательских слоя:

1. Основной интерфейс  
   `React SPA` из папки `frontend/`.  
   Это главный интерфейс приложения.

2. Учебный серверный интерфейс  
   `Handlebars`-шаблоны из папки `views/`.  
   Они нужны для демонстрации требований `ЛР1` и части `ЛР6`.

То есть это не классическое SSR-приложение. Основная работа идет через `React + REST API`, а шаблоны сохранены как отдельный учебный слой.

## 3. Технологический стек

### Backend

- `NestJS 11`
- `Prisma 7`
- `PostgreSQL`
- `express-session`
- `Swagger / OpenAPI`
- `GraphQL code-first`
- `SSE`

### Frontend

- `React 18`
- `React Router`
- `Vite`
- обычный `fetch` через общий HTTP-слой

## 4. Структура проекта

### Корень backend-проекта

- `src/` — весь backend-код NestJS
- `frontend/` — React-приложение
- `views/` — серверные шаблоны Handlebars
- `public/` — собранный frontend
- `prisma/` — схема, миграции, seed
- `test/` — e2e-проверки
- `docs/` — документация по лабораторным и проекту

### Основные backend-модули

- `auth` — регистрация, вход, профиль, пароль, сессия, роли
- `admin` — список пользователей и смена ролей
- `plan` — недельный план тренировок
- `workout` — тренировки по датам
- `nutrition` — питание по датам
- `rest` — сон и восстановление
- `dashboard` — агрегированная статистика и SSE
- `graphql` — дополнительный GraphQL-слой поверх тех же сервисов
- `prisma` — подключение к БД
- `common` — общие типы, util-функции, filter, interceptors

## 5. Что реализовано по лабораторным работам

## 5.1. ЛР1. Деплой и шаблонизация

Методичка: [ЛР1](./source-labs/Lab1.md)  
Исторический отчет: [REPORT_LR1_LR3.md](./reports/REPORT_LR1_LR3.md)

Что реализовано:
- backend-приложение на `NestJS`;
- frontend собирается в `public/` и отдается тем же приложением;
- настроен `PORT` через `process.env.PORT ?? 3000`;
- подключен `Handlebars`;
- созданы шаблонные страницы `/lab1` и `/lab1/exercises`;
- выделены `layout` и `partials`.

Код:
- `src/main.ts`
- `src/app.setup.ts`
- `src/app.controller.ts`
- `src/app.service.ts`
- `views/`
- `frontend/`

## 5.2. ЛР2. Доменная модель и база данных

Методичка: [ЛР2](./source-labs/Lab2.md)  
Исторический отчет: [REPORT_LR1_LR3.md](./reports/REPORT_LR1_LR3.md)

Что реализовано:
- полная доменная модель в `Prisma`;
- миграции;
- seed со стартовым администратором;
- подключение PostgreSQL к NestJS через `PrismaService`.

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

Код:
- `prisma/schema.prisma`
- `prisma/migrations/`
- `prisma/seed.js`
- `src/prisma/prisma.service.ts`
- `src/prisma/prisma.module.ts`

## 5.3. ЛР3. Модульная бизнес-логика и SSE

Методичка: [ЛР3](./source-labs/Lab3.md)  
Исторический отчет: [REPORT_LR1_LR3.md](./reports/REPORT_LR1_LR3.md)

Что реализовано:
- проект разделен на доменные модули;
- сервисы работают с реальной БД через Prisma;
- frontend переведен на реальные HTTP-запросы;
- добавлен SSE-поток для обновления дашборда;
- frontend подписывается на `EventSource`.

Код:
- `src/plan/*`
- `src/workout/*`
- `src/nutrition/*`
- `src/rest/*`
- `src/dashboard/*`
- `frontend/src/api/*`
- `frontend/src/pages/DashboardPage.tsx`

## 5.4. ЛР4. REST API и OpenAPI

Методичка: [ЛР4](./source-labs/Lab4.md)  
Исторический отчет: [REPORT_LR4.md](./reports/REPORT_LR4.md)

Что реализовано:
- REST-контроллеры по всем основным доменам;
- `ValidationPipe` на уровне приложения;
- единый формат ошибок через `HttpExceptionFilter`;
- Swagger UI и Swagger JSON;
- пагинация и `Link`/`X-Total-Count` headers;
- DTO для входных и выходных данных.

Код:
- `src/app.setup.ts`
- `src/common/filters/http-exception.filter.ts`
- `src/common/dto/*`
- `src/plan/plan.controller.ts`
- `src/workout/workout.controller.ts`
- `src/nutrition/nutrition.controller.ts`
- `src/rest/rest.controller.ts`
- `src/dashboard/dashboard.controller.ts`
- `src/auth/auth.controller.ts`
- `src/admin/admin.controller.ts`

## 5.5. ЛР5. GraphQL

Методичка: [ЛР5](./source-labs/Lab5.md)  
Исторический отчет: [REPORT_LR5.md](./reports/REPORT_LR5.md)

Что реализовано:
- `GraphQLModule` в режиме `code-first`;
- GraphiQL на `/graphql`;
- resolvers для `auth`, `plan`, `workout`, `dashboard`;
- ограничение сложности запроса;
- отдельный timing plugin для GraphQL.

Код:
- `src/graphql/graphql.module.ts`
- `src/graphql/auth/*`
- `src/graphql/plan/*`
- `src/graphql/workout/*`
- `src/graphql/dashboard/*`
- `src/graphql/plugins/complexity.plugin.ts`
- `src/graphql/plugins/request-timing.plugin.ts`

Сознательно не включено:
- `nutrition` через GraphQL;
- `rest` через GraphQL;
- `admin` через GraphQL;
- GraphQL subscriptions.

## 5.6. ЛР6. BFF-возможности NestJS

Методичка: [ЛР6](./source-labs/Lab6.md)  
Исторический отчет: [REPORT_LR6.md](./reports/REPORT_LR6.md)

Что реализовано:
- interceptor для измерения времени обработки HTTP-запросов;
- timing plugin для GraphQL;
- `X-Elapsed-Time` в REST и GraphQL;
- server/client time на шаблонных страницах `/lab1`;
- `ETag` и `Cache-Control` на suggestions endpoints;
- `CacheModule` для `dashboard summary`;
- ручная инвалидизация кэша после изменения данных.

Код:
- `src/common/interceptors/request-timing.interceptor.ts`
- `src/common/interceptors/etag.interceptor.ts`
- `src/dashboard/dashboard.module.ts`
- `src/dashboard/dashboard.service.ts`
- `src/workout/workout.service.ts`
- `src/nutrition/nutrition.service.ts`
- `src/rest/rest.service.ts`

Сознательная адаптация:
- часть про `S3/Object Storage` и загрузку файлов не реализуется;
- для домена `GymHelper` эта функциональность сейчас не нужна;
- в документации проекта это фиксируется как осознанное ограничение, а не как случайный пропуск.

## 5.7. ЛР7. Аутентификация и авторизация

Методичка: [ЛР7](./source-labs/Lab7.md)  
Исторический отчет: [REPORT_LR7.md](./reports/REPORT_LR7.md)

Что реализовано:
- session-based auth через `express-session`;
- хранение паролей через `scrypt`;
- регистрация и login;
- получение текущего пользователя;
- редактирование имени;
- смена пароля;
- роли `user` и `admin`;
- `RolesGuard`;
- `AdminModule` со списком пользователей и сменой роли;
- frontend-страницы `/profile` и `/admin/users`.

Код:
- `src/auth/*`
- `src/admin/*`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/components/auth/*`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/pages/AdminUsersPage.tsx`

Сознательная адаптация:
- внешний auth provider не используется;
- проект оставлен на собственной сессионной авторизации, чтобы код был проще и понятнее для учебной защиты.

## 6. REST-маршруты

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

## 7. GraphQL-операции

Реализованы:
- `me`
- `login`
- `register`
- `logout`
- `weeklyPlan`
- `planDay`
- `exerciseSuggestions`
- `savePlanDay`
- `workoutDay`
- `workouts`
- `saveWorkoutDay`
- `dashboardSummary`

## 8. Frontend

Главные файлы:
- `frontend/src/App.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/api/http.ts`
- `frontend/src/api/*.ts`
- `frontend/src/pages/*.tsx`

Что делает frontend:
- работает через backend API, а не через mock-слой;
- хранит только текущую сессию в памяти React через `AuthContext`;
- защищает маршруты на уровне UI;
- показывает admin-раздел только администраторам;
- подписывается на SSE для live-обновления дашборда.

После рефакторинга удалены:
- старый `mockDb.ts`;
- неиспользуемая зависимость `zustand`;
- пустая папка `frontend/src/services`.

## 9. База данных и seed

Seed создает и обновляет демо-администратора:
- email: `admin@gymhelper.local`
- пароль: `admin123`

Дополнительно seed создает:
- пример плана;
- пример тренировки;
- пример питания;
- пример записи отдыха.

Важно:
- seed очищает и заново создает demo-данные администратора;
- поэтому его удобно использовать локально и для начального демо, но не нужно запускать автоматически на каждом прод-старте.

## 10. Автоматические проверки

Сейчас в проекте есть:
- unit tests;
- e2e tests;
- проверка `lint`;
- проверка сборки frontend и backend.

Основные команды:

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

## 11. Что сознательно не реализовано

- загрузка файлов;
- `S3/Object Storage`;
- внешний auth provider;
- сложная production-auth инфраструктура.

Это не забытые части, а намеренные упрощения учебного проекта.

## 12. Какие документы читать дальше

- быстрый вход в код: [context/CODEX_ONBOARDING.md](./context/CODEX_ONBOARDING.md)
- короткий аудит: [context/LAB1_LAB7_AUDIT.md](./context/LAB1_LAB7_AUDIT.md)
- полная проверка проекта: [FULL_TEST_GUIDE.md](./FULL_TEST_GUIDE.md)
