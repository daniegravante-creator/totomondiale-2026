import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart2, LogOut, Menu, X, Shield } from 'lucide-react'
import { useParticipant } from '../context/ParticipantContext'

export default function Layout({ children }) {
  const { participant, isAdmin, logout } = useParticipant()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/classifica', label: 'Classifica', icon: <BarChart2 size={16} /> },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: <Shield size={16} /> }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-dvh flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-tm-border bg-tm-bg/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/coppa.png" alt="Coppa" className="h-8 w-auto group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(0,255,102,0.3)]" />
            <span className="font-black text-base tracking-tight">
              Toto<span className="text-tm-accent">Mondiale</span>
              <span className="text-tm-muted-light text-sm font-medium ml-1">2026</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive(l.to)
                    ? 'bg-tm-accent/10 text-tm-accent border border-tm-accent/30'
                    : 'text-tm-muted-light hover:text-white hover:bg-tm-card'}`}
              >
                {l.icon}{l.label}
              </Link>
            ))}
            {participant && (
              <>
                <Link
                  to={participant.has_submitted ? '/mia-schedina' : '/schedina'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive('/schedina') || isActive('/mia-schedina')
                      ? 'bg-tm-accent/10 text-tm-accent border border-tm-accent/30'
                      : 'text-tm-muted-light hover:text-white hover:bg-tm-card'}`}
                >
                  La mia schedina
                </Link>
                <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5 text-sm py-1.5">
                  <LogOut size={15} />{participant.first_name}
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-lg text-tm-muted-light hover:text-white hover:bg-tm-card transition-colors"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 pt-14 bg-tm-bg/95 backdrop-blur-sm animate-fade-in">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${isActive(l.to)
                    ? 'bg-tm-accent/10 text-tm-accent border border-tm-accent/30'
                    : 'text-tm-muted-light hover:text-white hover:bg-tm-card'}`}
              >
                {l.icon}{l.label}
              </Link>
            ))}
            {participant && (
              <>
                <Link
                  to={participant.has_submitted ? '/mia-schedina' : '/schedina'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-tm-muted-light hover:text-white hover:bg-tm-card transition-colors"
                >
                  La mia schedina
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} /> Esci ({participant.first_name})
                </button>
              </>
            )}
            {!participant && (
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-tm-accent hover:bg-tm-accent/10 transition-colors"
              >
                Accedi con il tuo codice
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-tm-border py-4 text-center text-xs text-tm-muted">
        TotoMondiale 2026 — Solo per uso privato
      </footer>
    </div>
  )
}
