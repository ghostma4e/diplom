-- Migration v3: profile, event participation, project–event link, admin ratings
-- Run in Supabase SQL Editor after migration-v2.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES hackathon_events(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES hackathon_events(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS project_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES hackathon_events(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  review_note TEXT NOT NULL DEFAULT '',
  rated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participations_user ON event_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_event_id ON projects(event_id);

ALTER TABLE event_participations DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_ratings DISABLE ROW LEVEL SECURITY;
