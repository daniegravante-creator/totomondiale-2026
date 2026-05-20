import { useState, useEffect } from 'react'

// Deadline pronostici: 11/06/2026 ore 20:00 italiane (CEST = UTC+2)
export const DEADLINE_UTC = new Date('2026-06-11T18:00:00Z')
// Kickoff primo match: 11/06/2026 ore 21:00 italiane
export const KICKOFF_UTC  = new Date('2026-06-11T19:00:00Z')

function calcTimeLeft(target) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function isBeforeDeadline() {
  return Date.now() < DEADLINE_UTC.getTime()
}

export default function Countdown({ target, label, compact, expiredText }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(target))

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calcTimeLeft(target)
      setTimeLeft(tl)
      if (!tl) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [target])

  if (!timeLeft) {
    if (expiredText) return <p className="text-sm text-tm-muted text-center">{expiredText}</p>
    return null
  }

  if (compact) {
    return (
      <div className="text-center">
        {label && <p className="text-xs text-tm-muted mb-1">{label}</p>}
        <div className="flex items-center justify-center gap-1 font-mono text-sm text-tm-accent font-bold">
          <span>{timeLeft.days}g</span>
          <span className="text-tm-muted">:</span>
          <span>{String(timeLeft.hours).padStart(2,'0')}h</span>
          <span className="text-tm-muted">:</span>
          <span>{String(timeLeft.minutes).padStart(2,'0')}m</span>
          <span className="text-tm-muted">:</span>
          <span>{String(timeLeft.seconds).padStart(2,'0')}s</span>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      {label && <p className="text-xs text-tm-muted mb-2 uppercase tracking-wider font-semibold">{label}</p>}
      <div className="flex items-center justify-center gap-2">
        {[
          { value: timeLeft.days, unit: 'Giorni' },
          { value: timeLeft.hours, unit: 'Ore' },
          { value: timeLeft.minutes, unit: 'Min' },
          { value: timeLeft.seconds, unit: 'Sec' },
        ].map(({ value, unit }) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-tm-card border border-tm-border flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-tm-accent font-mono">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] text-tm-muted mt-1 uppercase tracking-wide">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
