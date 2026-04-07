# GymHelper Backend

Учебный backend-проект на NestJS для приложения `GymHelper`.

Автор: **Mihail**

## О проекте

`GymHelper` — это приложение для:

- трекинга тренировок
- трекинга питания
- трекинга отдыха и сна
- подготовки frontend-части к последующему подключению полноценного backend API

В рамках **ЛР1** проект был развёрнут на Render и доработан так, чтобы:

- NestJS-приложение запускалось как production web service
- React/Vite frontend был встроен внутрь Nest-проекта
- собранный frontend отдавался сервером как статические файлы
- были добавлены серверные страницы на шаблонизаторе Handlebars
- повторяющиеся части страниц были выделены в partials
- были подготовлены два состояния сессии: авторизован и неавторизован

## Структура проекта

```text
gym-helper/
  frontend/   исходники React/Vite frontend
  public/     собранная статическая версия frontend
  src/        NestJS backend
  views/      Handlebars layout, partials и серверные страницы
```

## Что работает в ЛР1

- `GET /` и маршруты React SPA отдаются как встроенный frontend
- `GET /lab1` — серверная шаблонная страница
- `GET /lab1/exercises` — серверная шаблонная страница с повторяющимися карточками
- `?auth=guest` и `?auth=user` переключают состояние блока сессии на шаблонных страницах

Примеры:

- `/lab1?auth=guest`
- `/lab1?auth=user`
- `/lab1/exercises?auth=user`

## Локальный запуск

```bash
npm install
npm run build
npm run start:prod
```

Для режима разработки backend:

```bash
npm run start:dev
```

## Проверка

```bash
npm run build
npm run test:e2e
```

## Деплой

Приложение деплоится на Render как `Web Service`.

Параметры:

- Root Directory: `gym-helper`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

## Ссылка на развёрнутое приложение

Вставьте сюда ваш реальный URL сервиса на Render:

`https://YOUR-RENDER-SERVICE.onrender.com`
