# План тестирования ЛР5 для проекта GymHelper

Дата: `2026-04-08`

## 1. Цель тестирования

Проверить, что реализованный слой `GraphQL` в проекте `GymHelper`:

- корректно подключен к backend на `NestJS`;
- доступен по адресу `/graphql`;
- работает поверх уже существующих сервисов;
- поддерживает авторизацию через текущую сессию;
- корректно выполняет `query`, `mutation` и `field resolver`;
- не ломает уже существующий `REST API`;
- ограничивает слишком сложные запросы.

## 2. Что входит в тестирование

Проверяются:

- endpoint `GET /graphql`;
- schema introspection;
- `AuthResolver`;
- `PlanResolver`;
- `WorkoutResolver`;
- `DashboardResolver`;
- `WorkoutDayFieldResolver`;
- `WorkoutExerciseFieldResolver`;
- `GqlSessionAuthGuard`;
- `ComplexityPlugin`;
- совместимость `GraphQL` и существующего `REST API`.

Не входят в объем ЛР5:

- `Nutrition` через GraphQL;
- `Rest` через GraphQL;
- GraphQL subscriptions;
- перевод frontend с REST на GraphQL.

## 3. Тестовая среда

Минимальная среда:

- `Node.js`
- `npm`
- `PostgreSQL`
- настроенный `.env` с рабочим `DATABASE_URL`
- backend-проект `GymHelper-backend/gym-helper`

Команды подготовки:

```bash
npm install
npm run prisma:generate
npm run build
```

Команда запуска:

```bash
npm run start:dev
```

После запуска должны быть доступны:

- `http://localhost:3000/graphql`
- `http://localhost:3000/api/docs`

## 4. Критерии входа в тестирование

Перед началом тестирования должно быть выполнено:

- backend собирается без ошибок;
- база данных доступна;
- миграции применены;
- сервер запускается;
- endpoint `/graphql` подключен;
- schema генерируется в `code-first` режиме.

## 5. Критерии завершения тестирования

ЛР5 можно считать протестированной успешно, если:

- все обязательные GraphQL-операции работают;
- неавторизованные запросы к защищенным операциям отклоняются;
- мутации сохраняют данные в базе;
- запросы читают те же данные, что были записаны;
- nested fields возвращаются корректно;
- introspection работает;
- ограничение сложности срабатывает;
- `REST API` продолжает работать как раньше;
- проходят автоматические unit/e2e проверки.

## 6. Стратегия тестирования

Рекомендуется использовать два уровня проверки:

### 6.1. Автоматизированная проверка

Команды:

```bash
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Что покрывают автоматические тесты:

- базовые unit-тесты проекта;
- e2e-проверки `REST API`;
- доступность `GraphiQL`;
- выполнение GraphQL-мутатций и GraphQL-запросов в рамках e2e-сценария;
- совместимость GraphQL с текущей session-auth.

### 6.2. Ручная проверка

Ручная проверка нужна, чтобы показать преподавателю:

- песочницу `GraphiQL`;
- структуру схемы;
- примеры query/mutation;
- поведение авторизации;
- ошибку превышения сложности запроса.

## 7. Набор тест-кейсов

## TC-01. Доступность GraphiQL

Цель:
проверить, что GraphQL IDE доступна в браузере.

Шаги:

1. Запустить backend.
2. Открыть `http://localhost:3000/graphql`.

Ожидаемый результат:

- страница открывается;
- отображается интерфейс `GraphiQL`;
- можно увидеть панель со схемой.

## TC-02. Работоспособность introspection

Цель:
проверить, что схема доступна для просмотра и не блокируется плагином сложности.

Шаги:

1. В `GraphiQL` открыть документацию схемы.
2. Или выполнить introspection-запрос.

Ожидаемый результат:

- схема загружается;
- query root отображается;
- introspection не возвращает ошибку сложности.

## TC-03. Попытка доступа без сессии

Цель:
проверить защиту GraphQL-операций.

Пример запроса:

```graphql
query {
  weeklyPlan {
    mon {
      name
    }
  }
}
```

Шаги:

1. Убедиться, что пользователь не авторизован.
2. Выполнить защищенный query.

Ожидаемый результат:

- ответ содержит `errors`;
- сообщение ошибки: `You need to log in.`;
- данные защищенного query не возвращаются.

## TC-04. Регистрация через GraphQL

Цель:
проверить mutation `register`.

Пример:

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    id
    name
    email
    role
  }
}
```

Пример variables:

```json
{
  "input": {
    "name": "GraphQL User",
    "email": "graphql-user@gymhelper.local",
    "password": "pass1234"
  }
}
```

Ожидаемый результат:

- пользователь создается;
- возвращаются `id`, `name`, `email`, `role`;
- сервер создает сессию.

## TC-05. Получение текущего пользователя через `me`

Цель:
проверить, что сессия после `register` или `login` действительно работает.

Пример:

```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

Ожидаемый результат:

- возвращается текущий пользователь;
- `email` совпадает с учетной записью, под которой был выполнен вход.

## TC-06. Логин через GraphQL

Цель:
проверить mutation `login`.

