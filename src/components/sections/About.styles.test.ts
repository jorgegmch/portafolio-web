import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/test/contrast'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/About.module.css')
const tokensCss = readCss('src/styles/tokens.css')

/** Hasta aquí la sección va apilada; desde 1024 px, en dos columnas. */
const STACKED = '(max-width: 1023px)'
/** Hasta aquí las tarjetas van una bajo otra; por encima, las tres en fila. */
const PHONE = '(max-width: 480px)'
/** Dispositivos con puntero que puede quedarse encima: ratón o trackpad. */
const HOVER = '(hover: hover)'

const AA_TEXT = 4.5

/** Contraste WCAG entre dos tokens de color de tokens.css. */
const contrast = (foreground: string, background: string) =>
  contrastRatio(cssToken(tokensCss, foreground), cssToken(tokensCss, background))

describe('About: estilos', () => {
  it('no lleva colores literales: todos salen de tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })

  // (hover: hover) no es un breakpoint: dice si hay puntero de verdad.
  it('solo usa los breakpoints del apilado y de teléfono, y el media de puntero', () => {
    expect(css.match(/@media[^{]*/g)?.map((query) => query.trim())).toEqual([
      `@media ${STACKED}`,
      `@media ${PHONE}`,
      `@media ${HOVER}`,
    ])
  })

  // Las tarjetas y la terminal se elevan bajo el puntero, como las pastillas
  // del Hero: solo transform, con la duración de los tokens.
  describe('elevación bajo el puntero', () => {
    const LIFTED = ['.stat', '.panel']
    /** El CSS sin el bloque de (hover: hover). */
    const outsideHover = css.replace(/@media \(hover: hover\)\s*\{(?:[^{}]*\{[^}]*\})*\s*\}/, '')

    it.each(LIFTED)('%s se eleva escalando con --lift-scale, solo donde hay puntero', (selector) => {
      expect(cssRule(cssMedia(css, HOVER), `${selector}:hover`)).toEqual({
        transform: 'scale(var(--lift-scale))',
      })
    })

    // La duración sale del token: con movimiento reducido pasa a 0,01 ms.
    it.each(LIFTED)('%s anima solo transform, con la duración y el easing de los tokens', (selector) => {
      expect(cssRule(css, selector)).toMatchObject({
        transition: 'transform var(--duration-fast) var(--ease-standard)',
      })
    })

    // En táctil, :hover se queda pegado tras tocar.
    it('fuera de (hover: hover) no se eleva nada', () => {
      expect(outsideHover).not.toMatch(/\.(?:stat|panel|terminal|map)\b[^{]*:hover/)
      expect(cssMedia(css, HOVER).match(/[^{}]+\{/g)?.map((selector) => selector.trim())).toEqual([
        '.stat:hover {',
        '.panel:hover {',
      ])
    })

    it('ni el mapa ni su celda se elevan', () => {
      expect(css).not.toMatch(/\.(?:map|terminal)\b[^{]*:hover/)
    })

    it('el factor es un token propio, menor que el de las pastillas del Hero', () => {
      const lift = Number(cssToken(tokensCss, '--lift-scale'))

      expect(lift).toBe(1.03)
      expect(lift).toBeGreaterThan(1)
      expect(lift).toBeLessThan(Number(cssToken(tokensCss, '--hero-badge-scale')))
    })
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
        'grid-template-columns': 'minmax(0, var(--about-text-width)) minmax(0, 1fr)',
      })
    })

    // Entre 1024 y 1280 px la columna de texto crece con la ventana: a 1024
    // deja a la terminal sitio para el nombre en dos líneas como mucho, y en
    // 1280 llega al ancho de lectura sin saltos al cruzar ningún ancho.
    describe('ancho de la columna de texto', () => {
      const PX_PER_REM = 16
      const formula = cssToken(tokensCss, '--about-text-width')
      const ramp =
        /^min\(var\(--measure\), calc\(([\d.]+)rem \+ \(100vw - ([\d.]+)rem\) \* ([\d.]+)\)\)$/.exec(formula)
      const measurePx = parseFloat(cssToken(tokensCss, '--measure')) * PX_PER_REM
      /** Ancho de la columna, en px, con la ventana de ese ancho. */
      const widthAt = (viewport: number) => {
        const [, base = 'NaN', start = 'NaN', slope = 'NaN'] = ramp ?? []
        const rampPx = Number(base) * PX_PER_REM + (viewport - Number(start) * PX_PER_REM) * Number(slope)
        return Math.min(measurePx, rampPx)
      }

      // min(var(--measure), calc(<base>rem + (100vw - <inicio>rem) * <pendiente>))
      it('es una rampa con tope en el ancho de lectura', () => {
        expect(ramp).not.toBeNull()
      })

      it('empieza donde acaba el apilado: en 1024 px', () => {
        expect(Number(ramp?.[2]) * PX_PER_REM).toBe(1024)
      })

      it('a 1024 px mide 30rem (480 px)', () => {
        expect(widthAt(1024)).toBeCloseTo(30 * PX_PER_REM, 6)
      })

      it('a 1280 px llega a --measure (576 px), y no antes', () => {
        expect(measurePx).toBe(576)
        expect(widthAt(1280)).toBeCloseTo(measurePx, 6)
        expect(widthAt(1279)).toBeLessThan(measurePx)
      })

      it('por encima de 1280 px no pasa de --measure', () => {
        expect(widthAt(1281)).toBe(measurePx)
        expect(widthAt(1920)).toBe(measurePx)
        expect(formula.startsWith('min(var(--measure),')).toBe(true)
      })

      // Lo mismo por cada píxel de ventana: de 480 a 576 px en 256 px.
      it('crece sin escalones entre 1024 y 1280 px', () => {
        const step = (measurePx - 30 * PX_PER_REM) / (1280 - 1024)
        for (let viewport = 1024; viewport < 1280; viewport++) {
          expect(widthAt(viewport + 1) - widthAt(viewport)).toBeCloseTo(step, 6)
        }
      })

      // Apilado hay una sola columna: la rampa no se usa.
      it('no se aplica en el apilado', () => {
        expect(cssMedia(css, STACKED)).not.toContain('--about-text-width')
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

    // Apilada, la celda (terminal y mapa juntos) no pasa del ancho de la
    // descripción: los tres bloques comparten ancho y el mapa no domina.
    it('apilada, su celda no pasa del ancho de lectura', () => {
      expect(cssRule(cssMedia(css, STACKED), '.terminal')).toEqual({ 'max-width': 'var(--measure)' })
    })

    // En dos columnas la celda ocupa lo que le deja la rejilla.
    it('el tope solo existe en el apilado', () => {
      const terminalRules = [...css.matchAll(/\.terminal\s*\{([^}]*)\}/g)].map(([, body = '']) => body)
      const capped = terminalRules.filter((body) => /max-width\s*:/.test(body))

      expect(capped).toHaveLength(1)
      expect(cssMedia(css, STACKED)).toContain(capped[0] ?? 'sin tope')
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

    // El <li> es el que aparece al entrar en pantalla; la caja va dentro y lo
    // llena, así que las tres cajas miden lo mismo, como cuando la caja era
    // el <li>. El <li> no escala: eso lo hace la caja.
    it('el <li> es una rejilla de una celda que estira la caja, y nada más', () => {
      expect(cssRule(css, '.statItem')).toEqual({
        display: 'grid',
        'grid-template-columns': 'minmax(0, 1fr)',
      })
      expect(css).not.toMatch(/\.statItem\b[^{]*:hover/)
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
    it.each(['.stats', '.stat', '.statValue', '.statLabel'])('%s no lleva animaciones', (selector) => {
      const properties = Object.keys(cssRule(css, selector))

      expect(properties.length).toBeGreaterThan(0)
      expect(properties.filter((property) => /^animation/.test(property))).toEqual([])
    })

    it.each(['.stats', '.statValue', '.statLabel'])('%s no lleva transiciones', (selector) => {
      expect(Object.keys(cssRule(css, selector)).filter((property) => /^transition/.test(property))).toEqual([])
    })

    // La única transición de la tarjeta es la de la elevación bajo el puntero.
    it('la tarjeta solo lleva la transición de la elevación', () => {
      const rule = cssRule(css, '.stat')

      expect(Object.keys(rule).filter((property) => /^transition/.test(property))).toEqual(['transition'])
      expect(rule.transition).toBe('transform var(--duration-fast) var(--ease-standard)')
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
