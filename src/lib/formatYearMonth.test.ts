import { describe, expect, it } from 'vitest'
import type { YearMonth } from '@/data/types'
import { formatYearMonth } from '@/lib/formatYearMonth'

describe('formatYearMonth', () => {
  it('formatea en español', () => {
    expect(formatYearMonth('2023-03', 'es')).toBe('marzo de 2023')
  })

  it('formatea en inglés', () => {
    expect(formatYearMonth('2023-03', 'en')).toBe('March 2023')
  })

  it('no se corre al mes anterior por la zona horaria', () => {
    // Con una fecha UTC, enero caería en diciembre del año anterior en
    // cualquier zona al oeste de Greenwich (Colombia es UTC-5).
    expect(formatYearMonth('2023-01', 'es')).toBe('enero de 2023')
    expect(formatYearMonth('2023-01', 'en')).toBe('January 2023')
  })

  it('cubre el último mes del año', () => {
    expect(formatYearMonth('2016-12', 'en')).toBe('December 2016')
  })

  it.each(['2023-13', '2023-00', 'abc-def'])('rechaza la fecha inválida %s', (date) => {
    expect(() => formatYearMonth(date as YearMonth, 'es')).toThrow(RangeError)
  })
})
