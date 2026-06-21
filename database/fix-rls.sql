-- Fix: "new row violates row-level security policy"
-- Run this in Supabase SQL Editor if team/user/project inserts fail.
--
-- Причина: в Supabase по умолчанию включён RLS, а в server/.env указан anon key.
-- Решение 1 (рекомендуется): в server/.env используйте service_role key
--   Dashboard → Settings → API → service_role (secret)
-- Решение 2: выполните этот скрипт — отключит RLS для backend-only доступа.

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;

-- Если политики уже созданы — удалить (опционально)
DROP POLICY IF EXISTS "Allow all users" ON users;
DROP POLICY IF EXISTS "Allow all teams" ON teams;
DROP POLICY IF EXISTS "Allow all team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all projects" ON projects;

-- Роль администратора (если колонки ещё нет)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Назначить админа (замените username на свой логин):
-- UPDATE users SET role = 'admin' WHERE username = 'ваш_логин';
