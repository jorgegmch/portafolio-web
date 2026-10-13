import { describe, expect, it } from 'vitest'
import type { YearMonth } from '@/data/types'
import { codingTime } from '@/lib/codingTime'

// Inicio ficticio: los tests no dependen del de config/ ni del reloj.
const start: YearMonth = '2024-03'

describe('codingTime', () => {
  describe('en meses, hasta los 23', () => {
    it('el mismo mes del inicio son 0 meses', () => {
      expect(codingTime(start, { year: 2024, month: 3, day: 20 })).toEqual({
        value: 0,
        unit: 'months',
      })
    })

    it('el mes siguiente es 1 mes', () => {
      expect(codingTime(start, { year: 2024, month: 4, day: 1 })).toEqual({
        value: 1,
        unit: 'months',
      })
    })

    it('a los 14 meses sigue en meses', () => {
      expect(codingTime(start, { year: 2025, month: 5, day: 13 })).toEqual({
        value: 14,
        unit: 'months',
      })
    })

    it('a los 23 meses sigue en meses', () => {
      expect(codingTime(start, { year: 2026, month: 2, day: 28 })).toEqual({
        value: 23,
        unit: 'months',
      })
    })
  })

  describe('en años completos, desde los 24 meses', () => {
    it('a los 24 meses son 2 años', () => {
      expect(codingTime(start, { year: 2026, month: 3, day: 1 })).toEqual({
        value: 2,
        unit: 'years',
      })
    })

    it('a los 35 meses siguen siendo 2 años', () => {
      expect(codingTime(start, { year: 2027, month: 2, day: 28 })).toEqual({
        value: 2,
        unit: 'years',
      })
    })

    it('a los 36 meses son 3 años', () => {
      expect(codingTime(start, { year: 2027, month: 3, day: 1 })).toEqual({
        value: 3,
        unit: 'years',
      })
    })
  })

  it('de diciembre a enero pasa un mes, no un año', () => {
    expect(codingTime('2025-12', { year: 2025, month: 12, day: 31 })).toEqual({
      value: 0,
      unit: 'months',
    })
    expect(codingTime('2025-12', { year: 2026, month: 1, day: 1 })).toEqual({
      value: 1,
      unit: 'months',
    })
  })

  // El inicio no registra el día: cuenta el mes entero.
  it('el día del mes no cambia el resultado', () => {
    expect(codingTime(start, { year: 2025, month: 5, day: 1 })).toEqual(
      codingTime(start, { year: 2025, month: 5, day: 31 }),
    )
  })

  describe('con un inicio posterior a hoy', () => {
    it('un mes antes del inicio son 0 meses, nunca un valor negativo', () => {
      expect(codingTime(start, { year: 2024, month: 2, day: 29 })).toEqual({
        value: 0,
        unit: 'months',
      })
    })

    it('años antes del inicio siguen siendo 0 meses', () => {
      expect(codingTime(start, { year: 2020, month: 1, day: 1 })).toEqual({
        value: 0,
        unit: 'months',
      })
    })
  })

  it.each(['2024-00', '2024-13'] as const)('rechaza el mes inválido de %s', (invalid) => {
    expect(() => codingTime(invalid, { year: 2026, month: 1, day: 1 })).toThrow(RangeError)
  })
})
