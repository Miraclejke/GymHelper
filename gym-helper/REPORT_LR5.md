# Отчет по лабораторной работе 5

## 1. Название лабораторной работы

`ЛР5. Разработка схемы GraphQL`

## 2. Цель лабораторной работы

Целью пятой лабораторной работы было:

- подключить `GraphQL` к backend-проекту на `NestJS`;
- реализовать схему в подходе `code-first`;
- добавить `query`, `mutation` и `field resolver`;
- открыть встроенную песочницу GraphQL по адресу `/graphql`;
- использовать уже существующую бизнес-логику проекта, а не переписывать backend заново;
- ограничить чрезмерно сложные GraphQL-запросы.

## 3. Адаптация ЛР5 под проект GymHelper

Классическая формулировка ЛР5 предполагает добавление GraphQL-схемы к уже существующему backend. В проекте `GymHelper` к моменту выполнения ЛР5 уже были реализованы:

- backend на `NestJS`;
- реальная предметная модель в `PostgreSQL + Prisma`;
- модульная структура `auth`, `plan`, `workout`, `nutrition`, `rest`, `dashboard`;
- session-based аутентификация;
- `REST API` для React frontend;
- валидация DTO и Swagger/OpenAPI после ЛР4.

Поэтому в рамках ЛР5 было принято архитектурное решение:

- не удалять существующий `REST API`;
- не переводить React frontend с `REST` на `GraphQL`;
- не дублировать всю backend-логику;
- добавить `GraphQL` как дополнительный слой доступа к тем же данным поверх уже существующих сервисов.

Таким образом, в проекте `GymHelper` ЛР5 была реализована как **дополнительный GraphQL-слой над текущими сервисами backend**, а не как новый backend с нуля.

## 4. Исходное состояние проекта перед ЛР5

До начала выполнения ЛР5 в проекте уже были:

- `NestJS` backend;
- `React` frontend, встроенный в backend-проект;
- рабочий `REST API`;
- `PostgreSQL + Prisma`;
- session-auth через `express-session`;
- `SSE` для dashboard;
- server-side validation;
- Swagger/OpenAPI;
- unit и e2e тесты.

При этом отсутствовали:

- `GraphQLModule`;
- GraphQL schema;
- GraphQL resolvers;
- GraphQL inputs и object types;
- GraphQL guard для текущей сессии;
- ограничение сложности GraphQL-запросов.

## 5. Что было реализовано в ЛР5

## 5.1. Подключены зависимости GraphQL

В проект были добавлены пакеты:

- `@nestjs/graphql`
- `@nestjs/apollo`
- `@apollo/server`
- `@as-integrations/express5`
- `graphql`
- `graphql-query-complexity`

Они используются для:

- интеграции GraphQL в `NestJS`;
- работы через `ApolloDriver`;
- генерации схемы в `code-first` режиме;
- открытия встроенной песочницы `GraphiQL`;
- подсчета сложности запросов.

## 5.2. Подключен GraphQLModule

Для GraphQL был создан отдельный модуль:

- `src/graphql/graphql.module.ts`

В нем:

- подключен `GraphQLModule.forRoot<ApolloDriverConfig>()`;
- выбран `ApolloDriver`;
- задан endpoint `/graphql`;
- включен режим `code-first`;
- схема автоматически генерируется в `src/schema.gql`;
- включен `GraphiQL`;
- в GraphQL context передаются `req` и `res`.

Используемая конфигурация позволяет:

- открывать GraphQL IDE по адресу `http://localhost:3000/graphql`;
- использовать существующую cookie-session авторизацию внутри resolvers;
- генерировать схему автоматически на основе TypeScript-классов и декораторов.

## 5.3. Реализована отдельная GraphQL-авторизация поверх текущей session-auth

Так как существующие `SessionAuthGuard` и `CurrentUserId` работали только через HTTP context, для GraphQL были созданы отдельные элементы:

- `src/graphql/guards/gql-session-auth.guard.ts`
- `src/graphql/decorators/gql-current-user-id.decorator.ts`

Они используют `GqlExecutionContext` и позволяют:

- читать `req.session.userId`;
- защищать GraphQL query и mutation;
- переиспользовать текущую session-based auth без изменения общей auth-архитектуры.

## 5.4. Реализован AuthResolver

Файл:

- `src/graphql/auth/auth.resolver.ts`

Поддерживаемые операции:

- `me`
- `login`
- `register`
- `logout`

При этом:

- используется текущий `AuthService`;
- при `login` и `register` в сессию записывается `userId`;
- при `logout` сессия удаляется и очищается cookie `gymhelper.sid`.

Это позволяет выполнять авторизацию прямо из `GraphiQL`.

