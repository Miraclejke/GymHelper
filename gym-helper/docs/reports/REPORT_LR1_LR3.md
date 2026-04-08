# Отчет по backend-части проекта GymHelper

## Лабораторные работы 1–3

## 1. Общая информация о проекте

### 1.1. Название проекта

`GymHelper`

### 1.2. Назначение проекта

`GymHelper` — это учебное веб-приложение для учета тренировок, питания, сна и восстановления. Проект включает:

- раздел плана тренировок по дням недели;
- раздел фактически выполненных тренировок по датам;
- раздел питания по датам;
- раздел сна и отдыха по датам;
- дашборд с краткой статистикой за последние 14 дней;
- базовую пользовательскую аутентификацию.

### 1.3. Архитектурная идея проекта

Проект изначально разрабатывался как связка:

- `React + Vite` для пользовательского интерфейса;
- `NestJS` для серверной части;
- `PostgreSQL` как реляционная база данных;
- `Prisma ORM` как слой работы с БД.

Поэтому в рамках ЛР3 было принято решение **не переводить весь пользовательский интерфейс на server-side Handlebars**, а сохранить `React` как основной UI. При этом:

- роль клиентского представления выполняет `React`;
- роль backend-слоя выполняет `NestJS`;
- бизнес-логика размещена в `services`;
- работа с данными вынесена в `Prisma + PostgreSQL`;
- для дашборда реализованы `Server-Sent Events`.

Таким образом, итоговая архитектура проекта после ЛР3 соответствует реальному клиент-серверному приложению, а не только учебной MVC-демонстрации.

### 1.4. Текущий стек

Backend:

- `Node.js`
- `NestJS 11`
- `TypeScript`
- `Prisma 7`
- `PostgreSQL`
- `express-session`
- `express-handlebars`
- `RxJS`

Frontend:

- `React 18`
- `TypeScript`
- `Vite`
- `React Router DOM`

### 1.5. Основные рабочие директории проекта

- `src/` — исходный код backend на NestJS;
- `frontend/` — исходный код React-приложения;
- `public/` — собранная frontend-статистика для production;
- `views/` — Handlebars-шаблоны, добавленные в ЛР1;
- `prisma/` — схема БД, миграции и seed;
- `test/` — e2e-проверки backend.

---

## 2. Итоговое состояние backend после выполнения ЛР1–ЛР3

На текущий момент в проекте реализовано следующее:

- создан backend на `NestJS`;
- backend интегрирован с уже существующим React/Vite frontend;
- backend умеет раздавать собранную frontend-часть как статические файлы;
- сохранены и работают Handlebars-шаблоны из ЛР1;
- спроектирована и реализована доменная модель в PostgreSQL;
- подключен `Prisma Client`;
- выполнена миграция структуры БД;
- реализован seed с тестовыми данными;
- реализована модульная backend-структура по поддоменам;
- реализована реальная backend-аутентификация на основе cookie-session;
- реализованы реальные backend-endpoint’ы для `plan`, `workout`, `nutrition`, `rest`, `dashboard`;
- frontend переведен с `localStorage`-mock API на реальные HTTP-запросы к NestJS;
- дашборд получает summary с backend;
- реализованы `Server-Sent Events` для live-обновления дашборда;
- добавлены unit- и e2e-проверки.

---

## 3. Лабораторная работа 1

## 3.1. Цель ЛР1

Целью первой лабораторной работы было:

- создать backend-приложение на `NestJS`;
- встроить в него уже существующий frontend-проект;
- подготовить деплой на `Render`;
- освоить базовую шаблонизацию страниц через `Handlebars`.

## 3.2. Что было сделано в backend

### 3.2.1. Создан backend-проект на NestJS

В папке `GymHelper-backend/gym-helper` был создан backend-проект на NestJS.

Базовые характеристики проекта:

- имя проекта: `gym-helper`;
- backend описан как `GymHelper backend on NestJS`;
- в `package.json` указан автор;
- указана целевая версия Node.js для среды выполнения.

Ключевой файл:

- `package.json`

### 3.2.2. Настроен запуск backend

Входная точка backend находится в файле:

