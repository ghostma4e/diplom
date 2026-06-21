# Хакатон панель (Hackathon Panel)

Платформа для управления ИТ-соревнованиями: авторизация, команды с инвайт-кодами, проекты, дашборд и таблица лидеров.

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | React 18, Vite, fetch |
| Backend | Node.js, Express |
| БД | PostgreSQL (Supabase), `@supabase/supabase-js` |

## Структура каталогов

```
hackathon-panel/
├── database/
│   └── schema.sql
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── supabase.js
│       ├── middleware/
│       │   └── auth.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── teams.js
│       │   ├── projects.js
│       │   └── dashboard.js
│       └── utils/
│           └── inviteCode.js
└── client/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── client.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── AuthForm.jsx
        │   ├── StatsCards.jsx
        │   ├── Leaderboard.jsx
        │   ├── TeamPanel.jsx
        │   └── ProjectGallery.jsx
        ├── pages/
        │   └── DashboardPage.jsx
        └── styles/
            └── App.css
```

## Быстрый старт

### 1. Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. В **SQL Editor** выполните `database/schema.sql`.
3. Скопируйте **Project URL** и **service_role key** (для бэкенда).

### 2. Backend

```bash
cd server
cp .env.example .env
# Заполните SUPABASE_URL, SUPABASE_KEY (service_role!), JWT_SECRET
npm install
npm run dev
```

API: `http://localhost:4000`

### 3. Frontend

```bash
cd client
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```

UI: `http://localhost:5173`

## Ошибка RLS при создании команды

Если видите `new row violates row-level security policy for table "teams"`:

1. **Рекомендуется:** в `server/.env` укажите **service_role** ключ (Supabase → Settings → API → `service_role` secret), не `anon`.
2. Перезапустите сервер (`npm run dev` в папке `server`).
3. **Либо** выполните в Supabase SQL Editor скрипт `database/fix-rls.sql`.
4. Для новых функций выполните `database/migration-v2.sql` (мероприятия в БД, GitHub в проектах).
5. Для профиля, участия в ивентах и оценок жюри — `database/migration-v3.sql`.
6. Для трёх критериев оценки (дизайн / техника / задачи) — `database/migration-v4.sql`.

## Как выдать админку аккаунту

1. Зарегистрируйтесь на сайте с нужным логином.
2. В Supabase SQL Editor выполните (подставьте свой username):

```sql
UPDATE users SET role = 'admin' WHERE username = 'ваш_логин';
```

Готовый шаблон: `database/grant-admin.sql`

3. Выйдите и войдите снова — в боковой панели будет «Админ».
4. Админ может менять очки **любой** команды (не только своей).

## Режим зрителя

Регистрация **не обязательна**. Без входа доступны: главная, мероприятия, проекты (просмотр и фильтры), рейтинги, документация. Вход нужен для создания команды и добавления проектов (кнопки «Создать аккаунт» / «Войти» в боковой панели).

## API (основное)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/teams` | Создать команду |
| POST | `/api/teams/join` | Вступить по invite_code |
| GET | `/api/teams/my` | Моя команда |
| GET | `/api/teams` | Список команд |
| PATCH | `/api/teams/:id/score` | Обновить очки (лидер или админ) |
| GET | `/api/projects?tech=React,Node` | Проекты + фильтр |
| POST | `/api/projects` | Добавить проект |
| GET | `/api/dashboard/stats` | Статистика |
| GET | `/api/dashboard/leaderboard` | Рейтинг |
