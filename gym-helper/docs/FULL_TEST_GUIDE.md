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

## 9.1. Подготовка репозитория

Перед деплоем локально проверить:

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

Затем отправить актуальный код в `GitHub`.

## 9.2. База данных

На `Render` можно:
- создать PostgreSQL в самом Render;
- либо использовать внешний PostgreSQL.

Нужна строка подключения `DATABASE_URL`.

## 9.3. Создание Web Service

В панели `Render`:

1. Создать новый `Web Service`.
2. Подключить GitHub-репозиторий.
3. Выбрать ветку деплоя.

Рекомендуемые параметры:

- Runtime: `Node`
- Build Command:

```bash
npm install && npm run build
```

- Start Command:

```bash
npm run prisma:migrate:render && npm run start:prod
```

Почему именно так:
- `build` собирает frontend и backend;
- `start:prod` запускает уже собранный backend;
- `prisma:migrate:render` применяет миграции перед запуском сервиса.

## 9.4. Переменные среды на Render

Добавить:

```env
DATABASE_URL=<ваша строка подключения>
SESSION_SECRET=<любой длинный секрет>
CORS_ORIGIN=https://<your-render-domain>.onrender.com
NODE_ENV=production
```

Если frontend и backend раздаются одним и тем же сервисом, `CORS_ORIGIN` можно задать доменом этого же сервиса.

## 9.5. Первый seed на Render

`Seed` нельзя ставить в `Start Command`, потому что он:
- каждый раз обновляет демо-админа;
- очищает и пересоздает его demo-данные.

Поэтому seed нужно запускать отдельно, один раз после первого успешного деплоя:

```bash
npm run prisma:seed
```

Это можно сделать через shell/console Render или любой другой доступный способ запуска команды в окружении сервиса.

## 9.6. Что проверить после деплоя

Открыть:

- `https://<your-render-domain>.onrender.com/`
- `https://<your-render-domain>.onrender.com/lab1`
- `https://<your-render-domain>.onrender.com/api/docs`
- `https://<your-render-domain>.onrender.com/graphql`

Проверить:
- работает SPA;
- работают прямые маршруты `/profile`, `/admin/users`;
- работает Swagger;
- работает GraphQL;
- можно войти под `admin@gymhelper.local / admin123`.

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
