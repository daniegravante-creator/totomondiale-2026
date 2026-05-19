-- ============================================================
-- TotoMondiale 2026 — Dati iniziali (squadre e partite)
-- Eseguire DOPO schema.sql
-- NOTA: gruppi placeholder — verifica con i gironi reali del sorteggio
-- ============================================================

DO $$
DECLARE
  -- GIRONE A
  arg_id UUID; mar_id UUID; ukr_id UUID; alb_id UUID;
  -- GIRONE B
  fra_id UUID; usa_id UUID; jam_id UUID; isl_id UUID;
  -- GIRONE C
  esp_id UUID; jpn_id UUID; sen_id UUID; hon_id UUID;
  -- GIRONE D
  ger_id UUID; mex_id UUID; kor_id UUID; bol_id UUID;
  -- GIRONE E
  bra_id UUID; sui_id UUID; egy_id UUID; idn_id UUID;
  -- GIRONE F
  eng_id UUID; ned_id UUID; col_id UUID; pan_id UUID;
  -- GIRONE G
  por_id UUID; bel_id UUID; nga_id UUID; cri_id UUID;
  -- GIRONE H
  ita_id UUID; cro_id UUID; cam_id UUID; par_id UUID;
  -- GIRONE I
  uru_id UUID; tur_id UUID; ksa_id UUID; uzb_id UUID;
  -- GIRONE J
  pol_id UUID; srb_id UUID; ecu_id UUID; rsa_id UUID;
  -- GIRONE K
  aut_id UUID; alg_id UUID; aus_id UUID; ven_id UUID;
  -- GIRONE L
  can_id UUID; tun_id UUID; irn_id UUID; nzl_id UUID;

BEGIN

-- ============================================================
-- INSERIMENTO SQUADRE
-- ============================================================

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Argentina',     '🇦🇷', 'A', 1) RETURNING id INTO arg_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Marocco',       '🇲🇦', 'A', 2) RETURNING id INTO mar_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Ucraina',       '🇺🇦', 'A', 3) RETURNING id INTO ukr_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Albania',       '🇦🇱', 'A', 4) RETURNING id INTO alb_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Francia',       '🇫🇷', 'B', 1) RETURNING id INTO fra_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('USA',           '🇺🇸', 'B', 2) RETURNING id INTO usa_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Giamaica',      '🇯🇲', 'B', 3) RETURNING id INTO jam_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Islanda',       '🇮🇸', 'B', 4) RETURNING id INTO isl_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Spagna',        '🇪🇸', 'C', 1) RETURNING id INTO esp_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Giappone',      '🇯🇵', 'C', 2) RETURNING id INTO jpn_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Senegal',       '🇸🇳', 'C', 3) RETURNING id INTO sen_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Honduras',      '🇭🇳', 'C', 4) RETURNING id INTO hon_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Germania',      '🇩🇪', 'D', 1) RETURNING id INTO ger_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Messico',       '🇲🇽', 'D', 2) RETURNING id INTO mex_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Corea del Sud', '🇰🇷', 'D', 3) RETURNING id INTO kor_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Bolivia',       '🇧🇴', 'D', 4) RETURNING id INTO bol_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Brasile',       '🇧🇷', 'E', 1) RETURNING id INTO bra_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Svizzera',      '🇨🇭', 'E', 2) RETURNING id INTO sui_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Egitto',        '🇪🇬', 'E', 3) RETURNING id INTO egy_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Indonesia',     '🇮🇩', 'E', 4) RETURNING id INTO idn_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Inghilterra',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'F', 1) RETURNING id INTO eng_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Paesi Bassi',   '🇳🇱', 'F', 2) RETURNING id INTO ned_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Colombia',      '🇨🇴', 'F', 3) RETURNING id INTO col_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Panama',        '🇵🇦', 'F', 4) RETURNING id INTO pan_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Portogallo',    '🇵🇹', 'G', 1) RETURNING id INTO por_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Belgio',        '🇧🇪', 'G', 2) RETURNING id INTO bel_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Nigeria',       '🇳🇬', 'G', 3) RETURNING id INTO nga_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Costa Rica',    '🇨🇷', 'G', 4) RETURNING id INTO cri_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Italia',        '🇮🇹', 'H', 1) RETURNING id INTO ita_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Croazia',       '🇭🇷', 'H', 2) RETURNING id INTO cro_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Camerun',       '🇨🇲', 'H', 3) RETURNING id INTO cam_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Paraguay',      '🇵🇾', 'H', 4) RETURNING id INTO par_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Uruguay',       '🇺🇾', 'I', 1) RETURNING id INTO uru_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Turchia',       '🇹🇷', 'I', 2) RETURNING id INTO tur_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Arabia Saudita','🇸🇦', 'I', 3) RETURNING id INTO ksa_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Uzbekistan',    '🇺🇿', 'I', 4) RETURNING id INTO uzb_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Polonia',       '🇵🇱', 'J', 1) RETURNING id INTO pol_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Serbia',        '🇷🇸', 'J', 2) RETURNING id INTO srb_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Ecuador',       '🇪🇨', 'J', 3) RETURNING id INTO ecu_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Sudafrica',     '🇿🇦', 'J', 4) RETURNING id INTO rsa_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Austria',       '🇦🇹', 'K', 1) RETURNING id INTO aut_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Algeria',       '🇩🇿', 'K', 2) RETURNING id INTO alg_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Australia',     '🇦🇺', 'K', 3) RETURNING id INTO aus_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Venezuela',     '🇻🇪', 'K', 4) RETURNING id INTO ven_id;

INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Canada',        '🇨🇦', 'L', 1) RETURNING id INTO can_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Tunisia',       '🇹🇳', 'L', 2) RETURNING id INTO tun_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Iran',          '🇮🇷', 'L', 3) RETURNING id INTO irn_id;
INSERT INTO teams (name, flag, group_letter, sort_order) VALUES ('Nuova Zelanda', '🇳🇿', 'L', 4) RETURNING id INTO nzl_id;

-- ============================================================
-- INSERIMENTO PARTITE (72 partite di girone)
-- Formato: MD1: T1-T2, T3-T4 | MD2: T1-T3, T2-T4 | MD3: T1-T4, T2-T3
-- Orari in UTC. Matchday 3: entrambe le partite del girone a parità di orario.
-- ============================================================

-- ── GIRONE A ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (arg_id, mar_id, 'A', 1,  1, '2026-06-12 17:00:00+00', 'group'),
  (ukr_id, alb_id, 'A', 1,  2, '2026-06-12 20:00:00+00', 'group'),
  (arg_id, ukr_id, 'A', 2, 25, '2026-06-18 17:00:00+00', 'group'),
  (mar_id, alb_id, 'A', 2, 26, '2026-06-18 20:00:00+00', 'group'),
  (arg_id, alb_id, 'A', 3, 49, '2026-06-26 20:00:00+00', 'group'),
  (mar_id, ukr_id, 'A', 3, 50, '2026-06-26 20:00:00+00', 'group');

-- ── GIRONE B ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (fra_id, usa_id, 'B', 1,  3, '2026-06-12 23:00:00+00', 'group'),
  (jam_id, isl_id, 'B', 1,  4, '2026-06-13 02:00:00+00', 'group'),
  (fra_id, jam_id, 'B', 2, 27, '2026-06-18 23:00:00+00', 'group'),
  (usa_id, isl_id, 'B', 2, 28, '2026-06-19 02:00:00+00', 'group'),
  (fra_id, isl_id, 'B', 3, 51, '2026-06-27 20:00:00+00', 'group'),
  (usa_id, jam_id, 'B', 3, 52, '2026-06-27 20:00:00+00', 'group');

-- ── GIRONE C ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (esp_id, jpn_id, 'C', 1,  5, '2026-06-13 17:00:00+00', 'group'),
  (sen_id, hon_id, 'C', 1,  6, '2026-06-13 20:00:00+00', 'group'),
  (esp_id, sen_id, 'C', 2, 29, '2026-06-19 17:00:00+00', 'group'),
  (jpn_id, hon_id, 'C', 2, 30, '2026-06-19 20:00:00+00', 'group'),
  (esp_id, hon_id, 'C', 3, 53, '2026-06-28 20:00:00+00', 'group'),
  (jpn_id, sen_id, 'C', 3, 54, '2026-06-28 20:00:00+00', 'group');

-- ── GIRONE D ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (ger_id, mex_id, 'D', 1,  7, '2026-06-13 23:00:00+00', 'group'),
  (kor_id, bol_id, 'D', 1,  8, '2026-06-14 02:00:00+00', 'group'),
  (ger_id, kor_id, 'D', 2, 31, '2026-06-19 23:00:00+00', 'group'),
  (mex_id, bol_id, 'D', 2, 32, '2026-06-20 02:00:00+00', 'group'),
  (ger_id, bol_id, 'D', 3, 55, '2026-06-29 20:00:00+00', 'group'),
  (mex_id, kor_id, 'D', 3, 56, '2026-06-29 20:00:00+00', 'group');

-- ── GIRONE E ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (bra_id, sui_id, 'E', 1,  9, '2026-06-14 17:00:00+00', 'group'),
  (egy_id, idn_id, 'E', 1, 10, '2026-06-14 20:00:00+00', 'group'),
  (bra_id, egy_id, 'E', 2, 33, '2026-06-20 17:00:00+00', 'group'),
  (sui_id, idn_id, 'E', 2, 34, '2026-06-20 20:00:00+00', 'group'),
  (bra_id, idn_id, 'E', 3, 57, '2026-06-30 20:00:00+00', 'group'),
  (sui_id, egy_id, 'E', 3, 58, '2026-06-30 20:00:00+00', 'group');

