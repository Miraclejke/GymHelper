# План реализации ЛР5 для проекта GymHelper

Дата: `2026-04-08`

## 1. Цель ЛР5 в контексте проекта

Классическая формулировка ЛР5 требует добавить в проект схему `GraphQL`, запросы, мутации и встроенную песочницу.

Для проекта `GymHelper` это лучше трактовать так:

- не переписывать существующий `React` frontend;
- не удалять уже сделанный `REST API` из ЛР4;
- добавить **второй способ доступа к тем же данным** поверх уже существующих сервисов `NestJS`;
- переиспользовать текущую бизнес-логику из `auth`, `plan`, `workout`, `dashboard`.

То есть в `GymHelper` ЛР5 должна быть не "новым backend с нуля", а **тонким GraphQL-слоем над текущими сервисами**.

## 2. Что уже готово и почему это важно

Сейчас в проекте уже есть хорошая база для ЛР5:

- доменные сервисы уже написаны;
- бизнес-логика уже вынесена в `services`;
- есть реальные сущности в `PostgreSQL + Prisma`;
- есть backend-сессия через `express-session`;
- есть рабочий `REST API`, который можно использовать как ориентир для GraphQL-операций;
- есть DTO и валидация после ЛР4.

Это значит, что в ЛР5 не нужно заново придумывать доменную модель. Нужно только:

1. подключить `GraphQLModule`;
2. описать `ObjectType` и `InputType`;
3. создать `resolver`-классы;
4. внутри резолверов вызывать уже существующие сервисы.

## 3. Важная адаптация под текущий NestJS

В тексте лабораторной сказано про встроенную песочницу GraphQL. Это соответствует идее ЛР, но есть важное уточнение по текущей документации NestJS.

По документации NestJS, в разделе GraphQL Quick Start:

- для `Express + Apollo` используются пакеты `@nestjs/graphql`, `@nestjs/apollo`, `@apollo/server`, `@as-integrations/express5`, `graphql`;
- рекомендуется подход `code-first`;
- endpoint по умолчанию открывается по адресу `/graphql`;
- в документации есть обновление от `2025-04-14`: классический Apollo Playground помечен как deprecated, и вместо него рекомендуется включать `GraphiQL` через `graphiql: true`.

Поэтому для вашего проекта разумно использовать именно:

- `code-first`;
- `ApolloDriver`;
- `GraphiQL` по адресу `http://localhost:3000/graphql`.

Это не противоречит сути ЛР5: песочница будет, просто в актуальном варианте.

## 4. Принцип реализации для GymHelper

Самый правильный и простой подход:

- оставить `REST` как основной API для вашего `React` frontend;
- добавить `GraphQL` как учебный дополнительный слой;
- не переносить в `GraphQL` вообще все модули сразу;
- сначала закрыть **минимальный, но логичный набор операций**, который легко показать на защите.

## 5. Минимальный объем ЛР5

Для простой и понятной реализации рекомендую в ЛР5 включить только такие домены:

- `Auth`
- `Plan`
- `Workout`
- `Dashboard`

Почему именно они:

- `Auth` нужен, чтобы можно было работать с `/graphql` прямо из песочницы;
- `Plan` хорошо подходит для простых query/mutation;
- `Workout` показывает вложенные сущности `day -> exercises -> sets`;
- `Dashboard` показывает отдельный агрегированный запрос.

`Nutrition` и `Rest` лучше оставить как расширение, если останется время.

## 6. Что именно реализовать

### 6.1. Query-операции

Минимальный набор query:

- `me`
- `dashboardSummary`
- `weeklyPlan`
- `planDay(weekday: WeekdayKey!)`
- `workoutDay(date: String!)`
- `workouts(page: Int, limit: Int)`
- `exerciseSuggestions`

Этого уже достаточно, чтобы показать:

- работу с авторизацией;
- получение одной сущности;
- получение набора сущностей;
- пагинацию;
- агрегированный запрос;
- простой справочный query.

### 6.2. Mutation-операции

Минимальный набор mutation:

