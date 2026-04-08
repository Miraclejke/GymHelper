# Отчет по лабораторной работе 4

## 1. Название лабораторной работы

`ЛР4. Разработка RESTful API и его спецификации`

## 2. Цель лабораторной работы

Целью четвертой лабораторной работы было:

- привести backend проекта к более полному RESTful-формату;
- добавить серверную валидацию входных данных;
- реализовать единый формат обработки ошибок;
- добавить пагинацию для коллекций;
- сформировать спецификацию OpenAPI;
- подключить Swagger для визуальной документации и проверки API.

## 3. Адаптация ЛР4 под проект GymHelper

Классическая формулировка ЛР4 предполагает создание API-контроллеров поверх уже существующего MVC-приложения. В проекте `GymHelper` ситуация иная:

- пользовательский интерфейс реализован на `React`;
- backend уже был разделен на доменные модули в рамках ЛР3;
- реальные endpoint'ы уже использовались frontend-частью;
- проект уже работал по схеме `React + NestJS + Prisma + PostgreSQL`.

Поэтому ЛР4 была адаптирована под архитектуру проекта следующим образом:

- не создавался второй дублирующий набор API-контроллеров;
- не переписывался frontend;
- текущий backend API был доработан до более строгого REST-вида;
- были добавлены валидация, Swagger, пагинация и единый JSON-формат ошибок.

Таким образом, в рамках ЛР4 в проекте `GymHelper` выполнялось не создание API с нуля, а доработка уже существующего рабочего backend API до учебного стандарта REST + OpenAPI.

## 4. Исходное состояние проекта перед ЛР4

До начала выполнения ЛР4 в проекте уже были реализованы:

- `NestJS` backend;
- интеграция `React` frontend в backend-проект;
- доменная модель в `PostgreSQL` через `Prisma`;
- модули `auth`, `plan`, `workout`, `nutrition`, `rest`, `dashboard`;
- cookie-session аутентификация;
- реальные endpoint'ы для frontend;
- `SSE` для dashboard;
- unit- и e2e-тесты.

При этом отсутствовали или были реализованы не полностью:

- глобальный `ValidationPipe`;
- полноценная DTO-валидация через `class-validator`;
- единый `ExceptionFilter`;
- документация Swagger/OpenAPI;
- пагинация коллекций;
- response DTO-классы для документации;
- единый подход к описанию ошибок API.

## 5. Что было реализовано в ЛР4

## 5.1. Подключены зависимости для валидации и Swagger

В проект были добавлены зависимости:

- `class-validator`
- `class-transformer`
- `@nestjs/swagger`
- `swagger-ui-express`

Они используются для:

- проверки тел запросов;
- преобразования query/body-параметров;
- генерации OpenAPI-спецификации;
- визуального интерфейса Swagger UI.

## 5.2. Настроена глобальная конфигурация приложения для ЛР4

В файле:

- `src/app.setup.ts`

были добавлены:

- глобальный `ValidationPipe`;
- глобальный `HttpExceptionFilter`;
- настройка Swagger/OpenAPI;
- публикация Swagger UI по адресу `/api/docs`;
- публикация OpenAPI JSON по адресу `/api/docs-json`.

`ValidationPipe` настроен с параметрами:

- `transform: true`
- `whitelist: true`
- `forbidNonWhitelisted: true`

Это означает:

- поля приводятся к нужным типам;
- лишние поля не принимаются;
- при невалидных данных клиент получает `400 Bad Request`.

## 5.3. Реализован единый формат ошибок API

Для унифицированной обработки ошибок был создан фильтр:

- `src/common/filters/http-exception.filter.ts`

Фильтр:

- обрабатывает `HttpException`;
- обрабатывает ошибки `Prisma`;
- возвращает единый JSON-ответ.

Пример формата ошибки:

```json
{
  "statusCode": 401,
  "message": "You need to log in.",
  "error": "Unauthorized",
  "path": "/api/workouts/2026-04-08",
  "timestamp": "2026-04-08T10:54:58.858Z"
}
```

Это упрощает:

- обработку ошибок на frontend;
- тестирование;
- визуальную демонстрацию в Swagger;
- единообразие API.

