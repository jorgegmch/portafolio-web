import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/test/contrast'

describe('contrastRatio', () => {
  it('blanco sobre negro da 21:1, el máximo', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 10)
  })

  it('un color consigo mismo da 1:1, el mínimo', () => {
    expect(contrastRatio('#00ff88', '#00ff88')).toBe(1)
    expect(contrastRatio('#000000', '#000000')).toBe(1)
  })

  it('no depende de cuál va delante y cuál de fondo', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(contrastRatio('#ffffff', '#000000'))
    expect(contrastRatio('#08080f', '#00d4ff')).toBe(contrastRatio('#00d4ff', '#08080f'))
  })

  // Valores de referencia de WCAG: #767676 es el gris más claro que pasa AA
  // sobre blanco, y #777777 el primero que no llega.
  it('da los valores conocidos de los grises límite sobre blanco', () => {
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
  })

  it('cada canal pesa distinto: el verde es el que más luce', () => {
    const onBlack = (hex: string) => contrastRatio(hex, '#000000')

    expect(onBlack('#00ff00')).toBeGreaterThan(onBlack('#ff0000'))
    expect(onBlack('#ff0000')).toBeGreaterThan(onBlack('#0000ff'))
  })

  it('no distingue mayúsculas en el hexadecimal', () => {
    expect(contrastRatio('#EEEEF2', '#08080F')).toBe(contrastRatio('#eeeef2', '#08080f'))
  })

  // Un token translúcido o abreviado no se puede medir: mejor fallar que dar
  // un número sin sentido.
  it.each(['rgba(0, 212, 255, 0.13)', '#fff', 'white', ''])(
    'rechaza «%s», que no es un color #rrggbb',
    (value) => {
      expect(() => contrastRatio(value, '#000000')).toThrow('Color no hexadecimal')
      expect(() => contrastRatio('#000000', value)).toThrow('Color no hexadecimal')
    },
  )
})
