import { useState, useEffect, useCallback } from 'react'
import { Trophy, Coins, RefreshCw, ChevronDown, ChevronUp, Info, CheckCircle2, XCircle, Users, Star } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { getAllParticipants, getAllTeams, getAllMatches, getAllMatchPredictions, getAllAdvPredictions, getTournamentResults, getAllSettings } from '../lib/supabase'
import { calculateScore, rankParticipants, calculatePrizes, DEFAULT_PRIZE_CONFIG } from '../lib/scoring'
import { formatCurrency, getOrdinal, getMatchOutcome } from '../lib/utils'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function Classifica() {
  const [loading,   setLoading]   = useState(true)
  const [ranked,    setRanked]    = useState([])
  const [teams,     setTeams]     = useState([])
  const [prizes,    setPrizes]    = useState(null)
  const [expanded,  setExpanded]  = useState({})
  const [lastUpdate,setLastUpdate]= useState(null)
  const [hasResults,setHasResults]= useState(false)
  const [isFinished,setIsFinished]= useState(false)
  // Dati per trasparenza pronostici
  const [allMatchPreds, setAllMatchPreds] = useState([])
  const [allAdvPreds,   setAllAdvPreds]   = useState([])
  const [allMatches,    setAllMatches]    = useState([])
  const [tournamentRes, setTournamentRes] = useState(null)

  const load = useCallback(async () => {
    try {
      const [participants, allTeams, matches, matchPreds, advPreds, tourResult, settings] = await Promise.all([
        getAllParticipants(),
        getAllTeams(),
        getAllMatches(),
        getAllMatchPredictions(),
        getAllAdvPredictions(),
        getTournamentResults(),
        getAllSettings(),
      ])

      // Leggi config premi da settings o usa default
      const prizeConfig = {
        entryFee:  parseFloat(settings.entry_fee)   || DEFAULT_PRIZE_CONFIG.entryFee,
        adminRate: parseFloat(settings.admin_rate)   || DEFAULT_PRIZE_CONFIG.adminRate,
        firstPct:  parseFloat(settings.first_pct)    || DEFAULT_PRIZE_CONFIG.firstPct,
        secondPct: parseFloat(settings.second_pct)   || DEFAULT_PRIZE_CONFIG.secondPct,
        thirdPct:  parseFloat(settings.third_pct)    || DEFAULT_PRIZE_CONFIG.thirdPct,
      }

      setTeams(allTeams)
      setAllMatchPreds(matchPreds)
      setAllAdvPreds(advPreds)
      setAllMatches(matches)
      setTournamentRes(tourResult)

      // Controlla se ci sono partite con risultato (= punti assegnabili)
      const matchesWithResult = matches.filter(m => m.status === 'completed' || m.home_score !== null)
      setHasResults(matchesWithResult.length > 0)
      setIsFinished(settings.tournament_status === 'finished')

      const submitted = participants.filter(p => p.has_submitted)
      if (submitted.length === 0) {
        setRanked([])
        setLoading(false)
        return
      }

      // Mappa risultati partite
      const matchResults = Object.fromEntries(matches.map(m => [m.id, m]))

      // Calcola punteggi
      const scored = submitted.map(p => {
        const pMatchPreds = matchPreds.filter(mp => mp.participant_id === p.id)
        const pAdvPred    = advPreds.find(ap => ap.participant_id === p.id) ?? null
        const score = calculateScore({
          matchPredictions: pMatchPreds,
          advPrediction:    pAdvPred,
          matchResults,
          tournamentResults: tourResult,
        })
        return { ...p, score }
      })

      const r = rankParticipants(scored)
      setRanked(r)
      setPrizes(r.length > 0 ? calculatePrizes(r, prizeConfig) : null)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const teamById = (id) => teams.find(t => t.id === id)

  const rankClass = (rank, maxRank, n) => {
    if (n < 2) return 'rank-badge'
    if (rank === 1)       return 'rank-badge-1'
    if (rank === 2)       return 'rank-badge-2'
    if (rank === 3)       return 'rank-badge-3'
    if (rank === maxRank) return 'rank-badge-last'
    return 'rank-badge'
  }

  if (loading) return <LoadingSpinner text="Calcolo classifica…" />

  const maxRank = ranked.length > 0 ? Math.max(...ranked.map(p => p.rank)) : 0
  const totalParticipants = ranked.length

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Classifica</h1>
          <p className="text-tm-muted text-sm">
            {totalParticipants} partecipant{totalParticipants === 1 ? 'e' : 'i'}
            {lastUpdate && (
              <span className="ml-2">
                — agg. {lastUpdate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); load() }}
          className="p-2.5 rounded-xl border border-tm-border text-tm-muted hover:text-white hover:border-tm-border-bright transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── Montepremi (fisso in alto) ── */}
      {prizes && (
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-tm-accent" />
            <span className="font-bold">Montepremi</span>
          </div>
          <span className="text-tm-accent font-black text-lg">{formatCurrency(prizes.net)}</span>
        </div>
      )}

      {/* ── Legenda punteggi ── */}
      <div className="card-sm grid grid-cols-3 gap-2 text-center text-xs">
        <div className="py-1">
          <div className="font-bold text-white">1 pt</div>
          <div className="text-tm-muted">Esito girone</div>
        </div>
        <div className="py-1 border-x border-tm-border">
          <div className="font-bold text-white">1-2 pt</div>
          <div className="text-tm-muted">Semi/Final</div>
        </div>
        <div className="py-1">
          <div className="font-bold text-tm-accent">5+4 pt</div>
          <div className="text-tm-muted">Vincitore+Capo</div>
        </div>
      </div>

      {/* ── Lista partecipanti ── */}
      {ranked.length === 0 ? (
        <div className="card text-center py-12 text-tm-muted">
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          <p>Nessun partecipante ha ancora inviato la schedina</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((p, i) => {
            const isExp   = expanded[p.id]
            const prevRank = i > 0 ? ranked[i-1].rank : null
            const isFirst  = p.rank !== prevRank
            return (
              <div key={p.id}>
                {/* Separatore cambio posizione */}
                {isFirst && i > 0 && <div className="h-px bg-tm-border/50 my-1" />}
                <div className={`card transition-all duration-150 ${p.rank === maxRank ? 'border-red-900/40' : ''}`}>
                  <button
                    className="w-full flex items-center gap-3"
                    onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
                  >
                    {/* Rank badge */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${rankClass(p.rank, maxRank, totalParticipants)}`}>
                      {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank === maxRank && totalParticipants > 1 ? '🎖' : getOrdinal(p.rank)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-bold text-sm truncate">
                        {p.first_name} {p.last_name}
                      </div>
                      {/* Mini score bar */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1 flex-1 bg-tm-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-tm-accent/70 rounded-full"
                            style={{ width: `${Math.min(100, (p.score.total / 65) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-tm-muted font-mono">{p.score.total} pt</span>
                      </div>
                    </div>

                    {/* Points + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-black text-tm-accent">{p.score.total}</div>
                      </div>
                      {isExp ? <ChevronUp size={14} className="text-tm-muted" /> : <ChevronDown size={14} className="text-tm-muted" />}
                    </div>
                  </button>

                  {/* Dettaglio punteggi + pronostici */}
                  {isExp && (
                    <ParticipantDetail
                      participant={p}
                      matchPreds={allMatchPreds.filter(mp => mp.participant_id === p.id)}
                      advPred={allAdvPreds.find(ap => ap.participant_id === p.id) ?? null}
                      matches={allMatches}
                      teams={teams}
                      tournamentRes={tournamentRes}
                      teamById={teamById}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Premiati (solo se ci sono risultati) ── */}
      {prizes && isFinished && (
        <>
          <div className="accent-divider" />
          <div className="card space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={18} className="text-tm-accent" />
              <span className="font-bold">Premiati</span>
            </div>
            <div className="space-y-2">
              {prizes.firstPlacers.length > 0 && (
                <PrizeRow
                  emoji="🥇"
                  label={prizes.firstPlacers.length > 1
                    ? `1° ex aequo (${prizes.firstPlacers.length})`
                    : '1° Classificato'}
                  amount={prizes.eachFirst}
                  names={prizes.firstPlacers.map(p => `${p.first_name} ${p.last_name}`)}
                />
              )}
              {prizes.secondPlacers.length > 0 && prizes.eachSecond > 0 && (
                <PrizeRow
                  emoji="🥈"
                  label={prizes.secondPlacers.length > 1
                    ? `2° ex aequo (${prizes.secondPlacers.length})`
                    : '2° Classificato'}
                  amount={prizes.eachSecond}
                  names={prizes.secondPlacers.map(p => `${p.first_name} ${p.last_name}`)}
                />
              )}
              {prizes.thirdPlacers.length > 0 && prizes.eachThird > 0 && (
                <PrizeRow
                  emoji="🥉"
                  label="3° Classificato"
                  amount={prizes.eachThird}
                  names={prizes.thirdPlacers.map(p => `${p.first_name} ${p.last_name}`)}
                />
              )}
              {prizes.lastPlacers.length === 1 && prizes.lastPrize > 0 && (
                <PrizeRow
                  emoji="🎖"
                  label="Ultimo Classificato"
                  amount={prizes.lastPrize}
                  names={prizes.lastPlacers.map(p => `${p.first_name} ${p.last_name}`)}
                  muted
                />
              )}
            </div>

            {prizes.note !== 'normal' && prizes.note !== 'single_player' && prizes.note !== 'two_players' && (
              <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-xs text-yellow-400">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  {prizes.note === 'ex_aequo_first' && 'Ex aequo al 1° posto: l\'intero montepremi viene diviso equamente tra i primi classificati.'}
                  {prizes.note === 'ex_aequo_second' && 'Ex aequo al 2° posto: il montepremi di 2° e 3° viene accorpato e diviso equamente.'}
                  {prizes.note === 'no_third_place' && 'Non c\'è un 3° classificato distinto: la quota del 3° va al 1°.'}
                  {prizes.note === 'no_middle_ranks' && 'Solo 1° e ultimo classificato: il montepremi (escluso ultimo) va al 1°.'}
                  {prizes.note === 'third_less_than_last' && 'Il 3° posto prende meno della quota d\'iscrizione: il premio dell\'ultimo decade e va al 1°.'}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Dettaglio pronostici partecipante (trasparenza)
// ══════════════════════════════════════════════════════════
function ParticipantDetail({ participant, matchPreds, advPred, matches, teams, tournamentRes, teamById }) {
  const [activeGroup, setActiveGroup] = useState(null)
  const p = participant

  // Mappa pronostici partita: match_id → predicted_outcome
  const predMap = Object.fromEntries(matchPreds.map(mp => [mp.match_id, mp.predicted_outcome]))

  // Partite con risultato per gruppo
  const matchesWithResult = matches.filter(m => m.home_score !== null)
  const groupsWithResults = [...new Set(matchesWithResult.map(m => m.group_letter))].sort()

  // Tutte le partite per il girone attivo
  const groupMatches = activeGroup
    ? matches.filter(m => m.group_letter === activeGroup).sort((a, b) => a.match_number - b.match_number)
    : []

  const OUTCOME_COLORS = {
    '1': 'text-blue-400',
    'X': 'text-yellow-400',
    '2': 'text-red-400',
  }

  return (
    <div className="mt-3 pt-3 border-t border-tm-border animate-fade-in">
      {/* Riepilogo punti per categoria */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <ScoreDetail label="Gironi" value={p.score.groupStage} />
        <ScoreDetail label="Semifin." value={p.score.semifinalists} />
        <ScoreDetail label="Finaliste" value={p.score.finalists} />
        <ScoreDetail label="Vincitore" value={p.score.winner} max={5} accent />
        <ScoreDetail label="Capo." value={p.score.topScorer} max={4} accent />
        <div className="col-span-1 text-center py-2 rounded-lg bg-tm-accent/5 border border-tm-accent/20">
          <div className="text-xs text-tm-muted mb-0.5">Totale</div>
          <div className="font-black text-tm-accent">{p.score.total}</div>
        </div>
      </div>

      {/* ── Pronostici avanzamento ── */}
      {advPred && (
        <div className="space-y-3 mb-4">
          {/* Vincitore */}
          {advPred.winner_id && (() => {
            const t = teamById(advPred.winner_id)
            const isCorrect = tournamentRes?.winner_id === advPred.winner_id
            const hasResult = !!tournamentRes?.winner_id
            return (
              <div className="flex items-center gap-2">
                <Trophy size={13} className="text-tm-accent shrink-0" />
                <span className="text-xs text-tm-muted shrink-0">Vincitore:</span>
                <span className="text-sm font-semibold">{t?.flag} {t?.name}</span>
                {hasResult && (
                  isCorrect
                    ? <CheckCircle2 size={13} className="text-green-400 shrink-0 ml-auto" />
                    : <XCircle size={13} className="text-red-400/60 shrink-0 ml-auto" />
                )}
              </div>
            )
          })()}

          {/* Capocannoniere */}
          {advPred.top_scorer && (
            <div className="flex items-center gap-2">
              <Star size={13} className="text-tm-accent shrink-0" />
              <span className="text-xs text-tm-muted shrink-0">Capo.:</span>
              <span className="text-sm font-semibold">{advPred.top_scorer}</span>
              {tournamentRes?.top_scorer_names?.length > 0 && (
                p.score.topScorer > 0
                  ? <CheckCircle2 size={13} className="text-green-400 shrink-0 ml-auto" />
                  : <XCircle size={13} className="text-red-400/60 shrink-0 ml-auto" />
              )}
            </div>
          )}

          {/* Semifinaliste */}
          {advPred.semifinalist_ids?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={13} className="text-tm-muted shrink-0" />
                <span className="text-xs text-tm-muted">Semifinaliste</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {advPred.semifinalist_ids.map(id => {
                  const t = teamById(id)
                  const hasSemiResult = tournamentRes?.semifinalist_ids?.length > 0
                  const isCorrect = hasSemiResult && tournamentRes.semifinalist_ids.includes(id)
                  return (
                    <div key={id} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border
                      ${hasSemiResult
                        ? isCorrect ? 'border-green-700/40 bg-green-900/10 text-green-300' : 'border-red-900/30 bg-red-900/5 text-tm-muted'
                        : 'border-tm-border bg-tm-bg text-white'}`}>
                      <span>{t?.flag}</span>
                      <span className="truncate">{t?.name}</span>
                      {hasSemiResult && (
                        isCorrect
                          ? <CheckCircle2 size={11} className="text-green-400 shrink-0 ml-auto" />
                          : <XCircle size={11} className="text-red-400/50 shrink-0 ml-auto" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Finaliste */}
          {advPred.finalist_ids?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy size={13} className="text-yellow-400 shrink-0" />
                <span className="text-xs text-tm-muted">Finaliste</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {advPred.finalist_ids.map(id => {
                  const t = teamById(id)
                  const hasFinResult = tournamentRes?.finalist_ids?.length > 0
                  const isCorrect = hasFinResult && tournamentRes.finalist_ids.includes(id)
                  return (
                    <div key={id} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border
                      ${hasFinResult
                        ? isCorrect ? 'border-green-700/40 bg-green-900/10 text-green-300' : 'border-red-900/30 bg-red-900/5 text-tm-muted'
                        : 'border-tm-border bg-tm-bg text-white'}`}>
                      <span>{t?.flag}</span>
                      <span className="truncate">{t?.name}</span>
                      {hasFinResult && (
                        isCorrect
                          ? <CheckCircle2 size={11} className="text-green-400 shrink-0 ml-auto" />
                          : <XCircle size={11} className="text-red-400/50 shrink-0 ml-auto" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Pronostici gironi (tab per gruppo) ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-tm-muted font-semibold uppercase tracking-wide">Pronostici gironi</span>
          <span className="text-xs text-tm-muted">({p.score.groupStage}/{matchesWithResult.length} corretti)</span>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 mb-2 hide-scrollbar">
          {GROUPS.map(g => {
            // Conta pronostici corretti in questo girone
            const gMatches = matches.filter(m => m.group_letter === g)
            const gCorrect = gMatches.filter(m => {
              if (m.home_score === null) return false
              const actual = getMatchOutcome(m.home_score, m.away_score)
              return actual && predMap[m.id] === actual
            }).length
            const gTotal = gMatches.filter(m => m.home_score !== null).length
            const isActive = activeGroup === g

            return (
              <button
                key={g}
                onClick={() => setActiveGroup(isActive ? null : g)}
                className={`shrink-0 min-w-[2rem] h-7 px-1.5 rounded-md text-xs font-bold transition-colors relative
                  ${isActive
                    ? 'bg-tm-accent text-tm-bg'
                    : 'bg-tm-bg border border-tm-border text-tm-muted-light hover:border-tm-border-bright'}`}
              >
                {g}
                {gTotal > 0 && (
                  <span className={`block text-[9px] font-normal leading-none ${isActive ? 'text-tm-bg/70' : 'text-tm-muted'}`}>
                    {gCorrect}/{gTotal}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Match list for active group */}
        {activeGroup && (
          <div className="space-y-1 animate-fade-in">
            {groupMatches.map(m => {
              const pred = predMap[m.id]
              const ht = m.home_team
              const at = m.away_team
              const hasResult = m.home_score !== null
              const actual = hasResult ? getMatchOutcome(m.home_score, m.away_score) : null
              const isCorrect = actual && pred === actual

              return (
                <div key={m.id} className={`py-1.5 px-2 rounded-lg text-xs
                  ${hasResult
                    ? isCorrect ? 'bg-green-900/10 border border-green-800/30' : 'bg-red-900/5 border border-red-900/20'
                    : 'border border-transparent'}`}>
                  <div className="flex items-center gap-1.5">
                    {/* Home team */}
                    <span className="shrink-0">{ht?.flag}</span>
                    <span className="truncate flex-1 min-w-0">{ht?.name}</span>

                    {/* Prediction */}
                    <span className={`font-bold px-1.5 py-0.5 rounded shrink-0 ${OUTCOME_COLORS[pred] ?? 'text-tm-muted'}`}>
                      {pred ?? '—'}
                    </span>

                    {/* Correct/wrong icon */}
                    {hasResult && (
                      isCorrect
                        ? <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                        : <XCircle size={12} className="text-red-400/60 shrink-0" />
                    )}

                    {/* Away team */}
                    <span className="truncate flex-1 min-w-0 text-right">{at?.name}</span>
                    <span className="shrink-0">{at?.flag}</span>
                  </div>

                  {/* Risultato reale sotto */}
                  {hasResult && (
                    <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-tm-muted">
                      <span>Risultato: <span className="font-mono font-bold text-white">{m.home_score} - {m.away_score}</span></span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreDetail({ label, value, max, accent }) {
  return (
    <div className="text-center py-2 rounded-lg bg-tm-bg border border-tm-border">
      <div className={`font-bold ${accent && value > 0 ? 'text-tm-accent' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-tm-muted">{label}</div>
    </div>
  )
}

function PrizeRow({ emoji, label, amount, names, muted }) {
  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl border ${muted ? 'border-tm-border bg-tm-bg/50' : 'border-tm-border-bright bg-tm-card-hover'}`}>
      <span className="text-xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${muted ? 'text-tm-muted-light' : 'text-white'}`}>{label}</div>
        {names.map((n, i) => (
          <div key={i} className="text-xs text-tm-muted truncate">{n}</div>
        ))}
      </div>
      <div className={`font-black text-base shrink-0 ${muted ? 'text-tm-muted-light' : 'text-tm-accent'}`}>
        {formatCurrency(amount)}
      </div>
    </div>
  )
}
