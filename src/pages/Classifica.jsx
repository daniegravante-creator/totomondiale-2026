import { useState, useEffect, useCallback } from 'react'
import { Trophy, Coins, RefreshCw, ChevronDown, ChevronUp, Info } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { getAllParticipants, getAllTeams, getAllMatches, getAllMatchPredictions, getAllAdvPredictions, getTournamentResults } from '../lib/supabase'
import { calculateScore, rankParticipants, calculatePrizes } from '../lib/scoring'
import { formatCurrency, getOrdinal } from '../lib/utils'

export default function Classifica() {
  const [loading,   setLoading]   = useState(true)
  const [ranked,    setRanked]    = useState([])
  const [teams,     setTeams]     = useState([])
  const [prizes,    setPrizes]    = useState(null)
  const [expanded,  setExpanded]  = useState({})
  const [lastUpdate,setLastUpdate]= useState(null)
  const [hasResults,setHasResults]= useState(false)

  const load = useCallback(async () => {
    try {
      const [participants, allTeams, matches, matchPreds, advPreds, tourResult] = await Promise.all([
        getAllParticipants(),
        getAllTeams(),
        getAllMatches(),
        getAllMatchPredictions(),
        getAllAdvPredictions(),
        getTournamentResults(),
      ])

      setTeams(allTeams)

      // Controlla se ci sono partite con risultato (= punti assegnabili)
      const matchesWithResult = matches.filter(m => m.status === 'completed' || m.home_score !== null)
      setHasResults(matchesWithResult.length > 0)

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
      setPrizes(r.length > 0 ? calculatePrizes(r) : null)
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

                  {/* Dettaglio punteggi */}
                  {isExp && (
                    <div className="mt-3 pt-3 border-t border-tm-border grid grid-cols-3 gap-2 animate-fade-in">
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
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Premiati (solo se ci sono risultati) ── */}
      {prizes && hasResults && (
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

            {prizes.note !== 'normal' && (
              <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-xs text-yellow-400">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  {prizes.note === 'ex_aequo_first' && 'Ex aequo al 1° posto: l\'intero montepremi viene diviso equamente tra i primi classificati.'}
                  {prizes.note === 'ex_aequo_second' && 'Ex aequo al 2° posto: il montepremi di 2° e 3° viene accorpato e diviso equamente.'}
                </span>
              </div>
            )}
          </div>
        </>
      )}
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
