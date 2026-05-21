import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, UserPlus, Users, ClipboardList, Settings,
  Copy, Check, Trash2, RefreshCw, Save, ChevronDown, ChevronUp,
  Wifi, WifiOff, Trophy, Star, AlertTriangle, Download, Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useParticipant } from '../context/ParticipantContext'
import LoadingSpinner from '../components/LoadingSpinner'
import TeamSelector from '../components/TeamSelector'
import {
  getAllParticipants, getAllTeams, getAllMatches,
  createParticipant, deleteParticipant,
  updateMatchResult, getTournamentResults, updateTournamentResults,
  getSetting, getAllSettings, setSetting,
  getAllMatchPredictions, getAllAdvPredictions
} from '../lib/supabase'
import { generateParticipantCode, formatCurrency, formatDate } from '../lib/utils'
import { syncResults } from '../lib/apiFootball'
import { DEFAULT_PRIZE_CONFIG, calculatePrizes, rankParticipants, calculateScore } from '../lib/scoring'
import { getMatchOutcome } from '../lib/utils'

const TABS = [
  { id: 'codici',     label: 'Codici',      icon: <UserPlus size={15} /> },
  { id: 'partecipanti', label: 'Partecipanti', icon: <Users size={15} /> },
  { id: 'risultati',  label: 'Risultati',   icon: <ClipboardList size={15} /> },
  { id: 'torneo',     label: 'Torneo',      icon: <Trophy size={15} /> },
  { id: 'settings',   label: 'Impostazioni',icon: <Settings size={15} /> },
]

export default function Admin() {
  const { isAdmin, logoutAdmin } = useParticipant()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('codici')
  const [loading,   setLoading]   = useState(true)

  // Dati
  const [participants, setParticipants] = useState([])
  const [teams,        setTeams]        = useState([])
  const [matches,      setMatches]      = useState([])
  const [tourResult,   setTourResult]   = useState(null)
  const [settings,     setSettings]     = useState({})

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    loadAll()
  }, [isAdmin]) // eslint-disable-line

  const loadAll = async () => {
    setLoading(true)
    try {
      const [p, t, m, tr, s] = await Promise.all([
        getAllParticipants(),
        getAllTeams(),
        getAllMatches(),
        getTournamentResults(),
        getAllSettings(),
      ])
      setParticipants(p)
      setTeams(t)
      setMatches(m)
      setTourResult(tr)
      setSettings(s)
    } catch (e) { toast.error('Errore caricamento: ' + e.message) }
    setLoading(false)
  }

  if (loading) return <LoadingSpinner text="Caricamento pannello admin…" />

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-tm-accent" />
          <h1 className="text-xl font-black">Pannello Admin</h1>
        </div>
        <button
          onClick={() => { logoutAdmin(); navigate('/') }}
          className="btn-ghost text-xs text-red-400 hover:bg-red-900/20"
        >
          Esci
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Iscritti" value={participants.length} />
        <StatCard label="Schedine" value={participants.filter(p => p.has_submitted).length} />
        <StatCard label="Montepremi" value={formatCurrency(participants.length * (parseFloat(settings.entry_fee) || DEFAULT_PRIZE_CONFIG.entryFee) * (1 - (parseFloat(settings.admin_rate) || DEFAULT_PRIZE_CONFIG.adminRate)))} small />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors
              ${activeTab === t.id
                ? 'bg-tm-accent text-tm-bg'
                : 'bg-tm-card border border-tm-border text-tm-muted-light hover:border-tm-border-bright hover:text-white'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── SCHEDE ── */}
      {activeTab === 'codici'       && <TabCodici participants={participants} onRefresh={loadAll} />}
      {activeTab === 'partecipanti' && <TabPartecipanti participants={participants} onRefresh={loadAll} />}
      {activeTab === 'risultati'    && <TabRisultati matches={matches} teams={teams} settings={settings} onRefresh={loadAll} />}
      {activeTab === 'torneo'       && <TabTorneo tourResult={tourResult} teams={teams} onRefresh={loadAll} />}
      {activeTab === 'settings'     && <TabSettings settings={settings} participants={participants} matches={matches} teams={teams} onRefresh={loadAll} />}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────
