import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { getBirthDate, parseBirthDate } from '@/lib/birthDate'
import { encodeText } from '@/lib/textCodes'

const OFFSET = 3

// Estos tests comprueban la forma del resultado, nunca el valor: el repo es
// público y escribir aquí la fecha real anularía la ofuscación.
describe('birthDate', () => {
  it('reconstruye una fecha ficticia a partir de sus códigos', () => {
    const codes = encodeText('2000-03-15', OFFSET)
    expect(parseBirthDate(codes, OFFSET)).toEqual({ year: 2000, month: 3, day: 15 })
  })

  it('la fecha guardada tiene forma de fecha de calendario', () => {
    const { year, month, day } = getBirthDate()
    expect(Number.isInteger(year)).toBe(true)
    expect(year).toBeGreaterThan(1900)
    expect(year).toBeLessThan(new Date().getFullYear())
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).toContain(month)
    expect(Number.isInteger(day)).toBe(true)
    expect(day).toBeGreaterThanOrEqual(1)
    expect(day).toBeLessThanOrEqual(31)
  })

  it('los códigos guardados no son la fecha en claro', () => {
    expect(String.fromCharCode(...site.birthDateCodes)).not.toMatch(/\d{4}/)
  })
})
