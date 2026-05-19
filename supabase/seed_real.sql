-- ============================================================
-- TotoMondiale 2026 — GIRONI E PARTITE REALI
-- Eseguire nell'SQL Editor di Supabase
-- Sostituisce i dati placeholder con i gironi ufficiali
-- ============================================================

-- Pulizia dati esistenti
DELETE FROM match_predictions;
DELETE FROM adv_predictions;
DELETE FROM matches;
DELETE FROM teams;

-- Resetta risultati torneo
UPDATE tournament_results SET
  semifinalist_ids = '{}',
  finalist_ids = '{}',
  winner_id = NULL,
  top_scorer_names = '{}',
  updated_at = NOW();

DO $$
DECLARE
  -- GIRONE A: Messico, Sudafrica, Corea del Sud, Rep. Ceca
  messico_id UUID; sudafrica_id UUID; corea_id UUID; repceca_id UUID;
  -- GIRONE B: Canada, Bosnia, Qatar, Svizzera
  canada_id UUID; bosnia_id UUID; qatar_id UUID; svizzera_id UUID;
  -- GIRONE C: Brasile, Marocco, Haiti, Scozia
  brasile_id UUID; marocco_id UUID; haiti_id UUID; scozia_id UUID;
  -- GIRONE D: Stati Uniti, Paraguay, Australia, Turchia
  usa_id UUID; paraguay_id UUID; australia_id UUID; turchia_id UUID;
  -- GIRONE E: Germania, Curacao, Costa d'Avorio, Ecuador
  germania_id UUID; curacao_id UUID; costavorio_id UUID; ecuador_id UUID;
  -- GIRONE F: Paesi Bassi, Giappone, Svezia, Tunisia
  paesibassi_id UUID; giappone_id UUID; svezia_id UUID; tunisia_id UUID;
  -- GIRONE G: Belgio, Egitto, Iran, Nuova Zelanda
  belgio_id UUID; egitto_id UUID; iran_id UUID; nuovazelanda_id UUID;
  -- GIRONE H: Spagna, Capo Verde, Arabia Saudita, Uruguay
  spagna_id UUID; capoverde_id UUID; arabia_id UUID; uruguay_id UUID;
  -- GIRONE I: Francia, Senegal, Iraq, Norvegia
  francia_id UUID; senegal_id UUID; iraq_id UUID; norvegia_id UUID;
  -- GIRONE J: Argentina, Algeria, Austria, Giordania
  argentina_id UUID; algeria_id UUID; austria_id UUID; giordania_id UUID;
  -- GIRONE K: Portogallo, Congo, Uzbekistan, Colombia
  portogallo_id UUID; congo_id UUID; uzbekistan_id UUID; colombia_id UUID;
  -- GIRONE L: Inghilterra, Croazia, Ghana, Panama
  inghilterra_id UUID; croazia_id UUID; ghana_id UUID; panama_id UUID;

BEGIN

-- ============================================================
-- INSERIMENTO 48 SQUADRE
-- ============================================================

-- GIRONE A
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Messico',         '🇲🇽', 'A', 1) RETURNING id INTO messico_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Sudafrica',       '🇿🇦', 'A', 2) RETURNING id INTO sudafrica_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Corea del Sud',   '🇰🇷', 'A', 3) RETURNING id INTO corea_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Rep. Ceca',       '🇨🇿', 'A', 4) RETURNING id INTO repceca_id;

-- GIRONE B
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Canada',          '🇨🇦', 'B', 1) RETURNING id INTO canada_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Bosnia',          '🇧🇦', 'B', 2) RETURNING id INTO bosnia_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Qatar',           '🇶🇦', 'B', 3) RETURNING id INTO qatar_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Svizzera',        '🇨🇭', 'B', 4) RETURNING id INTO svizzera_id;

-- GIRONE C
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Brasile',         '🇧🇷', 'C', 1) RETURNING id INTO brasile_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Marocco',         '🇲🇦', 'C', 2) RETURNING id INTO marocco_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Haiti',           '🇭🇹', 'C', 3) RETURNING id INTO haiti_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Scozia',          '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C', 4) RETURNING id INTO scozia_id;