- `src/main.ts`

В нем:

- создается `NestExpressApplication`;
- применяется общая конфигурация приложения;
- сервер стартует на `process.env.PORT ?? 3000`.

Это позволяет корректно запускать приложение как локально, так и в облачной среде `Render`.

### 3.2.3. Подключена общая конфигурация Express/Nest

Для выделения конфигурации приложения в отдельный слой был создан файл:

- `src/app.setup.ts`

В рамках ЛР1 в этом файле были настроены:

- `Handlebars` как шаблонизатор;
- директория layout-шаблонов;
- директория partial-шаблонов;
- директория views;
- раздача статических файлов из `public/`.

Позже, уже в ЛР3, сюда была дополнительно добавлена конфигурация `express-session`.

## 3.3. Интеграция React frontend в backend

### 3.3.1. Встроен существующий frontend

Ранее созданный frontend был помещен внутрь backend-проекта:

- исходники — в `frontend/`;
- production-сборка — в `public/`.

### 3.3.2. Настроена frontend-сборка

В `frontend/vite.config.ts` было настроено:

- `base: '/'`;
- `outDir: '../public'`.

Это позволяет собирать frontend сразу в папку, которую backend раздает как статическую.

### 3.3.3. Настроены build-скрипты

В `package.json` backend были добавлены скрипты:

- `build`
- `build:frontend`
- `build:backend`

Логика сборки:

1. сначала собирается frontend;
2. затем генерируется Prisma Client;
3. затем собирается Nest backend.

Это обеспечивает целостную production-сборку приложения.

## 3.4. Раздача React-приложения из NestJS

### 3.4.1. Реализован SPA fallback

В `src/app.controller.ts` настроены маршруты:

- `/`
- `/login`
- `/register`
- `/plan`
- `/workout`
- `/workout/:date`
- `/nutrition`
- `/nutrition/:date`
- `/rest`
- `/rest/:date`
- `/404`

Для этих маршрутов backend отдает `public/index.html`, то есть служит хостом для React SPA.

### 3.4.2. Добавлена fallback-страница при отсутствии собранного frontend

Если `public/index.html` отсутствует, backend возвращает простую HTML-страницу-заглушку. Это полезно во время первоначальной настройки проекта.

## 3.5. Работа с шаблонами в ЛР1

### 3.5.1. Подключен Handlebars

Для демонстрации шаблонизатора был подключен `express-handlebars`.

### 3.5.2. Сделан layout и partials

Была подготовлена базовая структура шаблонов:

- `views/layouts/main.hbs`
- `views/partials/shared-assets.hbs`
- `views/partials/header.hbs`
- `views/partials/menu.hbs`
- `views/partials/session-info.hbs`
- `views/partials/feature-card.hbs`
- `views/partials/footer.hbs`

### 3.5.3. Сделаны серверные страницы для ЛР1

Были реализованы серверные страницы:

- `/lab1`
- `/lab1/exercises`

Шаблоны:

- `views/lab1-home.hbs`
- `views/lab1-exercises.hbs`

### 3.5.4. Подготовлена демонстрационная логика сессии

В ЛР1 использовался простой демонстрационный механизм через query-параметр:

- `?auth=guest`
- `?auth=user`

Это была именно учебная шаблонная демонстрация, не связанная с реальной backend-аутентификацией.

## 3.6. Итог ЛР1

По результатам ЛР1 были достигнуты следующие результаты:

- backend-приложение на NestJS создано;
- React frontend встроен в backend;
- backend умеет раздавать frontend как production-статистику;
- подготовлен шаблонизатор `Handlebars`;
- реализованы две шаблонные server-rendered страницы;
- подготовлена база для дальнейшего развития backend-части;
- настроена сборка и подготовка к деплою на `Render`.

---

## 4. Лабораторная работа 2

## 4.1. Цель ЛР2

Целью второй лабораторной работы было:

- спроектировать доменную модель приложения;
- реализовать ее в реляционной БД;
- подключить ORM;
- подготовить миграции и тестовые данные.

## 4.2. Выбор СУБД и ORM

Для проекта были выбраны:

