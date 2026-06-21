-- Hackathon Panel — Supabase / PostgreSQL schema
-- Run in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team membership (join via invite_code)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

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

-- Hackathon projects (linked to team and optional event)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_id UUID REFERENCES hackathon_events(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES hackathon_events(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS project_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES hackathon_events(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  score_design INTEGER CHECK (score_design >= 0 AND score_design <= 100),
  score_technical INTEGER CHECK (score_technical >= 0 AND score_technical <= 100),
  score_tasks INTEGER CHECK (score_tasks >= 0 AND score_tasks <= 100),
  review_note TEXT NOT NULL DEFAULT '',
  rated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_score ON teams(score DESC);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_tech_stack ON projects USING GIN (tech_stack);

-- Backend-only: Express использует service_role key.
-- Если RLS включён в Supabase — выполните database/fix-rls.sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participations DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_ratings DISABLE ROW LEVEL SECURITY;