- `login(input: LoginInput!)`
- `register(input: RegisterInput!)`
- `logout`
- `savePlanDay(weekday: WeekdayKey!, input: SavePlanDayInput!)`
- `saveWorkoutDay(date: String!, input: SaveWorkoutDayInput!)`

Этого достаточно, чтобы показать:

- мутации предметной области;
- повторное использование текущих сервисов;
- сохранение данных через GraphQL;
- работу с текущей session-auth логикой.

### 6.3. Field resolver

В тексте ЛР5 отдельно просят показать получение вложенных сущностей через field resolver.

Для вашего проекта самый удобный вариант:

- `WorkoutDay.exercises`
- `WorkoutExercise.sets`

Это самый наглядный учебный пример, потому что структура тренировки уже и так вложенная.

Если захочется сделать еще проще, можно оставить один явный field resolver:

- `WorkoutDay.exercises`

Этого уже достаточно, чтобы формально показать требование ЛР5.

## 7. Какой объем НЕ нужен в ЛР5

Чтобы не усложнять проект, в ЛР5 специально **не нужно**:

- переносить в GraphQL `SSE`;
- дублировать весь `REST API` один в один;
- сразу добавлять `nutrition` и `rest`;
- внедрять `subscriptions`;
- делать `DataLoader`, federation и сложную оптимизацию;
- переводить frontend c `REST` на `GraphQL`.

Для учебной работы это лишнее.

## 8. Предлагаемая структура файлов

Рекомендую сделать новый слой `src/graphql/`.

Примерно так:

```text
src/graphql/
  graphql.module.ts
  graphql.config.ts
  decorators/
    gql-current-user-id.decorator.ts
  guards/
    gql-session-auth.guard.ts
  plugins/
    complexity.plugin.ts
  enums/
    weekday.enum.ts
  auth/
    auth.resolver.ts
    types/
      auth-user.type.ts
    inputs/
      login.input.ts
      register.input.ts
  plan/
    plan.resolver.ts
    types/
      plan-exercise.type.ts
      weekly-plan.type.ts
    inputs/
      save-plan-day.input.ts
  workout/
    workout.resolver.ts
    workout.field-resolver.ts
    types/
      workout-day.type.ts
      workout-exercise.type.ts
      workout-set.type.ts
      paginated-workout-days.type.ts
    inputs/
      save-workout-day.input.ts
      pagination.input.ts
  dashboard/
    dashboard.resolver.ts
    types/
      dashboard-summary.type.ts
```

Это не единственно возможная структура, но она понятна и не мешает текущим `REST`-модулям.

## 9. Пошаговый план реализации

### Шаг 1. Подключить зависимости

Добавить пакеты:

```bash
npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql
npm i graphql-query-complexity
```

`graphql-query-complexity` нужен, потому что в ЛР5 прямо просят ограничение сложности запросов.

### Шаг 2. Подключить GraphQLModule

В `AppModule` подключить `GraphQLModule.forRoot<ApolloDriverConfig>()`.

Рекомендуемая конфигурация:

- `driver: ApolloDriver`
- `path: '/graphql'`
- `autoSchemaFile: join(process.cwd(), 'src/schema.gql')`
- `sortSchema: true`
- `graphiql: true`
- `context: ({ req, res }) => ({ req, res })`

Зачем нужен `context`:

- чтобы GraphQL-резолверы могли читать `req.session`;
- чтобы использовать ту же сессионную авторизацию, что и в `REST`.

### Шаг 3. Сделать GraphQL-авторизацию поверх текущей session-auth

Сейчас `SessionAuthGuard` и `CurrentUserId` работают через `context.switchToHttp()`.

Для GraphQL понадобится отдельная адаптация:

- `GqlSessionAuthGuard`
- `GqlCurrentUserId` decorator

Они должны брать `req` из `GqlExecutionContext`.

Это обязательный шаг, иначе защищенные query и mutation не смогут читать текущую сессию.

### Шаг 4. Реализовать Auth resolver

Сначала лучше сделать `AuthResolver`, потому что после этого удобно тестировать все остальные query прямо в песочнице.

Операции:

- `me`
- `login`
- `register`
- `logout`

