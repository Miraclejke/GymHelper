# Полная настройка, запуск и проверка GymHelper

## 1. Для чего нужен этот файл

Этот документ нужен для полной ручной и автоматической проверки проекта:
- локально;
- из консоли;
- на `Render`.

Документ написан под текущую реализацию проекта, а не под абстрактную методичку.

## 2. Что потребуется

### Локально

- `Node.js 22.x`
- `npm`
- `PostgreSQL`

### Для деплоя

- аккаунт `GitHub`
- аккаунт `Render`
- репозиторий с проектом

## 3. Переменные окружения

Минимальный набор:

```env
DATABASE_URL=postgresql://user:password@host:5432/gymhelper?sslmode=verify-full
SESSION_SECRET=gym-helper-educational-session-secret
CORS_ORIGIN=http://localhost:5173
```

Пояснение:
- `DATABASE_URL` — строка подключения к PostgreSQL;
- `SESSION_SECRET` — секрет для cookie-сессий;
- `CORS_ORIGIN` — origin frontend для локальной разработки через Vite.

## 4. Локальная настройка проекта

### 4.1. Установка зависимостей

```bash
npm install
```

### 4.2. Подготовка `.env`

Скопировать `.env.example` в `.env` и заполнить `DATABASE_URL`.

### 4.3. Генерация Prisma Client

```bash
npm run prisma:generate
```

### 4.4. Применение миграций

Для локальной разработки:

```bash
npm run prisma:migrate:dev
```

Для уже созданной базы:

```bash
npm run prisma:migrate:deploy
```

### 4.5. Заполнение демо-данных

```bash
npm run prisma:seed
```

Seed создает администратора:
- email: `admin@gymhelper.local`
- пароль: `admin123`

## 5. Локальный запуск

### 5.1. Backend

```bash
npm run start:dev
```

По умолчанию backend доступен на:

```text
http://localhost:3000
```

### 5.2. Что открыть в браузере

- `http://localhost:3000/` — React SPA
- `http://localhost:3000/lab1` — серверная страница ЛР1
- `http://localhost:3000/lab1/exercises` — серверная страница ЛР1
- `http://localhost:3000/api/docs` — Swagger UI
- `http://localhost:3000/graphql` — GraphiQL

## 6. Автоматическая проверка

### 6.1. Линтер

```bash
npm run lint
```

Ожидаемый результат:
- команда завершается без ошибок.

### 6.2. Unit-тесты

```bash
npm test -- --runInBand
```

Ожидаемый результат:
- unit tests проходят полностью.

### 6.3. E2E-тесты

```bash
npm run test:e2e -- --runInBand
```

Ожидаемый результат:
- e2e tests проходят полностью;
- проверяются `REST`, `Swagger`, `GraphQL`, `auth`, `roles`, `cache`, `SSE`-сценарии косвенно.

### 6.4. Сборка

```bash
npm run build
```

Ожидаемый результат:
- frontend собирается в `public/`;
- backend собирается в `dist/`.

## 7. Ручная проверка из консоли

Ниже приведен сценарий под `PowerShell` на Windows.  
Используется именно `curl.exe`, а не alias `curl`.

### 7.1. Подготовка cookie jar

```powershell
Remove-Item .\cookies.txt -ErrorAction SilentlyContinue
```

### 7.2. Проверка Swagger

```powershell
curl.exe http://localhost:3000/api/docs
curl.exe http://localhost:3000/api/docs-json
```

Нужно убедиться, что:
- `/api/docs` возвращает HTML Swagger UI;
- `/api/docs-json` возвращает JSON OpenAPI.

### 7.3. Проверка 401 без логина

```powershell
curl.exe -i http://localhost:3000/api/plan/mon
curl.exe -i http://localhost:3000/api/dashboard/summary
```

Ожидается:
- `401 Unauthorized`.

### 7.4. Регистрация пользователя

```powershell
curl.exe -i ^
  -c .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Console User\",\"email\":\"console-user@gymhelper.local\",\"password\":\"pass1234\"}" ^
  http://localhost:3000/api/auth/register
```

Ожидается:
- `201 Created`;
- в ответе есть `id`, `name`, `email`, `role`;
- в `cookies.txt` появляется cookie `gymhelper.sid`.

