import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/WorldMap.module.css')
const tokensCss = readCss('src/styles/tokens.css')

describe('WorldMap: estilos', () => {
  // Ocupa el ancho de su contenedor y el alto sale de la proporción del
  // viewBox: no hay un alto que esperar ni un salto al cargar.
  it('ancho del contenedor y alto por proporción', () => {
    expect(cssRule(css, '.map')).toMatchObject({ display: 'block', width: '100%', height: 'auto' })
  })

  it('la tierra se rellena con su token', () => {
    expect(cssRule(css, '.land')).toMatchObject({ fill: 'var(--color-map-land)' })
  })

  describe('punto de la ciudad', () => {
    it('va en el verde de la paleta', () => {
      expect(cssRule(css, '.city')).toMatchObject({ fill: 'var(--color-accent-alt)' })
    })

    // La técnica del punto de estado del Hero: un brillo fijo del mismo verde
    // al 30 %. En SVG no hay box-shadow, así que va como drop-shadow.
    it('lleva el brillo fijo del punto de estado del Hero', () => {
      expect(cssRule(css, '.city')).toMatchObject({
        filter:
          'drop-shadow(0 0 var(--map-city-glow) color-mix(in srgb, var(--color-accent-alt) 30%, transparent))',
      })
    })

    it('su radio de brillo es el del punto de estado del Hero', () => {
      expect(cssToken(tokensCss, '--map-city-glow')).toBe('var(--hero-status-glow)')
    })
  })

  describe('tokens', () => {
    it('el color de la tierra está definido en tokens.css', () => {
      expect(cssToken(tokensCss, '--color-map-land')).not.toBe('')
    })

    it('todos los tokens que usa existen en tokens.css', () => {
      const used = [...css.matchAll(/var\((--[\w-]+)\)/g)].map(([, name]) => name)

      expect(used.length).toBeGreaterThan(0)
      used.forEach((name) => {
        expect(tokensCss).toContain(`${name}:`)
      })
    })
  })

  // D6: brillo fijo, sin pulso.
  it('no anima nada', () => {
    expect(css).not.toMatch(/\b(?:transition|animation)\b|@keyframes/)
  })

  it('no lleva colores literales, imágenes ni URLs', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
    expect(css).not.toMatch(/url\(|image\(/i)
  })
})
