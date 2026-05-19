// ── Integrazione API-Football (api-sports.io) ─────────────
// Piano gratuito: 100 chiamate/giorno
// League ID 1 = FIFA World Cup | Season 2026

const API_BASE  = 'https://v3.football.api-sports.io'
const WC_LEAGUE = 1
const WC_SEASON = 2026

async function apiFetch(path, apiKey) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'x-apisports-key': apiKey,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API-Football errore ${res.status}: ${text}`)
  }
  const json = await res.json()
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(Object.values(json.errors).join(', '))
  }
  return json.response
}

// Recupera tutte le partite della fase a gironi
export async function fetchGroupStageFixtures(apiKey) {
  return apiFetch(
    `/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&round=Group+Stage`,
    apiKey
  )
}

// Recupera fixture aggiornate di oggi
export async function fetchTodayFixtures(apiKey) {
  const today = new Date().toISOString().slice(0, 10)
  return apiFetch(
    `/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&date=${today}`,
    apiKey
  )
}

// Recupera fixture live
export async function fetchLiveFixtures(apiKey) {
  return apiFetch(
    `/fixtures?league=${WC_LEAGUE}&live=all`,
    apiKey
  )
}

// Converte fixture API → formato interno
// Restituisce: { api_fixture_id, home_score, away_score, status }
export function parseFixture(fixture) {
  const { fixture: f, goals, teams } = fixture
  const statusMap = {
    'NS': 'scheduled',
    '1H': 'in_progress', 'HT': 'in_progress',
    '2H': 'in_progress', 'ET': 'in_progress',
    'P':  'in_progress', 'BT': 'in_progress',
    'FT': 'finished',    'AET': 'finished',   'PEN': 'finished',
  }
  return {
    api_fixture_id: f.id,
    home_score:     goals.home,
    away_score:     goals.away,
    status:         statusMap[f.status?.short] ?? 'scheduled',
    home_team_api:  teams.home.name,
    away_team_api:  teams.away.name,
  }
}

// Sincronizza risultati: prende le fixture aggiornate e restituisce
// un array di { matchId, homeScore, awayScore, status } pronti per il DB.
// Il mapping avviene tramite api_fixture_id già salvato sui matches.
export async function syncResults(apiKey, dbMatches) {
  const fixtures = await fetchGroupStageFixtures(apiKey)
  const updates  = []

  for (const fixture of fixtures) {
    const parsed = parseFixture(fixture)
    const match  = dbMatches.find(m => m.api_fixture_id === parsed.api_fixture_id)
    if (!match) continue
    if (parsed.status === 'finished' || parsed.status === 'in_progress') {
      updates.push({
        matchId:   match.id,
        homeScore: parsed.home_score,
        awayScore: parsed.away_score,
        status:    parsed.status,
      })
    }
  }

  return updates
}
