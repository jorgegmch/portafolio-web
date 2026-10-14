import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/StatIcon.module.css')
const tokensCss = readCss('src/styles/tokens.css')

/** Tarjeta de una sola línea: el icono no puede pasar de la cifra. */
const PHONE = '(max-width: 480px)'

describe('StatIcon: estilos', () => {
  // Token propio: cambiarlo no toca los iconos de la barra ni del Hero.
  it('mide lo que dice su propio token, no el de los demás iconos', () => {
    expect(cssRule(css, '.icon')).toMatchObject({
      width: 'var(--stat-icon-size)',
      height: 'var(--stat-icon-size)',
    })
  })

  it('todos los tokens que usa existen en tokens.css', () => {
    const used = [...css.matchAll(/var\((--[\w-]+)\)/g)].map(([, name]) => name)

    expect(used.length).toBeGreaterThan(0)
    used.forEach((name) => {
      expect(tokensCss).toContain(`${name}:`)
    })
  })

  describe('token de tamaño', () => {
    // El dibujo ocupa 18 de las 24 unidades del cuadro: con el cuadro al
    // tamaño de letra de la cifra, el trazo queda a la altura de sus dígitos.
    it('vale el tamaño de letra de la cifra', () => {
      expect(cssToken(tokensCss, '--stat-icon-size')).toBe('var(--font-size-title)')
    })

    it('en teléfono baja a 24 px, por debajo de la cifra, para no alargar la tarjeta', () => {
      const phone = cssToken(cssMedia(tokensCss, PHONE), '--stat-icon-size')
      const titleMin = parseFloat(/clamp\(([\d.]+)rem/.exec(cssToken(tokensCss, '--font-size-title'))?.[1] ?? '')

      expect(phone).toBe('1.5rem')
      expect(parseFloat(phone)).toBeLessThan(titleMin)
    })
  })

  it('es de trazo, con el grosor del token y el color de quien lo usa', () => {
    expect(cssRule(css, '.icon')).toMatchObject({
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 'var(--icon-stroke-width)',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    })
  })

  // Su tamaño no depende del hueco que le deje la tarjeta.
  it('no se encoge', () => {
    expect(cssRule(css, '.icon')).toMatchObject({ 'flex-shrink': '0' })
  })

  it('no lleva colores literales ni anima nada', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
    expect(css).not.toMatch(/\b(?:transition|animation)\b|@keyframes/)
  })
})
