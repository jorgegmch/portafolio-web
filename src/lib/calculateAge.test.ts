import { describe, expect, it } from 'vitest'
import { calculateAge, toDateParts, type DateParts } from '@/lib/calculateAge'

// Fecha ficticia: los tests no dependen de la fecha real de config/.
const birth: DateParts = { year: 2000, month: 3, day: 15 }

describe('calculateAge', () => {
  it('el día anterior al cumpleaños todavía no suma el año', () => {
    expect(calculateAge(birth, { year: 2026, month: 3, day: 14 })).toBe(25)
  })

  it('el día del cumpleaños ya suma el año', () => {
    expect(calculateAge(birth, { year: 2026, month: 3, day: 15 })).toBe(26)
  })

  it('el día siguiente al cumpleaños mantiene la nueva edad', () => {
    expect(calculateAge(birth, { year: 2026, month: 3, day: 16 })).toBe(26)
  })

  it('el 1 de enero no cambia la edad', () => {
    expect(calculateAge(birth, { year: 2025, month: 12, day: 31 })).toBe(25)
    expect(calculateAge(birth, { year: 2026, month: 1, day: 1 })).toBe(25)
  })

  it('el 31 de diciembre ya cuenta el cumpleaños de ese año', () => {
    expect(calculateAge(birth, { year: 2026, month: 12, day: 31 })).toBe(26)
  })

  it('el día del nacimiento la edad es 0', () => {
    expect(calculateAge(birth, birth)).toBe(0)
  })

  it('una fecha anterior al nacimiento devuelve 0', () => {
    expect(calculateAge(birth, { year: 1999, month: 6, day: 1 })).toBe(0)
  })

  describe('nacimiento un 29 de febrero', () => {
    const leapBirth: DateParts = { year: 2000, month: 2, day: 29 }

    it('en año bisiesto cumple el 29 de febrero', () => {
      expect(calculateAge(leapBirth, { year: 2024, month: 2, day: 28 })).toBe(23)
      expect(calculateAge(leapBirth, { year: 2024, month: 2, day: 29 })).toBe(24)
    })

    it('en año no bisiesto cumple el 1 de marzo', () => {
      expect(calculateAge(leapBirth, { year: 2025, month: 2, day: 28 })).toBe(24)
      expect(calculateAge(leapBirth, { year: 2025, month: 3, day: 1 })).toBe(25)
    })
  })
})

describe('toDateParts', () => {
  it('usa la fecha local y numera los meses de 1 a 12', () => {
    expect(toDateParts(new Date(2026, 0, 31, 23, 59))).toEqual({ year: 2026, month: 1, day: 31 })
    expect(toDateParts(new Date(2026, 11, 1, 0, 0))).toEqual({ year: 2026, month: 12, day: 1 })
  })
})
