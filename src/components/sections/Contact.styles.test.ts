import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/Contact.module.css')
const tokensCss = readCss('src/styles/tokens.css')

// Con el interlineado de Anton (0,84), el «¿» de «¿CONSTRUIMOS» bajaba sobre
// la «A» de «ALGO» y se leía «ÁLGO». Medido en Anton: «¿» baja 0,0625 em bajo
// la línea base y las mayúsculas de abajo suben 0,875 em: hacen falta 0,9375.
describe('Contact: interlineado del título', () => {
  const MEASURED_MINIMUM = 0.0625 + 0.875

  it('el título usa su propio interlineado, no el general de Anton', () => {
    expect(cssRule(css, '.title')).toMatchObject({ 'line-height': 'var(--leading-contact-title)' })
  })

  it('es el mínimo medido que evita el solape, redondeado hacia arriba', () => {
    const value = Number(cssToken(tokensCss, '--leading-contact-title'))

    expect(value).toBeGreaterThanOrEqual(MEASURED_MINIMUM)
    expect(value).toBeLessThan(MEASURED_MINIMUM + 0.01)
  })
})