### 7.5. Проверка текущей сессии

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  http://localhost:3000/api/auth/me
```

Ожидается:
- `200 OK`;
- возвращается текущий пользователь.

### 7.6. Проверка валидации

```powershell
curl.exe -i ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"\",\"email\":\"bad\",\"password\":\"123\"}" ^
  http://localhost:3000/api/auth/register
```

Ожидается:
- `400 Bad Request`;
- `message` содержит ошибки валидации.

### 7.7. Сохранение плана

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -X PUT ^
  -d "{\"exercises\":[{\"name\":\"Bench press\",\"note\":\"5x5\"},{\"name\":\"Pull-up\",\"note\":\"3x8\"}]}" ^
  http://localhost:3000/api/plan/mon
```

Проверка чтения:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  http://localhost:3000/api/plan/mon
```

### 7.8. Сохранение тренировки

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -X PUT ^
  -d "{\"exercises\":[{\"name\":\"Bench press\",\"sets\":[{\"weight\":60,\"reps\":8},{\"weight\":62.5,\"reps\":6}]}]}" ^
  http://localhost:3000/api/workouts/2026-04-08
```

Проверка чтения:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  http://localhost:3000/api/workouts/2026-04-08
```

### 7.9. Сохранение питания

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -X PUT ^
  -d "{\"meals\":[{\"title\":\"Oatmeal\",\"calories\":450,\"protein\":18,\"fat\":10,\"carbs\":65}]}" ^
  http://localhost:3000/api/nutrition/2026-04-08
```

### 7.10. Сохранение отдыха

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -X PUT ^
  -d "{\"date\":\"2026-04-08\",\"isRest\":false,\"sleepHours\":8.5,\"note\":\"Felt good\"}" ^
  http://localhost:3000/api/rest/2026-04-08
```

### 7.11. Проверка пагинации

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  "http://localhost:3000/api/workouts?page=1&limit=1"
```

Нужно проверить:
- `X-Total-Count`;
- `Link`;
- поля `page`, `limit`, `total`, `totalPages`.

### 7.12. Проверка suggestions cache

Первый запрос:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  http://localhost:3000/api/plan/suggestions
```

Нужно сохранить значение `ETag`.

Повторный запрос:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "If-None-Match: <PASTE_ETAG_HERE>" ^
  http://localhost:3000/api/plan/suggestions
```

Ожидается:
- `304 Not Modified`.

### 7.13. Проверка GraphQL

Запрос `me`:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"query { me { id name email role } }\"}" ^
  http://localhost:3000/graphql
```

Мутация `savePlanDay`:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"mutation SavePlan($weekday: WeekdayKey!, $input: SavePlanDayInput!) { savePlanDay(weekday: $weekday, input: $input) { name note } }\",\"variables\":{\"weekday\":\"MON\",\"input\":{\"exercises\":[{\"name\":\"GraphQL Bench\",\"note\":\"4x8\"}]}}}" ^
  http://localhost:3000/graphql
```

### 7.14. Проверка admin API

В проекте seed создает администратора `admin@gymhelper.local / admin123`.

Сначала нужно залогиниться этим пользователем:

```powershell
Remove-Item .\admin-cookies.txt -ErrorAction SilentlyContinue

curl.exe -i ^
  -c .\admin-cookies.txt ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@gymhelper.local\",\"password\":\"admin123\"}" ^
  http://localhost:3000/api/auth/login
```

Потом запросить список пользователей:

```powershell
curl.exe -i ^
  -b .\admin-cookies.txt ^
  http://localhost:3000/api/admin/users
```

### 7.15. Проверка logout

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  -X POST ^
  http://localhost:3000/api/auth/logout
```

Проверка, что сессия очищена:

```powershell
curl.exe -i ^
  -b .\cookies.txt ^
  http://localhost:3000/api/auth/me
```

Ожидается:
- `null` либо пустой ответ пользователя.

## 8. Ручная проверка в браузере

### 8.1. React SPA

Проверить:
- логин;
- регистрацию;
- страницу профиля;
- страницу плана;
- страницу тренировки;
- страницу питания;
- страницу отдыха;
- страницу admin users под администратором;
- прямой переход на `/profile` и `/admin/users`.

### 8.2. Handlebars

Проверить:
- `/lab1`
- `/lab1/exercises`

Нужно убедиться, что:
- страницы рендерятся;
- на странице показывается server/client timing.

### 8.3. SSE

Открыть `/` после логина и параллельно изменить тренировку, питание или отдых.  
Нужно убедиться, что:
- на дашборде появляется live-сообщение;
- summary перезагружается.

## 9. Полная настройка Render

Ниже описан самый простой и понятный вариант деплоя: один `Web Service` на Render, который раздает и backend, и собранный frontend, плюс отдельная база `PostgreSQL` в Render.

## 9.1. Что должно быть готово до деплоя

Перед публикацией проекта локально проверить:

```bash
npm install
npm run prisma:generate
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

