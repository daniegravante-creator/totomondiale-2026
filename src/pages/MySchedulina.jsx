import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Trophy, Star, Users, Edit3 } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Countdown, { DEADLINE_UTC, KICKOFF_UTC, isBeforeDeadline } from '../components/Countdown'
import { getAllTeams, getGroupMatches, getParticipantMatchPredictions, getParticipantAdvPrediction } from '../lib/supabase'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function MySchedulina() {
  const { participant } = useParticipant()
  const navigate = useNavigate()

  const [loading,     setLoading]     = useState(true)
  const [teams,       setTeams]       = useState([])
  const [matches,     setMatches]     = useState([])
  const [matchPreds,  setMatchPreds]  = useState({})
  const [advPred,     setAdvPred]     = useState(null)
  const [activeGroup, setActiveGroup] = useState('A')

  useEffect(() => {
    if (!participant) { navigate('/'); return }
    if (!participant.has_submitted) { navigate('/schedina'); return }
    load()
  }, []) // eslint-disable-line

  const load = async () => {
    try {
      const [t, m, mp, adv] = await Promise.all([
        getAllTeams(),
        getGroupMatches(),
        getParticipantMatchPredictions(participant.id),
        getParticipantAdvPrediction(participant.id),
      ])
      setTeams(t)
      setMatches(m)
      setMatchPreds(Object.fromEntries(mp.map(p => [p.match_id, p.predicted_outcome])))
      setAdvPred(adv)
    } catch { /* errore silenzioso */ }
    setLoading(false)
  }

  const teamById = useCallback((id) => teams.find(t => t.id === id), [teams])
  const matchesByGroup = (g) =>
    matches.filter(m => m.group_letter === g).sort((a, b) => a.match_number - b.match_number)

  if (loading) return <LoadingSpinner text="Caricamento schedina…" />

  const canEdit = isBeforeDeadline()
  const OUTCOME_COLORS = { '1': 'text-blue-400 border-blue-600/40 bg-blue-900/20', '0': 'text-yellow-400 border-yellow-600/40 bg-yellow-900/20', '2': 'text-red-400 border-red-600/40 bg-red-900/20' }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-tm-accent/10 border border-tm-accent/30 flex items-center justify-center">
          <CheckCircle2 size={20} className="text-tm-accent" />
        </div>
        <div>
          <h1 className="text-xl font-black">La tua schedina</h1>
          <p className="text-tm-muted text-sm">{participant?.first_name} {participant?.last_name}</p>
        </div>
        <span className="badge-accent ml-auto">Inviata</span>
      </div>

      {/* Countdown + Modifica */}
      <div className="card-sm space-y-3">
        <Countdown
          target={KICKOFF_UTC}
          compact
          label="Inizio Mondiali"
          expiredText="Il Mondiale 2026 è iniziato!"
        />
        {canEdit && (
          <>
            <div className="accent-divider my-0" />
            <Countdown
              target={DEADLINE_UTC}
              compact
              label="Tempo rimasto per modificare"
            />
            <button
              onClick={() => navigate('/schedina')}
              className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
            >
              <Edit3 size={15} /> Modifica la schedina
            </button>
          </>
        )}
      </div>

      {/* ── Avanzamento torneo ── */}
      {advPred && (
        <div className="card space-y-4">
          {/* Semifinaliste */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-tm-accent" />
              <span className="text-xs font-semibold text-tm-muted-light uppercase tracking-wide">Semifinaliste</span>
              <span className="badge-muted ml-auto">1 pt cad.</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {advPred.semifinalist_ids.map(id => {
                const t = teamById(id)
                return (
                  <div key={id} className="flex items-center gap-2 card-sm py-2">
                    <span className="text-lg">{t?.flag}</span>
                    <span className="text-sm font-medium">{t?.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="accent-divider my-0" />

          {/* Finaliste */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold text-tm-muted-light uppercase tracking-wide">Finaliste</span>
              <span className="badge-muted ml-auto">2 pt cad.</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {advPred.finalist_ids.map(id => {
                const t = teamById(id)
                return (
                  <div key={id} className="flex items-center gap-2 card-sm py-2 border-yellow-600/20">
                    <span className="text-lg">{t?.flag}</span>
                    <span className="text-sm font-medium">{t?.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="accent-divider my-0" />

          {/* Vincitore */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-tm-accent" />
              <span className="text-xs font-semibold text-tm-muted-light uppercase tracking-wide">Vincitore</span>
              <span className="badge-accent ml-auto">5 pt</span>
            </div>
            {advPred.winner_id && (() => {
              const t = teamById(advPred.winner_id)
              return (
                <div className="flex items-center gap-3 card-sm border-tm-accent/30 bg-tm-accent/5 py-3">
                  <span className="text-3xl">{t?.flag}</span>
                  <span className="font-bold">{t?.name}</span>
                </div>
              )
            })()}
          </div>

          <div className="accent-divider my-0" />

          {/* Capocannoniere */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-tm-accent" />
              <span className="text-xs font-semibold text-tm-muted-light uppercase tracking-wide">Capocannoniere</span>
              <span className="badge-accent ml-auto">4 pt</span>
            </div>
            <div className="card-sm py-3">
              <span className="font-semibold">{advPred.top_scorer}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Fase a gironi ── */}
      <div>
        <h2 className="section-title mb-3">Pronostici di girone</h2>
        {/* Group tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-3 hide-scrollbar">
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`shrink-0 w-9 h-9 rounded-lg text-sm font-bold transition-colors
                ${activeGroup === g
                  ? 'bg-tm-accent text-tm-bg'
                  : 'bg-tm-card border border-tm-border text-tm-muted-light hover:border-tm-border-bright'}`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="card space-y-3">
          {matchesByGroup(activeGroup).map(m => {
            const pred = matchPreds[m.id]
            const ht = m.home_team
            const at = m.away_team
            return (
              <div key={m.id} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span>{ht?.flag}</span>
                  <span className="text-sm truncate">{ht?.name}</span>
                </div>
                <span className={`text-xs font-bold border rounded-lg px-2.5 py-1.5 shrink-0 ${OUTCOME_COLORS[pred] ?? 'text-tm-muted border-tm-border'}`}>
                  {pred ?? '—'}
                </span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span className="text-sm truncate text-right">{at?.name}</span>
                  <span>{at?.flag}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
