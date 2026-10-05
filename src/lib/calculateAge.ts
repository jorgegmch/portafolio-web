/** Fecha de calendario sin hora ni zona. El mes va de 1 a 12. */
export interface DateParts {
  year: number
  month: number
  day: number
}

/** Partes de la fecha en la zona horaria local del visitante. */
export const toDateParts = (date: Date): DateParts => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
})

/**
 * Años cumplidos en la fecha dada. Quien nace un 29 de febrero cumple el
 * 1 de marzo en los años no bisiestos.
 */
export function calculateAge(birth: DateParts, today: DateParts): number {
  const hadBirthdayThisYear =
    today.month > birth.month || (today.month === birth.month && today.day >= birth.day)
  const age = today.year - birth.year - (hadBirthdayThisYear ? 0 : 1)
  return Math.max(0, age)
}
