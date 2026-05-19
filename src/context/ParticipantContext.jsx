import { createContext, useContext, useState, useEffect } from 'react'

const ParticipantContext = createContext(null)

export function ParticipantProvider({ children }) {
  const [participant, setParticipant] = useState(null)
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [loaded,      setLoaded]      = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tm2026_participant')
      if (saved) setParticipant(JSON.parse(saved))
      if (localStorage.getItem('tm2026_admin') === 'true') setIsAdmin(true)
    } catch {}
    setLoaded(true)
  }, [])

  const login = (data) => {
    setParticipant(data)
    localStorage.setItem('tm2026_participant', JSON.stringify(data))
  }

  // Aggiorna il partecipante in sessione (es. dopo submit schedina)
  const updateParticipant = (updates) => {
    const updated = { ...participant, ...updates }
    setParticipant(updated)
    localStorage.setItem('tm2026_participant', JSON.stringify(updated))
  }

  const logout = () => {
    setParticipant(null)
    setIsAdmin(false)
    localStorage.removeItem('tm2026_participant')
    localStorage.removeItem('tm2026_admin')
  }

  const loginAdmin = () => {
    setIsAdmin(true)
    localStorage.setItem('tm2026_admin', 'true')
  }

  const logoutAdmin = () => {
    setIsAdmin(false)
    localStorage.removeItem('tm2026_admin')
  }

  return (
    <ParticipantContext.Provider value={{
      participant, isAdmin, loaded,
      login, logout, loginAdmin, logoutAdmin, updateParticipant,
    }}>
      {children}
    </ParticipantContext.Provider>
  )
}

export const useParticipant = () => useContext(ParticipantContext)