Пример:

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    id
    email
    role
  }
}
```

Ожидаемый результат:

- при корректных данных создается сессия;
- возвращаются данные пользователя;
- после этого `me` отрабатывает успешно.

## TC-07. Некорректный логин

Цель:
проверить негативный сценарий auth.

Шаги:

1. Выполнить `login` с неправильным паролем.

Ожидаемый результат:

- ответ содержит `errors`;
- в сообщении есть `Invalid email or password.`;
- сессия не создается.

## TC-08. Получение недельного плана

Цель:
проверить query `weeklyPlan`.

Пример:

```graphql
query {
  weeklyPlan {
    mon { name note }
    tue { name note }
    wed { name note }
    thu { name note }
    fri { name note }
    sat { name note }
    sun { name note }
  }
}
```

Ожидаемый результат:

- возвращается объект на 7 дней;
- для пустых дней приходят пустые массивы;
- структура совпадает с доменной моделью.

## TC-09. Сохранение плана на день

Цель:
проверить mutation `savePlanDay`.

Пример:

```graphql
mutation SavePlan($weekday: WeekdayKey!, $input: SavePlanDayInput!) {
  savePlanDay(weekday: $weekday, input: $input) {
    name
    note
  }
}
```

Пример variables:

```json
{
  "weekday": "MON",
  "input": {
    "exercises": [
      { "name": "Bench press", "note": "5x5" },
      { "name": "Pull-up", "note": "3x8" }
    ]
  }
}
```

Ожидаемый результат:

- план сохраняется;
- mutation возвращает сохраненные упражнения;
- повторный query `planDay` возвращает те же данные.

## TC-10. Получение плана на конкретный день

Цель:
проверить query `planDay`.

Пример:

```graphql
query {
  planDay(weekday: MON) {
    id
    name
    note
  }
}
```

Ожидаемый результат:

- возвращается массив упражнений для выбранного дня;
- данные совпадают с последним сохранением.

## TC-11. Получение exercise suggestions

Цель:
проверить вспомогательный query `exerciseSuggestions`.

Пример:

```graphql
query {
  exerciseSuggestions
}
```

Ожидаемый результат:

- возвращается массив строк;
- список не пустой.

## TC-12. Сохранение тренировки

Цель:
проверить mutation `saveWorkoutDay`.

Пример:

```graphql
mutation SaveWorkout($date: String!, $input: SaveWorkoutDayInput!) {
  saveWorkoutDay(date: $date, input: $input) {
    date
    exercises {
      name
      sets {
        weight
        reps
      }
    }
  }
}
```

Пример variables:

```json
{
  "date": "2026-04-08",
  "input": {
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
}
```

Ожидаемый результат:

- тренировка сохраняется;
- дата возвращается корректно;
- вложенные `sets` возвращаются вместе с упражнением.

## TC-13. Получение тренировки по дате

Цель:
проверить query `workoutDay`.

Пример:

```graphql
query {
  workoutDay(date: "2026-04-08") {
    date
    exercises {
      id
      name
      sets {
        id
        weight
        reps
      }
    }
  }
}
```

Ожидаемый результат:

- возвращается сохраненная тренировка;
- вложенные `exercises` и `sets` присутствуют;
- field resolver работает корректно.

## TC-14. Проверка пагинации workouts

Цель:
проверить query `workouts(page, limit)`.

Пример:

```graphql
query {
  workouts(page: 1, limit: 5) {
    page
    limit
    total
    totalPages
    items {
      date
    }
  }
}
```

Ожидаемый результат:

- возвращаются `page`, `limit`, `total`, `totalPages`, `items`;
- структура совпадает с пагинированным ответом;
- `items` содержит даты тренировок.

## TC-15. Получение dashboard summary

Цель:
проверить query `dashboardSummary`.

Пример:

```graphql
query {
  dashboardSummary {
    workoutDays
    avgCalories
    avgSleep
  }
}
```

Ожидаемый результат:

- возвращается агрегированный объект;
- поля имеют числовые значения;
- данные согласованы с текущими сохраненными сущностями.

## TC-16. Логаут через GraphQL

Цель:
проверить mutation `logout`.

Пример:

```graphql
mutation {
  logout
}
```

Шаги:

1. Выполнить `logout`.
2. После этого снова выполнить `me`.

Ожидаемый результат:

- `logout` возвращает `true`;
- следующая попытка доступа к защищенным query завершается ошибкой авторизации.

## TC-17. Ошибка сложности запроса

Цель:
проверить работу `ComplexityPlugin`.

Шаги:

1. Выполнить искусственно большой query, который запрашивает много полей и списков одновременно.

Ожидаемый результат:

- ответ содержит `errors`;
- сообщение содержит текст вида:
  `Query is too complex: ... Maximum allowed complexity is 30.`

## TC-18. Регрессия REST API

Цель:
убедиться, что после добавления GraphQL не сломался существующий REST.

Шаги:

1. Выполнить:
   - `GET /api/docs`
   - `GET /api/auth/me`
   - `PUT /api/plan/mon`
   - `PUT /api/workouts/{date}`

Ожидаемый результат:

- REST endpoints продолжают работать;
- Swagger открывается;
- старые сценарии проекта не сломаны.

## 8. Рекомендуемый порядок проверки на защите

Оптимальный порядок демонстрации:

1. Показать `http://localhost:3000/graphql`
2. Открыть схему
3. Выполнить `register` или `login`
4. Выполнить `me`
5. Выполнить `savePlanDay`
6. Выполнить `planDay` и `weeklyPlan`
7. Выполнить `saveWorkoutDay`
8. Выполнить `workoutDay`
9. Выполнить `workouts(page, limit)`
10. Выполнить `dashboardSummary`
11. Показать `logout`
12. Показать негативный запрос без сессии
13. Показать ошибку сложности

## 9. Автоматические проверки, которые уже стоит запускать

Перед сдачей ЛР5 рекомендуется выполнить:

```bash
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Ожидаемый результат:

- unit-тесты проходят;
- e2e-тесты проходят;
- frontend и backend собираются без ошибок.

## 10. Итог

Если по данному плану успешно проходят:

- ручные GraphQL-сценарии;
- негативные проверки;
- проверка сложности;
- регрессия по REST;
- автоматические тесты,

то ЛР5 можно считать протестированной и готовой к защите.
