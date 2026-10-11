import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const tokensCss = readCss('src/styles/tokens.css')
const heroCss = readCss('src/components/sections/Hero.module.css')

const START = '--container-padding-start'
const SHIFT = '--container-shift'
const REM = 16
/** Hasta aquí la página va apilada y sus dos márgenes son iguales. */
const STACKED_UNTIL = 1023
/** Suelo del margen izquierdo en dos columnas, en px. */
const FLOOR = 48

/** Una fórmula partida en varias líneas, en una sola. */
const flat = (value = '') => value.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')')

/** Todo lo que comparte el borde izquierdo de la página, con su relleno vertical. */
const CONSUMERS = [
  ['la barra', 'src/components/layout/Navbar.module.css', '.nav', 'var(--space-3)'],
  ['el Hero', 'src/components/sections/Hero.module.css', '.hero', '0'],
  ['el pie', 'src/components/layout/Footer.module.css', '.footer', 'var(--space-5)'],
  ['Certificaciones', 'src/pages/CertificationsPage.module.css', '.page', 'var(--space-9)'],
] as const

const FORMULA =
  /^calc\(var\(--container-padding\) - clamp\(0rem, calc\(\(100vw - (\d+)rem\) \* ([\d.]+)\), var\(--container-shift\)\)\)$/
const [, from = '', slope = ''] = FORMULA.exec(flat(cssToken(tokensCss, START))) ?? []

const vw = (name: string, css = tokensCss) => parseFloat(cssToken(css, name)) / 100
const rem = (name: string) => parseFloat(cssToken(tokensCss, name)) * REM

/** --container-padding en px, para un ancho de página. */
const sidePadding = (width: number, gutter = vw('--container-gutter')) =>
  Math.max(gutter * width, (width - rem('--container-max')) / 2)
/** Lo que el contenido se acerca a la izquierda, en px. */
const shift = (width: number) =>
  Math.min(rem(SHIFT), Math.max(0, (width - Number(from) * REM) * Number(slope)))
/** Margen izquierdo en px: apilado es el lateral; en dos columnas, el lateral menos el desplazamiento. */
const startPadding = (width: number) =>
  width <= STACKED_UNTIL ? sidePadding(width) : sidePadding(width) - shift(width)

