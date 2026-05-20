-- ============================================================
-- TotoMondiale 2026 — GIRONI E PARTITE REALI
-- Orari ufficiali (fonte: Sky Sport) — UTC (ora italiana -2)
-- Eseguire nell'SQL Editor di Supabase
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
-- INSERIMENTO 72 PARTITE — orari ufficiali (UTC = ora italiana -2)
-- ============================================================

-- ── GIRONE A ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (messico_id,     sudafrica_id,    'A', 1,  1, '2026-06-11 19:00:00+00', 'group'),  -- 11/06 21:00 IT
  (corea_id,       repceca_id,      'A', 1,  2, '2026-06-12 02:00:00+00', 'group'),  -- 12/06 04:00 IT
  (repceca_id,     sudafrica_id,    'A', 2,  3, '2026-06-18 16:00:00+00', 'group'),  -- 18/06 18:00 IT
  (messico_id,     corea_id,        'A', 2,  4, '2026-06-19 01:00:00+00', 'group'),  -- 19/06 03:00 IT
  (sudafrica_id,   corea_id,        'A', 3,  5, '2026-06-25 01:00:00+00', 'group'),  -- 25/06 03:00 IT
  (repceca_id,     messico_id,      'A', 3,  6, '2026-06-25 01:00:00+00', 'group');  -- 25/06 03:00 IT

-- ── GIRONE B ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (canada_id,      bosnia_id,       'B', 1,  7, '2026-06-12 19:00:00+00', 'group'),  -- 12/06 21:00 IT
  (svizzera_id,    qatar_id,        'B', 1,  8, '2026-06-13 19:00:00+00', 'group'),  -- 13/06 21:00 IT
  (svizzera_id,    bosnia_id,       'B', 2,  9, '2026-06-18 19:00:00+00', 'group'),  -- 18/06 21:00 IT
  (canada_id,      qatar_id,        'B', 2, 10, '2026-06-19 22:00:00+00', 'group'),  -- 20/06 00:00 IT
  (svizzera_id,    canada_id,       'B', 3, 11, '2026-06-24 19:00:00+00', 'group'),  -- 24/06 21:00 IT
  (bosnia_id,      qatar_id,        'B', 3, 12, '2026-06-24 19:00:00+00', 'group');  -- 24/06 21:00 IT

-- ── GIRONE C ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (brasile_id,     marocco_id,      'C', 1, 13, '2026-06-14 22:00:00+00', 'group'),  -- 15/06 00:00 IT
  (haiti_id,       scozia_id,       'C', 1, 14, '2026-06-14 01:00:00+00', 'group'),  -- 14/06 03:00 IT
  (scozia_id,      marocco_id,      'C', 2, 15, '2026-06-20 22:00:00+00', 'group'),  -- 21/06 00:00 IT
  (brasile_id,     haiti_id,        'C', 2, 16, '2026-06-20 01:00:00+00', 'group'),  -- 20/06 03:00 IT
  (marocco_id,     haiti_id,        'C', 3, 17, '2026-06-25 22:00:00+00', 'group'),  -- 26/06 00:00 IT
  (scozia_id,      brasile_id,      'C', 3, 18, '2026-06-25 22:00:00+00', 'group');  -- 26/06 00:00 IT

-- ── GIRONE D ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (usa_id,         paraguay_id,     'D', 1, 19, '2026-06-13 01:00:00+00', 'group'),  -- 13/06 03:00 IT
  (australia_id,   turchia_id,      'D', 1, 20, '2026-06-13 04:00:00+00', 'group'),  -- 13/06 06:00 IT
  (turchia_id,     paraguay_id,     'D', 2, 21, '2026-06-19 04:00:00+00', 'group'),  -- 19/06 06:00 IT
  (usa_id,         australia_id,    'D', 2, 22, '2026-06-19 19:00:00+00', 'group'),  -- 19/06 21:00 IT
  (turchia_id,     usa_id,          'D', 3, 23, '2026-06-26 02:00:00+00', 'group'),  -- 26/06 04:00 IT
  (paraguay_id,    australia_id,    'D', 3, 24, '2026-06-26 02:00:00+00', 'group');  -- 26/06 04:00 IT

