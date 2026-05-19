// ── Generatore codice partecipante ────────────────────────

export function generateParticipantCode(firstName, lastName) {
  const normalize = (str) =>
    str
      .toUpperCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // rimuovi accenti
      .replace(/[^A-Z0-9]/g, '')        // solo alfanumerici
  const suffix = Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
  ).join('')
  return `${normalize(firstName)}.${normalize(lastName)}.${suffix}`
}

// ── Hash SHA-256 (per verifica password admin) ────────────

export async function sha256(text) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkAdminPassword(input) {
  const hash = import.meta.env.VITE_ADMIN_PASS_HASH
  if (!hash) return false
  const inputHash = await sha256(input)
  return inputHash === hash.toLowerCase()
}

// ── Esito partita ─────────────────────────────────────────

export function getMatchOutcome(homeScore, awayScore) {
  if (homeScore === null || awayScore === null) return null
  if (homeScore > awayScore)  return '1'
  if (homeScore === awayScore) return 'X'
  return '2'
}

// ── Formattazione ─────────────────────────────────────────

export function formatCurrency(amount) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  }).format(new Date(dateStr))
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Europe/Rome',
  }).format(new Date(dateStr))
}

// ── Classifica utils ──────────────────────────────────────

export function getOrdinal(n) {
  const ordinals = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°']
  return ordinals[n - 1] ?? `${n}°`
}

export function truncateName(str, max = 18) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}
