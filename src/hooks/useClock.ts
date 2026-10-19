import { useEffect, useState } from 'react'
import { formatClock } from '@/lib/formatClock'

/** Cada cuánto se refresca la hora: con minutos basta medio minuto. */
export const CLOCK_INTERVAL_MS = 30_000

/**
 * Hora actual (HH:MM) en la zona dada, refrescada cada medio minuto. No es
 * una animación: un reloj que avanza solo con el tiempo no se pausa.
 */
export function useClock(timeZone: string): string {
  const [time, setTime] = useState(() => formatClock(new Date(), timeZone))

  useEffect(() => {
    const tick = () => setTime(formatClock(new Date(), timeZone))
    tick()
    const timer = window.setInterval(tick, CLOCK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [timeZone])

  return time
}