-- ── GIRONE E ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (germania_id,    curacao_id,      'E', 1, 25, '2026-06-14 17:00:00+00', 'group'),  -- 14/06 19:00 IT
  (costavorio_id,  ecuador_id,      'E', 1, 26, '2026-06-14 20:00:00+00', 'group'),  -- 14/06 22:00 IT
  (germania_id,    costavorio_id,   'E', 2, 27, '2026-06-20 20:00:00+00', 'group'),  -- 20/06 22:00 IT
  (ecuador_id,     curacao_id,      'E', 2, 28, '2026-06-21 00:00:00+00', 'group'),  -- 21/06 02:00 IT
  (curacao_id,     costavorio_id,   'E', 3, 29, '2026-06-25 20:00:00+00', 'group'),  -- 25/06 22:00 IT
  (ecuador_id,     germania_id,     'E', 3, 30, '2026-06-25 20:00:00+00', 'group');  -- 25/06 22:00 IT

-- ── GIRONE F ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (paesibassi_id,  giappone_id,     'F', 1, 31, '2026-06-14 20:00:00+00', 'group'),  -- 14/06 22:00 IT
  (svezia_id,      tunisia_id,      'F', 1, 32, '2026-06-15 02:00:00+00', 'group'),  -- 15/06 04:00 IT
  (tunisia_id,     giappone_id,     'F', 2, 33, '2026-06-20 04:00:00+00', 'group'),  -- 20/06 06:00 IT
  (paesibassi_id,  svezia_id,       'F', 2, 34, '2026-06-20 17:00:00+00', 'group'),  -- 20/06 19:00 IT
  (tunisia_id,     paesibassi_id,   'F', 3, 35, '2026-06-25 23:00:00+00', 'group'),  -- 26/06 01:00 IT
  (giappone_id,    svezia_id,       'F', 3, 36, '2026-06-25 23:00:00+00', 'group');  -- 26/06 01:00 IT

-- ── GIRONE G ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (belgio_id,      egitto_id,       'G', 1, 37, '2026-06-15 19:00:00+00', 'group'),  -- 15/06 21:00 IT
  (iran_id,        nuovazelanda_id, 'G', 1, 38, '2026-06-16 01:00:00+00', 'group'),  -- 16/06 03:00 IT
  (belgio_id,      iran_id,         'G', 2, 39, '2026-06-21 19:00:00+00', 'group'),  -- 21/06 21:00 IT
  (nuovazelanda_id,egitto_id,       'G', 2, 40, '2026-06-22 01:00:00+00', 'group'),  -- 22/06 03:00 IT
  (nuovazelanda_id,belgio_id,       'G', 3, 41, '2026-06-27 03:00:00+00', 'group'),  -- 27/06 05:00 IT
  (egitto_id,      iran_id,         'G', 3, 42, '2026-06-27 03:00:00+00', 'group');  -- 27/06 05:00 IT

-- ── GIRONE H ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (spagna_id,      capoverde_id,    'H', 1, 43, '2026-06-15 16:00:00+00', 'group'),  -- 15/06 18:00 IT
  (arabia_id,      uruguay_id,      'H', 1, 44, '2026-06-16 22:00:00+00', 'group'),  -- 17/06 00:00 IT
  (spagna_id,      arabia_id,       'H', 2, 45, '2026-06-21 16:00:00+00', 'group'),  -- 21/06 18:00 IT
  (uruguay_id,     capoverde_id,    'H', 2, 46, '2026-06-22 22:00:00+00', 'group'),  -- 23/06 00:00 IT
  (capoverde_id,   arabia_id,       'H', 3, 47, '2026-06-27 00:00:00+00', 'group'),  -- 27/06 02:00 IT
  (uruguay_id,     spagna_id,       'H', 3, 48, '2026-06-27 00:00:00+00', 'group');  -- 27/06 02:00 IT

