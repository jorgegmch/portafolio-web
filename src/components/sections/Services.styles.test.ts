import { describe, expect, it } from 'vitest'
import { cssMedia, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/Services.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const HOVER = '(hover: hover)'
const TABLET = '(max-width: 1023px)'
const PHONE = '(max-width: 480px)'

/** Declaraciones de la regla con exactamente ese selector (escapado entero). */
const rule = (source: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const body = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? ''
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

/** El CSS sin los bloques @media. */
const outsideMedia = () => css.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/g, '')

const LIFT = 'scale(var(--lift-scale))'

describe('Services: estilos', () => {
  it('la barra fija no tapa el título al llegar por el ancla', () => {
    expect(rule(css, '.services')).toMatchObject({ 'scroll-margin-top': 'var(--nav-height)' })
  })

  // Seis tarjetas: filas completas en los tres tramos, sin nada que centrar.
  describe('rejilla de tarjetas', () => {
    it('desde 1024 px, tres columnas (3 + 3)', () => {
      expect(rule(css, '.cards')).toMatchObject({ 'grid-template-columns': 'repeat(3, minmax(0, 1fr))' })
    })

    it('de 481 a 1023 px, dos columnas (2 + 2 + 2)', () => {
      expect(rule(cssMedia(css, TABLET), '.cards')).toMatchObject({
        'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
      })
    })

    it('en teléfono, una columna', () => {
      expect(rule(cssMedia(css, PHONE), '.cards')).toMatchObject({ 'grid-template-columns': 'minmax(0, 1fr)' })
    })

    it('sin :nth-child ni span en las tarjetas', () => {
      expect(css).not.toMatch(/\.cardItem:nth-child/)
      expect(css).not.toMatch(/grid-column\s*:[^;]*span/)
    })
  })

  describe('fichas de tecnologías', () => {
    const DESKTOP_SMALL = '(max-width: 1280px)'
    const TABLET_PORTRAIT = '(max-width: 768px)'

    /** Ancho de ficha para n columnas: (100% - (n-1) huecos) / n. */
    const basis = (columns: number) => `0 0 calc((100% - ${columns - 1} * var(--space-4)) / ${columns})`

    // Filas que se envuelven y se centran: la última, incompleta, queda en
    // medio, como las tarjetas de arriba.
    it('van en filas que se envuelven y se centran, sin rejilla auto-fill', () => {
      expect(rule(css, '.techList')).toMatchObject({
        display: 'flex',
        'flex-wrap': 'wrap',
        'justify-content': 'center',
        gap: 'var(--space-4)',
      })
      expect(css).not.toMatch(/auto-fill|auto-fit/)
    })

    // El ancho es un porcentaje del contenedor menos los huecos, con el mismo
    // hueco que la lista: no hay anchos fijos que un redondeo pueda desbordar.
    it.each([
      { tramo: 'escritorio, por encima de 1280 px', source: css, columns: 8 },
      { tramo: 'hasta 1280 px', source: cssMedia(css, DESKTOP_SMALL), columns: 6 },
      { tramo: 'hasta 1023 px', source: cssMedia(css, TABLET), columns: 4 },
      { tramo: 'hasta 768 px', source: cssMedia(css, TABLET_PORTRAIT), columns: 3 },
      { tramo: 'teléfono, hasta 480 px', source: cssMedia(css, PHONE), columns: 2 },
    ])('$tramo: $columns columnas', ({ source, columns }) => {
      expect(rule(source, '.techItem')).toMatchObject({ flex: basis(columns) })
    })
  })

  describe('hover y foco', () => {
    // En táctil, :hover se queda pegado tras tocar.
    it('las tarjetas y las fichas escalan solo con puntero de verdad', () => {
      const hover = cssMedia(css, HOVER)

      expect(rule(hover, '.card:hover')).toEqual({ transform: LIFT })
      expect(rule(hover, '.chip:hover')).toEqual({ transform: LIFT })
    })

    it('fuera de (hover: hover) no hay ningún :hover', () => {
      expect(outsideMedia()).not.toMatch(/:hover/)
      expect(cssMedia(css, TABLET)).not.toMatch(/:hover/)
      expect(cssMedia(css, PHONE)).not.toMatch(/:hover/)
    })

    // Con teclado, la misma respuesta que con el puntero, en cualquier pantalla.
    it('las tarjetas con enlace escalan igual al recibir el foco de teclado', () => {
      expect(rule(css, '.card:focus-visible')).toEqual({ transform: LIFT })
    })

    it('solo se transiciona transform, nunca all', () => {
      const transitions = [...css.matchAll(/transition:\s*([^;]+);/g)].map(([, value]) => value)

      expect(transitions.length).toBeGreaterThan(0)
      transitions.forEach((value) => {
        expect(value).toMatch(/^transform\s/)
        expect(value).not.toMatch(/\ball\b/)
      })
    })

    it('no declara animaciones propias', () => {
      expect(css).not.toMatch(/@keyframes|animation\s*:/)
    })
  })

  describe('logos de las fichas', () => {
    it('miden lo que dice su propio token, sin filtros, opacidad ni mezclas', () => {
      const logo = rule(css, '.chipLogo')

      expect(logo).toMatchObject({ width: 'var(--stack-logo-size)', height: 'var(--stack-logo-size)' })
      expect(Object.keys(logo)).not.toEqual(expect.arrayContaining(['filter']))
      expect(css).not.toMatch(/\bfilter\s*:|\bopacity\s*:|mix-blend-mode/)
    })
  })

  describe('tokens', () => {
    it('todos los tokens que usa existen en tokens.css', () => {
      const used = [...css.matchAll(/var\((--[\w-]+)\)/g)].map(([, name]) => name)

      expect(used.length).toBeGreaterThan(0)
      used.forEach((name) => expect(tokensCss).toContain(`${name}:`))
    })

    it('no lleva colores literales', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
    })

    it('cada color sale de un token', () => {
      const colors = [...css.matchAll(/(?:^|[\s;{])(?:color|background-color|border-color)\s*:\s*([^;]+);/g)]

      expect(colors.length).toBeGreaterThan(0)
      colors.forEach(([, value]) => expect(value).toMatch(/^var\(--color-[\w-]+\)$/))
    })
  })
})