## 5.4. Переделаны DTO на полноценную валидацию

Были обновлены request DTO:

- `src/auth/dto/login.dto.ts`
- `src/auth/dto/register.dto.ts`
- `src/plan/dto/save-plan-day.dto.ts`
- `src/workout/dto/save-workout-day.dto.ts`
- `src/nutrition/dto/save-nutrition-day.dto.ts`
- `src/rest/dto/save-rest-day.dto.ts`

В DTO были добавлены декораторы:

- `@IsEmail`
- `@IsString`
- `@IsArray`
- `@ValidateNested`
- `@IsOptional`
- `@IsNumber`
- `@IsInt`
- `@IsBoolean`
- `@Min`
- `@Max`
- `@MinLength`

Также для вложенных структур были созданы отдельные input DTO-классы, например:

- для подходов тренировки;
- для упражнений тренировки;
- для приемов пищи;
- для упражнений плана.

Это сделало валидацию:

- более прозрачной;
- расширяемой;
- хорошо документируемой в Swagger.

## 5.5. Добавлены response DTO для документации

Для корректного описания ответов в Swagger были созданы отдельные response DTO-классы:

- `src/auth/dto/auth-user.response.dto.ts`
- `src/plan/dto/plan.response.dto.ts`
- `src/workout/dto/workout.response.dto.ts`
- `src/nutrition/dto/nutrition.response.dto.ts`
- `src/rest/dto/rest.response.dto.ts`
- `src/dashboard/dto/dashboard.response.dto.ts`
- `src/common/dto/error-response.dto.ts`
- `src/common/dto/paginated-response.dto.ts`

Это позволило:

- задать структуру ответа явно;
- описать ошибки и пагинацию;
- сделать Swagger-представление более понятным.

## 5.6. Добавлена пагинация для коллекций

В рамках ЛР4 была реализована пагинация для endpoint'ов коллекций:

- `GET /api/workouts`
- `GET /api/nutrition`
- `GET /api/rest`

Для этого были добавлены:

- query DTO `src/common/dto/pagination-query.dto.ts`
- helper `src/common/pagination.util.ts`

Поддерживаются параметры:

- `page`
- `limit`

Формат ответа коллекции:

```json
{
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 23,
  "totalPages": 3
}
```

Дополнительно сервер выставляет заголовки:

- `Link`
- `X-Total-Count`

Это приближает API к REST/HATEOAS-подходу и соответствует требованиям ЛР4.

## 5.7. Расширен API модуля plan

Ранее план тренировок можно было получать только по одному дню недели:

- `GET /api/plan/:weekday`

В рамках ЛР4 был добавлен новый endpoint:

- `GET /api/plan`

Он возвращает недельный план целиком:

- `mon`
- `tue`
- `wed`
- `thu`
- `fri`
- `sat`
- `sun`

Это сделало API более полным и более REST-ориентированным.

## 5.8. Контроллеры оформлены Swagger-декораторами

Во все основные контроллеры были добавлены Swagger-декораторы:

- `@ApiTags`
- `@ApiOperation`
- `@ApiOkResponse`
- `@ApiCreatedResponse`
- `@ApiNoContentResponse`
- `@ApiBadRequestResponse`
- `@ApiUnauthorizedResponse`
- `@ApiCookieAuth`
- `@ApiParam`
- `@ApiQuery`

Один тег соответствует одному модулю:

- `auth`
- `plan`
- `workouts`
- `nutrition`
- `rest`
- `dashboard`

Это соответствует требованиям ЛР4 по структурированию OpenAPI-документации.

## 5.9. Сохранена совместимость с frontend

Важной задачей было не сломать уже работающий `React` frontend.

Поэтому:

- существующие `GET /api/.../:date` и `PUT /api/.../:date` были сохранены;
- текущая логика работы страниц осталась прежней;
- основные сценарии `getDay/saveDay` не были изменены по смыслу;
- фронтовый API-слой был синхронизирован с новым пагинированным контрактом списков.

Таким образом, ЛР4 была реализована без разрушения уже работающей архитектуры проекта.

## 5.10. Обновлены автоматические тесты