- `PostgreSQL` как СУБД;
- `Prisma ORM` как инструмент доступа к базе данных.

Дополнительно используются:

- `@prisma/adapter-pg`
- `pg`

## 4.3. Схема базы данных

Схема описана в файле:

- `prisma/schema.prisma`

В ней реализованы следующие сущности:

### 4.3.1. Пользователь

`User`

Поля:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Ограничения:

- `email` уникален

### 4.3.2. План тренировок

`PlanDay`

Поля:

- `id`
- `userId`
- `weekday`
- `createdAt`
- `updatedAt`

Ограничения:

- уникальность пары `(userId, weekday)`

Связанная сущность:

- `PlanExercise`

`PlanExercise` содержит:

- `id`
- `planDayId`
- `sortOrder`
- `name`
- `note`
- `createdAt`
- `updatedAt`

Ограничение:

- уникальность `(planDayId, sortOrder)`

### 4.3.3. Тренировки по датам

`WorkoutDay`

Поля:

- `id`
- `userId`
- `date`
- `createdAt`
- `updatedAt`

Ограничения:

- уникальность `(userId, date)`

Связанные сущности:

- `WorkoutExercise`
- `WorkoutSet`

`WorkoutExercise` содержит:

- `id`
- `workoutDayId`
- `sortOrder`
- `name`
- `createdAt`
- `updatedAt`

Ограничение:

- уникальность `(workoutDayId, sortOrder)`

`WorkoutSet` содержит:

- `id`
- `workoutExerciseId`
- `sortOrder`
- `weight`
- `reps`
- `createdAt`
- `updatedAt`

Ограничение:

- уникальность `(workoutExerciseId, sortOrder)`

### 4.3.4. Питание

`NutritionDay`

Поля:

- `id`
- `userId`
- `date`
- `createdAt`
- `updatedAt`

Ограничение:

- уникальность `(userId, date)`

Связанная сущность:

- `MealEntry`

`MealEntry` содержит:

- `id`
- `nutritionDayId`
- `sortOrder`
- `title`
- `calories`
- `protein`
- `fat`
- `carbs`
- `createdAt`
- `updatedAt`

Ограничение:

- уникальность `(nutritionDayId, sortOrder)`

### 4.3.5. Сон и восстановление

`RestDay`

Поля:

- `id`
- `userId`
- `date`
- `isRest`
- `sleepHours`
- `note`
- `createdAt`
- `updatedAt`

Ограничение:

- уникальность `(userId, date)`

## 4.4. Перечисления

В Prisma-схеме описаны enum-ы:

- `UserRole`
- `Weekday`

`UserRole`:

- `USER`
- `ADMIN`

`Weekday`:

- `MON`
- `TUE`
- `WED`
- `THU`
- `FRI`
- `SAT`
- `SUN`

## 4.5. Связи между сущностями

Ключевые связи:

- `User -> PlanDay -> PlanExercise`
- `User -> WorkoutDay -> WorkoutExercise -> WorkoutSet`
- `User -> NutritionDay -> MealEntry`
- `User -> RestDay`

Во всех зависимых сущностях настроено каскадное удаление (`onDelete: Cascade`).

## 4.6. Подключение Prisma к NestJS

Для работы с ORM создан модуль:

- `src/prisma/prisma.module.ts`
- `src/prisma/prisma.service.ts`

`PrismaService`:

- наследуется от `PrismaClient`;
- получает `DATABASE_URL` через `ConfigService`;
- добавляет `sslmode=verify-full`, если используется Render Postgres без указанного SSL-параметра;
- создает `PrismaPg adapter`;
- подключается к БД в `onModuleInit`;
- закрывает подключение в `onModuleDestroy`.

Таким образом, Prisma интегрирована в Nest через глобальный сервис.

## 4.7. Конфигурация Prisma CLI

Используется файл:

- `prisma.config.ts`

В нем заданы:

- путь до `schema.prisma`;
- путь до директории миграций;
- команда seed;
- URL источника данных из `process.env.DATABASE_URL`.

## 4.8. Миграции

Была создана и зафиксирована первая миграция:

- `prisma/migrations/20260407225203_init_lab2/migration.sql`