После этого нужно:
- убедиться, что код отправлен в `GitHub`;
- убедиться, что в репозитории есть актуальный файл `.env.example`;
- не загружать в репозиторий реальный `.env` с настоящими паролями.

## 9.2. Сначала создать PostgreSQL на Render

В панели Render:

1. Нажать `New`.
2. Выбрать `PostgreSQL`.
3. Заполнить базовые поля:
   - `Name`: например `gym-helper-db`;
   - `Database`: например `gymhelper`;
   - `User`: например `gymhelper_user`;
   - `Region`: лучше ту же, что и у web service.
4. Создать базу.

После создания базы Render покажет несколько строк подключения. Для проекта нужна именно:

```text
External Database URL
```

Именно это значение нужно вставить в переменную окружения `DATABASE_URL`.

## 9.3. Какой репозиторий и какую папку выбирать

Если в GitHub у тебя опубликован только проект `gym-helper`, то:

- `Root Directory` оставь пустым.

Если в GitHub опубликован весь общий репозиторий `lastweb`, а проект лежит внутри:

- `Root Directory` укажи так:

```text
GymHelper-backend/gym-helper
```

Это очень важный момент. Если `Root Directory` указан неправильно, Render не найдет `package.json` и сборка сразу упадет.

## 9.4. Создание Web Service

В панели Render:

1. Нажать `New`.
2. Выбрать `Web Service`.
3. Подключить GitHub.
4. Выбрать нужный репозиторий.
5. Выбрать ветку, обычно `main`.

Дальше заполнить настройки сервиса так:

- `Name`: например `gym-helper`
- `Region`: та же, что у PostgreSQL
- `Runtime`: `Node`
- `Root Directory`: см. раздел выше
- `Build Command`:

```bash
npm install --include=dev && npm run build
```

- `Start Command`:

```bash
npm run prisma:migrate:render && npm run start:prod
```

- `Auto-Deploy`: `Yes`

Почему именно так:
- `npm install --include=dev` ставит и обычные, и dev-зависимости, которые нужны для сборки TypeScript и frontend;
- `npm run build` собирает backend и frontend;
- backend собирается через `tsc`, поэтому деплой не зависит от `nest` CLI в окружении Render;
- `npm run prisma:migrate:render` применяет Prisma migrations в production;
- `npm run start:prod` запускает уже собранный NestJS-сервер, который раздает и API, и frontend.

## 9.5. Какие переменные среды добавить

В `Environment Variables` на Render нужно добавить следующие значения.

### `DATABASE_URL`

Сюда вставить `External Database URL` из созданной базы Render.

Пример вида:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

### `SESSION_SECRET`

Сюда вставить длинную случайную строку.

Пример:

```env
SESSION_SECRET=gym-helper-render-session-secret-very-long-string-123456
```

Это секрет для сессий и cookie. Лучше не использовать слишком короткое значение.

### `CORS_ORIGIN`

Сюда вставить адрес самого Render-сервиса после деплоя.

Пример:

```env
CORS_ORIGIN=https://gym-helper.onrender.com
```

Для этого проекта frontend и backend раздаются одним и тем же сервисом, поэтому здесь должен быть домен этого же Render-приложения.

### `NODE_ENV`

Указать:

```env
NODE_ENV=production
```

## 9.6. Полный готовый набор env переменных для Render

