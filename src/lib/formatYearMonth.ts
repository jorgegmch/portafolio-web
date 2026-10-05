import type { YearMonth } from '@/data/types'
import type { Lang } from '@/i18n/types'

/**
 * "2023-03" -> "marzo de 2023" / "March 2023".
 *
 * La fecha se construye en hora local: new Date("2023-03") se interpreta
 * como UTC y en zonas al oeste de Greenwich cae en el mes anterior.
 */
export function formatYearMonth(date: YearMonth, lang: Lang): string {
  const [year, month] = date.split('-').map(Number)
  if (!year || !month || month > 12) throw new RangeError(`Fecha año-mes inválida: ${date}`)

  return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
}