-- GIRONE D
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Stati Uniti',     '🇺🇸', 'D', 1) RETURNING id INTO usa_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Paraguay',        '🇵🇾', 'D', 2) RETURNING id INTO paraguay_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Australia',       '🇦🇺', 'D', 3) RETURNING id INTO australia_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Turchia',         '🇹🇷', 'D', 4) RETURNING id INTO turchia_id;

-- GIRONE E
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Germania',        '🇩🇪', 'E', 1) RETURNING id INTO germania_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Curacao',         '🇨🇼', 'E', 2) RETURNING id INTO curacao_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Costa d''Avorio', '🇨🇮', 'E', 3) RETURNING id INTO costavorio_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Ecuador',         '🇪🇨', 'E', 4) RETURNING id INTO ecuador_id;

-- GIRONE F
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Paesi Bassi',     '🇳🇱', 'F', 1) RETURNING id INTO paesibassi_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Giappone',        '🇯🇵', 'F', 2) RETURNING id INTO giappone_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Svezia',          '🇸🇪', 'F', 3) RETURNING id INTO svezia_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Tunisia',         '🇹🇳', 'F', 4) RETURNING id INTO tunisia_id;

-- GIRONE G
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Belgio',          '🇧🇪', 'G', 1) RETURNING id INTO belgio_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Egitto',          '🇪🇬', 'G', 2) RETURNING id INTO egitto_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Iran',            '🇮🇷', 'G', 3) RETURNING id INTO iran_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Nuova Zelanda',   '🇳🇿', 'G', 4) RETURNING id INTO nuovazelanda_id;

-- GIRONE H
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Spagna',          '🇪🇸', 'H', 1) RETURNING id INTO spagna_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Capo Verde',      '🇨🇻', 'H', 2) RETURNING id INTO capoverde_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Arabia Saudita',  '🇸🇦', 'H', 3) RETURNING id INTO arabia_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Uruguay',         '🇺🇾', 'H', 4) RETURNING id INTO uruguay_id;

-- GIRONE I
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Francia',         '🇫🇷', 'I', 1) RETURNING id INTO francia_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Senegal',         '🇸🇳', 'I', 2) RETURNING id INTO senegal_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Iraq',            '🇮🇶', 'I', 3) RETURNING id INTO iraq_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Norvegia',        '🇳🇴', 'I', 4) RETURNING id INTO norvegia_id;

-- GIRONE J
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Argentina',       '🇦🇷', 'J', 1) RETURNING id INTO argentina_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Algeria',         '🇩🇿', 'J', 2) RETURNING id INTO algeria_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Austria',         '🇦🇹', 'J', 3) RETURNING id INTO austria_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Giordania',       '🇯🇴', 'J', 4) RETURNING id INTO giordania_id;

-- GIRONE K
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Portogallo',      '🇵🇹', 'K', 1) RETURNING id INTO portogallo_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Congo',           '🇨🇩', 'K', 2) RETURNING id INTO congo_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Uzbekistan',      '🇺🇿', 'K', 3) RETURNING id INTO uzbekistan_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Colombia',        '🇨🇴', 'K', 4) RETURNING id INTO colombia_id;

-- GIRONE L
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Inghilterra',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L', 1) RETURNING id INTO inghilterra_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Croazia',         '🇭🇷', 'L', 2) RETURNING id INTO croazia_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Ghana',           '🇬🇭', 'L', 3) RETURNING id INTO ghana_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Panama',          '🇵🇦', 'L', 4) RETURNING id INTO panama_id;

-- ============================================================
-- INSERIMENTO 72 PARTITE (ordine cronologico reale)
-- ============================================================

