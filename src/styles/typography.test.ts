import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const tokensCss = readCss('src/styles/tokens.css')
const fontsCss = readCss('src/styles/fonts.css')
const heroCss = readCss('src/components/sections/Hero.module.css')
const certificationsCss = readCss('src/pages/CertificationsPage.module.css')

const SEMIBOLD = '--font-weight-semibold'
const EXTRABOLD = '--font-weight-extrabold'
const DISPLAY_SIZE = '--font-size-display'
const TITLE_SIZE = '--font-size-title'

/** Tokens de peso de tokens.css, como pares [nombre, valor]. */
const weightTokens = [...tokensCss.matchAll(/(--font-weight-[a-z]+):\s*(\d+);/g)].map(
  ([, name = '', value = '']) => [name, value] as const,
)

/** Archivos de fuente que importa fonts.css, como pares [familia, peso]. */
const fontImports = [
  ...fontsCss.matchAll(/@import '@fontsource\/([a-z-]+)\/latin-(\d+)\.css';/g),
].map(([, family = '', weight = '']) => [family, weight] as const)

const isLoaded = (family: string, weight: string) =>
  fontImports.some(([loadedFamily, loadedWeight]) => loadedFamily === family && loadedWeight === weight)

/** Mínimo y máximo, en rem, de un token escrito como clamp(mín, fluido, máx). */
const clampBounds = (name: string) => {
  const [, min = '', max = ''] =
    /^clamp\(\s*([\d.]+)rem\s*,[^,]+,\s*([\d.]+)rem\s*\)$/.exec(cssToken(tokensCss, name)) ?? []
  return { min: Number.parseFloat(min), max: Number.parseFloat(max) }
}

describe('tipografía de títulos', () => {
  describe('pesos sin negrita falsa', () => {
    it('hay tokens de peso y archivos de fuente que comprobar', () => {
      expect(weightTokens.length).toBeGreaterThan(0)
      expect(fontImports.length).toBeGreaterThan(0)
    })

    // Sin el archivo de un peso, el navegador engordaría otro por su cuenta.
    it.each(weightTokens)('el peso de %s (%s) tiene su @import en fonts.css', (_name, value) => {
      expect(fontImports.map(([, weight]) => weight)).toContain(value)
    })

    // Y al revés: un archivo de fuente sin token no lo usa nadie.
    it.each(fontImports)('la fuente %s en peso %s tiene un token que la usa', (_family, weight) => {
      expect(weightTokens.map(([, value]) => value)).toContain(weight)
    })

    it('los tokens nuevos valen 600 y 800', () => {
      expect(cssToken(tokensCss, SEMIBOLD)).toBe('600')
      expect(cssToken(tokensCss, EXTRABOLD)).toBe('800')
    })

    // Los títulos van en Outfit: los pesos tienen que existir en esa familia.
    it.each(['600', '800'])('Outfit se carga en peso %s', (weight) => {
      expect(isLoaded('outfit', weight)).toBe(true)
    })
  })

  describe('nombre del Hero', () => {
    it('usa el peso más grueso', () => {
      expect(cssRule(heroCss, '.name')).toMatchObject({ 'font-weight': `var(${EXTRABOLD})` })
    })

    it('va en la fuente de texto, la que carga ese peso', () => {
      expect(cssRule(heroCss, '.name')).not.toHaveProperty('font-family')
      expect(cssToken(tokensCss, '--font-sans')).toMatch(/^'Outfit'/)
    })

    it('el token de tamaño crece: de 40 px en teléfono a 90 px en escritorio', () => {
      expect(cssToken(tokensCss, DISPLAY_SIZE)).toBe('clamp(2.5rem, 7vw, 5.625rem)')
    })

    it('es mayor que el título de sección en los dos extremos', () => {
      const display = clampBounds(DISPLAY_SIZE)
      const title = clampBounds(TITLE_SIZE)

      expect(display.min).toBeGreaterThan(title.min)
      expect(display.max).toBeGreaterThan(title.max)
    })
  })

  describe('título de Certificaciones', () => {
    it('usa el peso intermedio', () => {
      expect(cssRule(certificationsCss, '.title')).toMatchObject({
        'font-weight': `var(${SEMIBOLD})`,
      })
    })

    it('es más grueso que el texto normal y menos que el nombre del Hero', () => {
      const weight = (name: string) => Number(cssToken(tokensCss, name))

      expect(weight(SEMIBOLD)).toBeGreaterThan(weight('--font-weight-regular'))
      expect(weight(SEMIBOLD)).toBeLessThan(weight(EXTRABOLD))
    })

    it('conserva su tamaño', () => {
      expect(cssRule(certificationsCss, '.title')).toMatchObject({
        'font-size': `var(${TITLE_SIZE})`,
      })
    })
  })

  describe('pesos escritos a mano', () => {
    it.each([
      ['Hero', heroCss],
      ['Certificaciones', certificationsCss],
    ])('en %s todo font-weight sale de un token', (_name, css) => {
      const weights = [...css.matchAll(/font-weight:\s*([^;]+);/g)].map(([, value]) => value)

      expect(weights.length).toBeGreaterThan(0)
      weights.forEach((value) => expect(value).toMatch(/^var\(--font-weight-[a-z]+\)$/))
    })
  })
})