Был расширен e2e-файл:

- `test/app.e2e-spec.ts`

Добавлены проверки:

- `401 Unauthorized` без сессии;
- доступности Swagger UI;
- доступности OpenAPI JSON;
- `400 Bad Request` при невалидных данных;
- сохранения и получения данных;
- `GET /api/plan`;
- пагинации `workouts`;
- наличия заголовка `Link`;
- корректности dashboard summary.

## 6. Реализованные endpoint'ы после ЛР4

### 6.1. Auth

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

### 6.2. Plan

- `GET /api/plan`
- `GET /api/plan/suggestions`
- `GET /api/plan/:weekday`
- `PUT /api/plan/:weekday`

### 6.3. Workouts

- `GET /api/workouts?page=1&limit=10`
- `GET /api/workouts/suggestions`
- `GET /api/workouts/:date`
- `PUT /api/workouts/:date`

### 6.4. Nutrition

- `GET /api/nutrition?page=1&limit=10`
- `GET /api/nutrition/:date`
- `PUT /api/nutrition/:date`

### 6.5. Rest

- `GET /api/rest?page=1&limit=10`
- `GET /api/rest/:date`
- `PUT /api/rest/:date`

### 6.6. Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/stream`

## 7. Основные файлы, измененные в рамках ЛР4

### 7.1. Конфигурация приложения

- `package.json`
- `src/app.setup.ts`

### 7.2. Общие файлы

- `src/common/api.types.ts`
- `src/common/date.util.ts`
- `src/common/weekday.util.ts`
- `src/common/pagination.util.ts`
- `src/common/filters/http-exception.filter.ts`
- `src/common/dto/error-response.dto.ts`
- `src/common/dto/pagination-query.dto.ts`
- `src/common/dto/paginated-response.dto.ts`

### 7.3. Auth

- `src/auth/auth.controller.ts`
- `src/auth/dto/login.dto.ts`
- `src/auth/dto/register.dto.ts`
- `src/auth/dto/auth-user.response.dto.ts`

### 7.4. Plan

- `src/plan/plan.controller.ts`
- `src/plan/plan.service.ts`
- `src/plan/dto/save-plan-day.dto.ts`
- `src/plan/dto/plan.response.dto.ts`

### 7.5. Workout

- `src/workout/workout.controller.ts`
- `src/workout/workout.service.ts`
- `src/workout/dto/save-workout-day.dto.ts`
- `src/workout/dto/workout.response.dto.ts`

### 7.6. Nutrition

- `src/nutrition/nutrition.controller.ts`
- `src/nutrition/nutrition.service.ts`
- `src/nutrition/dto/save-nutrition-day.dto.ts`
- `src/nutrition/dto/nutrition.response.dto.ts`

### 7.7. Rest

- `src/rest/rest.controller.ts`
- `src/rest/rest.service.ts`
- `src/rest/dto/save-rest-day.dto.ts`
- `src/rest/dto/rest.response.dto.ts`

### 7.8. Dashboard

- `src/dashboard/dashboard.controller.ts`
- `src/dashboard/dto/dashboard.response.dto.ts`

### 7.9. Frontend API synchronization

- `frontend/src/api/workoutApi.ts`
- `frontend/src/api/nutritionApi.ts`
- `frontend/src/api/restApi.ts`
- `frontend/src/api/types.ts`

### 7.10. Тесты

- `test/app.e2e-spec.ts`

## 8. Как проверить выполнение ЛР4

Проверка ЛР4 может выполняться в трех форматах:

- автоматические тесты;
- ручная проверка через Swagger;
- итоговая сборка проекта.

## 8.1. Автоматическая проверка

Из директории проекта нужно выполнить:

```bash
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Ожидаемый результат:

- unit-тесты проходят;
- e2e-тесты проходят;
- frontend и backend успешно собираются.

## 8.2. Проверка Swagger

Нужно запустить backend:

```bash
npm run start:dev
```

После этого открыть:

- `http://localhost:3000/api/docs`
- `http://localhost:3000/api/docs-json`

В Swagger необходимо проверить:

