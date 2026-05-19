import { getMatchOutcome } from './utils'

const ENTRY_FEE   = 25  // €
const ADMIN_RATE  = 0.15

// ── Calcolo punti singolo partecipante ────────────────────

export function calculateScore({ matchPredictions, advPrediction, matchResults, tournamentResults }) {
  let groupStage   = 0
  let semifinalists = 0
  let finalists    = 0
  let winner       = 0
  let topScorer    = 0

  // Fase a gironi: 1 punto per esito 1X2 corretto
  for (const pred of matchPredictions) {
    const result = matchResults[pred.match_id]
    if (!result || result.status !== 'finished') continue
    const actual = getMatchOutcome(result.home_score, result.away_score)
    if (actual && pred.predicted_outcome === actual) groupStage++
  }

  if (!advPrediction) {
    return { groupStage, semifinalists, finalists, winner, topScorer, total: groupStage }
  }

  // Semifinaliste: 1 punto ciascuna
  if (tournamentResults?.semifinalist_ids?.length > 0) {
    for (const id of advPrediction.semifinalist_ids) {
      if (tournamentResults.semifinalist_ids.includes(id)) semifinalists++
    }
  }

  // Finaliste: 2 punti ciascuna
  if (tournamentResults?.finalist_ids?.length > 0) {
    for (const id of advPrediction.finalist_ids) {
      if (tournamentResults.finalist_ids.includes(id)) finalists += 2
    }
  }

  // Vincitore: 5 punti
  if (tournamentResults?.winner_id && advPrediction.winner_id === tournamentResults.winner_id) {
    winner = 5
  }

  // Capocannoniere: 4 punti (valido anche se ce ne sono più a pari gol)
  if (tournamentResults?.top_scorer_names?.length > 0 && advPrediction.top_scorer) {
    const entered = advPrediction.top_scorer.toLowerCase().trim()
    const valid   = tournamentResults.top_scorer_names.map(n => n.toLowerCase().trim())
    if (valid.some(n => n === entered || n.includes(entered) || entered.includes(n))) {
      topScorer = 4
    }
  }

  const total = groupStage + semifinalists + finalists + winner + topScorer
  return { groupStage, semifinalists, finalists, winner, topScorer, total }
}

// ── Classifica con gestione ex aequo ─────────────────────

export function rankParticipants(scored) {
  // scored = [{ id, first_name, last_name, score: { total, ... } }]
  const sorted = [...scored].sort((a, b) => b.score.total - a.score.total)

  let rank = 1
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score.total < sorted[i - 1].score.total) rank = i + 1
    sorted[i].rank = rank
  }

  return sorted
}

// ── Calcolo montepremi ────────────────────────────────────
// Regole ex aequo:
// • Più ultimi a pari punti → 25€ decade, aggiunto al premio del 1°
// • Più primi a pari punti → tutto (1°+2°+3°) diviso equamente tra i primi
// • Singolo 1°, più secondi → 2°+3° accorpati e divisi tra i secondi

export function calculatePrizes(ranked) {
  const N = ranked.length
  if (N === 0) return null

  const total    = N * ENTRY_FEE
  const adminFee = total * ADMIN_RATE
  const net      = total - adminFee

  const maxRank = Math.max(...ranked.map(p => p.rank))

  // Classificati per posizione
  const firstPlacers  = ranked.filter(p => p.rank === 1)
  const lastPlacers   = ranked.filter(p => p.rank === maxRank)

  // Premio ultimo classificato
  const multipleLast = lastPlacers.length > 1
  const lastPrize    = multipleLast ? 0 : ENTRY_FEE
  // Bonus da aggiungere al 1° se più ultimi a pari
  const firstBonus   = multipleLast ? ENTRY_FEE : 0

  // Base distribuibile tra 1°/2°/3°
  const pool = net - ENTRY_FEE  // riserviamo sempre €25, poi li gestiamo

  // Caso: più primi a pari punti
  if (firstPlacers.length > 1) {
    const totalForFirsts = pool + firstBonus
    return {
      N, total, adminFee, net,
      lastPlacers, lastPrize,
      firstPlacers, eachFirst: totalForFirsts / firstPlacers.length,
      secondPlacers: [], eachSecond: 0,
      thirdPlacers: [],  eachThird: 0,
      note: 'ex_aequo_first',
    }
  }

  const firstPrize = pool * 0.5 + firstBonus

  // Secondi classificati
  const second = ranked.filter(p => p.rank !== 1 && p.rank !== maxRank)
  if (second.length === 0) {
    return {
      N, total, adminFee, net,
      lastPlacers, lastPrize,
      firstPlacers, eachFirst: firstPrize,
      secondPlacers: [], eachSecond: 0,
      thirdPlacers: [],  eachThird: 0,
      note: 'not_enough_players',
    }
  }

  const secondRank   = Math.min(...second.map(p => p.rank))
  const secondPlacers = ranked.filter(p => p.rank === secondRank)

  // Caso: più secondi a pari punti
  if (secondPlacers.length > 1) {
    const secondPool = pool * 0.5  // 2° + 3° accorpati
    return {
      N, total, adminFee, net,
      lastPlacers, lastPrize,
      firstPlacers, eachFirst: firstPrize,
      secondPlacers, eachSecond: secondPool / secondPlacers.length,
      thirdPlacers: [], eachThird: 0,
      note: 'ex_aequo_second',
    }
  }

  const secondPrize = pool * 0.3

  // Terzi classificati
  const thirdRank    = ranked.filter(p => p.rank > secondRank && p.rank !== maxRank)
  const minThirdRank = thirdRank.length > 0 ? Math.min(...thirdRank.map(p => p.rank)) : null
  const thirdPlacers = minThirdRank ? ranked.filter(p => p.rank === minThirdRank) : []
  const thirdPrize   = thirdPlacers.length > 0 ? pool * 0.2 / thirdPlacers.length : 0

  return {
    N, total, adminFee, net,
    lastPlacers, lastPrize,
    firstPlacers, eachFirst: firstPrize,
    secondPlacers, eachSecond: secondPrize,
    thirdPlacers, eachThird: thirdPrize,
    note: 'normal',
  }
}