-- ── PARTITA 1-10 ──────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (messico_id,     sudafrica_id,   'A', 1,  1, '2026-06-11 18:00:00+00', 'group'),
  (corea_id,       repceca_id,     'A', 1,  2, '2026-06-12 17:00:00+00', 'group'),
  (canada_id,      bosnia_id,      'B', 1,  3, '2026-06-12 20:00:00+00', 'group'),
  (usa_id,         paraguay_id,    'D', 1,  4, '2026-06-13 17:00:00+00', 'group'),
  (qatar_id,       svizzera_id,    'B', 1,  5, '2026-06-13 20:00:00+00', 'group'),
  (brasile_id,     marocco_id,     'C', 1,  6, '2026-06-14 17:00:00+00', 'group'),
  (haiti_id,       scozia_id,      'C', 1,  7, '2026-06-14 18:00:00+00', 'group'),
  (australia_id,   turchia_id,     'D', 1,  8, '2026-06-14 20:00:00+00', 'group'),
  (germania_id,    curacao_id,     'E', 1,  9, '2026-06-14 21:00:00+00', 'group'),
  (paesibassi_id,  giappone_id,    'F', 1, 10, '2026-06-14 23:00:00+00', 'group');

-- ── PARTITA 11-20 ─────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (costavorio_id,  ecuador_id,     'E', 1, 11, '2026-06-15 17:00:00+00', 'group'),
  (svezia_id,      tunisia_id,     'F', 1, 12, '2026-06-15 18:00:00+00', 'group'),
  (spagna_id,      capoverde_id,   'H', 1, 13, '2026-06-15 20:00:00+00', 'group'),
  (belgio_id,      egitto_id,      'G', 1, 14, '2026-06-15 23:00:00+00', 'group'),
  (arabia_id,      uruguay_id,     'H', 1, 15, '2026-06-16 17:00:00+00', 'group'),
  (iran_id,        nuovazelanda_id,'G', 1, 16, '2026-06-16 18:00:00+00', 'group'),
  (francia_id,     senegal_id,     'I', 1, 17, '2026-06-16 20:00:00+00', 'group'),
  (iraq_id,        norvegia_id,    'I', 1, 18, '2026-06-17 17:00:00+00', 'group'),
  (argentina_id,   algeria_id,     'J', 1, 19, '2026-06-17 18:00:00+00', 'group'),
  (austria_id,     giordania_id,   'J', 1, 20, '2026-06-17 20:00:00+00', 'group');

-- ── PARTITA 21-30 ─────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (portogallo_id,  congo_id,       'K', 1, 21, '2026-06-17 21:00:00+00', 'group'),
  (inghilterra_id, croazia_id,     'L', 1, 22, '2026-06-17 23:00:00+00', 'group'),
  (ghana_id,       panama_id,      'L', 1, 23, '2026-06-18 17:00:00+00', 'group'),
  (uzbekistan_id,  colombia_id,    'K', 1, 24, '2026-06-18 18:00:00+00', 'group'),
  (repceca_id,     sudafrica_id,   'A', 2, 25, '2026-06-18 20:00:00+00', 'group'),
  (svizzera_id,    bosnia_id,      'B', 2, 26, '2026-06-18 23:00:00+00', 'group'),
  (canada_id,      qatar_id,       'B', 2, 27, '2026-06-19 17:00:00+00', 'group'),
  (messico_id,     corea_id,       'A', 2, 28, '2026-06-19 18:00:00+00', 'group'),
  (usa_id,         australia_id,   'D', 2, 29, '2026-06-19 20:00:00+00', 'group'),
  (scozia_id,      marocco_id,     'C', 2, 30, '2026-06-20 17:00:00+00', 'group');

-- ── PARTITA 31-40 ─────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (brasile_id,     haiti_id,       'C', 2, 31, '2026-06-20 18:00:00+00', 'group'),
  (turchia_id,     paraguay_id,    'D', 2, 32, '2026-06-20 20:00:00+00', 'group'),
  (paesibassi_id,  svezia_id,      'F', 2, 33, '2026-06-20 23:00:00+00', 'group'),
  (germania_id,    costavorio_id,  'E', 2, 34, '2026-06-20 21:00:00+00', 'group'),
  (ecuador_id,     curacao_id,     'E', 2, 35, '2026-06-21 17:00:00+00', 'group'),
  (tunisia_id,     giappone_id,    'F', 2, 36, '2026-06-21 18:00:00+00', 'group'),
  (spagna_id,      arabia_id,      'H', 2, 37, '2026-06-21 20:00:00+00', 'group'),
  (belgio_id,      iran_id,        'G', 2, 38, '2026-06-21 23:00:00+00', 'group'),
  (uruguay_id,     capoverde_id,   'H', 2, 39, '2026-06-22 17:00:00+00', 'group'),
  (nuovazelanda_id,egitto_id,      'G', 2, 40, '2026-06-22 18:00:00+00', 'group');

