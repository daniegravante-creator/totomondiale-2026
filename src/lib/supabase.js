import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variabili Supabase mancanti nel file .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Partecipanti ──────────────────────────────────────────

export async function getParticipantByCode(code) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getAllParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createParticipant(firstName, lastName, code) {
  const { data, error } = await supabase
    .from('participants')
    .insert({ first_name: firstName, last_name: lastName, code })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteParticipant(id) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Squadre ───────────────────────────────────────────────

export async function getAllTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('group_letter')
    .order('sort_order')
  if (error) throw error
  return data
}

// ── Partite ───────────────────────────────────────────────

export async function getGroupMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, flag, group_letter),
      away_team:teams!matches_away_team_id_fkey(id, name, flag, group_letter)
    `)
    .eq('round', 'group')
    .order('match_number')
  if (error) throw error
  return data
}

export async function getAllMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, flag, group_letter),
      away_team:teams!matches_away_team_id_fkey(id, name, flag, group_letter)
    `)
    .order('match_number')
  if (error) throw error
  return data
}

export async function updateMatchResult(matchId, homeScore, awayScore) {
  const status = (homeScore !== null && awayScore !== null) ? 'finished' : 'scheduled'
  const { error } = await supabase
    .from('matches')
    .update({ home_score: homeScore, away_score: awayScore, status })
    .eq('id', matchId)
  if (error) throw error
}

// ── Pronostici partita ────────────────────────────────────

export async function getParticipantMatchPredictions(participantId) {
  const { data, error } = await supabase
    .from('match_predictions')
    .select('*')
    .eq('participant_id', participantId)
  if (error) throw error
  return data
}

export async function getAllMatchPredictions() {
  const { data, error } = await supabase
    .from('match_predictions')
    .select('*')
  if (error) throw error
  return data
}

export async function submitMatchPredictions(participantId, predictions) {
  const rows = Object.entries(predictions).map(([matchId, outcome]) => ({
    participant_id: participantId,
    match_id: matchId,
    predicted_outcome: outcome,
  }))
  const { error } = await supabase
    .from('match_predictions')
    .upsert(rows, { onConflict: 'participant_id,match_id' })
  if (error) throw error
}

// ── Pronostici avanzamento ────────────────────────────────

export async function getParticipantAdvPrediction(participantId) {
  const { data, error } = await supabase
    .from('adv_predictions')
    .select('*')
    .eq('participant_id', participantId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getAllAdvPredictions() {
  const { data, error } = await supabase
    .from('adv_predictions')
    .select('*')
  if (error) throw error
  return data
}

export async function submitAdvPrediction(participantId, semifinalistIds, finalistIds, winnerId, topScorer) {
  const { error } = await supabase
    .from('adv_predictions')
    .upsert({
      participant_id: participantId,
      semifinalist_ids: semifinalistIds,
      finalist_ids: finalistIds,
      winner_id: winnerId,
      top_scorer: topScorer,
    }, { onConflict: 'participant_id' })
  if (error) throw error
}

export async function markParticipantSubmitted(participantId) {
  const { error } = await supabase
    .from('participants')
    .update({ has_submitted: true })
    .eq('id', participantId)
  if (error) throw error
}

// ── Risultati torneo ──────────────────────────────────────

export async function getTournamentResults() {
  const { data, error } = await supabase
    .from('tournament_results')
    .select('*')
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateTournamentResults(updates) {
  const existing = await getTournamentResults()
  if (existing) {
    const { error } = await supabase
      .from('tournament_results')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('tournament_results')
      .insert({ ...updates })
    if (error) throw error
  }
}

// ── Impostazioni ──────────────────────────────────────────

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data?.value ?? null
}

export async function getAllSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
  if (error) throw error
  return Object.fromEntries(data.map(s => [s.key, s.value]))
}

export async function setSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}
