import { useEffect, useState } from 'react'
import { getBirthDate } from '@/lib/birthDate'
import { calculateAge, toDateParts, type DateParts } from '@/lib/calculateAge'

const msUntilNextMidnight = (now: Date): number =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()

/**
 * Edad actual, en vivo: se recalcula en cada medianoche local y cada vez
 * que la pestaña vuelve a estar visible.
 *
 * El timer nunca supera las 24 horas. Un único setTimeout hasta el próximo
 * cumpleaños desbordaría el máximo de ~24,8 días y se dispararía de inmediato.
 */
export function useAge(birth: DateParts = getBirthDate()): number {
  const { year, month, day } = birth
  const [age, setAge] = useState(() => calculateAge({ year, month, day }, toDateParts(new Date())))

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const update = () => {
      setAge(calculateAge({ year, month, day }, toDateParts(new Date())))
    }
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        update()
        schedule()
      }, msUntilNextMidnight(new Date()))
    }
    // Una pestaña en segundo plano puede atrasar o suspender sus timers.
    const handleVisibilityChange = () => {
      update()
      schedule()
    }

    schedule()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [year, month, day])

  return age
}
