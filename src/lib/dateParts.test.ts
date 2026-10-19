import { describe, expect, it } from 'vitest'
import { toDateParts } from '@/lib/dateParts'

describe('toDateParts', () => {
  it('usa la fecha local y numera los meses de 1 a 12', () => {
    expect(toDateParts(new Date(2026, 0, 31, 23, 59))).toEqual({ year: 2026, month: 1, day: 31 })
    expect(toDateParts(new Date(2026, 11, 1, 0, 0))).toEqual({ year: 2026, month: 12, day: 1 })
  })
})