function StatCard({ label, value, small }) {
  return (
    <div className="card-sm text-center py-3">
      <div className={`font-black ${small ? 'text-base' : 'text-2xl'} text-tm-accent`}>{value}</div>
      <div className="text-xs text-tm-muted mt-0.5">{label}</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TAB — CODICI
// ══════════════════════════════════════════════════════════
function TabCodici({ participants, onRefresh }) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [generated, setGenerated] = useState(null)
  const [copied,    setCopied]    = useState(false)
  const [saving,    setSaving]    = useState(false)

  const generate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Inserisci nome e cognome')
      return
    }
    const code = generateParticipantCode(firstName, lastName)
    setGenerated(code)
    setCopied(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveAndReset = async () => {
    if (!generated) return
    setSaving(true)
    try {
      await createParticipant(firstName.trim(), lastName.trim(), generated)
      toast.success(`Codice salvato per ${firstName} ${lastName}`)
      setFirstName('')
      setLastName('')
      setGenerated(null)
      onRefresh()
    } catch (e) {
      toast.error('Errore: ' + e.message)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-tm-muted">
        Genera un codice univoco per ogni partecipante. Il codice va inviato privatamente alla persona.
      </p>

      <div className="card space-y-3">
        <h3 className="font-bold text-sm">Genera nuovo codice</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-tm-muted mb-1 block">Nome</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Mario"
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-tm-muted mb-1 block">Cognome</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Rossi"
              className="input-field text-sm"
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
          </div>
        </div>
        <button onClick={generate} className="btn-outline w-full text-sm">
          Genera codice
        </button>

        {generated && (
          <div className="mt-2 space-y-2 animate-slide-up">
            <div className="flex items-center gap-2 bg-tm-bg border border-tm-accent/40 rounded-xl px-4 py-3">
              <span className="font-mono font-bold text-tm-accent flex-1 text-sm tracking-wider break-all">
                {generated}
              </span>
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-tm-card-hover transition-colors shrink-0">
                {copied
                  ? <Check size={16} className="text-tm-accent" />
                  : <Copy size={16} className="text-tm-muted-light" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={generate} className="btn-ghost text-xs border border-tm-border rounded-xl">
                Rigenera
              </button>
              <button onClick={saveAndReset} disabled={saving} className="btn-primary text-xs py-2">
                {saving ? 'Salvo…' : 'Salva partecipante'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista ultimi codici generati */}
      {participants.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Ultimi codici generati</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {[...participants].reverse().slice(0, 15).map(p => (
              <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-tm-border last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.first_name} {p.last_name}</div>
                  <div className="font-mono text-xs text-tm-muted tracking-wide">{p.code}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.has_submitted ? 'bg-tm-accent/10 text-tm-accent' : 'bg-tm-border/50 text-tm-muted'}`}>
                  {p.has_submitted ? '✓' : 'in attesa'}
                </span>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(p.code)
                    toast.success('Codice copiato!')
                  }}
                  className="p-1 rounded hover:bg-tm-card-hover"
                >
                  <Copy size={12} className="text-tm-muted" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TAB — PARTECIPANTI
// ══════════════════════════════════════════════════════════
function TabPartecipanti({ participants, onRefresh }) {
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()
  const filtered = query
    ? participants.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
      )
    : participants

  const submitted = filtered.filter(p => p.has_submitted)
  const pending   = filtered.filter(p => !p.has_submitted)

  const handleDelete = async (p) => {
    if (!window.confirm(`Eliminare ${p.first_name} ${p.last_name}? Verranno cancellati anche tutti i suoi pronostici.`)) return
    try {
      await deleteParticipant(p.id)
      toast.success('Partecipante eliminato')
      onRefresh()
    } catch (e) { toast.error('Errore: ' + e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="card-sm text-center py-3">
          <div className="text-xl font-black text-tm-accent">{participants.filter(p => p.has_submitted).length}</div>
          <div className="text-xs text-tm-muted">Schedine inviate</div>
        </div>
        <div className="card-sm text-center py-3">
          <div className="text-xl font-black text-yellow-400">{participants.filter(p => !p.has_submitted).length}</div>
          <div className="text-xs text-tm-muted">In attesa</div>
        </div>
      </div>

      {/* Barra di ricerca */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome, cognome o codice…"
          className="input-field text-sm pl-9 w-full"
          autoComplete="off"
        />
        <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tm-muted pointer-events-none" />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted hover:text-white transition-colors text-xs"
          >
            Annulla
          </button>
        )}
      </div>

      {query && filtered.length === 0 && (
        <div className="card text-center py-6 text-tm-muted text-sm">
          Nessun partecipante trovato per "{search}"
        </div>
      )}

      {pending.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3 text-yellow-400 flex items-center gap-2">
            <AlertTriangle size={14} /> In attesa di schedina ({pending.length})
          </h3>
          <div className="space-y-1">
            {pending.map(p => (
              <ParticipantRow key={p.id} p={p} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {(submitted.length > 0 || !query) && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3 text-tm-accent">Schedine inviate ({submitted.length})</h3>
          {submitted.length === 0
            ? <p className="text-sm text-tm-muted">Nessuna schedina inviata</p>
            : <div className="space-y-1">
                {submitted.map(p => <ParticipantRow key={p.id} p={p} onDelete={handleDelete} />)}
              </div>
          }
        </div>
      )}
    </div>
  )
}

function ParticipantRow({ p, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-tm-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{p.first_name} {p.last_name}</div>
        <div className="font-mono text-xs text-tm-muted">{p.code}</div>
      </div>
      <span className={`text-xs shrink-0 ${p.has_submitted ? 'text-tm-accent' : 'text-yellow-400'}`}>
        {p.has_submitted ? '✓ Inviata' : '⏳ Pending'}
      </span>
      <button onClick={() => onDelete(p)} className="p-1 rounded hover:bg-red-900/30 text-tm-muted hover:text-red-400 transition-colors shrink-0">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TAB — RISULTATI
// ══════════════════════════════════════════════════════════
function TabRisultati({ matches: initialMatches, teams, settings, onRefresh }) {
  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const [localMatches,setLocalMatches]= useState(initialMatches)
  const [scores,     setScores]     = useState({})
  const [saving,     setSaving]     = useState({})
  const [savingAll,  setSavingAll]  = useState(false)
  const [syncing,    setSyncing]    = useState(false)
  const [activeGroup,setActiveGroup]= useState('A')

  const groupMatches = (g) =>
    localMatches.filter(m => m.group_letter === g && m.round === 'group').sort((a,b) => a.match_number - b.match_number)

  const handleScoreChange = (matchId, side, val) => {
    setScores(s => ({
      ...s,
      [matchId]: { ...(s[matchId] ?? {}), [side]: val }
    }))
  }

  // Controlla se una partita ha modifiche non salvate
  const hasChanges = (match) => {
    const s = scores[match.id]
    if (!s) return false
    const newHome = s.home !== undefined ? parseInt(s.home) : null
    const newAway = s.away !== undefined ? parseInt(s.away) : null
    if (newHome === null && newAway === null) return false
    return newHome !== match.home_score || newAway !== match.away_score
  }

  const saveScore = async (match) => {
    const s = scores[match.id] ?? {}
    const home = s.home !== undefined ? parseInt(s.home) : match.home_score
    const away = s.away !== undefined ? parseInt(s.away) : match.away_score
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      toast.error('Risultato non valido')
      return
    }
    setSaving(sv => ({ ...sv, [match.id]: true }))
    try {
      await updateMatchResult(match.id, home, away)
      // Aggiorna la copia locale senza ricaricare tutto
      setLocalMatches(prev => prev.map(m =>
        m.id === match.id ? { ...m, home_score: home, away_score: away, status: 'finished' } : m
      ))
      setScores(s => { const copy = { ...s }; delete copy[match.id]; return copy })
      toast.success('Risultato salvato')
    } catch (e) { toast.error('Errore: ' + e.message) }
    setSaving(sv => ({ ...sv, [match.id]: false }))
  }

  // Salva tutti i risultati modificati del girone attivo
  const saveAllGroup = async () => {
    const gMatches = groupMatches(activeGroup)
    const toSave = gMatches.filter(m => hasChanges(m))
    if (toSave.length === 0) {
      toast.error('Nessuna modifica da salvare')
      return
    }
    setSavingAll(true)
    let saved = 0
    for (const match of toSave) {
      const s = scores[match.id] ?? {}
      const home = s.home !== undefined ? parseInt(s.home) : match.home_score
      const away = s.away !== undefined ? parseInt(s.away) : match.away_score
      if (isNaN(home) || isNaN(away) || home < 0 || away < 0) continue
      try {
        await updateMatchResult(match.id, home, away)
        setLocalMatches(prev => prev.map(m =>
          m.id === match.id ? { ...m, home_score: home, away_score: away, status: 'finished' } : m
        ))
        setScores(s => { const copy = { ...s }; delete copy[match.id]; return copy })
        saved++
      } catch (e) { toast.error(`Errore partita #${match.match_number}: ${e.message}`) }
    }
    if (saved > 0) toast.success(`${saved} risultat${saved === 1 ? 'o salvato' : 'i salvati'}`)
    setSavingAll(false)
  }

  const handleApiSync = async () => {
    const apiKey = settings.api_football_key
    if (!apiKey) { toast.error('API key non configurata nelle Impostazioni'); return }
    setSyncing(true)
    try {
      const updates = await syncResults(apiKey, localMatches)
      if (updates.length === 0) {
        toast.success('Nessun aggiornamento disponibile')
      } else {
        for (const u of updates) {
          await updateMatchResult(u.matchId, u.homeScore, u.awayScore)
        }
        await setSetting('last_api_sync', new Date().toISOString())
        toast.success(`Sincronizzati ${updates.length} risultati`)
        onRefresh()
      }
    } catch (e) { toast.error('Errore API: ' + e.message) }
    setSyncing(false)
  }

  // Conta modifiche pendenti nel girone attivo
  const pendingChanges = groupMatches(activeGroup).filter(m => hasChanges(m)).length

  return (
    <div className="space-y-4">
      {/* API Sync */}
      <div className="card flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {settings.api_football_key
            ? <Wifi size={16} className="text-tm-accent shrink-0" />
            : <WifiOff size={16} className="text-red-400 shrink-0" />}
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {settings.api_football_key ? 'API-Football attiva' : 'API-Football non configurata'}
            </div>
            {settings.last_api_sync && (
              <div className="text-xs text-tm-muted truncate">
                Ultimo sync: {formatDate(settings.last_api_sync)}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleApiSync}
          disabled={syncing || !settings.api_football_key}
          className="btn-outline text-xs shrink-0 py-2 px-3 flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sync…' : 'Sincronizza'}
        </button>
      </div>

      {/* Group tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-colors
              ${activeGroup === g ? 'bg-tm-accent text-tm-bg' : 'bg-tm-card border border-tm-border text-tm-muted-light hover:text-white'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Matches */}
      <div className="space-y-2">
        {groupMatches(activeGroup).map(m => {
          const ht = m.home_team ?? teams.find(t => t.id === m.home_team_id)
          const at = m.away_team ?? teams.find(t => t.id === m.away_team_id)
          const sc = scores[m.id] ?? {}
          const homeVal = sc.home !== undefined ? sc.home : (m.home_score ?? 0)
          const awayVal = sc.away !== undefined ? sc.away : (m.away_score ?? 0)
          const changed = hasChanges(m)

          return (
            <div key={m.id} className={`card-sm transition-all ${changed ? 'border-tm-accent/40' : ''}`}>
              <div className="flex items-center gap-2 text-xs text-tm-muted mb-2">
                <span>Giornata {m.matchday}</span>
                <span>·</span>
                <span>{formatDate(m.scheduled_at)}</span>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                  m.status === 'finished' ? 'bg-tm-accent/10 text-tm-accent' :
                  m.status === 'in_progress' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-tm-border/50 text-tm-muted'
                }`}>
                  {m.status === 'finished' ? 'Finita' : m.status === 'in_progress' ? 'In corso' : 'Programmata'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-base">{ht?.flag}</span>
                  <span className="text-sm font-medium truncate">{ht?.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min="0" max="99"
                    value={homeVal}
                    onChange={e => handleScoreChange(m.id, 'home', e.target.value)}
                    className="input-field w-12 text-center text-sm py-1.5 px-2"
                  />
                  <span className="text-tm-muted text-sm font-bold">-</span>
                  <input
                    type="number"
                    min="0" max="99"
                    value={awayVal}
                    onChange={e => handleScoreChange(m.id, 'away', e.target.value)}
                    className="input-field w-12 text-center text-sm py-1.5 px-2"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span className="text-sm font-medium truncate text-right">{at?.name}</span>
                  <span className="text-base">{at?.flag}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pulsante salva tutto il girone */}
      <button
        onClick={saveAllGroup}
        disabled={savingAll || pendingChanges === 0}
        className="btn-primary w-full flex items-center justify-center gap-2 sticky bottom-4"
      >
        <Save size={16} />
        {savingAll
          ? 'Salvo…'
          : pendingChanges > 0
            ? `Salva ${pendingChanges} risultat${pendingChanges === 1 ? 'o' : 'i'} — Girone ${activeGroup}`
            : `Nessuna modifica — Girone ${activeGroup}`
        }
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TAB — TORNEO (avanzamento e capocannoniere)
// ══════════════════════════════════════════════════════════
function TabTorneo({ tourResult, teams, onRefresh }) {
  const [semis,    setSemis]    = useState(tourResult?.semifinalist_ids ?? [])
  const [finals,   setFinals]   = useState(tourResult?.finalist_ids ?? [])
  const [winnerId, setWinnerId] = useState(tourResult?.winner_id ?? null)
  const [topScorers,setTopScorers]=useState((tourResult?.top_scorer_names ?? []).join(', '))
  const [saving,   setSaving]   = useState(false)
  const [selector, setSelector] = useState(null)

  const teamById = (id) => teams.find(t => t.id === id)

  const toggleId = (arr, setArr, id) =>
    setArr(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const save = async () => {
    setSaving(true)
    try {
      await updateTournamentResults({
        semifinalist_ids: semis,
        finalist_ids:     finals,
        winner_id:        winnerId || null,
        top_scorer_names: topScorers.split(',').map(s => s.trim()).filter(Boolean),
      })
      toast.success('Risultati torneo aggiornati')
      onRefresh()
    } catch (e) { toast.error('Errore: ' + e.message) }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {/* Semifinaliste */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Semifinaliste ({semis.length}/4)</h3>
          <button onClick={() => setSelector('semis')} className="btn-outline text-xs py-1.5 px-3">
            Modifica
          </button>
        </div>
        {semis.length === 0
          ? <p className="text-xs text-tm-muted">Nessuna ancora</p>
          : <div className="grid grid-cols-2 gap-1.5">
              {semis.map(id => {
                const t = teamById(id)
                return (
                  <div key={id} className="flex items-center gap-2 card-sm py-2">
                    <span>{t?.flag}</span>
                    <span className="text-sm">{t?.name}</span>
                  </div>
                )
              })}
            </div>
        }
      </div>

      {/* Finaliste */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Finaliste ({finals.length}/2)</h3>
          <button onClick={() => setSelector('finals')} className="btn-outline text-xs py-1.5 px-3">
            Modifica
          </button>
        </div>
        {finals.length === 0
          ? <p className="text-xs text-tm-muted">Nessuna ancora</p>
          : <div className="grid grid-cols-2 gap-1.5">
              {finals.map(id => {
                const t = teamById(id)
                return (
                  <div key={id} className="flex items-center gap-2 card-sm py-2 border-yellow-600/20">
                    <span>{t?.flag}</span>
                    <span className="text-sm">{t?.name}</span>
                  </div>
                )
              })}
            </div>
        }
      </div>

      {/* Vincitore */}
      <div className="card">
        <h3 className="font-bold text-sm mb-3">Vincitore del Mondiale</h3>
        {finals.length === 0
          ? <p className="text-xs text-tm-muted">Prima inserisci le finaliste</p>
          : <div className="grid grid-cols-2 gap-2">
              {finals.map(id => {
                const t    = teamById(id)
                const isWin = winnerId === id
                return (
                  <button
                    key={id}
                    onClick={() => setWinnerId(isWin ? null : id)}
                    className={`flex items-center gap-2 card-sm py-3 border-2 transition-all ${isWin ? 'border-tm-accent bg-tm-accent/5' : 'border-tm-border hover:border-tm-border-bright'}`}
                  >
                    <span className="text-2xl">{t?.flag}</span>
                    <span className="text-sm font-bold">{t?.name}</span>
                    {isWin && <Trophy size={14} className="text-tm-accent ml-auto" />}
                  </button>
                )
              })}
            </div>
        }
      </div>

      {/* Capocannoniere */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-tm-accent" />
          <h3 className="font-bold text-sm">Capocannoniere ufficiale</h3>
        </div>
        <p className="text-xs text-tm-muted mb-3">
          Separa con virgola se più giocatori a pari gol: es. <em>Mbappé, Kane</em>
        </p>
        <input
          type="text"
          value={topScorers}
          onChange={e => setTopScorers(e.target.value)}
          placeholder="es. Kylian Mbappé"
          className="input-field text-sm"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {saving ? 'Salvo…' : 'Salva risultati torneo'}
      </button>

      {/* Selettori */}
      {selector === 'semis' && (
        <TeamSelector
          teams={teams}
          selected={semis}
          max={4}
          onToggle={(id) => toggleId(semis, setSemis, id)}
          onClose={() => setSelector(null)}
          title="Imposta 4 Semifinaliste"
        />
      )}
      {selector === 'finals' && (
        <TeamSelector
          teams={teams}
          selected={finals}
          max={2}
          onToggle={(id) => toggleId(finals, setFinals, id)}
          onClose={() => setSelector(null)}
          title="Imposta 2 Finaliste"
          filterIds={semis.length > 0 ? semis : undefined}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TAB — IMPOSTAZIONI
// ══════════════════════════════════════════════════════════
function TabSettings({ settings, participants, matches, teams, onRefresh }) {
  const [apiKey,   setApiKey]   = useState(settings.api_football_key ?? '')
  const [status,   setStatus]   = useState(settings.tournament_status ?? 'upcoming')
  const [entryFee, setEntryFee] = useState(settings.entry_fee ?? String(DEFAULT_PRIZE_CONFIG.entryFee))
  const [adminRate,setAdminRate]= useState(settings.admin_rate != null ? String(Math.round(parseFloat(settings.admin_rate) * 100)) : String(DEFAULT_PRIZE_CONFIG.adminRate * 100))
  const [firstPct, setFirstPct] = useState(settings.first_pct != null ? String(Math.round(parseFloat(settings.first_pct) * 100)) : String(DEFAULT_PRIZE_CONFIG.firstPct * 100))
  const [secondPct,setSecondPct]= useState(settings.second_pct != null ? String(Math.round(parseFloat(settings.second_pct) * 100)) : String(DEFAULT_PRIZE_CONFIG.secondPct * 100))
  const [thirdPct, setThirdPct] = useState(settings.third_pct != null ? String(Math.round(parseFloat(settings.third_pct) * 100)) : String(DEFAULT_PRIZE_CONFIG.thirdPct * 100))
  const [saving,   setSaving]   = useState(false)
  const [exporting,setExporting]= useState(false)

  const save = async () => {
    // Validazione percentuali
    const f = parseFloat(firstPct) || 0
    const s = parseFloat(secondPct) || 0
    const t = parseFloat(thirdPct) || 0
    if (Math.abs(f + s + t - 100) > 0.1) {
      toast.error(`Le percentuali premi devono sommare 100% (ora: ${f + s + t}%)`)
      return
    }

    setSaving(true)
    try {
      await setSetting('api_football_key', apiKey.trim())
      await setSetting('tournament_status', status)
      await setSetting('entry_fee', entryFee)
      await setSetting('admin_rate', String(parseFloat(adminRate) / 100))
      await setSetting('first_pct', String(parseFloat(firstPct) / 100))
      await setSetting('second_pct', String(parseFloat(secondPct) / 100))
      await setSetting('third_pct', String(parseFloat(thirdPct) / 100))
      toast.success('Impostazioni salvate')
      onRefresh()
    } catch (e) { toast.error('Errore: ' + e.message) }
    setSaving(false)
  }

  // ── Backup/Export (formato matrice) ──
  const handleExport = async () => {
    setExporting(true)
    try {
      const [matchPreds, advPreds, tourResult] = await Promise.all([
        getAllMatchPredictions(),
        getAllAdvPredictions(),
        getTournamentResults(),
      ])

      const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]))
      const teamFlagMap = Object.fromEntries(teams.map(t => [t.id, t.flag ?? '']))
      const submitted = participants.filter(p => p.has_submitted)
      const sortedMatches = [...matches].sort((a,b) => a.match_number - b.match_number)

      // Mappa pronostici: { participantId: { matchId: '1'/'X'/'2' } }
      const predsByPart = {}
      for (const mp of matchPreds) {
        if (!predsByPart[mp.participant_id]) predsByPart[mp.participant_id] = {}
        predsByPart[mp.participant_id][mp.match_id] = mp.predicted_outcome
      }

      let csv = '﻿' // BOM per Excel

      // ══════════════════════════════════════
      // SEZIONE 1: MATRICE PRONOSTICI GIRONI
      // ══════════════════════════════════════
      csv += 'MATRICE PRONOSTICI GIRONI\n'
      // Header: N; Girone; Casa; Ospite; Risultato; [Nome partecipanti...]
      csv += 'N;Girone;Casa;Ospite;Risultato'
      for (const p of submitted) {
        csv += `;${p.first_name} ${p.last_name}`
      }
      csv += '\n'

      // Una riga per partita
      for (const m of sortedMatches) {
        const ht = m.home_team?.name ?? teamMap[m.home_team_id] ?? '?'
        const at = m.away_team?.name ?? teamMap[m.away_team_id] ?? '?'
        const score = m.home_score !== null ? `${m.home_score}-${m.away_score}` : ''
        csv += `${m.match_number};${m.group_letter};${ht};${at};${score}`
        for (const p of submitted) {
          const pred = predsByPart[p.id]?.[m.id] ?? ''
          csv += `;${pred}`
        }
        csv += '\n'
      }

      // ══════════════════════════════════════
      // PRONOSTICI AVANZAMENTO (stessa matrice, righe sotto le partite)
      // ══════════════════════════════════════
      csv += '\n' // riga vuota di separazione

      // Mappa avanzamento per partecipante
      const advByPart = Object.fromEntries(advPreds.map(a => [a.participant_id, a]))

      // Riga Semifinaliste
      csv += ';;SEMIFINALISTE;;'
      for (const p of submitted) {
        const adv = advByPart[p.id]
        csv += `;${(adv?.semifinalist_ids ?? []).map(id => teamMap[id] ?? '?').join(', ')}`
      }
      csv += '\n'

      // Riga Finaliste
      csv += ';;FINALISTE;;'
      for (const p of submitted) {
        const adv = advByPart[p.id]
        csv += `;${(adv?.finalist_ids ?? []).map(id => teamMap[id] ?? '?').join(', ')}`
      }
      csv += '\n'

      // Riga Vincitore
      csv += ';;VINCITORE;;'
      for (const p of submitted) {
        const adv = advByPart[p.id]
        csv += `;${adv?.winner_id ? (teamMap[adv.winner_id] ?? '?') : ''}`
      }
      csv += '\n'

      // Riga Capocannoniere
      csv += ';;CAPOCANNONIERE;;'
      for (const p of submitted) {
        const adv = advByPart[p.id]
        csv += `;${adv?.top_scorer ?? ''}`
      }
      csv += '\n'

      // ══════════════════════════════════════
      // SEZIONE 3: RISULTATI PARTITE
      // ══════════════════════════════════════
      csv += '\n\nRISULTATI PARTITE\n'
      csv += 'N;Girone;Casa;Ospite;Gol Casa;Gol Ospite;Esito (1X2);Stato\n'
      for (const m of sortedMatches) {
        const ht = m.home_team?.name ?? teamMap[m.home_team_id] ?? '?'
        const at = m.away_team?.name ?? teamMap[m.away_team_id] ?? '?'
        const outcome = m.home_score !== null ? getMatchOutcome(m.home_score, m.away_score) : ''
        csv += `${m.match_number};${m.group_letter};${ht};${at};${m.home_score ?? ''};${m.away_score ?? ''};${outcome};${m.status}\n`
      }

      // ══════════════════════════════════════
      // SEZIONE 4: RISULTATI TORNEO
      // ══════════════════════════════════════
      csv += '\n\nRISULTATI TORNEO\n'
      if (tourResult) {
        csv += `Semifinaliste;${(tourResult.semifinalist_ids ?? []).map(id => teamMap[id] ?? '?').join(', ')}\n`
        csv += `Finaliste;${(tourResult.finalist_ids ?? []).map(id => teamMap[id] ?? '?').join(', ')}\n`
        csv += `Vincitore;${teamMap[tourResult.winner_id] ?? ''}\n`
        csv += `Capocannoniere;${(tourResult.top_scorer_names ?? []).join(', ') || ''}\n`
      } else {
        csv += 'Nessun risultato torneo inserito\n'
      }

      // ══════════════════════════════════════
      // SEZIONE 5: DATI PARTECIPANTI
      // ══════════════════════════════════════
      csv += '\n\nDATI PARTECIPANTI\n'
      csv += 'Nome;Cognome;Codice;Schedina Inviata;Data Iscrizione\n'
      for (const p of participants) {
        csv += `${p.first_name};${p.last_name};${p.code};${p.has_submitted ? 'Si' : 'No'};${p.created_at?.slice(0,10) ?? ''}\n`
      }

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `TotoMondiale_Backup_${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Backup scaricato!')
    } catch (e) { toast.error('Errore export: ' + e.message) }
    setExporting(false)
  }

  return (
    <div className="space-y-4">
      {/* API Key */}
      <div className="card space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wifi size={14} className="text-tm-accent" />
            <h3 className="font-bold text-sm">API-Football Key</h3>
          </div>
          <p className="text-xs text-tm-muted">
            Ottieni la tua chiave gratuita su{' '}
            <span className="text-tm-accent">api-football.com</span>
            {' '}(100 chiamate/giorno sul piano free)
          </p>
        </div>
        <input
          type="text"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="La tua API key"
          className="input-field font-mono text-sm"
        />
      </div>

      {/* Stato torneo */}
      <div className="card space-y-3">
        <h3 className="font-bold text-sm">Stato del torneo</h3>
        <div className="space-y-2">
          {[
            { value: 'upcoming',    label: 'In arrivo',   desc: 'Iscrizioni aperte, pronostici accettati' },
            { value: 'in_progress', label: 'In corso',    desc: 'Torneo iniziato, pronostici bloccati' },
            { value: 'finished',    label: 'Concluso',    desc: 'Torneo finito, classifica definitiva' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors
                ${status === opt.value ? 'border-tm-accent bg-tm-accent/5' : 'border-tm-border hover:border-tm-border-bright'}`}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className="text-xs text-tm-muted">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Montepremi e percentuali */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={14} className="text-tm-accent" />
          <h3 className="font-bold text-sm">Montepremi e percentuali</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-tm-muted mb-1 block">Quota partecipazione</label>
            <div className="relative">
              <input type="number" value={entryFee} onChange={e => setEntryFee(e.target.value)} className="input-field text-sm pr-8" min="1" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-tm-muted mb-1 block">Quota gestori</label>
            <div className="relative">
              <input type="number" value={adminRate} onChange={e => setAdminRate(e.target.value)} className="input-field text-sm pr-8" min="0" max="100" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-tm-border" />
        <p className="text-xs text-tm-muted">Distribuzione premi (devono sommare 100%)</p>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-tm-muted mb-1 block">1° posto</label>
            <div className="relative">
              <input type="number" value={firstPct} onChange={e => setFirstPct(e.target.value)} className="input-field text-sm pr-8" min="0" max="100" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-tm-muted mb-1 block">2° posto</label>
            <div className="relative">
              <input type="number" value={secondPct} onChange={e => setSecondPct(e.target.value)} className="input-field text-sm pr-8" min="0" max="100" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-tm-muted mb-1 block">3° posto</label>
            <div className="relative">
              <input type="number" value={thirdPct} onChange={e => setThirdPct(e.target.value)} className="input-field text-sm pr-8" min="0" max="100" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted text-sm">%</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-tm-muted">
          L'ultimo classificato riceve la quota d'iscrizione ({entryFee}€). Se più ultimi a pari, il premio decade e va al 1°.
        </p>

        {/* ── Simulazione premi in tempo reale ── */}
        <PrizeSimulation
          entryFee={entryFee}
          adminRate={adminRate}
          firstPct={firstPct}
          secondPct={secondPct}
          thirdPct={thirdPct}
          participantCount={participants.filter(p => p.has_submitted).length}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {saving ? 'Salvo…' : 'Salva impostazioni'}
      </button>

      {/* Backup */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Database size={14} className="text-tm-accent" />
          <h3 className="font-bold text-sm">Backup dati</h3>
        </div>
        <p className="text-xs text-tm-muted">
          Esporta tutti i dati (partecipanti, pronostici, risultati) in un file CSV apribile con Excel.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
        >
          <Download size={15} />
          {exporting ? 'Esportazione…' : 'Scarica backup (CSV/Excel)'}
        </button>
      </div>

      <div className="card-sm border-yellow-700/30 bg-yellow-900/10">
        <p className="text-xs text-yellow-400 flex items-start gap-2">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          L'API key è salvata nel database Supabase. Chiunque abbia accesso diretto al DB può visualizzarla. Per uso privato, è accettabile.
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Simulazione premi in tempo reale
// ══════════════════════════════════════════════════════════
function PrizeSimulation({ entryFee, adminRate, firstPct, secondPct, thirdPct, participantCount }) {
  const fee  = parseFloat(entryFee) || 0
  const rate = (parseFloat(adminRate) || 0) / 100
  const f    = (parseFloat(firstPct)  || 0) / 100
  const s    = (parseFloat(secondPct) || 0) / 100
  const t    = (parseFloat(thirdPct)  || 0) / 100
  const N    = participantCount

  if (N === 0 || fee === 0) {
    return (
      <div className="rounded-xl border border-tm-border bg-tm-bg/50 p-3 text-center text-xs text-tm-muted">
        Nessun partecipante con schedina inviata
      </div>
    )
  }

  const total    = N * fee
  const adminFee = Math.round(total * rate * 100) / 100
  const net      = total - adminFee
  const pool     = net - fee  // riserva quota ultimo
  const first    = Math.round(pool * f * 100) / 100
  const second   = Math.round(pool * s * 100) / 100
  const third    = Math.round(pool * t * 100) / 100
  const last     = fee

  const pctSum = Math.round((f + s + t) * 100)
  const isValid = Math.abs(pctSum - 100) < 1

  return (
    <div className="rounded-xl border border-tm-accent/20 bg-tm-accent/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-tm-accent uppercase tracking-wide">Simulazione premi</span>
        <span className="text-xs text-tm-muted">{N} partecipant{N === 1 ? 'e' : 'i'}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-tm-muted">Totale raccolto</span>
        <span className="text-right font-mono text-white">{formatCurrency(total)}</span>

        <span className="text-tm-muted">Quota gestori ({(rate * 100).toFixed(0)}%)</span>
        <span className="text-right font-mono text-red-400">-{formatCurrency(adminFee)}</span>

        <span className="text-tm-muted font-semibold">Montepremi netto</span>
        <span className="text-right font-mono font-bold text-tm-accent">{formatCurrency(net)}</span>
      </div>

      <div className="h-px bg-tm-border/50" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-tm-muted flex items-center gap-1">🥇 1° posto ({(f*100).toFixed(0)}%)</span>
        <span className="text-right font-mono text-white">{formatCurrency(first)}</span>

        <span className="text-tm-muted flex items-center gap-1">🥈 2° posto ({(s*100).toFixed(0)}%)</span>
        <span className="text-right font-mono text-white">{formatCurrency(second)}</span>

        <span className="text-tm-muted flex items-center gap-1">🥉 3° posto ({(t*100).toFixed(0)}%)</span>
        <span className="text-right font-mono text-white">{formatCurrency(third)}</span>

        <span className="text-tm-muted flex items-center gap-1">🎖 Ultimo</span>
        <span className="text-right font-mono text-tm-muted-light">{formatCurrency(last)}</span>
      </div>

      {!isValid && (
        <p className="text-xs text-red-400 mt-1">Le percentuali devono sommare 100% (ora: {pctSum}%)</p>
      )}
    </div>
  )
}
