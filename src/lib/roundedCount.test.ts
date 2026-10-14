import { describe, expect, it } from 'vitest'
import { roundedCount } from '@/lib/roundedCount'

describe('roundedCount', () => {
  describe('hasta 20, la cifra exacta', () => {
    it.each([0, 1, 10, 11, 16, 19, 20])('%i se queda igual, sin aproximar', (count) => {
      expect(roundedCount(count)).toEqual({ value: count, approximate: false })
    })
  })

  describe('por encima de 20, baja a la decena', () => {
    // Con unidades de sobra la cifra es «más de»: quien la muestra añade el «+».
    it.each([
      [21, 20],
      [29, 20],
      [31, 30],
      [39, 30],
      [41, 40],
      [105, 100],
    ])('%i pasa a %i, aproximado', (count, value) => {
      expect(roundedCount(count)).toEqual({ value, approximate: true })
    })

    it.each([30, 40, 100])('%i es una decena justa: se queda igual y sin aproximar', (count) => {
      expect(roundedCount(count)).toEqual({ value: count, approximate: false })
    })
  })

  describe('solo admite enteros desde 0', () => {
    it.each([
      ['un negativo', -1],
      ['un decimal', 1.5],
      ['un decimal por encima de 20', 25.5],
      ['NaN', Number.NaN],
      ['infinito', Number.POSITIVE_INFINITY],
      ['menos infinito', Number.NEGATIVE_INFINITY],
    ])('rechaza %s', (_, count) => {
      expect(() => roundedCount(count)).toThrow(RangeError)
    })
  })
})
