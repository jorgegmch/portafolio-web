import { describe, expect, it } from 'vitest'
import type { YearMonth } from '@/data/types'
import type { DateParts } from '@/lib/calculateAge'
import { codingTime } from '@/lib/codingTime'

// Inicio ficticio: los tests no dependen del de config/ ni del reloj.
const start: YearMonth = '2024-03'

/** El día 10 del mes que queda a `months` meses del inicio. */
const after = (months: number): DateParts => {
  const index = 2 + months
  return { year: 2024 + Math.floor(index / 12), month: (index % 12) + 1, day: 10 }
}

describe('codingTime', () => {
  it('la ayuda del test sitúa bien los meses', () => {
    expect(after(0)).toEqual({ year: 2024, month: 3, day: 10 })
    expect(after(9)).toEqual({ year: 2024, month: 12, day: 10 })
    expect(after(10)).toEqual({ year: 2025, month: 1, day: 10 })
    expect(after(25)).toEqual({ year: 2026, month: 4, day: 10 })
  })

  describe('en meses, hasta los 11', () => {
    it.each([
      ['el mismo mes del inicio son 0 meses', 0],
      ['el mes siguiente es 1 mes', 1],
      ['a los 11 meses sigue en meses', 11],
    ])('%s', (_, months) => {
      expect(codingTime(start, after(months))).toEqual({
        value: months,
        unit: 'months',
        approximate: false,
      })
    })
  })

  describe('en años completos, desde los 12 meses', () => {
    it.each([
      ['a los 12 meses es 1 año justo', 12, 1],
      ['a los 24 meses son 2 años justos', 24, 2],
      ['a los 36 meses son 3 años justos', 36, 3],
    ])('%s', (_, months, years) => {
      expect(codingTime(start, after(months))).toEqual({
        value: years,
        unit: 'years',
        approximate: false,
      })
    })

    // Con meses de sobra la cifra es «más de»: quien la muestra añade el «+».
    it.each([
      ['a los 13 meses es más de 1 año', 13, 1],
      ['a los 23 meses sigue siendo más de 1 año', 23, 1],
      ['a los 25 meses son más de 2 años', 25, 2],
      ['a los 35 meses siguen siendo más de 2 años', 35, 2],
    ])('%s', (_, months, years) => {
      expect(codingTime(start, after(months))).toEqual({
        value: years,
        unit: 'years',
        approximate: true,
      })
    })
  })

  it('de diciembre a enero pasa un mes, no un año', () => {
    expect(codingTime('2025-12', { year: 2025, month: 12, day: 31 })).toEqual({
      value: 0,
      unit: 'months',
      approximate: false,
    })
    expect(codingTime('2025-12', { year: 2026, month: 1, day: 1 })).toEqual({
      value: 1,
      unit: 'months',
      approximate: false,
    })
  })

  // El inicio no registra el día: cuenta el mes entero.
  describe('el día del mes no cambia el resultado', () => {
    it('en meses', () => {
      expect(codingTime(start, { year: 2024, month: 8, day: 1 })).toEqual(
        codingTime(start, { year: 2024, month: 8, day: 31 }),
      )
    })

    it('el primer día del mes 12 ya es 1 año justo', () => {
      expect(codingTime(start, { year: 2025, month: 3, day: 1 })).toEqual({
        value: 1,
        unit: 'years',
        approximate: false,
      })
    })

    it('el último día del mes 11 todavía son 11 meses', () => {
      expect(codingTime(start, { year: 2025, month: 2, day: 28 })).toEqual({
        value: 11,
        unit: 'months',
        approximate: false,
      })
    })
  })

  describe('con un inicio posterior a hoy', () => {
    it('un mes antes del inicio son 0 meses, nunca un valor negativo', () => {
      expect(codingTime(start, { year: 2024, month: 2, day: 29 })).toEqual({
        value: 0,
        unit: 'months',
        approximate: false,
      })
    })

    it('años antes del inicio siguen siendo 0 meses', () => {
      expect(codingTime(start, { year: 2020, month: 1, day: 1 })).toEqual({
        value: 0,
        unit: 'months',
        approximate: false,
      })
    })
  })

  it.each(['2024-00', '2024-13'] as const)('rechaza el mes inválido de %s', (invalid) => {
    expect(() => codingTime(invalid, { year: 2026, month: 1, day: 1 })).toThrow(RangeError)
  })
})