Также присутствует:

- `prisma/migrations/migration_lock.toml`

Миграция создает все основные таблицы предметной области.

## 4.9. Seed

Подготовлен seed-скрипт:

- `prisma/seed.js`

Он:

- использует `dotenv/config`;
- использует `PrismaPg adapter`;
- при необходимости автоматически дописывает `sslmode=verify-full` для Render;
- создает или обновляет администратора;
- заполняет тестовые данные.

Тестовый пользователь:

- email: `admin@gymhelper.local`
- пароль: `admin123`

При этом в БД хранится не открытый пароль, а `sha256`-хеш.

Seed создает:

- записи плана тренировок;
- тренировку с упражнениями и подходами;
- записи питания;
- запись сна и восстановления.

## 4.10. Технические особенности ЛР2

### 4.10.1. Production entrypoint

Было зафиксировано, что production-сборка Nest попадает в:

- `dist/src/main.js`

Поэтому в `package.json` для production используется:

- `start:prod = node dist/src/main.js`

### 4.10.2. Миграции не запускаются автоматически при старте

Из-за особенностей работы advisory lock в Prisma на Render миграции не запускаются из `start:prod`.

Для этого предусмотрена отдельная команда:

- `npm run prisma:migrate:deploy`

## 4.11. Итог ЛР2

По результатам ЛР2 были достигнуты следующие результаты:

- спроектирована полная доменная модель проекта;
- реализована структура БД в PostgreSQL;
- подключен Prisma Client;
- настроены миграции;
- реализован seed;
- backend получил устойчивую основу для реализации прикладной логики.

---

## 5. Лабораторная работа 3

## 5.1. Исходная постановка ЛР3 и ее адаптация под проект

Классическая формулировка ЛР3 предполагала:

- использование шаблонов;
- построение MVC-приложения;
- интеграцию бизнес-логики;
- добавление `Server-Sent Events`.

Однако проект `GymHelper` уже имел полноценную клиентскую часть на `React`, поэтому полный переход на `Nest + Handlebars` как основной UI привел бы к фактическому переписыванию всего frontend.

Поэтому ЛР3 была адаптирована под реальную архитектуру проекта:

- `React` сохранен как основной пользовательский интерфейс;
- `NestJS` реализует контроллеры, сервисы, сессии и бизнес-логику;
- `Prisma + PostgreSQL` реализуют модель и хранение данных;
- `SSE` используются для дашборда.

Таким образом, роль представления выполняет `React`, а backend выполняет функции контроллеров, сервисов и модели данных.

## 5.2. Новая модульная структура backend

После выполнения ЛР3 backend был разбит на модули по поддоменам, что соответствует модульному подходу и идеям DDD.

Созданы следующие модули:

- `src/auth`
- `src/dashboard`
- `src/plan`
- `src/workout`
- `src/nutrition`
- `src/rest`
- `src/common`
- `src/prisma`

### 5.2.1. Модуль `common`

Вынесены общие типы и утилиты:

- `src/common/api.types.ts`
- `src/common/date.util.ts`
- `src/common/weekday.util.ts`
- `src/common/suggestions.ts`

Назначение:

- общие DTO-подобные response-типы;
- работа с ISO-датами;
- преобразование weekday-значений;
- единые предложения упражнений.

## 5.3. Реальная backend-аутентификация

### 5.3.1. Сессии

В `src/app.setup.ts` подключен `express-session`.

Используются настройки:

- cookie-сессия;
- имя cookie: `gymhelper.sid`;
- `httpOnly`;
- `sameSite: 'lax'`;
- `secure` в production;
- срок жизни cookie 7 дней.

Для конфигурации добавлена переменная:

- `SESSION_SECRET`

Пример переменных вынесен в:

- `.env.example`

### 5.3.2. Auth module

Состав модуля:

- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/session-auth.guard.ts`
- `src/auth/current-user-id.decorator.ts`
- `src/auth/session.types.ts`
- `src/auth/dto/login.dto.ts`
- `src/auth/dto/register.dto.ts`

### 5.3.3. Функциональность auth

Реализованы endpoint’ы:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

Логика:

- регистрация нового пользователя;
- вход по email и паролю;
- получение текущего пользователя по сессии;
- выход с уничтожением сессии.

Пароли:

- проверяются на backend;
- хранятся как `sha256`-хеш, совместимый с текущим seed.

### 5.3.4. Защита endpoint’ов

Для защиты приватных route’ов используется:

- `SessionAuthGuard`

Если пользователь не авторизован, backend возвращает `401 Unauthorized`.

## 5.4. Реальные backend-модули домена

### 5.4.1. Модуль `plan`

Файлы:

- `src/plan/plan.module.ts`
- `src/plan/plan.controller.ts`
- `src/plan/plan.service.ts`
- `src/plan/dto/save-plan-day.dto.ts`

Endpoint’ы:

- `GET /api/plan/suggestions`
- `GET /api/plan/:weekday`
- `PUT /api/plan/:weekday`

Функциональность:

- получение списка упражнений на день недели;
- сохранение списка упражнений на день недели;
- удаление плана путем сохранения пустого массива;
- привязка данных к текущему пользователю.

### 5.4.2. Модуль `workout`

Файлы:

- `src/workout/workout.module.ts`
- `src/workout/workout.controller.ts`
- `src/workout/workout.service.ts`
- `src/workout/dto/save-workout-day.dto.ts`

Endpoint’ы:

- `GET /api/workouts`
- `GET /api/workouts/suggestions`
- `GET /api/workouts/:date`
- `PUT /api/workouts/:date`

Функциональность:

- получение списка всех тренировочных дней пользователя;
- получение тренировки за конкретную дату;
- сохранение тренировки с вложенными упражнениями и подходами;
- удаление записи при сохранении пустого набора упражнений.

### 5.4.3. Модуль `nutrition`

Файлы:

- `src/nutrition/nutrition.module.ts`
- `src/nutrition/nutrition.controller.ts`
- `src/nutrition/nutrition.service.ts`
- `src/nutrition/dto/save-nutrition-day.dto.ts`

Endpoint’ы:

- `GET /api/nutrition`
- `GET /api/nutrition/:date`
- `PUT /api/nutrition/:date`

Функциональность:

- получение всех nutrition-записей пользователя;
- получение записи по конкретной дате;
- сохранение списка приемов пищи за день;
- удаление записи при пустом содержимом.

### 5.4.4. Модуль `rest`

Файлы:

- `src/rest/rest.module.ts`
- `src/rest/rest.controller.ts`
- `src/rest/rest.service.ts`
- `src/rest/dto/save-rest-day.dto.ts`

Endpoint’ы:

- `GET /api/rest`
- `GET /api/rest/:date`
- `PUT /api/rest/:date`

Функциональность:

- получение списка записей отдыха;
- получение записи отдыха за дату;
- сохранение флага дня отдыха, часов сна и заметки;
- удаление записи, если пользователь оставил полностью пустое состояние.

## 5.5. Dashboard как backend-driven модуль

### 5.5.1. Причина вынесения dashboard в backend

Изначально дашборд считал статистику на стороне React из локальных mock-данных.

После выполнения ЛР3 логика дашборда была перенесена на backend:

- статистика агрегируется на сервере;
- frontend получает уже готовый summary;
- это лучше соответствует идее бизнес-логики в сервисах.

### 5.5.2. Состав dashboard-модуля

Файлы:

- `src/dashboard/dashboard.module.ts`
- `src/dashboard/dashboard.controller.ts`
- `src/dashboard/dashboard.service.ts`
- `src/dashboard/dashboard-events.service.ts`

### 5.5.3. Реализованные endpoint’ы dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/stream` через `@Sse`

### 5.5.4. Реализованная бизнес-логика summary

В `DashboardService` реализован подсчет статистики за последние 14 дней:

- количество тренировочных дней;
- среднее количество калорий;
- среднее количество часов сна.

Для этого dashboard агрегирует данные из:

- `WorkoutDay`
- `NutritionDay`
- `RestDay`

### 5.5.5. Реализация SSE

Для realtime-уведомлений реализован `DashboardEventsService`.

Принцип работы:

