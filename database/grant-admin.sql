-- Назначить права администратора пользователю
-- Выполните в Supabase SQL Editor после регистрации аккаунта на сайте

-- 1. Замените 'admin_username' на ваш логин
UPDATE users
SET role = 'admin'
WHERE username = 'admin_username';

-- 2. Проверка
SELECT id, username, role, created_at FROM users WHERE role = 'admin';