## 5.5. Реализован PlanResolver

Файл:

- `src/graphql/plan/plan.resolver.ts`

Поддерживаемые операции:

- `weeklyPlan`
- `planDay(weekday: WeekdayKey!)`
- `exerciseSuggestions`
- `savePlanDay(weekday: WeekdayKey!, input: SavePlanDayInput!)`

Внутри используется уже существующий `PlanService`.

Таким образом, GraphQL-слой не содержит отдельной бизнес-логики плана, а только вызывает существующий backend-сервис.

## 5.6. Реализован WorkoutResolver

Файл:

- `src/graphql/workout/workout.resolver.ts`

Поддерживаемые операции:

- `workoutDay(date: String!)`
- `workouts(page: Int, limit: Int)`
- `saveWorkoutDay(date: String!, input: SaveWorkoutDayInput!)`

Также для workout были реализованы:

- object types для `WorkoutDay`, `WorkoutExercise`, `WorkoutSet`;
- пагинированный тип `PaginatedWorkoutDays`;
- field resolver для `WorkoutDay.exercises`;
- field resolver для `WorkoutExercise.sets`.

Это соответствует требованию ЛР5 по работе с вложенными сущностями через field resolver.

## 5.7. Реализован DashboardResolver

Файл:

- `src/graphql/dashboard/dashboard.resolver.ts`

Поддерживаемая операция:

- `dashboardSummary`

Она переиспользует текущий `DashboardService`, который уже умеет считать агрегированную статистику за последние 14 дней.

Таким образом, через GraphQL проект отдает не только сущности, но и агрегированный результат бизнес-логики.

## 5.8. Реализованы GraphQL types и input types

Для подхода `code-first` были созданы:

- `ObjectType` классы;
- `InputType` классы;
- enum `WeekdayKey`;
- args-класс для пагинации.

Основные файлы:

- `src/graphql/auth/types/*`
- `src/graphql/auth/inputs/*`
- `src/graphql/plan/types/*`
- `src/graphql/plan/inputs/*`
- `src/graphql/workout/types/*`
- `src/graphql/workout/inputs/*`
- `src/graphql/dashboard/types/*`
- `src/graphql/enums/weekday-key.enum.ts`
- `src/graphql/common/pagination.args.ts`

Это позволило автоматически сгенерировать рабочую GraphQL schema без отдельного написания SDL-файла вручную.

## 5.9. Добавлено ограничение сложности запросов

Для выполнения требования ЛР5 был создан plugin:

- `src/graphql/plugins/complexity.plugin.ts`

Он:

- использует `graphql-query-complexity`;
- применяет `simpleEstimator({ defaultComplexity: 1 })`;
- ограничивает максимальную сложность обычного запроса значением `30`.

Дополнительно было учтено, что introspection-запросы нужны для просмотра схемы в `GraphiQL`, поэтому:

- introspection не блокируется ограничением сложности;
- схема может открываться и использоваться в песочнице.

## 5.10. Исправлен конфликт HTTP exception filter и GraphQL

Во время проверки негативных GraphQL-сценариев был обнаружен дефект:

- глобальный `HttpExceptionFilter` был рассчитан на HTTP-контекст;
- при GraphQL-ошибке без сессии он пытался читать `request.originalUrl`;
- из-за этого вместо нормальной GraphQL-ошибки возникало дополнительное исключение.

Для исправления файл:

- `src/common/filters/http-exception.filter.ts`

был доработан так, чтобы:

- фильтр обрабатывал только обычные HTTP-запросы;
- GraphQL-исключения возвращались стандартному GraphQL error handling.

После этого неавторизованный GraphQL-запрос стал корректно возвращать сообщение:

- `You need to log in.`

## 6. Реализованные GraphQL-операции после ЛР5

### 6.1. Query

- `me`
- `weeklyPlan`
- `planDay`
- `exerciseSuggestions`
- `workoutDay`
- `workouts`
- `dashboardSummary`

### 6.2. Mutation

- `login`
- `register`
- `logout`
- `savePlanDay`
- `saveWorkoutDay`

### 6.3. Field resolver

- `WorkoutDay.exercises`
- `WorkoutExercise.sets`

## 7. Основные файлы, добавленные и измененные в рамках ЛР5

### 7.1. Подключение GraphQL

- `src/app.module.ts`
- `src/graphql/graphql.module.ts`

### 7.2. GraphQL auth

- `src/graphql/graphql-context.type.ts`
- `src/graphql/guards/gql-session-auth.guard.ts`
- `src/graphql/decorators/gql-current-user-id.decorator.ts`

### 7.3. GraphQL plugin

- `src/graphql/plugins/complexity.plugin.ts`

