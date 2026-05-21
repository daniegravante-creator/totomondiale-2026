import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Users, Trophy, Star, Send, CheckCircle2, Clock, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useParticipant } from '../context/ParticipantContext'
import TeamSelector from '../components/TeamSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import Countdown, { DEADLINE_UTC, KICKOFF_UTC, isBeforeDeadline } from '../components/Countdown'
import {
  getAllTeams, getGroupMatches, submitMatchPredictions, submitAdvPrediction,
  markParticipantSubmitted, getParticipantMatchPredictions, getParticipantAdvPrediction,
  setSetting
} from '../lib/supabase'
import { suggestPlayers } from '../data/players'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function Schedina() {
  const { participant, updateParticipant } = useParticipant()
  const navigate = useNavigate()

  const [teams,       setTeams]       = useState([])
  const [matches,     setMatches]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [isEditing,   setIsEditing]   = useState(false)

  // Stato pronostici
  const [predictions,   setPredictions]   = useState({})   // { matchId: '1'|'X'|'2' }
  const [semis,         setSemis]         = useState([])   // 4 team IDs
  const [finalists,     setFinalists]     = useState([])   // 2 team IDs
  const [winner,        setWinner]        = useState(null) // 1 team ID
  const [topScorer,     setTopScorer]     = useState('')
  const [scorerSugg,   setScorerSugg]    = useState([])
  const [showScorerDrop,setShowScorerDrop]= useState(false)

  // UI state
  const [expandedGroups, setExpandedGroups] = useState({ A: true })
  const [selectorMode,   setSelectorMode]   = useState(null) // 'semis'|'finalists'|'winner'

  useEffect(() => {
    if (!participant) { navigate('/'); return }

    // Se la deadline è passata, blocca
    if (!isBeforeDeadline()) {
      // Auto-imposta stato "in_progress"
      setSetting('tournament_status', 'in_progress').catch(() => {})
      if (participant.has_submitted) {
        navigate('/mia-schedina')
      } else {
        toast.error('Il tempo per compilare la schedina è scaduto!')
        navigate('/')
      }
      return
    }

    // Se ha già inviato, carica i dati esistenti per modifica
    if (participant.has_submitted) {
      setIsEditing(true)
    }

    load()
  }, []) // eslint-disable-line

  const load = async () => {
    try {
      const [t, m] = await Promise.all([getAllTeams(), getGroupMatches()])
      setTeams(t)
      setMatches(m)

      // Se ha già inviato, carica pronostici esistenti
      if (participant.has_submitted) {
        const [existingPreds, existingAdv] = await Promise.all([
          getParticipantMatchPredictions(participant.id),
          getParticipantAdvPrediction(participant.id),
        ])
        if (existingPreds.length > 0) {
          setPredictions(Object.fromEntries(existingPreds.map(p => [p.match_id, p.predicted_outcome])))
        }
        if (existingAdv) {
          setSemis(existingAdv.semifinalist_ids ?? [])
          setFinalists(existingAdv.finalist_ids ?? [])
          setWinner(existingAdv.winner_id ?? null)
          setTopScorer(existingAdv.top_scorer ?? '')
        }
      }
    } catch {
      toast.error('Errore nel caricamento dei dati')
    }
    setLoading(false)
  }

  // ── Helpers ──────────────────────────────────────────────

  const teamById = useCallback((id) => teams.find(t => t.id === id), [teams])

  const matchesByGroup = useCallback((group) =>
    matches
      .filter(m => m.group_letter === group)
      .sort((a, b) => a.match_number - b.match_number),
  [matches])

  const groupProgress = useCallback((group) => {
    const ms = matchesByGroup(group)
    const done = ms.filter(m => predictions[m.id]).length
    return { done, total: ms.length }
  }, [matchesByGroup, predictions])

  const totalProgress = useCallback(() => {
    const done = matches.filter(m => predictions[m.id]).length
    return { done, total: matches.length }
  }, [matches, predictions])

  // ── Handlers ──────────────────────────────────────────────

  const setPrediction = (matchId, outcome) =>
    setPredictions(p => ({ ...p, [matchId]: outcome }))

  const toggleGroup = (g) =>
    setExpandedGroups(e => ({ ...e, [g]: !e[g] }))

  // Semifinalisti → cascade
  const toggleSemi = (id) => {
    setSemis(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setFinalists(f => f.filter(x => next.includes(x)))
      setWinner(w => next.includes(w) ? w : null)
      return next
    })
  }

  // Finaliste → cascade
  const toggleFinalist = (id) => {
    setFinalists(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (!next.includes(winner)) setWinner(null)
      return next
    })
  }

  // Vincitore (una sola, toggle)
  const selectWinner = (id) =>
    setWinner(prev => prev === id ? null : id)

  // Autocomplete capocannoniere
  const handleScorerInput = (val) => {
    setTopScorer(val)
    setScorerSugg(suggestPlayers(val))
    setShowScorerDrop(true)
  }

  // ── Validazione ───────────────────────────────────────────

  const validate = () => {
    const p = totalProgress()
    if (p.done < p.total) return `Mancano ${p.total - p.done} pronostici di girone`
    if (semis.length < 4)      return `Seleziona 4 semifinaliste (${semis.length}/4)`
    if (finalists.length < 2)  return `Seleziona 2 finaliste (${finalists.length}/2)`
    if (!winner)               return 'Seleziona il vincitore del Mondiale'
    if (!topScorer.trim())     return 'Inserisci il capocannoniere'
    return null
  }

  // ── Submit ────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Controlla deadline al momento dell'invio
    if (!isBeforeDeadline()) {
      toast.error('Il tempo per compilare la schedina è scaduto!')
      navigate('/mia-schedina')
      return
    }

    const err = validate()
    if (err) { toast.error(err); return }

    setSubmitting(true)
    try {
      await submitMatchPredictions(participant.id, predictions)
      await submitAdvPrediction(participant.id, semis, finalists, winner, topScorer.trim())
      if (!participant.has_submitted) {
        await markParticipantSubmitted(participant.id)
        updateParticipant({ has_submitted: true })
      }
      toast.success(isEditing ? 'Schedina aggiornata! Buona fortuna!' : 'Schedina inviata! Buona fortuna!')
      navigate('/mia-schedina')
    } catch (e) {
      console.error(e)
      toast.error('Errore durante l\'invio. Riprova.')
    }
    setSubmitting(false)
  }

  // ── Render ────────────────────────────────────────────────

  if (loading) return <LoadingSpinner text="Caricamento partite…" />

  const prog = totalProgress()
  const progPercent = prog.total > 0 ? Math.round(prog.done / prog.total * 100) : 0
  const validationError = validate()

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* ── Intestazione ── */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black">
            {isEditing ? 'Modifica schedina' : 'La tua schedina'}
          </h1>
          {isEditing && <Edit3 size={18} className="text-yellow-400" />}
        </div>
        <p className="text-tm-muted text-sm mt-1">
          {participant?.first_name} {participant?.last_name} — tutti i campi sono obbligatori
        </p>
      </div>

      {/* ── Countdown deadline ── */}
      <div className="card bg-tm-card/80">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Clock size={14} className="text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
            Tempo rimanente per compilare
          </span>
        </div>
        <Countdown
          target={DEADLINE_UTC}
          compact
          expiredText="Tempo scaduto!"
        />
      </div>

      {/* ── Countdown Mondiale ── */}
      <div className="card-sm text-center">
        <Countdown
          target={KICKOFF_UTC}
          compact
          label="Inizio Mondiali"
          expiredText="Il Mondiale 2026 è iniziato!"
        />
      </div>

      {/* ── Progress bar ── */}
      <div className="card space-y-2">
        <div className="flex justify-between text-xs text-tm-muted-light">
          <span>Partite compilate</span>
          <span className="font-mono text-tm-accent">{prog.done}/{prog.total}</span>
        </div>
        <div className="h-1.5 bg-tm-border rounded-full overflow-hidden">
          <div
            className="h-full bg-tm-accent rounded-full transition-all duration-300"
            style={{ width: `${progPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`flex items-center gap-1.5 ${semis.length === 4 ? 'text-tm-accent' : 'text-tm-muted'}`}>
            <CheckCircle2 size={12} className={semis.length === 4 ? 'text-tm-accent' : 'text-tm-border-bright'} />
            Semifinaliste {semis.length}/4
          </div>
          <div className={`flex items-center gap-1.5 ${finalists.length === 2 ? 'text-tm-accent' : 'text-tm-muted'}`}>
            <CheckCircle2 size={12} className={finalists.length === 2 ? 'text-tm-accent' : 'text-tm-border-bright'} />
            Finaliste {finalists.length}/2
          </div>
          <div className={`flex items-center gap-1.5 ${winner ? 'text-tm-accent' : 'text-tm-muted'}`}>
            <CheckCircle2 size={12} className={winner ? 'text-tm-accent' : 'text-tm-border-bright'} />
            Vincitore {winner ? '✓' : '—'}
          </div>
          <div className={`flex items-center gap-1.5 ${topScorer.trim() ? 'text-tm-accent' : 'text-tm-muted'}`}>
            <CheckCircle2 size={12} className={topScorer.trim() ? 'text-tm-accent' : 'text-tm-border-bright'} />
            Capocannoniere {topScorer.trim() ? '✓' : '—'}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SEZIONE 1 — Fase a gironi
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-1 rounded-full bg-tm-accent" />
          <h2 className="section-title">Fase a gironi</h2>
          <span className="badge-muted ml-auto">{prog.done}/{prog.total} partite</span>
        </div>
        <p className="text-xs text-tm-muted mb-4">
          1 punto per ogni esito corretto (1 = vittoria casa · X = pareggio · 2 = vittoria ospite)
        </p>

        <div className="space-y-2">
          {GROUPS.map(group => {
            const gm   = matchesByGroup(group)
            const gp   = groupProgress(group)
            const open = expandedGroups[group]
            return (
              <div key={group} className="card-sm overflow-hidden">
                {/* Group header */}
                <button
                  className="w-full flex items-center justify-between py-1"
                  onClick={() => toggleGroup(group)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-tm-accent/10 border border-tm-accent/30 text-tm-accent font-black text-sm">
                      {group}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">
                        Girone {group}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {gm.slice(0, 4).map(m => (
                          <span key={m.id} className="text-xs">{m.home_team?.flag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${gp.done === gp.total ? 'text-tm-accent' : 'text-tm-muted'}`}>
                      {gp.done}/{gp.total}
                    </span>
                    {open ? <ChevronUp size={16} className="text-tm-muted" /> : <ChevronDown size={16} className="text-tm-muted" />}
                  </div>
                </button>

                {/* Matches */}
                {open && (
                  <div className="mt-3 space-y-2 border-t border-tm-border pt-3">
                    {[1,2,3].map(md => {
                      const dayMatches = gm.filter(m => m.matchday === md)
                      if (!dayMatches.length) return null
                      return (
                        <div key={md}>
                          <p className="text-xs text-tm-muted mb-2 font-medium">Giornata {md}</p>
                          {dayMatches.map(m => (
                            <MatchRow
                              key={m.id}
                              match={m}
                              value={predictions[m.id]}
                              onChange={(v) => setPrediction(m.id, v)}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div className="accent-divider" />

      {/* ═══════════════════════════════════════════════════
          SEZIONE 2 — Semifinaliste
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 rounded-full bg-tm-accent" />
          <h2 className="section-title">Semifinaliste</h2>
          <span className={`badge-muted ml-auto ${semis.length === 4 ? 'border-tm-accent/30 text-tm-accent bg-tm-accent/10' : ''}`}>
            {semis.length}/4
          </span>
        </div>
        <p className="text-xs text-tm-muted mb-4">
          1 punto per ogni squadra correttamente indovinata tra le 4 semifinaliste
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {semis.length === 0 && (
            <div className="col-span-2 card-sm text-center py-6 text-tm-muted text-sm">
              Nessuna squadra selezionata
            </div>
          )}
          {semis.map(id => {
            const t = teamById(id)
            return (
              <div key={id} className="flex items-center gap-2 card-sm border-tm-accent/30">
                <span className="text-xl">{t?.flag}</span>
                <span className="text-sm font-medium flex-1">{t?.name}</span>
                <button onClick={() => toggleSemi(id)} className="text-tm-muted hover:text-red-400 transition-colors">
                  ×
                </button>
              </div>
            )
          })}
        </div>

        {semis.length < 4 && (
          <button
            onClick={() => setSelectorMode('semis')}
            className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
          >
            <Users size={16} /> Seleziona semifinaliste ({semis.length}/4)
          </button>
        )}
      </section>

      <div className="accent-divider" />

      {/* ═══════════════════════════════════════════════════
          SEZIONE 3 — Finaliste
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 rounded-full bg-tm-accent" />
          <h2 className="section-title">Finaliste</h2>
          <span className={`badge-muted ml-auto ${finalists.length === 2 ? 'border-tm-accent/30 text-tm-accent bg-tm-accent/10' : ''}`}>
            {finalists.length}/2
          </span>
        </div>
        <p className="text-xs text-tm-muted mb-4">
          2 punti per ogni finalista indovinata — scegli tra le tue 4 semifinaliste
        </p>

        {semis.length < 4 ? (
          <div className="card-sm text-center py-4 text-tm-muted text-sm">
            Prima seleziona le 4 semifinaliste
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {finalists.length === 0 && (
                <div className="col-span-2 card-sm text-center py-6 text-tm-muted text-sm">
                  Nessuna finalista selezionata
                </div>
              )}
              {finalists.map(id => {
                const t = teamById(id)
                return (
                  <div key={id} className="flex items-center gap-2 card-sm border-yellow-600/30">
                    <span className="text-xl">{t?.flag}</span>
                    <span className="text-sm font-medium flex-1">{t?.name}</span>
                    <button onClick={() => toggleFinalist(id)} className="text-tm-muted hover:text-red-400 transition-colors">
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
            {finalists.length < 2 && (
              <button
                onClick={() => setSelectorMode('finalists')}
                className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
              >
                <Trophy size={16} /> Seleziona finaliste ({finalists.length}/2)
              </button>
            )}
          </>
        )}
      </section>

      <div className="accent-divider" />

      {/* ═══════════════════════════════════════════════════
          SEZIONE 4 — Vincitore
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 rounded-full bg-tm-accent" />
          <h2 className="section-title">Vincitore del Mondiale</h2>
          <span className="badge-accent ml-auto">5 punti</span>
        </div>
        <p className="text-xs text-tm-muted mb-4">
          Scegli tra le 2 finaliste selezionate
        </p>

        {finalists.length < 2 ? (
          <div className="card-sm text-center py-4 text-tm-muted text-sm">
            Prima seleziona le 2 finaliste
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {finalists.map(id => {
              const t     = teamById(id)
              const isWin = winner === id
              return (
                <button
                  key={id}
                  onClick={() => selectWinner(id)}
                  className={`card-sm flex flex-col items-center gap-2 py-5 border-2 transition-all duration-150 active:scale-95
                    ${isWin
                      ? 'border-tm-accent bg-tm-accent/10'
                      : 'border-tm-border hover:border-tm-border-bright'}`}
                >
                  <span className="text-4xl">{t?.flag}</span>
                  <span className="font-bold text-sm text-center">{t?.name}</span>
                  {isWin && <span className="text-xs text-tm-accent font-semibold">✓ Selezionato</span>}
                </button>
              )
            })}
          </div>
        )}
      </section>

      <div className="accent-divider" />

      {/* ═══════════════════════════════════════════════════
          SEZIONE 5 — Capocannoniere
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 rounded-full bg-tm-accent" />
          <h2 className="section-title">Capocannoniere</h2>
          <span className="badge-accent ml-auto">4 punti</span>
        </div>
        <p className="text-xs text-tm-muted mb-4">
          Se più giocatori chiudono a pari gol (criteri FIFA), tutti i nomi sono validi
        </p>

        <div className="relative">
          <Star size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-muted pointer-events-none" />
          <input
            type="text"
            value={topScorer}
            onChange={e => handleScorerInput(e.target.value)}
            onFocus={() => setShowScorerDrop(true)}
            onBlur={() => setTimeout(() => setShowScorerDrop(false), 150)}
            placeholder="Nome e cognome del giocatore…"
            className="input-field pl-9"
            autoComplete="off"
          />
          {showScorerDrop && scorerSugg.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-tm-card border border-tm-border rounded-xl shadow-xl overflow-hidden">
              {scorerSugg.map(name => (
                <button
                  key={name}
                  onMouseDown={() => { setTopScorer(name); setShowScorerDrop(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-tm-card-hover transition-colors border-b border-tm-border last:border-0"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="pt-2">
        {validationError && (
          <p className="text-sm text-red-400 mb-3 text-center bg-red-900/20 rounded-xl py-2 px-4">
            {validationError}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting || !!validationError}
          className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
        >
          {submitting
            ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-tm-bg/50 border-t-tm-bg" /> Invio in corso…</>
            : <><Send size={18} /> {isEditing ? 'Aggiorna la mia schedina' : 'Invia la mia schedina'}</>
          }
        </button>
        <p className="text-center text-xs text-tm-muted mt-3">
          {isEditing
            ? 'Puoi modificare la schedina fino al 11/06/2026 ore 20:00'
            : 'Dopo l\'invio puoi ancora modificare la schedina fino alla deadline'}
        </p>
      </div>

      {/* ── Selettori modali ── */}
      {selectorMode === 'semis' && (
        <TeamSelector
          teams={teams}
          selected={semis}
          max={4}
          onToggle={toggleSemi}
          onClose={() => setSelectorMode(null)}
          title="Seleziona 4 Semifinaliste"
        />
      )}
      {selectorMode === 'finalists' && (
        <TeamSelector
          teams={teams}
          selected={finalists}
          max={2}
          onToggle={toggleFinalist}
          onClose={() => setSelectorMode(null)}
          title="Seleziona 2 Finaliste"
          filterIds={semis}
        />
      )}
    </div>
  )
}

// ── MatchRow component ─────────────────────────────────────
function MatchRow({ match, value, onChange }) {
  const { home_team: ht, away_team: at } = match
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-base">{ht?.flag}</span>
        <span className="text-xs font-medium truncate">{ht?.name}</span>
      </div>
      <div className="flex gap-1 shrink-0">
        {['1','X','2'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`outcome-btn w-9 text-xs
              ${value === opt
                ? opt === '1' ? 'outcome-btn-1'
                  : opt === 'X' ? 'outcome-btn-X'
                  : 'outcome-btn-2'
                : 'outcome-btn-inactive'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
        <span className="text-xs font-medium truncate text-right">{at?.name}</span>
        <span className="text-base">{at?.flag}</span>
      </div>
    </div>
  )
}