describe('contenedor: borde izquierdo en dos columnas', () => {
  describe('token', () => {
    it('es el margen lateral menos un desplazamiento que crece con la ventana', () => {
      expect(flat(cssToken(tokensCss, START))).toBe(
        `calc(var(--container-padding) - clamp(0rem, calc((100vw - 64rem) * 0.25), var(${SHIFT})))`,
      )
    })

    it('el desplazamiento completo es de 2rem', () => {
      expect(cssToken(tokensCss, SHIFT)).toBe('2rem')
    })

    // La rampa arranca donde empiezan las dos columnas y termina en 1152 px.
    it('la rampa va de 1024 a 1152 px', () => {
      expect(Number(from) * REM).toBe(STACKED_UNTIL + 1)
      expect(Number(from) * REM + rem(SHIFT) / Number(slope)).toBe(1152)
      expect(shift(1024)).toBe(0)
      expect(shift(1151)).toBeLessThan(rem(SHIFT))
      expect(shift(1152)).toBe(rem(SHIFT))
      expect(shift(1920)).toBe(rem(SHIFT))
    })

    // El borde derecho no se mueve: su token sigue siendo el de siempre.
    it('el margen lateral de la derecha no cambia', () => {
      expect(flat(cssToken(tokensCss, '--container-padding'))).toBe(
        'max(var(--container-gutter), calc((100% - var(--container-max)) / 2))',
      )
      expect(cssToken(tokensCss, '--container-gutter')).toBe('8vw')
    })

    // Apilado no hay retrato al lado: los dos lados vuelven a ser iguales.
    it('hasta 1023 px vuelve a ser el margen lateral, sin desplazar', () => {
      const stacked = cssMedia(tokensCss, `(max-width: ${STACKED_UNTIL}px)`)

      expect(cssRule(stacked, ':root')).toEqual({ [START]: 'var(--container-padding)' })
    })

    it('ningún otro tramo lo redefine', () => {
      expect(tokensCss.match(new RegExp(`${START}:`, 'g'))).toHaveLength(2)
      expect(tokensCss.match(new RegExp(`${SHIFT}:`, 'g'))).toHaveLength(1)
    })

    // Con la rampa, un mínimo aparte no llegaría a actuar.
    it('no hay un token de margen mínimo', () => {
      expect(tokensCss).not.toContain('--container-start-min')
    })
  })

  describe('medidas', () => {
    it.each([
      [1024, 81.92],
      [1088, 71.04],
      [1152, 60.16],
      [1280, 70.4],
      [1440, 83.2],
      [1920, 288],
    ])('a %i px el margen izquierdo es de %f px', (width, expected) => {
      expect(startPadding(width)).toBeCloseTo(expected, 2)
    })

    // Sin la rampa, el logo y el texto saltaban 32 px al pasar a dos columnas.
    it('no salta al pasar de 1023 a 1024 px', () => {
      expect(Math.abs(startPadding(1024) - startPadding(1023))).toBeLessThanOrEqual(1)
    })

    it('de 1015 a 1160 px no cambia más de 1 px por cada px de ventana', () => {
      for (let width = 1015; width < 1160; width += 1) {
        expect(Math.abs(startPadding(width + 1) - startPadding(width)), `${width}`).toBeLessThanOrEqual(1)
      }
    })

    // 48 px es lo que deja una tablet de 768 px: el escritorio nunca deja menos.
    it('de 1024 a 1920 px nunca baja de 48 px', () => {
      const tabletGutter = vw('--container-gutter', cssMedia(tokensCss, '(max-width: 768px)'))

      expect(FLOOR).toBeGreaterThanOrEqual(sidePadding(768, tabletGutter))
      for (let width = 1024; width <= 1920; width += 1) {
        expect(startPadding(width), `${width}`).toBeGreaterThanOrEqual(FLOOR)
      }
    })

    it('su punto más bajo es de 60 px, a 1152 px', () => {
      const widths = Array.from({ length: 1920 - 1024 + 1 }, (_, i) => 1024 + i)
      const lowest = widths.reduce((a, b) => (startPadding(b) < startPadding(a) ? b : a))

      expect(lowest).toBe(1152)
      expect(startPadding(lowest)).toBeCloseTo(60.16, 2)
    })

    it('nunca supera al margen derecho, y desde 1152 px queda 2rem por debajo', () => {
      for (let width = 1024; width <= 2560; width += 1) {
        expect(startPadding(width)).toBeLessThanOrEqual(sidePadding(width))
        if (width >= 1152) expect(sidePadding(width) - startPadding(width)).toBe(rem(SHIFT))
      }
    })
  })

  describe('quién lo usa', () => {
    it.each(CONSUMERS)('%s lo aplica solo a la izquierda', (_, path, selector, vertical) => {
      const rule = cssRule(readCss(path), selector)

      expect(rule).toMatchObject({
        padding: `${vertical} var(--container-padding)`,
        'padding-left': `var(${START})`,
      })
      expect(rule).not.toHaveProperty('padding-right')
    })

    // Si el relleno izquierdo fuera delante, el atajo `padding` lo pisaría.
    it.each(CONSUMERS)('en %s va después del relleno general', (_, path, selector) => {
      const css = readCss(path)
      const body = new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''

      expect(body.indexOf('padding-left:')).toBeGreaterThan(body.indexOf('padding:'))
    })

    it('nadie más lo usa, y nadie repite el desplazamiento', () => {
      CONSUMERS.forEach(([, path]) => {
        const css = readCss(path)

        expect(css.match(new RegExp(`var\\(${START}\\)`, 'g')), path).toHaveLength(1)
        expect(css, path).not.toContain(SHIFT)
      })
    })

    // El retrato sigue anclado al borde derecho de siempre.
    it('el retrato del Hero no se mueve', () => {
      expect(cssRule(heroCss, '.portrait')).toMatchObject({ right: 'var(--container-padding)' })
    })

    // Apilado, el atajo `padding` del tramo devuelve el Hero a sus dos
    // márgenes iguales.
    it('el Hero apilado conserva sus dos márgenes iguales', () => {
      const stacked = cssRule(cssMedia(heroCss, `(max-width: ${STACKED_UNTIL}px)`), '.hero')

      expect(stacked).toMatchObject({
        padding: 'var(--hero-stack-padding) var(--container-padding) 0',
      })
      expect(stacked).not.toHaveProperty('padding-left')
    })
  })
})
