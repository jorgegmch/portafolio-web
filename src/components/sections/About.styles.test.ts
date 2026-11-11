import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/About.module.css')
const tokensCss = readCss('src/styles/tokens.css')

/** Solo con un puntero que se pose y sin pedir menos movimiento. */
const HOVER_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

// Bio de dos párrafos (spec v2.1 §3.2): 19 px con interlineado 1,6 y ancho
// máximo de 600 px; 16 px en teléfono.
describe('About: bio', () => {
  it('19 px en escritorio y 16 en teléfono', () => {
    expect(cssToken(tokensCss, '--font-size-bio')).toBe('1.1875rem')
    expect(cssToken(cssMedia(tokensCss, '(max-width: 480px)'), '--font-size-bio')).toBe('1rem')
  })

  it('interlineado 1,6 y ancho máximo de 600 px, con los párrafos separados', () => {
    expect(cssRule(css, '.bio')).toMatchObject({
      display: 'flex',
      'flex-direction': 'column',
      gap: 'var(--bio-gap)',
      'max-width': 'var(--bio-measure)',
      'font-size': 'var(--font-size-bio)',
      'line-height': 'var(--leading-base)',
    })
    expect(cssToken(tokensCss, '--bio-measure')).toBe('37.5rem')
    expect(cssToken(tokensCss, '--leading-base')).toBe('1.6')
  })
})

describe('About: tarjetas de cifras al pasar el puntero', () => {
  const hover = cssMedia(css, HOVER_QUERY)

  it('crecen un poco, con el token de escala, solo con puntero fino y sin movimiento reducido', () => {
    expect(cssRule(hover, '.stat:hover')).toEqual({ transform: 'scale(var(--lift-scale))' })
    expect(cssToken(tokensCss, '--lift-scale')).toBe('1.04')
  })

  it('la transición es solo de transform, de unos 200 ms y con --ease-cine', () => {
    expect(cssRule(hover, '.stat')).toEqual({
      transition: 'transform var(--duration-fast) var(--ease-cine)',
    })
    expect(cssToken(tokensCss, '--duration-fast')).toBe('200ms')
  })

  // El <li> lo anima Reveal al aparecer: las dos transformaciones se pisarían.
  it('la escala va en la tarjeta de dentro, nunca en el <li> de Reveal', () => {
    expect(css).not.toMatch(/\.statItem[^{]*\{[^}]*transform/)
    expect(css).not.toMatch(/\.statItem:hover/)
  })

  it('fuera de ese bloque, la tarjeta no cambia al pasar el puntero', () => {
    const outside = css.replace(hover, '')

    expect(outside).not.toMatch(/\.stat:hover/)
  })
})
