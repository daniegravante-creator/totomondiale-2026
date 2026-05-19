import { useState } from 'react'
import { X, Search, Check } from 'lucide-react'

// Modale per selezionare N squadre da un insieme
// Props:
//   teams     - array { id, name, flag }
//   selected  - array di ID selezionati
//   max       - numero massimo selezionabili
//   onToggle  - (id) => void
//   onClose   - () => void
//   title     - string
//   filterIds - se fornito, mostra solo queste squadre

export default function TeamSelector({ teams, selected, max, onToggle, onClose, title, filterIds }) {
  const [query, setQuery] = useState('')
  const pool    = filterIds ? teams.filter(t => filterIds.includes(t.id)) : teams
  const filtered = query.trim()
    ? pool.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : pool

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-tm-card border border-tm-border rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[85dvh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tm-border">
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-tm-muted mt-0.5">
              {selected.length}/{max} selezionate
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-tm-card-hover transition-colors">
            <X size={18} className="text-tm-muted-light" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-tm-border">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-tm-muted" />
            <input
              type="text"
              placeholder="Cerca squadra…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Team list */}
        <div className="overflow-y-auto flex-1 p-2">
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map(team => {
              const isSelected = selected.includes(team.id)
              const isDisabled = !isSelected && selected.length >= max
              return (
                <button
                  key={team.id}
                  onClick={() => !isDisabled && onToggle(team.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-150
                    ${isSelected
                      ? 'bg-tm-accent/10 border-tm-accent text-white'
                      : isDisabled
                        ? 'border-tm-border text-tm-muted opacity-40 cursor-not-allowed'
                        : 'border-tm-border text-tm-muted-light hover:border-tm-border-bright hover:text-white hover:bg-tm-card-hover'}`}
                >
                  <span className="text-xl leading-none">{team.flag}</span>
                  <span className="text-sm font-medium flex-1 truncate">{team.name}</span>
                  {isSelected && (
                    <Check size={14} className="text-tm-accent shrink-0" />
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 py-8 text-center text-tm-muted text-sm">
                Nessuna squadra trovata
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-tm-border">
          <button
            onClick={onClose}
            className={`w-full btn-primary ${selected.length < max ? 'opacity-60' : ''}`}
          >
            Conferma ({selected.length}/{max})
          </button>
        </div>
      </div>
    </div>
  )
}
