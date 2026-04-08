# Отчет По Лабораторной Работе 6

## 1. Название лабораторной работы

`ЛР6. Применение возможностей NestJS для разработки BFF`

## 2. Цель лабораторной работы

В рамках ЛР6 требовалось показать использование дополнительных возможностей NestJS на уровне обработки запросов:
- измерение времени ответа;
- клиентское HTTP-кэширование;
- server-side in-memory кэширование.

Для проекта `GymHelper` лабораторная работа была адаптирована под реальную архитектуру `React + NestJS + Prisma`, без искусственного добавления лишних доменных сущностей.

## 3. Адаптация ЛР6 под проект GymHelper

В методичке ЛР6 отдельно упоминается загрузка файлов в S3-совместимое хранилище. В проекте `GymHelper` такая функция не нужна:
- в предметной области нет фотографий, документов или медиа;
- добавление upload-модуля усложнило бы проект без пользы для основного сценария;
- для учебной демонстрации BFF-механизмов достаточно interceptor'ов и кэша.

Поэтому итоговый объем ЛР6 в проекте:
- измерение времени ответа для Handlebars, REST и GraphQL;
- `ETag + Cache-Control` для части GET-методов;
- server-side cache для dashboard summary.

## 4. Что было реализовано

## 4.1. Измерение времени ответа

Реализован глобальный interceptor:
- `src/common/interceptors/request-timing.interceptor.ts`

Он:
- логирует время обработки запроса;
- добавляет `X-Elapsed-Time` для REST API;
- передает `serverElapsedMs` в шаблоны `/lab1` и `/lab1/exercises`.

Для GraphQL отдельно добавлен plugin:
- `src/graphql/plugins/request-timing.plugin.ts`

Он выставляет `X-Elapsed-Time` для ответов GraphQL.

## 4.2. Отображение server/client времени на шаблонах

Для демонстрации требования ЛР6 были обновлены Handlebars-страницы:
- `views/partials/session-info.hbs`
- `views/partials/shared-assets.hbs`

На странице `/lab1` теперь показываются:
- время обработки на сервере;
- время на клиенте через `performance.now()`.

## 4.3. Клиентское HTTP-кэширование

Для GET-endpoint'ов с подсказками реализованы:
- `Cache-Control`
- `ETag`

Это сделано для:
- `GET /api/plan/suggestions`
- `GET /api/workouts/suggestions`

Файлы:
- `src/common/interceptors/etag.interceptor.ts`
- `src/plan/plan.controller.ts`
- `src/workout/workout.controller.ts`

Если клиент повторно отправляет запрос с `If-None-Match`, сервер может вернуть `304 Not Modified`.

## 4.4. Server-side cache

Для `dashboard summary` подключен `CacheModule`:
- `src/dashboard/dashboard.module.ts`
- `src/dashboard/dashboard.service.ts`

Кэш работает in-memory и используется только для агрегированной статистики:
- число тренировочных дней;
- средние калории;
- средний сон.

После изменения workout/nutrition/rest кэш summary сбрасывается вручную в сервисах:
- `src/workout/workout.service.ts`
- `src/nutrition/nutrition.service.ts`
- `src/rest/rest.service.ts`

Это сделано для того, чтобы summary не устаревал после записи новых данных.

## 5. Что не вошло в финальную реализацию

Сознательно исключено:
- object storage;
- S3;
- upload файлов;
- аватары;
- multipart endpoint'ы.

Это не считается дефектом проекта, а является упрощением, согласованным с предметной областью `GymHelper`.

## 6. Проверка выполнения ЛР6

Автоматически проверяются:
- наличие `X-Elapsed-Time` у REST;
- наличие `X-Elapsed-Time` у GraphQL;
- наличие `ETag`;
- корректный ответ `304 Not Modified`;
- наличие server/client markers на `/lab1`.

Главный файл проверки:
- `test/app.e2e-spec.ts`

Команды проверки:

```bash
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

## 7. Итог

По результатам выполнения ЛР6 в проекте `GymHelper` реализованы ключевые BFF-механизмы NestJS:
- interceptor времени ответа;
- GraphQL timing plugin;
- клиентское HTTP-кэширование через `ETag + Cache-Control`;
- server-side cache через `CacheModule`.

Таким образом, ЛР6 для проекта `GymHelper` можно считать выполненной в адаптированном и практичном объеме: все действительно полезные для данного проекта механизмы реализованы и проверяются, а лишняя файловая инфраструктура сознательно исключена.
