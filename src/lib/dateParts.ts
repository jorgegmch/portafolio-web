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
