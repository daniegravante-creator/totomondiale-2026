import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, UserPlus, Users, ClipboardList, Settings,
  Copy, Check, Trash2, RefreshCw, Save, ChevronDown, ChevronUp,
  Wifi, WifiOff, Trophy, Star, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useParticipant } from '../context/ParticipantContext'
import LoadingSpinner from '../components/LoadingSpinner'
import TeamSelector from '../components/TeamSelector'
import {
  getAllParticipants, getAllTeams, getAllMatches,
  createParticipant, deleteParticipant,
  updateMatchResult, getTournamentResults, updateTournamentResults,
  getSetting, getAllSettings, setSetting
} from '../lib/supabase'
import { generateParticipantCode, formatCurrency, formatDate } from '../lib/utils'
import { syncResults } from '../lib/apiFootball'

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
        <StatCard label="Montepremi" value={formatCurrency(participants.length * 25 * 0.85)} small />
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
      {activeTab === 'settings'     && <TabSettings settings={settings} onRefresh={loadAll} />}
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
function TabRisultati({ matches, teams, settings, onRefresh }) {
  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const [scores,     setScores]     = useState({})
  const [saving,     setSaving]     = useState({})
  const [syncing,    setSyncing]    = useState(false)
  const [activeGroup,setActiveGroup]= useState('A')

  const groupMatches = (g) =>
    matches.filter(m => m.group_letter === g && m.round === 'group').sort((a,b) => a.match_number - b.match_number)

  const handleScoreChange = (matchId, side, val) => {
    setScores(s => ({
      ...s,
      [matchId]: { ...(s[matchId] ?? {}), [side]: val }
    }))
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
      toast.success('Risultato salvato')
      onRefresh()
    } catch (e) { toast.error('Errore: ' + e.message) }
    setSaving(sv => ({ ...sv, [match.id]: false }))
  }

  const handleApiSync = async () => {
    const apiKey = settings.api_football_key
    if (!apiKey) { toast.error('API key non configurata nelle Impostazioni'); return }
    setSyncing(true)
    try {
      const updates = await syncResults(apiKey, matches)
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
          const homeVal = sc.home !== undefined ? sc.home : (m.home_score ?? '')
          const awayVal = sc.away !== undefined ? sc.away : (m.away_score ?? '')

          return (
            <div key={m.id} className="card-sm">
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
                    placeholder="0"
                  />
                  <span className="text-tm-muted text-sm font-bold">-</span>
                  <input
                    type="number"
                    min="0" max="99"
                    value={awayVal}
                    onChange={e => handleScoreChange(m.id, 'away', e.target.value)}
                    className="input-field w-12 text-center text-sm py-1.5 px-2"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span className="text-sm font-medium truncate text-right">{at?.name}</span>
                  <span className="text-base">{at?.flag}</span>
                </div>
              </div>
              <button
                onClick={() => saveScore(m)}
                disabled={saving[m.id]}
                className="mt-2 w-full btn-outline text-xs py-1.5 flex items-center justify-center gap-1"
              >
                <Save size={12} />
                {saving[m.id] ? 'Salvo…' : 'Salva risultato'}
              </button>
            </div>
          )
        })}
      </div>
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
function TabSettings({ settings, onRefresh }) {
  const [apiKey,   setApiKey]   = useState(settings.api_football_key ?? '')
  const [status,   setStatus]   = useState(settings.tournament_status ?? 'upcoming')
  const [saving,   setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await setSetting('api_football_key', apiKey.trim())
      await setSetting('tournament_status', status)
      toast.success('Impostazioni salvate')
      onRefresh()
    } catch (e) { toast.error('Errore: ' + e.message) }
    setSaving(false)
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

      <button
        onClick={save}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {saving ? 'Salvo…' : 'Salva impostazioni'}
      </button>

      <div className="card-sm border-yellow-700/30 bg-yellow-900/10">
        <p className="text-xs text-yellow-400 flex items-start gap-2">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          L'API key è salvata nel database Supabase. Chiunque abbia accesso diretto al DB può visualizzarla. Per uso privato, è accettabile.
        </p>
      </div>
    </div>
  )
}