Внутри:

- использовать текущий `AuthService`;
- записывать `request.session.userId` так же, как это уже делает `AuthController`;
- для `logout` уничтожать сессию и чистить cookie аналогично текущему REST-контроллеру.

### Шаг 5. Реализовать Plan resolver

Операции:

- `weeklyPlan`
- `planDay`
- `savePlanDay`
- `exerciseSuggestions`

Внутри:

- использовать `PlanService`;
- не дублировать бизнес-логику;
- входные данные оформлять через `InputType`.

Это самый простой модуль для первого полноценного GraphQL CRUD-сценария.

### Шаг 6. Реализовать Workout resolver

Операции:

- `workoutDay`
- `workouts(page, limit)`
- `saveWorkoutDay`

Дополнительно:

- сделать `WorkoutDay`, `WorkoutExercise`, `WorkoutSet` как `ObjectType`;
- добавить хотя бы один `ResolveField`.

Именно `Workout` лучше всего показать как пример вложенной GraphQL-схемы.

### Шаг 7. Реализовать Dashboard resolver

Операция:

- `dashboardSummary`

Внутри:

- использовать уже готовый `DashboardService`;
- ничего не пересчитывать заново в GraphQL-слое.

Это покажет, что GraphQL может отдавать не только сущности из БД, но и агрегированный результат.

### Шаг 8. Добавить ограничение сложности запроса

Сделать отдельный plugin, например `ComplexityPlugin`, по документации NestJS.

Минимально достаточно:

- использовать `graphql-query-complexity`;
- выставить `simpleEstimator({ defaultComplexity: 1 })`;
- ограничить максимальную сложность, например `30`.

Для учебного проекта этого достаточно.

### Шаг 9. Проверить GraphQL вручную

Минимальный сценарий проверки:

1. Открыть `http://localhost:3000/graphql`
2. Выполнить `register` или `login`
3. Выполнить `me`
4. Выполнить `weeklyPlan`
5. Выполнить `savePlanDay`
6. Выполнить `workoutDay`
7. Выполнить `saveWorkoutDay`
8. Выполнить `dashboardSummary`

После этого можно считать, что ЛР5 в минимальном виде работает.

## 10. Рекомендуемый порядок реализации по времени

Самый удобный порядок:

1. зависимости и `GraphQLModule`;
2. GraphQL auth-context;
3. `AuthResolver`;
4. `PlanResolver`;
5. `WorkoutResolver`;
6. `DashboardResolver`;
7. complexity plugin;
8. ручная проверка в `GraphiQL`;
9. если останется время, добавить `Nutrition` и `Rest`.

## 11. Что можно добавить только если останется время

Не в основной минимум, а как улучшение:

- `nutritionDay` и `saveNutritionDay`;
- `restDay` и `saveRestDay`;
- пагинированные `nutrition` и `rest`;
- e2e-тест на `/graphql`;
- общий `@ObjectType` для пагинации;
- enum для ролей;
- более строгие input-валидации.

## 12. Критерий готовности ЛР5

ЛР5 можно считать выполненной, если:

- в проекте подключен `GraphQLModule`;
- по адресу `/graphql` открывается `GraphiQL`;
- схема генерируется автоматически в `code-first` режиме;
- есть query и mutation по предметной области;
- есть хотя бы один `field resolver`;
- есть ограничение сложности запроса;
- GraphQL использует существующие сервисы проекта, а не отдельную дублирующую логику;
- существующий `REST API` после этого продолжает работать как раньше.

## 13. Итоговая рекомендация

Для вашего уровня и текущего состояния проекта **не нужно делать полный перенос backend на GraphQL**.

Лучший вариант ЛР5 для `GymHelper`:

- сделать аккуратный дополнительный GraphQL-слой;
- взять только `Auth + Plan + Workout + Dashboard`;
- показать `query`, `mutation`, `field resolver`, `code-first`, песочницу и ограничение сложности;
- оставить `REST` основной рабочей интеграцией для `React`.

Это будет:

- достаточно просто;
- понятно на защите;
- полностью согласовано с архитектурой вашего проекта.
