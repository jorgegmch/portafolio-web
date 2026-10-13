import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/About.module.css')
const tokensCss = readCss('src/styles/tokens.css')

/** Hasta aquí la sección va apilada; desde 1024 px, en dos columnas. */
const STACKED = '(max-width: 1023px)'

describe('About: estilos', () => {
  it('no lleva colores literales: todos salen de tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })

  it('solo usa el breakpoint del apilado', () => {
    expect(css.match(/@media[^{]*/g)?.map((query) => query.trim())).toEqual([`@media ${STACKED}`])
  })

  describe('sección', () => {
    // La barra es fija: al llegar por el ancla, el título no queda debajo.
    it('reserva el alto de la barra al llegar por el ancla', () => {
      expect(cssRule(css, '.about')).toMatchObject({ 'scroll-margin-top': 'var(--nav-height)' })
    })
  })

  describe('título', () => {
    it('va en el verde de la paleta', () => {
      expect(cssRule(css, '.heading')).toMatchObject({ color: 'var(--color-accent-alt)' })
    })

    // El diccionario guarda el texto normal; las mayúsculas son solo visuales.
    it('las mayúsculas las pone el CSS', () => {
      expect(cssRule(css, '.heading')).toMatchObject({ 'text-transform': 'uppercase' })
    })
  })

  describe('frase grande', () => {
    it('va en el color de texto, con su tamaño propio', () => {
      expect(cssRule(css, '.phrase')).toMatchObject({
        color: 'var(--color-text)',
        'font-size': 'var(--font-size-phrase)',
      })
    })

    it('ocupa todo el ancho: no tiene ancho máximo', () => {
      expect(cssRule(css, '.phrase')).not.toHaveProperty('max-width')
    })

    it('su tamaño va de 28 px en teléfono a 52 px en escritorio', () => {
      expect(cssToken(tokensCss, '--font-size-phrase')).toBe('clamp(1.75rem, 4vw, 3.25rem)')
    })

    it('queda entre el título de sección y el nombre del hero', () => {
      const max = (name: string) =>
        parseFloat(/,\s*([\d.]+)rem\)$/.exec(cssToken(tokensCss, name))?.[1] ?? '')

      expect(max('--font-size-phrase')).toBeGreaterThan(max('--font-size-title'))
      expect(max('--font-size-phrase')).toBeLessThan(max('--font-size-display'))
    })

    it('el resalte es el verde de la paleta, y nada más', () => {
      expect(cssRule(css, '.highlight')).toEqual({ color: 'var(--color-accent-alt)' })
    })
  })

  describe('descripción', () => {
    it('no pasa del ancho de lectura', () => {
      expect(cssRule(css, '.bio')).toMatchObject({ 'max-width': 'var(--measure)' })
    })

    it('desde 1024 px va a la izquierda, con la otra columna reservada', () => {
      expect(cssRule(css, '.columns')).toMatchObject({
        display: 'grid',
        'grid-template-columns': 'minmax(0, var(--measure)) minmax(0, 1fr)',
      })
    })

    it('hasta 1023 px todo va apilado, en una columna', () => {
      expect(cssRule(cssMedia(css, STACKED), '.columns')).toEqual({
        'grid-template-columns': 'minmax(0, 1fr)',
      })
    })
  })

  describe('terminal', () => {
    // Sin esto la rejilla la estiraría al alto de la descripción.
    it('se alinea con la parte superior de la descripción', () => {
      expect(cssRule(css, '.columns')).toMatchObject({ 'align-items': 'start' })
    })

    it('su celda no deja que el panel la ensanche', () => {
      expect(cssRule(css, '.terminal')).toEqual({ 'min-width': '0' })
    })
  })

  describe('enlace a certificaciones', () => {
    it('es una cápsula de contorno con el alto táctil', () => {
      expect(cssRule(css, '.cta')).toMatchObject({
        'min-height': 'var(--touch-target)',
        border: '1px solid var(--color-accent-alt)',
        'border-radius': 'var(--radius-pill)',
        'background-color': 'transparent',
        color: 'var(--color-accent-alt)',
      })
    })

    it('no quita el anillo de foco', () => {
      expect(css).not.toMatch(/outline:\s*(?:none|0)/)
    })
  })
})
