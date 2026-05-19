-- ============================================================
-- TotoMondiale 2026 — Schema Database Supabase
-- Eseguire nell'SQL Editor di Supabase (in ordine)
-- ============================================================

-- Estensioni
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- TABELLA: participants
-- =====================
CREATE TABLE IF NOT EXISTS participants (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  code        TEXT        UNIQUE NOT NULL,
  first_name  TEXT        NOT NULL,
  last_name   TEXT        NOT NULL,
  has_submitted BOOLEAN   DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABELLA: teams
-- =====================
CREATE TABLE IF NOT EXISTS teams (
  id           UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         TEXT    NOT NULL,
  flag         TEXT    DEFAULT '🏳',
  group_letter CHAR(1) NOT NULL,
  sort_order   INT     DEFAULT 0
);

-- =====================
-- TABELLA: matches
-- =====================
CREATE TABLE IF NOT EXISTS matches (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  home_team_id UUID        REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID        REFERENCES teams(id) ON DELETE CASCADE,
  group_letter CHAR(1),
  matchday     INT         CHECK (matchday BETWEEN 1 AND 3),
  match_number INT,
  scheduled_at TIMESTAMPTZ,
  home_score   INT,
  away_score   INT,
  status       TEXT        DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'in_progress', 'finished')),
  api_fixture_id BIGINT,
  round        TEXT        DEFAULT 'group'
               CHECK (round IN ('group','round_of_32','round_of_16',
                                'quarterfinal','semifinal','final','third_place')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABELLA: match_predictions
-- =====================
CREATE TABLE IF NOT EXISTS match_predictions (
  id              UUID  DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id  UUID  REFERENCES participants(id) ON DELETE CASCADE,
  match_id        UUID  REFERENCES matches(id)      ON DELETE CASCADE,
  predicted_outcome TEXT NOT NULL CHECK (predicted_outcome IN ('1','X','2')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, match_id)
);

-- =====================
-- TABELLA: adv_predictions
-- (semifinaliste, finaliste, vincitore, capocannoniere)
-- =====================
CREATE TABLE IF NOT EXISTS adv_predictions (
  id               UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id   UUID    REFERENCES participants(id) ON DELETE CASCADE UNIQUE,
  semifinalist_ids UUID[]  NOT NULL DEFAULT '{}',
  finalist_ids     UUID[]  NOT NULL DEFAULT '{}',
  winner_id        UUID    REFERENCES teams(id),
  top_scorer       TEXT    NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABELLA: tournament_results
-- =====================
CREATE TABLE IF NOT EXISTS tournament_results (
  id                UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  semifinalist_ids  UUID[]  DEFAULT '{}',
  finalist_ids      UUID[]  DEFAULT '{}',
  winner_id         UUID    REFERENCES teams(id),
  top_scorer_names  TEXT[]  DEFAULT '{}',
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TABELLA: settings
-- =====================
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_mp_participant  ON match_predictions(participant_id);
CREATE INDEX IF NOT EXISTS idx_mp_match        ON match_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_adv_participant ON adv_predictions(participant_id);
CREATE INDEX IF NOT EXISTS idx_matches_group   ON matches(group_letter);
CREATE INDEX IF NOT EXISTS idx_matches_status  ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_round   ON matches(round);

-- Impostazioni iniziali
INSERT INTO settings (key, value) VALUES
  ('api_football_key',    ''),
  ('tournament_status',   'upcoming'),
  ('last_api_sync',       ''),
  ('api_sync_enabled',    'true'),
  ('participants_locked', 'false')
ON CONFLICT (key) DO NOTHING;

-- Riga risultati torneo (una sola, aggiornata dall'admin)
INSERT INTO tournament_results DEFAULT VALUES;
