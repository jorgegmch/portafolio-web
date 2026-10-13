import type { YearMonth } from '@/data/types'
import type { DateParts } from '@/lib/calculateAge'

const MONTHS_PER_YEAR = 12
/** Desde aquí el tiempo se cuenta en años; antes, en meses. */
const YEARS_FROM_MONTHS = 24

/** Tiempo programando: la cifra y su unidad. El plural y la etiqueta van en i18n. */
export interface CodingTime {
  value: number
  unit: 'months' | 'years'
}

/**
 * Tiempo transcurrido desde el mes de inicio: en meses hasta los 23 y en
 * años completos desde los 24. El inicio no registra el día, así que el mes
 * cuenta entero. Si el inicio es posterior a hoy, son 0 meses.
 */
export function codingTime(start: YearMonth, today: DateParts): CodingTime {
  const [year, month] = start.split('-').map(Number)
  if (!year || !month || month > MONTHS_PER_YEAR) {
    throw new RangeError(`Fecha año-mes inválida: ${start}`)
  }

  const months = Math.max(0, (today.year - year) * MONTHS_PER_YEAR + (today.month - month))

  return months < YEARS_FROM_MONTHS
    ? { value: months, unit: 'months' }
    : { value: Math.floor(months / MONTHS_PER_YEAR), unit: 'years' }
}