-- ── GIRONE I ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (francia_id,     senegal_id,      'I', 1, 49, '2026-06-16 19:00:00+00', 'group'),  -- 16/06 21:00 IT
  (iraq_id,        norvegia_id,     'I', 1, 50, '2026-06-17 22:00:00+00', 'group'),  -- 18/06 00:00 IT
  (francia_id,     iraq_id,         'I', 2, 51, '2026-06-22 21:00:00+00', 'group'),  -- 22/06 23:00 IT
  (norvegia_id,    senegal_id,      'I', 2, 52, '2026-06-23 00:00:00+00', 'group'),  -- 23/06 02:00 IT
  (norvegia_id,    francia_id,      'I', 3, 53, '2026-06-26 19:00:00+00', 'group'),  -- 26/06 21:00 IT
  (senegal_id,     iraq_id,         'I', 3, 54, '2026-06-26 19:00:00+00', 'group');  -- 26/06 21:00 IT

-- ── GIRONE J ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (austria_id,     giordania_id,    'J', 1, 55, '2026-06-16 04:00:00+00', 'group'),  -- 16/06 06:00 IT
  (argentina_id,   algeria_id,      'J', 1, 56, '2026-06-17 01:00:00+00', 'group'),  -- 17/06 03:00 IT
  (argentina_id,   austria_id,      'J', 2, 57, '2026-06-22 17:00:00+00', 'group'),  -- 22/06 19:00 IT
  (giordania_id,   algeria_id,      'J', 2, 58, '2026-06-23 03:00:00+00', 'group'),  -- 23/06 05:00 IT
  (algeria_id,     austria_id,      'J', 3, 59, '2026-06-28 02:00:00+00', 'group'),  -- 28/06 04:00 IT
  (giordania_id,   argentina_id,    'J', 3, 60, '2026-06-28 02:00:00+00', 'group');  -- 28/06 04:00 IT

-- ── GIRONE K ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (portogallo_id,  congo_id,        'K', 1, 61, '2026-06-17 17:00:00+00', 'group'),  -- 17/06 19:00 IT
  (uzbekistan_id,  colombia_id,     'K', 1, 62, '2026-06-18 02:00:00+00', 'group'),  -- 18/06 04:00 IT
  (portogallo_id,  uzbekistan_id,   'K', 2, 63, '2026-06-23 17:00:00+00', 'group'),  -- 23/06 19:00 IT
  (colombia_id,    congo_id,        'K', 2, 64, '2026-06-24 02:00:00+00', 'group'),  -- 24/06 04:00 IT
  (colombia_id,    portogallo_id,   'K', 3, 65, '2026-06-27 23:30:00+00', 'group'),  -- 28/06 01:30 IT
  (congo_id,       uzbekistan_id,   'K', 3, 66, '2026-06-27 23:30:00+00', 'group');  -- 28/06 01:30 IT

-- ── GIRONE L ──────────────────────────────────────────────
INSERT INTO matches (home_team_id, away_team_id, group_letter, matchday, match_number, scheduled_at, round) VALUES
  (inghilterra_id, croazia_id,      'L', 1, 67, '2026-06-17 20:00:00+00', 'group'),  -- 17/06 22:00 IT
  (ghana_id,       panama_id,       'L', 1, 68, '2026-06-17 23:00:00+00', 'group'),  -- 18/06 01:00 IT
  (inghilterra_id, ghana_id,        'L', 2, 69, '2026-06-23 20:00:00+00', 'group'),  -- 23/06 22:00 IT
  (panama_id,      croazia_id,      'L', 2, 70, '2026-06-23 23:00:00+00', 'group'),  -- 24/06 01:00 IT
  (panama_id,      inghilterra_id,  'L', 3, 71, '2026-06-27 21:00:00+00', 'group'),  -- 27/06 23:00 IT
  (croazia_id,     ghana_id,        'L', 3, 72, '2026-06-27 21:00:00+00', 'group');  -- 27/06 23:00 IT

END $$;
