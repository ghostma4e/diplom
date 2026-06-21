-- Migration v2: мероприятия в БД, GitHub в проектах
-- Выполните в Supabase SQL Editor

ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;

CREATE TABLE IF NOT EXISTS hackathon_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  format_type TEXT NOT NULL DEFAULT 'team' CHECK (format_type IN ('team', 'solo', 'mixed')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_hackathon_events_dates ON hackathon_events(starts_at, ends_at);

ALTER TABLE hackathon_events DISABLE ROW LEVEL SECURITY;

-- Примеры мероприятий (можно удалить после создания своих)
INSERT INTO hackathon_events (topic, description, format_type, starts_at, ends_at)
SELECT * FROM (VALUES
  ('Web Fullstack', 'SPA, API и база данных', 'team', '2026-05-21 09:00:00+00'::timestamptz, '2026-05-23 23:59:00+00'::timestamptz),
  ('Mobile Apps', 'iOS / Android приложение', 'solo', '2026-05-22 09:00:00+00'::timestamptz, '2026-05-24 23:59:00+00'::timestamptz),
  ('AI & Data', 'ML и аналитика', 'team', '2026-05-23 09:00:00+00'::timestamptz, '2026-05-25 23:59:00+00'::timestamptz)
) AS v(topic, description, format_type, starts_at, ends_at)
WHERE NOT EXISTS (SELECT 1 FROM hackathon_events LIMIT 1);
