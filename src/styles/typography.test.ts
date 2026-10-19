import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const tokensCss = readCss('src/styles/tokens.css')
const fontsCss = readCss('src/styles/fonts.css')
const heroCss = readCss('src/components/sections/Hero.module.css')

const SEMIBOLD = '--font-weight-semibold'
const EXTRABOLD = '--font-weight-extrabold'
const DISPLAY_SIZE = '--font-size-display'
const TITLE_SIZE = '--font-size-title'

/** Tokens de peso de tokens.css, como pares [nombre, valor]. */
const weightTokens = [...tokensCss.matchAll(/(--font-weight-[a-z]+):\s*(\d+);/g)].map(
  ([, name = '', value = '']) => [name, value] as const,
)

/** Bloques @font-face de fonts.css. */
const fontFaces = [...fontsCss.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body = '']) => body)

/** Fuentes que declara fonts.css, como pares [familia, peso]. */
const fontImports = fontFaces.map(
  (body) =>
    [
      /font-family:\s*'([^']+)';/.exec(body)?.[1] ?? '',
      /font-weight:\s*(\d+);/.exec(body)?.[1] ?? '',
    ] as const,
)

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
    it.each(weightTokens)('el peso de %s (%s) tiene su @font-face en fonts.css', (_name, value) => {
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

    // Los pesos que pide la spec del rediseño, en su familia.
    it.each([
      ['Anton', '400'],
      ['Manrope', '400'],
      ['Manrope', '500'],
      ['Manrope', '700'],
      ['Manrope', '800'],
      ['JetBrains Mono', '400'],
      ['JetBrains Mono', '600'],
    ])('%s se carga en peso %s', (family, weight) => {
      expect(isLoaded(family, weight)).toBe(true)
    })

    it('no se carga nada más', () => {
      expect(fontImports).toHaveLength(7)
    })
  })

  // Cero peticiones a terceros: cada fuente sale de public/fonts/, en woff2,
  // y se muestra con la de respaldo mientras llega.
  describe('fuentes alojadas en el sitio', () => {
    it.each(fontFaces)('cada @font-face es local, en woff2 y con swap', (body) => {
      expect(body).toMatch(/src:\s*url\('\/fonts\/[a-z0-9-]+\.woff2'\) format\('woff2'\);/)
      expect(body).toContain('font-display: swap;')
      expect(body).not.toMatch(/https?:|\/\//)
    })

    it.each(fontFaces)('el archivo de cada @font-face existe', (body) => {
      const file = /url\('\/fonts\/([a-z0-9-]+\.woff2)'\)/.exec(body)?.[1] ?? ''

      expect(existsSync(`public/fonts/${file}`)).toBe(true)
    })

    // La OFL pide que la licencia viaje con la fuente.
    it.each(['anton', 'manrope', 'jetbrains-mono'])('la licencia de %s va junto a sus archivos', (family) => {
      expect(readFileSync(`public/fonts/OFL-${family}.txt`, 'utf8')).toContain(
        'SIL OPEN FONT LICENSE Version 1.1',
      )
    })

    it('index.html precarga Anton y Manrope, sin pedir nada a Google Fonts', () => {
      const html = readFileSync('index.html', 'utf8')

      expect(html).toContain(
        '<link rel="preload" href="/fonts/anton-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />',
      )
      expect(html).toContain(
        '<link rel="preload" href="/fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />',
      )
      expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    })
  })

  describe('nombre del Hero', () => {
    it('usa el peso más grueso', () => {
      expect(cssRule(heroCss, '.name')).toMatchObject({ 'font-weight': `var(${EXTRABOLD})` })
    })

    it('va en la fuente de texto, la que carga ese peso', () => {
      expect(cssRule(heroCss, '.name')).not.toHaveProperty('font-family')
      expect(cssToken(tokensCss, '--font-sans')).toMatch(/^'Manrope'/)
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

  describe('pesos escritos a mano', () => {
    it.each([['Hero', heroCss]])('en %s todo font-weight sale de un token', (_name, css) => {
      const weights = [...css.matchAll(/font-weight:\s*([^;]+);/g)].map(([, value]) => value)

      expect(weights.length).toBeGreaterThan(0)
      weights.forEach((value) => expect(value).toMatch(/^var\(--font-weight-[a-z]+\)$/))
    })
  })
})