- наличие тегов по модулям;
- наличие описания request body;
- наличие описания response body;
- наличие кодов ответа `200`, `201`, `204`, `400`, `401`;
- наличие cookie-auth в описании защищенных endpoint'ов.

## 8.3. Базовый сценарий ручной проверки в Swagger

### Шаг 1. Проверка 401 без логина

Вызвать:

- `GET /api/workouts/{date}`

с датой:

- `2026-04-08`

Ожидаемый результат:

- `401 Unauthorized`
- JSON с полями `statusCode`, `message`, `error`, `path`, `timestamp`

### Шаг 2. Регистрация пользователя

Вызвать:

- `POST /api/auth/register`

Пример тела:

```json
{
  "name": "Swagger User",
  "email": "swagger-test@gymhelper.local",
  "password": "pass1234"
}
```

Ожидаемый результат:

- `201 Created`
- возвращаются данные пользователя

### Шаг 3. Проверка активной сессии

Вызвать:

- `GET /api/auth/me`

Ожидаемый результат:

- `200 OK`
- возвращается текущий пользователь

### Шаг 4. Проверка валидации 400

Вызвать:

- `POST /api/auth/register`

с невалидным телом:

```json
{
  "name": "",
  "email": "bad-email",
  "password": "123"
}
```

Ожидаемый результат:

- `400 Bad Request`
- `message` содержит ошибки валидации

### Шаг 5. Сохранение тренировки

Вызвать:

- `PUT /api/workouts/{date}`

с датой:

- `2026-04-08`

и телом:

```json
{
  "exercises": [
    {
      "name": "Bench press",
      "sets": [
        { "weight": 60, "reps": 8 },
        { "weight": 62.5, "reps": 6 }
      ]
    }
  ]
}
```

Ожидаемый результат:

- `200 OK`
- тренировка сохраняется

### Шаг 6. Получение тренировки по дате

Вызвать:

- `GET /api/workouts/{date}`

с той же датой.

Ожидаемый результат:

- `200 OK`
- возвращается сохраненная тренировка

### Шаг 7. Проверка пагинации

Сначала создать как минимум две тренировки на разные даты, затем вызвать:

- `GET /api/workouts?page=1&limit=1`

Ожидаемый результат:

- в body есть `items`, `page`, `limit`, `total`, `totalPages`
- в headers есть `Link`
- в headers есть `X-Total-Count`

### Шаг 8. Проверка недельного плана

Сначала вызвать:

- `PUT /api/plan/mon`

с телом:

```json
{
  "exercises": [
    { "name": "Bench press", "note": "5x5" },
    { "name": "Pull-up", "note": "3x8" }
  ]
}
```

После этого вызвать:

- `GET /api/plan`

Ожидаемый результат:

- возвращается недельный объект `mon` ... `sun`

### Шаг 9. Проверка logout

Вызвать:

- `POST /api/auth/logout`

После этого снова вызвать защищенный endpoint, например:

- `GET /api/workouts/{date}`

Ожидаемый результат:

- снова `401 Unauthorized`

## 9. Итоговые результаты ЛР4

По результатам выполнения ЛР4 в проекте `GymHelper` были достигнуты следующие результаты:

- backend API приведен к более полному RESTful-виду;
- включена глобальная серверная валидация;
- реализован единый JSON-формат ошибок;
- добавлена пагинация коллекций;
- подключен Swagger/OpenAPI;
- все основные контроллеры документированы;
- добавлены request/response DTO для документации;
- расширены e2e-проверки;
- сохранена совместимость с существующим React frontend.

## 10. Заключение

В ходе выполнения лабораторной работы 4 backend проекта `GymHelper` был переведен из состояния "рабочий API для frontend" в состояние "документированный и валидируемый REST API".

Главные результаты ЛР4:

- API стало формально описанным;
- ошибки стали единообразными;
- входные данные начали проверяться на сервере;
- коллекции получили пагинацию;
- появилась полноценная Swagger-документация;
- проект сохранил исходную архитектуру `React + NestJS + Prisma`.

Таким образом, ЛР4 для проекта `GymHelper` можно считать выполненной: API не только работает, но и оформлено, документировано и проверяется как автоматически, так и вручную через Swagger.