-- ── PARTITA 41-50 ─────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (argentina_id,   austria_id,     'J', 2, 41, '2026-06-22 20:00:00+00', 'group'),
  (francia_id,     iraq_id,        'I', 2, 42, '2026-06-22 23:00:00+00', 'group'),
  (norvegia_id,    senegal_id,     'I', 2, 43, '2026-06-23 17:00:00+00', 'group'),
  (giordania_id,   algeria_id,     'J', 2, 44, '2026-06-23 18:00:00+00', 'group'),
  (portogallo_id,  uzbekistan_id,  'K', 2, 45, '2026-06-23 20:00:00+00', 'group'),
  (inghilterra_id, ghana_id,       'L', 2, 46, '2026-06-23 23:00:00+00', 'group'),
  (panama_id,      croazia_id,     'L', 2, 47, '2026-06-24 17:00:00+00', 'group'),
  (colombia_id,    congo_id,       'K', 2, 48, '2026-06-24 18:00:00+00', 'group'),
  (svizzera_id,    canada_id,      'B', 3, 49, '2026-06-24 20:00:00+00', 'group'),
  (bosnia_id,      qatar_id,       'B', 3, 50, '2026-06-24 20:00:00+00', 'group');

-- ── PARTITA 51-60 ─────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (marocco_id,     haiti_id,       'C', 3, 51, '2026-06-25 18:00:00+00', 'group'),
  (scozia_id,      brasile_id,     'C', 3, 52, '2026-06-25 18:00:00+00', 'group'),
  (repceca_id,     messico_id,     'A', 3, 53, '2026-06-25 20:00:00+00', 'group'),
  (sudafrica_id,   corea_id,       'A', 3, 54, '2026-06-25 20:00:00+00', 'group'),
  (ecuador_id,     germania_id,    'E', 3, 55, '2026-06-25 23:00:00+00', 'group'),
  (curacao_id,     costavorio_id,  'E', 3, 56, '2026-06-25 23:00:00+00', 'group'),
  (tunisia_id,     paesibassi_id,  'F', 3, 57, '2026-06-26 18:00:00+00', 'group'),
  (giappone_id,    svezia_id,      'F', 3, 58, '2026-06-26 18:00:00+00', 'group'),
  (turchia_id,     usa_id,         'D', 3, 59, '2026-06-26 20:00:00+00', 'group'),
  (paraguay_id,    australia_id,   'D', 3, 60, '2026-06-26 20:00:00+00', 'group');

-- ── PARTITA 61-72 ─────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (norvegia_id,    francia_id,     'I', 3, 61, '2026-06-26 23:00:00+00', 'group'),
  (senegal_id,     iraq_id,        'I', 3, 62, '2026-06-26 23:00:00+00', 'group'),
  (uruguay_id,     spagna_id,      'H', 3, 63, '2026-06-27 18:00:00+00', 'group'),
  (capoverde_id,   arabia_id,      'H', 3, 64, '2026-06-27 18:00:00+00', 'group'),
  (nuovazelanda_id,belgio_id,      'G', 3, 65, '2026-06-27 20:00:00+00', 'group'),
  (egitto_id,      iran_id,        'G', 3, 66, '2026-06-27 20:00:00+00', 'group'),
  (panama_id,      inghilterra_id, 'L', 3, 67, '2026-06-27 23:00:00+00', 'group'),
  (croazia_id,     ghana_id,       'L', 3, 68, '2026-06-27 23:00:00+00', 'group'),
  (colombia_id,    portogallo_id,  'K', 3, 69, '2026-06-28 18:00:00+00', 'group'),
  (congo_id,       uzbekistan_id,  'K', 3, 70, '2026-06-28 18:00:00+00', 'group'),
  (giordania_id,   argentina_id,   'J', 3, 71, '2026-06-28 20:00:00+00', 'group'),
  (algeria_id,     austria_id,     'J', 3, 72, '2026-06-28 20:00:00+00', 'group');

END $$;
