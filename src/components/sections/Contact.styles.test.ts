import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/Contact.module.css')
const tokensCss = readCss('src/styles/tokens.css')
const phone = cssMedia(tokensCss, '(max-width: 480px)')

// Título de Contacto (spec v2.1 §2 y §3.5): clamp(56px, 6.4vw, 92px), 46 px
// en teléfono, con text-wrap: balance e interlineado de 0,94 (el del
// tablero). Debajo, la pregunta en 22 px y 700 y la invitación en 18 px y
// 500 (18 y 16 en teléfono).
describe('Contact: título', () => {
  it('el tamaño es el de la spec, y en teléfono 46 px', () => {
    expect(cssToken(tokensCss, '--font-size-contact-title')).toBe('clamp(3.5rem, 6.4vw, 5.75rem)')
    expect(cssToken(phone, '--font-size-contact-title')).toBe('2.875rem')
  })

  it('reparte sus líneas con text-wrap: balance y su propio interlineado', () => {
    expect(cssRule(css, '.title')).toMatchObject({
      'font-size': 'var(--font-size-contact-title)',
      'line-height': 'var(--leading-contact-title)',
      'text-wrap': 'balance',
    })
    expect(cssToken(tokensCss, '--leading-contact-title')).toBe('0.94')
  })
})

describe('Contact: textos bajo el título', () => {
  it('la pregunta en 22 px y negrita; la invitación en 18 px y 500', () => {
    expect(cssRule(css, '.pitchLead')).toMatchObject({
      'font-size': 'var(--font-size-contact-lead)',
      'font-weight': 'var(--font-weight-bold)',
    })
    expect(cssRule(css, '.pitchBody')).toMatchObject({
      'font-size': 'var(--font-size-contact-body)',
      'font-weight': 'var(--font-weight-medium)',
    })
    expect(cssToken(tokensCss, '--font-size-contact-lead')).toBe('1.375rem')
    expect(cssToken(tokensCss, '--font-size-contact-body')).toBe('1.125rem')
    expect(cssToken(phone, '--font-size-contact-lead')).toBe('1.125rem')
    expect(cssToken(phone, '--font-size-contact-body')).toBe('1rem')
  })

  it('el rótulo de los canales va en mono, en mayúsculas', () => {
    expect(cssRule(css, '.channelsLabel')).toMatchObject({
      'font-family': 'var(--font-mono)',
      'text-transform': 'uppercase',
    })
  })
})
