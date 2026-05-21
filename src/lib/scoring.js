import { getMatchOutcome } from './utils'

// Configurazione di default — sovrascrivibile dall'admin via settings
export const DEFAULT_PRIZE_CONFIG = {
  entryFee:   20,
  adminRate:  0.15,
  firstPct:   0.50,
  secondPct:  0.30,
  thirdPct:   0.20,
}

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
  const sorted = [...scored].sort((a, b) => b.score.total - a.score.total)

  let rank = 1
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score.total < sorted[i - 1].score.total) rank = i + 1
    sorted[i].rank = rank
  }

  return sorted
}

// ── Calcolo montepremi ────────────────────────────────────
// Regole:
// • 1 solo partecipante → vince tutto il netto
// • 2 partecipanti → 1° prende netto - quota_ultimo, ultimo prende quota
// • 3+ partecipanti → distribuzione normale 1°/2°/3° + ultimo
// Ex aequo:
// • Più ultimi a pari punti → premio ultimo decade, aggiunto al 1°
// • Più primi a pari punti → tutto (1°+2°+3°) diviso equamente tra i primi
// • Singolo 1°, più secondi → 2°+3° accorpati e divisi tra i secondi

export function calculatePrizes(ranked, config = {}) {
  const cfg = { ...DEFAULT_PRIZE_CONFIG, ...config }
  const N = ranked.length
  if (N === 0) return null

  const total    = N * cfg.entryFee
  const adminFee = Math.round(total * cfg.adminRate * 100) / 100
  const net      = total - adminFee

  const maxRank = Math.max(...ranked.map(p => p.rank))

  // Classificati per posizione
  const firstPlacers  = ranked.filter(p => p.rank === 1)
  const lastPlacers   = ranked.filter(p => p.rank === maxRank)

  const base = { N, total, adminFee, net, entryFee: cfg.entryFee }

  // ── Caso speciale: 1 solo partecipante ──
  if (N === 1) {
    return {
      ...base,
      lastPlacers: [], lastPrize: 0,
      firstPlacers, eachFirst: net,
      secondPlacers: [], eachSecond: 0,
      thirdPlacers: [],  eachThird: 0,
      note: 'single_player',
    }
  }

  // ── Caso speciale: 2 partecipanti (1° e ultimo, niente 2°/3°) ──
  if (N === 2 && firstPlacers.length === 1) {
    return {
      ...base,
      lastPlacers, lastPrize: cfg.entryFee,
      firstPlacers, eachFirst: net - cfg.entryFee,
      secondPlacers: [], eachSecond: 0,
      thirdPlacers: [],  eachThird: 0,
      note: 'two_players',
    }
  }

  // Premio ultimo classificato
  const multipleLast = lastPlacers.length > 1
  const lastPrize    = multipleLast ? 0 : cfg.entryFee
  // Bonus da aggiungere al 1° se più ultimi a pari
  const firstBonus   = multipleLast ? cfg.entryFee : 0

  // Base distribuibile tra 1°/2°/3°
  const pool = net - cfg.entryFee  // riserviamo quota ultimo, poi gestiamo

  // Caso: più primi a pari punti (tutti o quasi)
  if (firstPlacers.length > 1) {
    const totalForFirsts = pool + firstBonus
    return {
      ...base,
      lastPlacers, lastPrize,
      firstPlacers, eachFirst: Math.round(totalForFirsts / firstPlacers.length * 100) / 100,
      secondPlacers: [], eachSecond: 0,
      thirdPlacers: [],  eachThird: 0,
      note: 'ex_aequo_first',
    }
  }

  // Secondi classificati (escluso 1° e ultimo)
  const second = ranked.filter(p => p.rank !== 1 && p.rank !== maxRank)

  // Se non c'è un 2° distinto (es. solo 1° e ultimo), il 1° prende pool + bonus
  if (second.length === 0) {
    return {
      ...base,
      lastPlacers, lastPrize,
      firstPlacers, eachFirst: pool + firstBonus,
      secondPlacers: [], eachSecond: 0,
      thirdPlacers: [],  eachThird: 0,
      note: 'no_middle_ranks',
    }
  }

  const firstPrize = pool * cfg.firstPct + firstBonus
  const secondRank   = Math.min(...second.map(p => p.rank))
  const secondPlacers = ranked.filter(p => p.rank === secondRank)

  // Caso: più secondi a pari punti → accorpamento 2°+3°
  if (secondPlacers.length > 1) {
    const secondPool = pool * (cfg.secondPct + cfg.thirdPct)
    return {
      ...base,
      lastPlacers, lastPrize,
      firstPlacers, eachFirst: firstPrize,
      secondPlacers, eachSecond: Math.round(secondPool / secondPlacers.length * 100) / 100,
      thirdPlacers: [], eachThird: 0,
      note: 'ex_aequo_second',
    }
  }

  const secondPrize = pool * cfg.secondPct

  // Terzi classificati
  const thirdCandidates = ranked.filter(p => p.rank > secondRank && p.rank !== maxRank)
  const minThirdRank = thirdCandidates.length > 0 ? Math.min(...thirdCandidates.map(p => p.rank)) : null
  const thirdPlacers = minThirdRank ? ranked.filter(p => p.rank === minThirdRank) : []
  let thirdPrize = 0

  if (thirdPlacers.length > 0) {
    thirdPrize = Math.round(pool * cfg.thirdPct / thirdPlacers.length * 100) / 100
  } else {
    // Nessun 3° distinto → la quota 3° va al 1°
    // (es. 3 giocatori: 1°, 2°, ultimo — non c'è un 3° separato)
  }

  // Calcola il residuo non assegnato (quota 3° se non c'è un 3°) e aggiungilo al 1°
  const assignedFromPool = (pool * cfg.firstPct) + secondPrize + (thirdPrize * thirdPlacers.length)
  const residue = pool - assignedFromPool
  const adjustedFirst = pool * cfg.firstPct + firstBonus + (thirdPlacers.length === 0 ? pool * cfg.thirdPct : 0)

  return {
    ...base,
    lastPlacers, lastPrize,
    firstPlacers, eachFirst: Math.round(adjustedFirst * 100) / 100,
    secondPlacers, eachSecond: Math.round(secondPrize * 100) / 100,
    thirdPlacers, eachThird: thirdPrize,
    note: thirdPlacers.length === 0 ? 'no_third_place' : 'normal',
  }
}