### 7.4. GraphQL auth layer

- `src/graphql/auth/auth.resolver.ts`
- `src/graphql/auth/types/auth-user.type.ts`
- `src/graphql/auth/inputs/login.input.ts`
- `src/graphql/auth/inputs/register.input.ts`

### 7.5. GraphQL plan layer

- `src/graphql/plan/plan.resolver.ts`
- `src/graphql/plan/types/plan-exercise.type.ts`
- `src/graphql/plan/types/weekly-plan.type.ts`
- `src/graphql/plan/inputs/save-plan-day.input.ts`

### 7.6. GraphQL workout layer

- `src/graphql/workout/workout.resolver.ts`
- `src/graphql/workout/types/workout-day.type.ts`
- `src/graphql/workout/types/workout-exercise.type.ts`
- `src/graphql/workout/types/workout-set.type.ts`
- `src/graphql/workout/types/paginated-workout-days.type.ts`
- `src/graphql/workout/inputs/save-workout-day.input.ts`
- `src/graphql/common/pagination.args.ts`
- `src/graphql/enums/weekday-key.enum.ts`

### 7.7. GraphQL dashboard layer

- `src/graphql/dashboard/dashboard.resolver.ts`
- `src/graphql/dashboard/types/dashboard-summary.type.ts`

### 7.8. Изменения в существующих backend-модулях

- `src/plan/plan.module.ts`
- `src/workout/workout.module.ts`
- `src/common/filters/http-exception.filter.ts`

### 7.9. Тесты и документация

- `test/app.e2e-spec.ts`
- `LAB5_IMPLEMENTATION_PLAN.md`
- `LAB5_TEST_PLAN.md`

## 8. Что было сознательно не включено в объем ЛР5

Чтобы сохранить проект простым и понятным, в ЛР5 специально не были реализованы:

- `nutrition` через GraphQL;
- `rest` через GraphQL;
- GraphQL subscriptions;
- перевод React frontend на GraphQL;
- сложные оптимизации типа `DataLoader`;
- полное дублирование всего REST API.

Это было осознанное решение, потому что цель ЛР5 состояла в демонстрации GraphQL как второго способа доступа к данным, а не в полном переходе проекта на GraphQL.

## 9. Проверка и тестирование ЛР5

### 9.1. Ручная проверка

Ручная проверка выполнялась через `GraphiQL` по адресу:

- `http://localhost:3000/graphql`

Были проверены:

- доступность песочницы;
- просмотр схемы;
- регистрация и логин через GraphQL;
- получение текущего пользователя;
- сохранение и получение плана;
- сохранение и получение тренировки;
- пагинация тренировок;
- получение dashboard summary;
- logout;
- ошибка авторизации без сессии;
- ошибка превышения сложности запроса.

### 9.2. Автоматические проверки

Успешно проходят команды:

```bash
npm run test -- --runInBand
npm run test:e2e
npm run build
```

Дополнительно проверялось:

- introspection-запрос к `/graphql` возвращает схему корректно;
- GraphQL и REST работают параллельно и не мешают друг другу.

## 10. Итоговые результаты ЛР5

По результатам выполнения ЛР5 в проекте `GymHelper` были достигнуты следующие результаты:

- backend получил рабочий GraphQL endpoint `/graphql`;
- GraphQL подключен в режиме `code-first`;
- открывается встроенная песочница `GraphiQL`;
- реализованы `query`, `mutation` и `field resolver`;
- GraphQL работает поверх уже существующих backend-сервисов;
- поддерживается текущая session-auth логика;
- добавлено ограничение сложности запросов;
- introspection и просмотр схемы работают корректно;
- существующий `REST API` после внедрения GraphQL продолжает работать.

## 11. Заключение

В ходе выполнения лабораторной работы 5 backend проекта `GymHelper` был расширен поддержкой `GraphQL`, при этом существующая архитектура проекта не была сломана.

Главные результаты ЛР5:

- проект получил полноценный GraphQL-слой;
- схема генерируется автоматически в `code-first` режиме;
- операции отражают предметную область проекта;
- авторизация в GraphQL интегрирована с текущей сессией;
- вложенные сущности доступны через field resolvers;
- добавлена защита от чрезмерно сложных запросов;
- GraphQL стал дополнительным способом работы с backend, а не заменой существующего REST API.

Таким образом, ЛР5 для проекта `GymHelper` можно считать выполненной: GraphQL в проекте не только подключен формально, но и реально работает поверх уже существующей бизнес-логики, доступен для ручной проверки в `GraphiQL`, покрыт тестовыми сценариями и согласован с архитектурой `React + NestJS + Prisma + PostgreSQL`.