- внутри сервиса используется `Subject` из `RxJS`;
- сервис публикует события по конкретному `userId`;
- SSE-поток фильтруется так, чтобы пользователь видел только свои события.

Тип события включает:

- `reason`
- `message`

### 5.5.6. Какие изменения генерируют SSE

События публикуются из сервисов:

- `WorkoutService`
- `NutritionService`
- `RestService`

То есть при изменении данных, влияющих на дашборд, клиент получает live-сообщение и может обновить summary.

## 5.6. Интеграция frontend с реальным backend

### 5.6.1. Общий HTTP-слой

Для frontend был добавлен единый helper:

- `frontend/src/api/http.ts`

Он:

- выполняет `fetch`;
- автоматически отправляет `credentials: 'include'`;
- обрабатывает ошибки ответа;
- возвращает JSON или `null` для пустого ответа.

### 5.6.2. Перевод API-слоя с mock на HTTP

Были обновлены frontend API-файлы:

- `frontend/src/api/authApi.ts`
- `frontend/src/api/planApi.ts`
- `frontend/src/api/workoutApi.ts`
- `frontend/src/api/nutritionApi.ts`
- `frontend/src/api/restApi.ts`
- `frontend/src/api/dashboardApi.ts`

Ранее эти файлы работали через `mockDb.ts` и `localStorage`.

Теперь они делают реальные запросы к backend:

- `/api/auth/*`
- `/api/plan/*`
- `/api/workouts/*`
- `/api/nutrition/*`
- `/api/rest/*`
- `/api/dashboard/*`

### 5.6.3. Сохранение React как основного UI

При этом сами страницы React не были переписаны заново как шаблоны.

Сохранились страницы:

- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/PlanPage.tsx`
- `frontend/src/pages/WorkoutPage.tsx`
- `frontend/src/pages/NutritionPage.tsx`
- `frontend/src/pages/RestPage.tsx`

Это было осознанное архитектурное решение:

- не дублировать интерфейс на Handlebars;
- сохранить уже подготовленную React-структуру;
- сосредоточиться на реальном backend и интеграции.

### 5.6.4. Обновление DashboardPage

`frontend/src/pages/DashboardPage.tsx` теперь:

- получает summary с backend через `dashboardApi`;
- подписывается на `EventSource('/api/dashboard/stream')`;
- при получении события показывает сообщение об обновлении;
- заново загружает summary.

Таким образом, дашборд в проекте работает как realtime-страница, обновляемая сервером.

### 5.6.5. Vite proxy

Для локальной разработки в `frontend/vite.config.ts` добавлен proxy:

- `/api` -> `http://localhost:3000`

Это позволяет:

- запускать frontend отдельно;
- обращаться к backend без проблем с origin во время разработки.

## 5.7. Сохраненные элементы ЛР1

Несмотря на переход к реальной backend-логике, в проекте по-прежнему сохранены:

- шаблоны из ЛР1;
- Handlebars-конфигурация;
- маршруты `/lab1` и `/lab1/exercises`.

Это полезно как история развития проекта и как подтверждение выполнения первой лабораторной работы.

## 5.8. Проверка и тестирование ЛР3

### 5.8.1. Unit-тесты

Проверяются:

- `AppController`
- `DashboardEventsService`

Файлы:

- `src/app.controller.spec.ts`
- `src/dashboard/dashboard-events.service.spec.ts`

### 5.8.2. E2E-тесты

Реализован файл:

- `test/app.e2e-spec.ts`

Он проверяет реальные пользовательские сценарии:

- доступность собранного frontend shell;
- защиту приватных API без сессии;
- регистрацию пользователя;
- восстановление сессии через `GET /api/auth/me`;
- сохранение плана;
- сохранение тренировки;
- сохранение питания;
- сохранение сна и отдыха;
- получение backend summary для dashboard;
- logout и очистку сессии.

### 5.8.3. Команды, которые успешно проходят

На текущем этапе успешно проходят:

