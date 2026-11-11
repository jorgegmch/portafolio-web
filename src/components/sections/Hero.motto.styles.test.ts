import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

// Lema al pie de la foto (spec v2.1 §3.1 y tablero desktop-page): centrado,
// en Anton de 46 px (34 en teléfono) con interlineado 1, la primera frase en
// Bone y la segunda en Signal, sobre un velo de 190 px que va de Ink a
// transparente. Los bloques laterales suben a 132 px del pie del escenario
// para dejarle sitio.
const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')
const phone = cssMedia(tokensCss, '(max-width: 480px)')

describe('Hero: lema y velo', () => {
  it('los tamaños son los de la spec: 46 px en escritorio y 34 en teléfono', () => {
    expect(cssToken(tokensCss, '--hero-motto-size')).toBe('2.875rem')
    expect(cssToken(phone, '--hero-motto-size')).toBe('2.125rem')
  })

  it('el lema va en Anton, en mayúsculas, centrado y con interlineado 1', () => {
    expect(cssRule(heroCss, '.motto')).toMatchObject({
      'font-family': 'var(--font-display)',
      'font-size': 'var(--hero-motto-size)',
      'line-height': 'var(--leading-none)',
      'text-align': 'center',
      'text-transform': 'uppercase',
    })
  })

  it('la primera frase va en Bone y la segunda en Signal, cada una en su línea', () => {
    expect(cssRule(heroCss, '.mottoFirst')).toMatchObject({ display: 'block' })
    expect(cssRule(heroCss, '.mottoSecond')).toMatchObject({
      display: 'block',
      color: 'var(--color-signal)',
    })
    expect(cssRule(heroCss, '.motto')).toMatchObject({ color: 'var(--color-bone)' })
  })

  it('el velo mide 190 px de alto y va de Ink a transparente, sin recibir clics', () => {
    expect(cssToken(tokensCss, '--hero-veil-height')).toBe('11.875rem')
    expect(cssRule(heroCss, '.veil')).toMatchObject({
      height: 'var(--hero-veil-height)',
      background:
        'linear-gradient(to top, var(--color-ink) 0%, var(--color-hero-veil-mid) 45%, transparent 100%)',
      'pointer-events': 'none',
    })
    expect(cssToken(tokensCss, '--color-hero-veil-mid')).toBe('rgba(17, 17, 19, 0.92)')
  })

  it('los bloques laterales suben a 132 px del pie del escenario', () => {
    expect(cssToken(tokensCss, '--hero-blocks-bottom')).toBe('8.25rem')
    expect(cssRule(heroCss, '.blocks')).toMatchObject({ bottom: 'var(--hero-blocks-bottom)' })
  })

  it('en teléfono y tablet el lema se equilibra en sus líneas, al pie de la foto', () => {
    const stacked = cssMedia(heroCss, '(max-width: 1280px)')

    expect(cssRule(stacked, '.motto')).toMatchObject({
      'grid-area': 'photo',
      'align-self': 'end',
      'text-wrap': 'balance',
    })
    expect(cssRule(stacked, '.portrait')).toMatchObject({ 'grid-area': 'photo' })
    expect(cssRule(stacked, '.veil')).toMatchObject({ 'grid-area': 'photo', 'align-self': 'end' })
  })
})