В итоге в Render должно получиться примерно так:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
SESSION_SECRET=<длинный_секрет>
CORS_ORIGIN=https://<your-service>.onrender.com
NODE_ENV=production
```

Где что брать:
- `DATABASE_URL` взять из `External Database URL` базы Render;
- `SESSION_SECRET` придумать самостоятельно;
- `CORS_ORIGIN` взять из домена web service;
- `NODE_ENV` задать вручную как `production`.

## 9.7. Что нажимать после заполнения

После того как:
- выбран репозиторий;
- указан `Root Directory`;
- прописаны команды;
- добавлены env переменные;

можно нажимать `Create Web Service`.

Дальше Render начнет:
- скачивать репозиторий;
- устанавливать зависимости;
- собирать проект;
- применять миграции;
- запускать сервер.

Если что-то пошло не так, нужно смотреть:
- `Build Logs`;
- `Runtime Logs`.

## 9.8. Как выполнить первый seed на Render

`Seed` не нужно добавлять в `Start Command`, потому что тогда он будет запускаться при каждом старте сервиса.

Для учебного проекта это плохо, потому что seed:
- перезаписывает демо-админа;
- может обновить демо-данные в базе.

Правильный вариант:

1. Дождаться первого успешного деплоя.
2. Открыть shell/console Render для этого сервиса.
3. Выполнить:

```bash
npm run prisma:seed
```

Обычно это нужно сделать один раз, сразу после первого деплоя.

## 9.9. Что проверить после деплоя

Открыть в браузере:

- `https://<your-service>.onrender.com/`
- `https://<your-service>.onrender.com/lab1`
- `https://<your-service>.onrender.com/api/docs`
- `https://<your-service>.onrender.com/graphql`
- `https://<your-service>.onrender.com/profile`
- `https://<your-service>.onrender.com/admin/users`

После этого проверить:
- открывается главная SPA-страница;
- прямые переходы по `/profile` и `/admin/users` не дают `404`;
- Swagger открывается;
- GraphQL страница открывается;
- можно войти под `admin@gymhelper.local / admin123`;
- после логина работает dashboard;
- после изменений тренировок, питания и отдыха обновляется summary.

## 9.10. Самый простой шаблон настроек Render

Если тебе нужно просто быстро свериться, то ориентируйся на этот шаблон:

- `Type`: `Web Service`
- `Runtime`: `Node`
- `Root Directory`: пусто, если сам репозиторий в GitHub уже начинается с `gym-helper`
- `Build Command`: `npm install --include=dev && npm run build`
- `Start Command`: `npm run prisma:migrate:render && npm run start:prod`
- `DATABASE_URL`: `External Database URL` из PostgreSQL Render
- `SESSION_SECRET`: длинный случайный секрет
- `CORS_ORIGIN`: `https://<your-service>.onrender.com`
- `NODE_ENV`: `production`

## 9.11. Частые ошибки на Render

### Ошибка 1. Render не находит `package.json`

Причина:
- неправильно указан `Root Directory`.

Что делать:
- проверить, где именно в репозитории лежит проект;
- если нужен вложенный путь, указать `GymHelper-backend/gym-helper`.

### Ошибка 2. Prisma не может подключиться к базе

Причина:
- неверный `DATABASE_URL`;
- скопирована не та ссылка;
- забыта env переменная.

Что делать:
- открыть PostgreSQL в Render;
- заново скопировать `External Database URL`;
- вставить его в `DATABASE_URL`.

### Ошибка 3. После деплоя приложение открылось, но логин не работает

Причина:
- неверный `CORS_ORIGIN`;
- не выполнен seed;
- не применились миграции.

Что делать:
- проверить `CORS_ORIGIN`;
- проверить, что `Start Command` содержит `npm run prisma:migrate:render && npm run start:prod`;
- вручную выполнить `npm run prisma:seed`.

### Ошибка 4. Открывается `/`, но `/profile` или `/admin/users` дают `404`

Причина:
- запущена старая версия проекта;
- деплой не подтянул актуальные изменения.

Что делать:
- проверить, что в GitHub отправлен последний код;
- выполнить новый deploy;
- снова открыть прямые маршруты.

## 10. Что считается успешной сдачей

Можно считать проект готовым к защите, если:
- локально проходят `lint`, `test`, `test:e2e`, `build`;
- REST работает и документирован в Swagger;
- GraphQL работает и открывается в GraphiQL;
- есть рабочая авторизация и роли;
- есть SSE для дашборда;
- есть Handlebars-страницы для ЛР1;
- есть внятное объяснение, почему `S3/Object Storage` и внешний auth provider не включены в учебную реализацию.

## 11. Ссылки на связанные документы

- краткий обзор проекта: [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md)
- краткий аудит: [context/LAB1_LAB7_AUDIT.md](./context/LAB1_LAB7_AUDIT.md)
- onboarding по коду: [context/CODEX_ONBOARDING.md](./context/CODEX_ONBOARDING.md)
