import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getParticipantByCode } from '../lib/supabase'
import { checkAdminPassword } from '../lib/utils'
import { useParticipant } from '../context/ParticipantContext'
import Countdown, { KICKOFF_UTC } from '../components/Countdown'

export default function Login() {
  const { login, loginAdmin } = useParticipant()
  const navigate = useNavigate()

  const [code,      setCode]      = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const handleParticipantLogin = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      const participant = await getParticipantByCode(code)
      if (!participant) {
        toast.error('Codice non valido. Riprova.')
        setLoading(false)
        return
      }
      login(participant)
      toast.success(`Benvenuto, ${participant.first_name}!`)
      if (participant.has_submitted) {
        navigate('/mia-schedina')
      } else {
        navigate('/schedina')
      }
    } catch (err) {
      console.error(err)
      toast.error('Errore di connessione. Riprova.')
    }
    setLoading(false)
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    if (!adminPass.trim()) return
    setLoading(true)
    const ok = await checkAdminPassword(adminPass)
    if (ok) {
      loginAdmin()
      toast.success('Accesso admin effettuato')
      navigate('/admin')
    } else {
      toast.error('Password admin errata')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <img
          src="/coppa.png"
          alt="Coppa del Mondo FIFA"
          className="mx-auto h-36 sm:h-44 w-auto mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.35)] animate-fade-in"
        />
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
          Toto<span className="text-tm-accent">Mondiale</span>
        </h1>
        <p className="text-6xl sm:text-7xl font-black text-tm-border-bright -mt-1 tracking-tighter select-none">
          2026
        </p>
      </div>

      {/* Countdown al Mondiale */}
      <div className="mb-8 w-full max-w-sm">
        <Countdown
          target={KICKOFF_UTC}
          label="Inizio Mondiali"
          expiredText="Il Mondiale 2026 è iniziato!"
        />
      </div>

      <p className="text-tm-muted-light mb-4 text-sm">
        Inserisci il tuo codice personale per accedere
      </p>

      {/* Card principale */}
      <div className="w-full max-w-sm">
        {!showAdmin ? (
          <form onSubmit={handleParticipantLogin} className="card space-y-4">
            <div>
              <label className="block text-xs font-semibold text-tm-muted-light uppercase tracking-wider mb-2">
                Codice partecipante
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="es. MARIO.ROSSI.X7K2"
                className="input-field font-mono tracking-wider text-center uppercase"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-tm-bg/50 border-t-tm-bg" />
              ) : (
                <>Entra <ArrowRight size={16} /></>
              )}
            </button>

            <div className="accent-divider" />

            <p className="text-center text-xs text-tm-muted">
              Vuoi solo vedere la classifica?{' '}
              <a
                href="/classifica"
                className="text-tm-accent hover:underline"
                onClick={e => { e.preventDefault(); navigate('/classifica') }}
              >
                Classifica pubblica
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="card space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-tm-accent" />
              <span className="font-bold text-sm">Accesso Admin</span>
            </div>
            <input
              type="password"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              placeholder="Password admin"
              className="input-field"
              autoFocus
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !adminPass.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-tm-bg/50 border-t-tm-bg" />
                : <><Lock size={15} /> Accedi come Admin</>
              }
            </button>
            <button
              type="button"
              onClick={() => setShowAdmin(false)}
              className="btn-ghost w-full text-sm"
            >
              ← Torna all'accesso normale
            </button>
          </form>
        )}

        {/* Admin toggle */}
        {!showAdmin && (
          <button
            onClick={() => setShowAdmin(true)}
            className="w-full mt-3 text-center text-xs text-tm-muted hover:text-tm-muted-light transition-colors py-2"
          >
            Accesso amministratore
          </button>
        )}
      </div>
    </div>
  )
}