-- ── GIRONE F ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (eng_id, ned_id, 'F', 1, 11, '2026-06-14 23:00:00+00', 'group'),
  (col_id, pan_id, 'F', 1, 12, '2026-06-15 02:00:00+00', 'group'),
  (eng_id, col_id, 'F', 2, 35, '2026-06-20 23:00:00+00', 'group'),
  (ned_id, pan_id, 'F', 2, 36, '2026-06-21 02:00:00+00', 'group'),
  (eng_id, pan_id, 'F', 3, 59, '2026-07-01 20:00:00+00', 'group'),
  (ned_id, col_id, 'F', 3, 60, '2026-07-01 20:00:00+00', 'group');

-- ── GIRONE G ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (por_id, bel_id, 'G', 1, 13, '2026-06-15 17:00:00+00', 'group'),
  (nga_id, cri_id, 'G', 1, 14, '2026-06-15 20:00:00+00', 'group'),
  (por_id, nga_id, 'G', 2, 37, '2026-06-21 17:00:00+00', 'group'),
  (bel_id, cri_id, 'G', 2, 38, '2026-06-21 20:00:00+00', 'group'),
  (por_id, cri_id, 'G', 3, 61, '2026-07-02 20:00:00+00', 'group'),
  (bel_id, nga_id, 'G', 3, 62, '2026-07-02 20:00:00+00', 'group');

-- ── GIRONE H ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (ita_id, cro_id, 'H', 1, 15, '2026-06-15 23:00:00+00', 'group'),
  (cam_id, par_id, 'H', 1, 16, '2026-06-16 02:00:00+00', 'group'),
  (ita_id, cam_id, 'H', 2, 39, '2026-06-21 23:00:00+00', 'group'),
  (cro_id, par_id, 'H', 2, 40, '2026-06-22 02:00:00+00', 'group'),
  (ita_id, par_id, 'H', 3, 63, '2026-07-03 20:00:00+00', 'group'),
  (cro_id, cam_id, 'H', 3, 64, '2026-07-03 20:00:00+00', 'group');

-- ── GIRONE I ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (uru_id, tur_id, 'I', 1, 17, '2026-06-16 17:00:00+00', 'group'),
  (ksa_id, uzb_id, 'I', 1, 18, '2026-06-16 20:00:00+00', 'group'),
  (uru_id, ksa_id, 'I', 2, 41, '2026-06-22 17:00:00+00', 'group'),
  (tur_id, uzb_id, 'I', 2, 42, '2026-06-22 20:00:00+00', 'group'),
  (uru_id, uzb_id, 'I', 3, 65, '2026-07-04 20:00:00+00', 'group'),
  (tur_id, ksa_id, 'I', 3, 66, '2026-07-04 20:00:00+00', 'group');

-- ── GIRONE J ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (pol_id, srb_id, 'J', 1, 19, '2026-06-16 23:00:00+00', 'group'),
  (ecu_id, rsa_id, 'J', 1, 20, '2026-06-17 02:00:00+00', 'group'),
  (pol_id, ecu_id, 'J', 2, 43, '2026-06-22 23:00:00+00', 'group'),
  (srb_id, rsa_id, 'J', 2, 44, '2026-06-23 02:00:00+00', 'group'),
  (pol_id, rsa_id, 'J', 3, 67, '2026-07-05 20:00:00+00', 'group'),
  (srb_id, ecu_id, 'J', 3, 68, '2026-07-05 20:00:00+00', 'group');

-- ── GIRONE K ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (aut_id, alg_id, 'K', 1, 21, '2026-06-17 17:00:00+00', 'group'),
  (aus_id, ven_id, 'K', 1, 22, '2026-06-17 20:00:00+00', 'group'),
  (aut_id, aus_id, 'K', 2, 45, '2026-06-23 17:00:00+00', 'group'),
  (alg_id, ven_id, 'K', 2, 46, '2026-06-23 20:00:00+00', 'group'),
  (aut_id, ven_id, 'K', 3, 69, '2026-07-06 20:00:00+00', 'group'),
  (alg_id, aus_id, 'K', 3, 70, '2026-07-06 20:00:00+00', 'group');

-- ── GIRONE L ──────────────────────────────────────────────
INSERT INTO matches (home_team_id,away_team_id,group_letter,matchday,match_number,scheduled_at,round) VALUES
  (can_id, tun_id, 'L', 1, 23, '2026-06-17 23:00:00+00', 'group'),
  (irn_id, nzl_id, 'L', 1, 24, '2026-06-18 02:00:00+00', 'group'),
  (can_id, irn_id, 'L', 2, 47, '2026-06-23 23:00:00+00', 'group'),
  (tun_id, nzl_id, 'L', 2, 48, '2026-06-24 02:00:00+00', 'group'),
  (can_id, nzl_id, 'L', 3, 71, '2026-07-07 20:00:00+00', 'group'),
  (tun_id, irn_id, 'L', 3, 72, '2026-07-07 20:00:00+00', 'group');

END $$;
