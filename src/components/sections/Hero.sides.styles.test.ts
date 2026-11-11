import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'
import { contrastRatio } from '@/test/contrast'

// Paneles laterales del Hero (spec v2.1 §3.1 y tablero desktop-page): la
// ventana de código girada -3° y las fichas giradas 2,5°, de 304 px a 44 del
// borde. Se ocultan donde no caben junto al nombre: en el Hero apilado.
const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')

describe('Hero: paneles laterales', () => {
  it('la ventana va a la izquierda, girada -3°, y las fichas a la derecha, giradas 2,5°', () => {
    expect(cssRule(heroCss, '.codeWindow')).toMatchObject({
      position: 'absolute',
      left: 'var(--hero-side-inset)',
      width: 'var(--hero-side-width)',
      transform: 'rotate(var(--hero-code-tilt))',
    })
    expect(cssRule(heroCss, '.mainStack')).toMatchObject({
      position: 'absolute',
      right: 'var(--hero-side-inset)',
      width: 'var(--hero-side-width)',
      transform: 'rotate(var(--hero-stack-tilt))',
    })
    expect(cssToken(tokensCss, '--hero-code-tilt')).toBe('-3deg')
    expect(cssToken(tokensCss, '--hero-stack-tilt')).toBe('2.5deg')
    expect(cssToken(tokensCss, '--hero-side-inset')).toBe('2.75rem')
  })

  it('van detrás de la foto y delante del nombre', () => {
    for (const selector of ['.codeWindow', '.mainStack']) {
      expect(cssRule(heroCss, selector)).toMatchObject({ 'z-index': '2' })
    }
    expect(cssRule(heroCss, '.name')).toMatchObject({ 'z-index': '1' })
    expect(cssRule(heroCss, '.portrait')).toMatchObject({ 'z-index': '3' })
  })

  it('en el Hero apilado (hasta 1280 px) se ocultan', () => {
    const stacked = cssMedia(heroCss, '(max-width: 1280px)')

    expect(cssRule(heroCss, '.side')).toMatchObject({ 'pointer-events': 'none' })
    expect(cssRule(stacked, '.side')).toMatchObject({ display: 'none' })
  })

  it('la sintaxis va en la voz de código: palabras clave en Code, cadenas y comentarios en sus tonos', () => {
    expect(cssRule(heroCss, '.keyword')).toMatchObject({ color: 'var(--color-code)' })
    expect(cssRule(heroCss, '.string')).toMatchObject({ color: 'var(--color-code-string)' })
    expect(cssRule(heroCss, '.comment')).toMatchObject({ color: 'var(--color-code)' })
    expect(cssToken(tokensCss, '--color-code-string')).toBe('#e8c9a0')
  })

  it('el texto de la ventana se lee sobre su fondo (AA)', () => {
    const window = cssToken(tokensCss, '--color-code-window')

    for (const color of ['--color-code', '--color-code-string', '--color-bone-soft', '--color-code-comment']) {
      expect(contrastRatio(cssToken(tokensCss, color), window), color).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('las fichas son de 92 px de alto, con el logo de 34 px y sombra de dos capas', () => {
    expect(cssRule(heroCss, '.tile')).toMatchObject({
      height: 'var(--hero-tile-height)',
      'box-shadow': 'var(--shadow-tile)',
    })
    expect(cssToken(tokensCss, '--hero-tile-height')).toBe('5.75rem')
    expect(cssRule(heroCss, '.tileLogo')).toMatchObject({
      width: 'var(--hero-tile-logo)',
      height: 'var(--hero-tile-logo)',
      'object-fit': 'contain',
    })
    expect(cssToken(tokensCss, '--shadow-tile').split(/,(?![^(]*\))/)).toHaveLength(2)
  })
})
