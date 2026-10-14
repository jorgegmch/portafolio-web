import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/test/contrast'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/About.module.css')
const tokensCss = readCss('src/styles/tokens.css')

/** Hasta aquí la sección va apilada; desde 1024 px, en dos columnas. */
const STACKED = '(max-width: 1023px)'
/** Hasta aquí las tarjetas van una bajo otra; por encima, las tres en fila. */
const PHONE = '(max-width: 480px)'

const AA_TEXT = 4.5

/** Contraste WCAG entre dos tokens de color de tokens.css. */
const contrast = (foreground: string, background: string) =>
  contrastRatio(cssToken(tokensCss, foreground), cssToken(tokensCss, background))

describe('About: estilos', () => {
  it('no lleva colores literales: todos salen de tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })

  it('solo usa los breakpoints del apilado y de teléfono', () => {
    expect(css.match(/@media[^{]*/g)?.map((query) => query.trim())).toEqual([
      `@media ${STACKED}`,
      `@media ${PHONE}`,
    ])
  })

  describe('sección', () => {
    // La barra es fija: al llegar por el ancla, el título no queda debajo.
    it('reserva el alto de la barra al llegar por el ancla', () => {
      expect(cssRule(css, '.about')).toMatchObject({ 'scroll-margin-top': 'var(--nav-height)' })
    })
  })

  describe('título', () => {
    it('va en el verde de la paleta', () => {
      expect(cssRule(css, '.heading')).toMatchObject({ color: 'var(--color-accent-alt)' })
    })

    // El diccionario guarda el texto normal; las mayúsculas son solo visuales.
    it('las mayúsculas las pone el CSS', () => {
      expect(cssRule(css, '.heading')).toMatchObject({ 'text-transform': 'uppercase' })
    })
  })

  describe('frase grande', () => {
    it('va en el color de texto, con su tamaño propio', () => {
      expect(cssRule(css, '.phrase')).toMatchObject({
        color: 'var(--color-text)',
        'font-size': 'var(--font-size-phrase)',
      })
    })

    it('ocupa todo el ancho: no tiene ancho máximo', () => {
      expect(cssRule(css, '.phrase')).not.toHaveProperty('max-width')
    })

    it('su tamaño va de 28 px en teléfono a 52 px en escritorio', () => {
      expect(cssToken(tokensCss, '--font-size-phrase')).toBe('clamp(1.75rem, 4vw, 3.25rem)')
    })

    it('queda entre el título de sección y el nombre del hero', () => {
      const max = (name: string) =>
        parseFloat(/,\s*([\d.]+)rem\)$/.exec(cssToken(tokensCss, name))?.[1] ?? '')

      expect(max('--font-size-phrase')).toBeGreaterThan(max('--font-size-title'))
      expect(max('--font-size-phrase')).toBeLessThan(max('--font-size-display'))
    })

    it('el resalte es el verde de la paleta, y nada más', () => {
      expect(cssRule(css, '.highlight')).toEqual({ color: 'var(--color-accent-alt)' })
    })
  })

  describe('descripción', () => {
    it('no pasa del ancho de lectura', () => {
      expect(cssRule(css, '.bio')).toMatchObject({ 'max-width': 'var(--measure)' })
    })

    it('desde 1024 px va a la izquierda, con la otra columna reservada', () => {
      expect(cssRule(css, '.columns')).toMatchObject({
        display: 'grid',
        'grid-template-columns': 'minmax(0, var(--measure)) minmax(0, 1fr)',
      })
    })

    it('hasta 1023 px todo va apilado, en una columna', () => {
      expect(cssRule(cssMedia(css, STACKED), '.columns')).toEqual({
        'grid-template-columns': 'minmax(0, 1fr)',
      })
    })
  })

  describe('terminal', () => {
    // Sin esto la rejilla la estiraría al alto de la descripción.
    it('se alinea con la parte superior de la descripción', () => {
      expect(cssRule(css, '.columns')).toMatchObject({ 'align-items': 'start' })
    })

    it('su celda no deja que el panel la ensanche', () => {
      expect(cssRule(css, '.terminal')).toEqual({ 'min-width': '0' })
    })
  })

  describe('mapa', () => {
    it('se separa de la terminal con un espacio de la escala', () => {
      expect(cssRule(css, '.map')).toEqual({ 'margin-top': 'var(--space-6)' })
    })

    // El ancho y el alto los pone WorldMap: la sección no los cambia en ningún
    // tamaño, así que el mapa conserva su proporción y no se recorta.
    it('la sección no le cambia el tamaño ni lo recorta', () => {
      const mapRules = [...css.matchAll(/\.map\s*\{([^}]*)\}/g)].map(([, body]) => body)

      expect(mapRules).toHaveLength(1)
      expect(mapRules[0]).not.toMatch(/\b(?:width|height|max-width|max-height|overflow|object-fit|aspect-ratio)\s*:/)
    })
  })

  describe('tarjetas', () => {
    const BACKGROUND = '--color-surface'
    const VALUE = '--color-accent-alt'
    const LABEL = '--color-text'

    it('van las tres en una fila, a partes iguales', () => {
      expect(cssRule(css, '.stats')).toMatchObject({
        display: 'grid',
        'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
        'list-style': 'none',
      })
    })

    it('llevan el fondo y el borde de la terminal', () => {
      const panel = cssRule(readCss('src/components/ui/TerminalPanel.module.css'), '.panel')

      expect(cssRule(css, '.stat')).toMatchObject({
        'background-color': `var(${BACKGROUND})`,
        border: '1px solid var(--color-border-strong)',
        'border-radius': 'var(--radius-md)',
      })
      expect(cssRule(css, '.stat')['background-color']).toBe(panel['background-color'])
      expect(cssRule(css, '.stat').border).toBe(panel.border)
      expect(cssRule(css, '.stat')['border-radius']).toBe(panel['border-radius'])
    })

    it('la cifra va en el verde de la paleta, con el tamaño de título', () => {
      expect(cssRule(css, '.statValue')).toMatchObject({
        color: `var(${VALUE})`,
        'font-size': 'var(--font-size-title)',
      })
    })

    it('la etiqueta va en el color de texto', () => {
      expect(cssRule(css, '.statLabel')).toMatchObject({ color: `var(${LABEL})` })
    })

    it.each([
      ['la cifra', VALUE, 14.26],
      ['la etiqueta', LABEL, 16.52],
    ])('%s cumple AA sobre el fondo de la tarjeta', (_, token, expected) => {
      expect(contrast(token, BACKGROUND)).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(token, BACKGROUND)).toBeCloseTo(expected, 1)
    })

    // Sin conteo ascendente ni otra animación: solo aparecen.
    it.each(['.stats', '.stat', '.statValue', '.statLabel'])('%s no anima nada', (selector) => {
      const properties = Object.keys(cssRule(css, selector))

      expect(properties.length).toBeGreaterThan(0)
      expect(properties.filter((property) => /^(?:transition|animation)/.test(property))).toEqual([])
    })

    it('en teléfono van una bajo otra, con la cifra y la etiqueta en la misma línea', () => {
      const phone = cssMedia(css, PHONE)

      expect(cssRule(phone, '.stats')).toEqual({ 'grid-template-columns': 'minmax(0, 1fr)' })
      expect(cssRule(phone, '.stat')).toMatchObject({
        'flex-direction': 'row',
        'align-items': 'baseline',
      })
    })

    // Decorativo, pero con contraste de sobra sobre la tarjeta.
    it('el icono va en el verde de las cifras', () => {
      expect(cssRule(css, '.statIcon')).toMatchObject({ color: `var(${VALUE})` })
      expect(contrast(VALUE, BACKGROUND)).toBeCloseTo(14.26, 1)
    })

    // La geometría real se mide en el navegador: aquí se fija la intención.
    describe('posición del icono', () => {
      it('desde 481 px, la tarjeta va en filas que se parten: cifra e icono en la primera', () => {
        expect(cssRule(css, '.stat')).toMatchObject({
          display: 'flex',
          'flex-wrap': 'wrap',
          'align-items': 'center',
        })
        expect(cssRule(css, '.stat')).not.toHaveProperty('flex-direction')
      })

      // Las tres tarjetas se estiran al alto de la más alta: sin esto, la que
      // tiene la etiqueta en una línea reparte el sobrante entre sus filas.
      it('las filas se juntan arriba aunque la tarjeta sea más alta', () => {
        expect(cssRule(css, '.stat')).toMatchObject({ 'align-content': 'flex-start' })
      })

      it('la etiqueta ocupa su propia fila', () => {
        expect(cssRule(css, '.statLabel')).toMatchObject({ 'flex-basis': '100%' })
      })

      it('va al borde derecho, centrado con la cifra, y en ningún caso a la izquierda', () => {
        expect(cssRule(css, '.statIcon')).toEqual({
          color: `var(${VALUE})`,
          'align-self': 'center',
          'margin-left': 'auto',
        })
      })

      it('en teléfono, cifra y etiqueta en una línea a la izquierda y el icono al final', () => {
        const phone = cssMedia(css, PHONE)

        expect(cssRule(phone, '.stat')).toMatchObject({ 'flex-wrap': 'nowrap' })
        expect(cssRule(phone, '.statLabel')).toEqual({ 'flex-basis': 'auto' })
        expect(cssRule(phone, '.statIcon')).toEqual({ order: '1' })
      })
    })

    it('en el apilado de tablet siguen en fila', () => {
      expect(cssRule(cssMedia(css, STACKED), '.stats')).toEqual({})
    })
  })

  describe('enlace a certificaciones', () => {
    it('es una cápsula de contorno con el alto táctil', () => {
      expect(cssRule(css, '.cta')).toMatchObject({
        'min-height': 'var(--touch-target)',
        border: '1px solid var(--color-accent-alt)',
        'border-radius': 'var(--radius-pill)',
        'background-color': 'transparent',
        color: 'var(--color-accent-alt)',
      })
    })

    it('se separa de la descripción con un espaciado de tokens', () => {
      expect(cssRule(css, '.cta')).toMatchObject({ 'margin-top': 'var(--space-6)' })
      expect(cssToken(tokensCss, '--space-6')).toBe('2rem')
    })

    it('no quita el anillo de foco', () => {
      expect(css).not.toMatch(/outline:\s*(?:none|0)/)
    })
  })
})