```bash
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Это означает, что:

- backend-компиляция проходит;
- frontend-компиляция проходит;
- Nest и React интегрируются корректно;
- API-сценарии работают;
- основные бизнес-сценарии покрыты автотестами.

## 5.9. Итог ЛР3

После выполнения адаптированной ЛР3 backend получил полноценную прикладную структуру:

- реальная аутентификация через backend;
- модульное разделение по доменам;
- вынесенная бизнес-логика в сервисы;
- реальные endpoint’ы для frontend;
- dashboard summary на стороне backend;
- SSE-уведомления для live-обновления дашборда;
- автоматические проверки на уровне unit и e2e.

Именно это позволяет считать ЛР3 завершенной в формате, согласованном под архитектуру проекта `GymHelper`.

---

## 6. Текущие важные backend-файлы

### 6.1. Общая конфигурация

- `package.json`
- `.env.example`
- `src/main.ts`
- `src/app.module.ts`
- `src/app.setup.ts`

### 6.2. Приложение и шаблоны ЛР1

- `src/app.controller.ts`
- `src/app.service.ts`
- `views/layouts/main.hbs`
- `views/lab1-home.hbs`
- `views/lab1-exercises.hbs`
- `views/partials/*`

### 6.3. Prisma и БД

- `prisma/schema.prisma`
- `prisma/seed.js`
- `prisma.config.ts`
- `src/prisma/prisma.module.ts`
- `src/prisma/prisma.service.ts`

### 6.4. Auth

- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/session-auth.guard.ts`

### 6.5. Поддомены

- `src/plan/*`
- `src/workout/*`
- `src/nutrition/*`
- `src/rest/*`
- `src/dashboard/*`

### 6.6. Frontend API integration

- `frontend/src/api/http.ts`
- `frontend/src/api/authApi.ts`
- `frontend/src/api/planApi.ts`
- `frontend/src/api/workoutApi.ts`
- `frontend/src/api/nutritionApi.ts`
- `frontend/src/api/restApi.ts`
- `frontend/src/api/dashboardApi.ts`

### 6.7. Проверки

- `src/app.controller.spec.ts`
- `src/dashboard/dashboard-events.service.spec.ts`
- `test/app.e2e-spec.ts`

---

## 7. Что реализовано полностью, а что пока еще нет

## 7.1. Полностью реализовано

- базовый backend на `NestJS`;
- интеграция существующего React frontend;
- шаблоны и partials из ЛР1;
- раздача собранного frontend из backend;
- PostgreSQL + Prisma;
- миграции и seed;
- backend session auth;
- реальные backend endpoint’ы для основных разделов;
- backend summary для dashboard;
- SSE для dashboard;
- unit/e2e тестирование;
- production build.

## 7.2. Пока не реализовано

Следующие части в текущем состоянии проекта еще не реализованы или реализованы не полностью:

- `Swagger / OpenAPI` спецификация;
- полноценные `REST`-контроллеры с документацией как в отдельной ЛР4;
- `GraphQL`;
- расширенные `validation pipes` и DTO-валидация;
- полноценная backend-авторизация по ролям;
- постоянное хранение сессий не в `MemoryStore`, а, например, в Redis/PostgreSQL;
- file upload;
- production hardening и security-настройки.

Эти задачи логично относятся уже к следующим лабораторным работам.

---

## 8. Заключение

В ходе выполнения трех лабораторных работ backend-часть проекта `GymHelper` прошла путь от базового NestJS-приложения с интеграцией frontend и шаблонов до полноценного backend с доменной моделью, реальной БД, модульной бизнес-логикой, аутентификацией, HTTP API и механизмом server-sent events.

### Основные результаты:

- backend и frontend объединены в единое приложение;
- предметная область полностью описана в PostgreSQL/Prisma;
- backend работает не как заглушка, а как реальный слой данных и логики;
- React сохранен как основной интерфейс проекта;
- dashboard переведен на backend-агрегацию и realtime-обновления;
- проект успешно собирается и проходит автоматические проверки.

Итоговое состояние проекта можно считать хорошей основой для следующих лабораторных работ:

- ЛР4 — REST API и его спецификация;
- ЛР5 — GraphQL;
- ЛР6 — дополнительные возможности NestJS как BFF;
- ЛР7 — полноценная аутентификация и авторизация.
