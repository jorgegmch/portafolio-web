import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { portrait } from '@/assets/hero/portrait'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const MEASURE_TOKEN = '--hero-intro-measure'

describe('Hero: estilos', () => {
  describe('saludo', () => {
    it('va en mayúsculas sostenidas por CSS', () => {
      expect(cssRule(heroCss, '.greeting')).toMatchObject({ 'text-transform': 'uppercase' })
    })

    it('el espaciado de letras sale de un token', () => {
      expect(cssRule(heroCss, '.greeting')).toMatchObject({
        'letter-spacing': 'var(--tracking-wider)',
      })
      expect(cssToken(tokensCss, '--tracking-wider')).not.toBe('')
    })
  })

  describe('nombre', () => {
    it('el nombre va en el color de texto', () => {
      expect(cssRule(heroCss, '.name')).toMatchObject({ color: 'var(--color-text)' })
    })

    it('el apellido va en el verde de la paleta', () => {
      expect(cssRule(heroCss, '.lastName')).toMatchObject({ color: 'var(--color-accent-alt)' })
      expect(cssToken(tokensCss, '--color-accent-alt')).toBe('#00ff88')
    })

    it('el tamaño sale del token del nombre', () => {
      expect(cssRule(heroCss, '.name')).toMatchObject({ 'font-size': 'var(--font-size-display)' })
    })

    // Protegido: el retrato cede ancho antes de que el nombre se parta.
    it('no se parte en dos líneas', () => {
      expect(cssRule(heroCss, '.name')).toMatchObject({ 'white-space': 'nowrap' })
    })
  })

  describe('rol', () => {
    it('va en el color de texto, con peso normal', () => {
      expect(cssRule(heroCss, '.role')).toMatchObject({
        color: 'var(--color-text)',
        'font-weight': 'var(--font-weight-regular)',
      })
    })

    it('el tamaño sale de su token y es mayor que el del párrafo en cualquier pantalla', () => {
      const [, min, max] =
        /^clamp\(([\d.]+)rem, [\d.]+vw, ([\d.]+)rem\)$/.exec(cssToken(tokensCss, '--hero-role-size')) ?? []

      expect(cssRule(heroCss, '.role')).toMatchObject({ 'font-size': 'var(--hero-role-size)' })
      expect(cssRule(heroCss, '.intro')).toMatchObject({ 'font-size': 'var(--font-size-lg)' })
      expect(Number(min)).toBeGreaterThan(parseFloat(cssToken(tokensCss, '--font-size-lg')))
      expect(Number(max)).toBeGreaterThan(Number(min))
    })

    describe('cursor', () => {
      it('va en el verde de acento de la paleta', () => {
        expect(cssRule(heroCss, '.cursor')).toMatchObject({ color: 'var(--color-accent-alt)' })
      })

      it('queda pegado al rol, con una separación que sale de un token', () => {
        expect(cssRule(heroCss, '.cursor')).toMatchObject({ 'margin-left': 'var(--space-1)' })
        expect(cssRule(heroCss, '.role')).not.toHaveProperty('display')
        expect(cssRule(heroCss, '.role')).not.toHaveProperty('gap')
      })

      // No es un cursor de escritura: no parpadea ni se mueve.
      it('es fijo: ni animación ni transición', () => {
        expect(Object.keys(cssRule(heroCss, '.cursor')).sort()).toEqual(['color', 'margin-left'])
        expect(heroCss).not.toMatch(/@keyframes blink/)
        expect(cssMedia(heroCss, '(prefers-reduced-motion: reduce)')).not.toMatch(/\.cursor/)
      })

      it('no deja tokens sin uso', () => {
        expect(cssToken(tokensCss, '--hero-cursor-width')).toBe('')
        expect(cssToken(tokensCss, '--duration-cursor')).toBe('')
      })
    })

    // El rol empuja el párrafo hacia el hombro de la figura: el texto sube lo
    // que el rol ocupa, y el párrafo se queda donde estaba.
    describe('no mueve el párrafo', () => {
      it('lo que ocupa sale de su tamaño, su interlineado y su margen', () => {
        expect(cssRule(heroCss, '.role')).toMatchObject({
          'margin-top': 'var(--space-3)',
          'line-height': 'var(--leading-tight)',
        })
        expect(cssRule(heroCss, '.hero')).toMatchObject({
          '--hero-role-height':
            'calc(var(--hero-role-size) * var(--leading-tight) + var(--space-3))',
        })
      })

      it('en dos columnas el texto sube justo eso, con una sola regla', () => {
        const compact = cssMedia(heroCss, '(max-width: 1280px)')

        expect(cssRule(heroCss, '.text').padding).toMatch(
          /^calc\(var\(--hero-text-offset\) - var\(--hero-role-height\)\) /,
        )
        expect(cssRule(compact, '.text')).toEqual({})
      })
    })
  })

  describe('botones', () => {
    const phone = cssMedia(heroCss, '(max-width: 480px)')

    it('van en una fila que puede partirse, separada del párrafo', () => {
      expect(cssRule(heroCss, '.actions')).toMatchObject({
        display: 'flex',
        'flex-wrap': 'wrap',
        gap: 'var(--space-4)',
        'margin-top': 'var(--hero-space-actions)',
      })
    })

    describe('principal', () => {
      const primary = cssRule(heroCss, '.primary')

      it('tiene forma de cápsula, con un radio que sale de un token', () => {
        expect(primary).toMatchObject({ 'border-radius': 'var(--radius-pill)' })
        expect(cssToken(tokensCss, '--radius-pill')).toMatch(/^[\d.]+rem$/)
        expect(parseFloat(cssToken(tokensCss, '--radius-pill'))).toBeGreaterThanOrEqual(50)
      })

      it('va relleno con el verde de acento y texto del color de fondo', () => {
        expect(primary).toMatchObject({
          background: 'var(--color-accent-alt)',
          color: 'var(--color-bg)',
          border: '1px solid var(--color-accent-alt)',
        })
      })

      it('lleva el texto en mayúsculas por CSS, con la tipografía de tokens', () => {
        expect(primary).toMatchObject({
          'text-transform': 'uppercase',
          'font-family': 'var(--font-mono)',
          'font-size': 'var(--font-size-md)',
          'font-weight': 'var(--font-weight-medium)',
          'letter-spacing': 'var(--tracking-normal)',
          'white-space': 'nowrap',
        })
      })

      // Es un enlace con aspecto de botón: sin el subrayado de los enlaces.
      it('no va subrayado', () => {
        expect(primary).toMatchObject({ 'text-decoration': 'none' })
      })

      it('centra su texto y no baja del alto táctil', () => {
        expect(primary).toMatchObject({
          display: 'inline-flex',
          'align-items': 'center',
          'min-height': 'var(--touch-target)',
          padding: 'var(--space-3) var(--space-5)',
        })
        expect(cssToken(tokensCss, '--touch-target')).toBe('2.75rem')
      })

      // El brillo es una sombra: no ocupa sitio ni mueve nada. Su color se
      // deriva del verde de la paleta, sin escribir ninguno.
      it('lleva un brillo derivado del verde de acento', () => {
        expect(primary['box-shadow']).toBe(
          '0 0 var(--hero-cta-glow) color-mix(in srgb, var(--color-accent-alt) 35%, transparent)',
        )
        expect(cssToken(tokensCss, '--hero-cta-glow')).toMatch(/^[\d.]+rem$/)
      })

      it('bajo el puntero el brillo crece, sin cambiar nada más', () => {
        const hover = cssRule(heroCss, '.primary:hover')

        expect(Object.keys(hover)).toEqual(['box-shadow'])
        expect(hover['box-shadow']).toBe(
          '0 0 var(--hero-cta-glow-hover) color-mix(in srgb, var(--color-accent-alt) 55%, transparent)',
        )
        expect(parseFloat(cssToken(tokensCss, '--hero-cta-glow-hover'))).toBeGreaterThan(
          parseFloat(cssToken(tokensCss, '--hero-cta-glow')),
        )
      })

      // Solo se animan transform y opacity: el brillo cambia de golpe, también
      // con movimiento reducido.
      it('no lleva transición ni animación', () => {
        expect(primary).not.toHaveProperty('transition')
        expect(primary).not.toHaveProperty('animation')
      })

      it('no quita el anillo de foco', () => {
        expect(heroCss).not.toMatch(/outline\s*:/)
      })

      it('en teléfono lleva el texto de 13 px y menos relleno, con el mismo alto táctil', () => {
        expect(cssRule(phone, '.primary')).toEqual({
          padding: 'var(--space-2) var(--space-4)',
          'font-size': 'var(--font-size-sm)',
        })
      })
    })
  })

  describe('estado de disponibilidad', () => {
    const status = cssRule(heroCss, '.status')
    const dot = cssRule(heroCss, '.statusDot')

    it('va bajo los botones, con el punto y el texto en línea', () => {
      expect(status).toMatchObject({
        display: 'flex',
        'align-items': 'center',
        gap: 'var(--space-2)',
        'margin-top': 'var(--hero-space-meta)',
      })
    })

    // Con el estado, la cara quedaba 45 px más abajo en la primera pantalla.
    describe('en teléfono no se muestra', () => {
      const phone = cssMedia(heroCss, '(max-width: 480px)')

      // display: none también lo saca del árbol de accesibilidad.
      it('hasta 480 px se oculta con display, nunca con visibility ni opacity', () => {
        expect(cssRule(phone, '.status')).toEqual({ display: 'none' })
      })

      it('en los demás tramos se ve', () => {
        expect(status).not.toHaveProperty('display', 'none')
        for (const query of ['(max-width: 1280px)', '(max-width: 1023px)', '(max-width: 380px)']) {
          expect(cssRule(cssMedia(heroCss, query), '.status')).toEqual({})
        }
      })
    })

    it('el texto va en tono apagado, pequeño y en mayúsculas por CSS', () => {
      expect(status).toMatchObject({
        color: 'var(--color-text-muted)',
        'font-family': 'var(--font-mono)',
        'font-size': 'var(--font-size-sm)',
        'letter-spacing': 'var(--tracking-normal)',
        'text-transform': 'uppercase',
      })
    })

    it('el punto es un círculo del verde de acento, con el tamaño de su token', () => {
      expect(dot).toMatchObject({
        width: 'var(--hero-status-dot)',
        height: 'var(--hero-status-dot)',
        'border-radius': 'var(--radius-full)',
        background: 'var(--color-accent-alt)',
      })
      expect(cssToken(tokensCss, '--hero-status-dot')).toBe('0.625rem')
    })

    it('el punto no se encoge si el texto se parte', () => {
      expect(dot).toMatchObject({ flex: 'none' })
    })

    // El texto largo necesita 314 px de columna, que hay desde 374 px de
    // ventana; con algo de margen, hasta 380 px se muestra el corto.
    describe('texto largo y corto', () => {
      const tight = cssMedia(heroCss, '(max-width: 380px)')

      it('por defecto se ve el largo y el corto no existe', () => {
        expect(cssRule(heroCss, '.statusShort')).toEqual({ display: 'none' })
        expect(cssRule(heroCss, '.statusLong')).toEqual({})
      })

      it('hasta 380 px se ve el corto y el largo no existe', () => {
        expect(cssRule(tight, '.statusLong')).toEqual({ display: 'none' })
        expect(cssRule(tight, '.statusShort')).toEqual({ display: 'inline' })
      })

      // display: none saca el texto del árbol de accesibilidad; visibility u
      // opacity lo dejarían ocupando sitio o leyéndose dos veces.
      it('se ocultan con display, nunca con visibility ni opacity', () => {
        const rules = [cssRule(heroCss, '.statusShort'), cssRule(tight, '.statusLong')]

        for (const rule of rules) {
          expect(rule).not.toHaveProperty('visibility')
          expect(rule).not.toHaveProperty('opacity')
        }
      })

      it('solo ese tramo cambia cuál se ve', () => {
        const others = ['(max-width: 1280px)', '(max-width: 1023px)', '(max-width: 480px)']

        for (const query of others) {
          expect(cssMedia(heroCss, query)).not.toMatch(/\.status(?:Long|Short)/)
        }
      })
    })

    it('es fijo: ni animación ni transición', () => {
      for (const rule of [status, dot]) {
        expect(rule).not.toHaveProperty('animation')
        expect(rule).not.toHaveProperty('transition')
      }
    })
  })

  describe('fila de redes', () => {
    const row = cssRule(heroCss, '.social')
    const control = cssRule(heroCss, '.socialControl')
    const hover = cssRule(heroCss, '.socialControl:hover')
    const focus = cssRule(heroCss, '.socialControl:focus-visible')
    const icon = cssRule(heroCss, '.socialIcon')
    /** Todas las reglas de la fila, con su selector. */
    const socialRules = [...heroCss.matchAll(/([^{}]*social[^{}]*)\{([^}]*)\}/g)].map(
      ([, selector = '', body = '']) => ({ selector: selector.trim(), body }),
    )

    it('va bajo el estado, en fila, con 12 px entre iconos y sin viñetas', () => {
      expect(row).toMatchObject({
        display: 'flex',
        'flex-wrap': 'wrap',
        gap: 'var(--space-3)',
        'margin-top': 'var(--hero-space-meta)',
        'list-style': 'none',
      })
      expect(cssToken(tokensCss, '--space-3')).toBe('0.75rem')
    })

    it('cada control es un círculo de 44 px con el icono centrado', () => {
      expect(control).toMatchObject({
        display: 'grid',
        'place-items': 'center',
        width: 'var(--touch-target)',
        height: 'var(--touch-target)',
        'border-radius': 'var(--radius-full)',
      })
      expect(cssToken(tokensCss, '--touch-target')).toBe('2.75rem')
    })

    // Solo borde: sin relleno, sin sombra y sin brillo.
    it('solo lleva borde, de un color de la paleta, sin relleno', () => {
      expect(control).toMatchObject({
        border: '1px solid var(--color-text-subtle)',
        background: 'none',
      })
      expect(control).not.toHaveProperty('box-shadow')
      expect(control).not.toHaveProperty('background-color')
    })

    it('el botón y el enlace se ven igual: sin relleno propio y con cursor de enlace', () => {
      expect(control).toMatchObject({ padding: '0', cursor: 'pointer' })
    })

    // El puntero y el foco cambian el borde del contenedor, nunca el logo.
    it.each([
      ['bajo el puntero', hover],
      ['con el foco', focus],
    ])('%s solo cambia el color del borde, al verde de acento', (_, rule) => {
      expect(rule).toEqual({ 'border-color': 'var(--color-accent-alt)' })
    })

    // El anillo de foco es el global: aquí no se quita.
    it('no quita el anillo de foco', () => {
      socialRules.forEach(({ body }) => expect(body).not.toMatch(/outline/))
    })

    it('el icono mide 24 px y conserva su proporción, sin estirar ni recortar', () => {
      expect(icon).toEqual({
        width: 'var(--icon-size)',
        height: 'var(--icon-size)',
        'object-fit': 'contain',
      })
      expect(cssToken(tokensCss, '--icon-size')).toBe('1.5rem')
    })

    // Las marcas no dejan alterar el logo: ningún efecto, en ningún estado.
    it('ninguna regla de la fila aplica filtros, opacidad, mezclas, sombras ni transformaciones', () => {
      expect(socialRules.map(({ selector }) => selector).sort()).toEqual([
        '.social',
        '.socialControl',
        '.socialControl:focus-visible',
        '.socialControl:hover',
        '.socialIcon',
      ])
      socialRules.forEach(({ body }) =>
        expect(body).not.toMatch(
          /filter|opacity|mix-blend-mode|box-shadow|mask|transform|transition|animation|color-mix/,
        ),
      )
    })

    // Ningún selector de fuera alcanza a los iconos por etiqueta.
    it('ninguna regla del Hero apunta a img por etiqueta', () => {
      expect(heroCss).not.toMatch(/(^|[\s,>+~}])img\b[^{}]*\{/)
    })

    it('no cambia en ningún tramo: cabe igual en teléfono', () => {
      ;['1280px', '1023px', '480px', '380px'].forEach((width) =>
        expect(cssMedia(heroCss, `(max-width: ${width})`)).not.toMatch(/social/),
      )
    })
  })

  // Separación entre los bloques del texto. Donde el texto es más alto que el
  // retrato (dos columnas estrechas) o empuja la cara fuera de la primera
  // pantalla (teléfono), se aprieta; en escritorio y en tablet, no.
  describe('ritmo vertical del texto', () => {
    const ROOMY = {
      '--hero-space-intro': 'var(--space-5)',
      '--hero-space-actions': 'var(--space-6)',
      '--hero-space-meta': 'var(--space-5)',
    }
    const TIGHT = {
      '--hero-space-intro': 'var(--space-4)',
      '--hero-space-actions': 'var(--space-5)',
      '--hero-space-meta': 'var(--space-4)',
    }
    const hero = (query: string) => cssRule(cssMedia(heroCss, query), '.hero')

    it('cada bloque toma su margen de una variable de la sección', () => {
      expect(cssRule(heroCss, '.intro')).toMatchObject({ 'margin-top': 'var(--hero-space-intro)' })
      expect(cssRule(heroCss, '.actions')).toMatchObject({
        'margin-top': 'var(--hero-space-actions)',
      })
      expect(cssRule(heroCss, '.status')).toMatchObject({ 'margin-top': 'var(--hero-space-meta)' })
      expect(cssRule(heroCss, '.social')).toMatchObject({ 'margin-top': 'var(--hero-space-meta)' })
    })

    it('en escritorio: 24 px, 32 px y 24 px', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject(ROOMY)
    })

    it('hasta 1280 px, en dos columnas estrechas: 8 px menos cada uno', () => {
      expect(hero('(max-width: 1280px)')).toMatchObject(TIGHT)
    })

    it('hasta 1023 px, apilado en tablet: vuelve a los de escritorio', () => {
      expect(hero('(max-width: 1023px)')).toMatchObject(ROOMY)
    })

    it('hasta 480 px, en teléfono: de nuevo 8 px menos', () => {
      expect(hero('(max-width: 480px)')).toMatchObject(TIGHT)
    })

    it('los valores salen de la escala de espaciado', () => {
      expect(cssToken(tokensCss, '--space-4')).toBe('1rem')
      expect(cssToken(tokensCss, '--space-5')).toBe('1.5rem')
      expect(cssToken(tokensCss, '--space-6')).toBe('2rem')
    })

    it('ningún bloque fija su margen por su cuenta en un tramo', () => {
      for (const query of ['(max-width: 1280px)', '(max-width: 1023px)', '(max-width: 480px)']) {
        for (const selector of ['.intro', '.actions', '.status', '.social']) {
          expect(cssRule(cssMedia(heroCss, query), selector)).not.toHaveProperty('margin-top')
        }
      }
    })
  })

  describe('presentación', () => {
    it('va en el tono apagado de la paleta', () => {
      expect(cssRule(heroCss, '.intro')).toMatchObject({ color: 'var(--color-text-muted)' })
    })

    it('limita su ancho con un token', () => {
      expect(cssRule(heroCss, '.intro')).toMatchObject({ 'max-width': `var(${MEASURE_TOKEN})` })
      expect(cssToken(tokensCss, MEASURE_TOKEN)).toMatch(/^[\d.]+rem$/)
    })

    // Más estrecho que un párrafo normal: sus líneas quedan más lejos del
    // hombro de la figura, que es la parte más ancha.
    it('en dos columnas es más estrecha que un párrafo normal: 30rem', () => {
      expect(cssToken(tokensCss, MEASURE_TOKEN)).toBe('30rem')
      expect(parseFloat(cssToken(tokensCss, MEASURE_TOKEN))).toBeLessThan(
        parseFloat(cssToken(tokensCss, '--measure')),
      )
    })

    it('apilada conserva el ancho de un párrafo normal', () => {
      const stacked = cssMedia(heroCss, '(max-width: 1023px)')

      expect(cssRule(stacked, '.intro')).toMatchObject({ 'max-width': 'var(--measure)' })
    })
  })

  describe('sección', () => {
    // La barra es fija: sin este margen, al llegar por el ancla taparía el inicio.
    it('al llegar por su ancla no queda bajo la barra', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({
        'scroll-margin-top': 'var(--nav-height)',
      })
    })

    it('usa el mismo margen lateral que la barra y el pie', () => {
      expect(cssRule(heroCss, '.hero').padding).toContain('var(--container-padding)')
    })

    // El retrato llega hasta el borde inferior y sube hasta casi tocar la
    // barra: la sección no pone relleno ni arriba ni abajo.
    it('no deja relleno arriba ni abajo', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({ padding: '0 var(--container-padding)' })
    })

    // El texto va arriba, a la altura de la cabeza, donde la figura es
    // estrecha: más abajo, el hombro lo pisaría.
    it('el texto empieza arriba, a una distancia que sale de un token', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({ 'align-items': 'start' })
      expect(cssRule(heroCss, '.text')).toMatchObject({
        padding: 'calc(var(--hero-text-offset) - var(--hero-role-height)) 0 var(--space-4)',
      })
    })

    // Si el texto es el más alto, el Hero crece y el pelo se aleja de la
    // barra: debajo de la fila de redes quedan 16 px, no 48.
    it('bajo el texto queda poco relleno', () => {
      expect(cssToken(tokensCss, '--space-4')).toBe('1rem')
      expect(cssRule(heroCss, '.text').padding).toMatch(/ 0 var\(--space-4\)$/)
    })

    // Con el retrato más pequeño hay menos alto: el texto baja menos. La
    // distancia crece con la ventana sin escalones, para que el pelo no salte
    // al cruzar 1280 px: 80 px a 1024, 96 px a 1280 y 128 px desde 1312.
    describe('la distancia del texto al borde superior es fluida', () => {
      const REM = 16
      const FORMULA =
        /^min\((\d+)rem, max\(calc\((\d+)rem \+ \(100vw - (\d+)rem\) \* ([\d.]+)\), calc\(100vw - (\d+)rem\)\)\)$/
      const token = cssToken(tokensCss, '--hero-text-offset')
      const [, top = '', base = '', from = '', slope = '', shift = ''] = FORMULA.exec(token) ?? []
      /** La fórmula del token, en px, para un ancho de ventana. */
      const offset = (width: number) =>
        Math.min(
          Number(top) * REM,
          Math.max(
            Number(base) * REM + (width - Number(from) * REM) * Number(slope),
            width - Number(shift) * REM,
          ),
        )

      it('es una sola fórmula: un tope y dos rampas', () => {
        expect(token).toMatch(FORMULA)
        expect(token).toBe(
          'min(8rem, max(calc(5rem + (100vw - 64rem) * 0.0625), calc(100vw - 74rem)))',
        )
      })

      it.each([
        [1024, 80],
        [1152, 88],
        [1280, 96],
        [1296, 112],
        [1312, 128],
        [1440, 128],
        [1920, 128],
      ])('a %i px de ancho vale %i px', (width, expected) => {
        expect(offset(width)).toBe(expected)
      })

      // Las dos rampas se cruzan justo en 1280 px: ahí no hay salto.
      it('no salta al cruzar 1280 px', () => {
        expect(offset(1281) - offset(1280)).toBeLessThanOrEqual(1)
        expect(Number(base) * REM + (1280 - Number(from) * REM) * Number(slope)).toBe(
          1280 - Number(shift) * REM,
        )
      })

      it('nunca baja al crecer la ventana', () => {
        for (let width = 1024; width < 1920; width += 1) {
          expect(offset(width + 1)).toBeGreaterThanOrEqual(offset(width))
        }
      })

      it('ya no hay un token aparte para el tramo estrecho', () => {
        expect(tokensCss).not.toContain('--hero-text-offset-compact')
        expect(heroCss).not.toContain('--hero-text-offset-compact')
      })
    })

    // La caja del retrato invade la columna de texto por su zona transparente.
    it('el texto queda por encima de la caja del retrato', () => {
      expect(cssRule(heroCss, '.text')).toMatchObject({ position: 'relative', 'z-index': '1' })
    })
  })

  describe('retrato', () => {
    const { width, height } = portrait.aspectRatio

    // El hueco sale de la proporción declarada, no del archivo: sustituir la
    // imagen por otra de 4:5 no mueve nada.
    it('reserva la proporción que declara el módulo del retrato', () => {
      expect(cssRule(heroCss, '.portrait')).toMatchObject({
        'aspect-ratio': `${width} / ${height}`,
      })
    })

    describe('tamaño en dos columnas: lo que pide el alto de la ventana, con tope por ancho', () => {
      const hero = cssRule(heroCss, '.hero')
      const compact = cssRule(cssMedia(heroCss, '(max-width: 1280px)'), '.hero')
      /** Una fórmula partida en varias líneas, en una sola. */
      const flat = (value = '') =>
        value.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')')

      it('las medidas salen de tokens', () => {
        expect(cssToken(tokensCss, '--portrait-max-width')).toBe('46rem')
        expect(cssToken(tokensCss, '--portrait-ramp')).toBe('calc(132vw - 72.8rem)')
        expect(cssToken(tokensCss, '--portrait-share-compact')).toBe('41vw')
        expect(cssToken(tokensCss, '--portrait-head-gap')).toBe('2rem')
        expect(cssToken(tokensCss, '--portrait-head-room')).toBe('0.125')
      })

      it('el tope por ancho es el menor entre el máximo y una rampa con el ancho de la ventana', () => {
        expect(hero['--portrait-cap']).toBe('min(var(--portrait-max-width), var(--portrait-ramp))')
      })

      // Un escalón en 1280 px hacía saltar el retrato casi 170 px de un píxel
      // de ventana al siguiente, y la figura se echaba encima del nombre.
      describe('la rampa enlaza los dos tramos sin escalón', () => {
        const REM = 16
        const BREAKPOINT = 1280
        const [, slope = '', offset = ''] =
          /^calc\(([\d.]+)vw - ([\d.]+)rem\)$/.exec(cssToken(tokensCss, '--portrait-ramp')) ?? []
        const ramp = (viewport: number) => (Number(slope) / 100) * viewport - Number(offset) * REM
        const compact = (viewport: number) =>
          (parseFloat(cssToken(tokensCss, '--portrait-share-compact')) / 100) * viewport
        const maxWidth = parseFloat(cssToken(tokensCss, '--portrait-max-width')) * REM

        it('es una recta: tantos vw menos tantos rem', () => {
          expect(Number(slope)).toBeGreaterThan(0)
          expect(Number(offset)).toBeGreaterThan(0)
        })

        it('en 1280 px vale lo mismo que el tope compacto', () => {
          expect(Math.abs(ramp(BREAKPOINT) - compact(BREAKPOINT))).toBeLessThanOrEqual(1)
        })

        it('de 1280 a 1281 px el retrato no cambia más de 2 px', () => {
          expect(Math.abs(ramp(BREAKPOINT + 1) - compact(BREAKPOINT))).toBeLessThanOrEqual(2)
        })

        // A partir de ahí manda el máximo: de 1440 px en adelante nada cambia.
        it('llega al ancho máximo en 1440 px', () => {
          expect(Math.abs(ramp(1440) - maxWidth)).toBeLessThanOrEqual(1)
          expect(ramp(1439)).toBeLessThan(maxWidth)
        })

        it('crece con el ancho de la ventana', () => {
          expect(ramp(1281)).toBeLessThan(ramp(1344))
          expect(ramp(1344)).toBeLessThan(ramp(1440))
        })
      })

      // Con el párrafo en más líneas, la figura lo alcanzaría antes.
      it('desde 1280 px el tope por ancho es más bajo', () => {
        expect(compact['--portrait-cap']).toBe(
          'min(var(--portrait-max-width), var(--portrait-share-compact))',
        )
      })

      // Alto = (ventana - barra - aire sobre el pelo) / parte de la caja que
      // ocupa la figura; o el que corresponde al tope por ancho, si es menor.
      it('el alto sale de la ventana, la barra y el aire sobre el pelo', () => {
        expect(flat(hero['--portrait-height'])).toBe(
          'min(calc((100svh - var(--nav-height) - var(--portrait-head-gap)) / (1 - var(--portrait-head-room))), calc(var(--portrait-cap) * 5 / 4))',
        )
      })

      it('la proporción de esa fórmula es la del módulo del retrato', () => {
        expect(hero['--portrait-height']).toContain(`* ${height} / ${width})`)
      })

      // Así el pelo queda siempre a la misma distancia de la barra y el
      // retrato termina en el borde inferior.
      it('el alto mínimo de la sección se deriva del retrato', () => {
        expect(flat(hero['min-height'])).toBe(
          'calc(var(--portrait-height) * (1 - var(--portrait-head-room)) + var(--portrait-head-gap))',
        )
      })

      it('el retrato toma ese alto y su ancho sale de la proporción', () => {
        expect(cssRule(heroCss, '.portrait')).toMatchObject({ height: 'var(--portrait-height)' })
        expect(cssRule(heroCss, '.portrait')).not.toHaveProperty('width')
      })
    })

    it('se ancla abajo a la derecha, fuera del flujo', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({ position: 'relative' })
      expect(cssRule(heroCss, '.portrait')).toMatchObject({
        position: 'absolute',
        right: 'var(--container-padding)',
        bottom: '0',
      })
    })

    // La caja se mete en la columna de texto: no debe quedarse con los clics
    // ni con la selección. Las pastillas sí reaccionan al puntero.
    it('la caja no intercepta el puntero, las pastillas sí', () => {
      expect(cssRule(heroCss, '.portrait')).toMatchObject({ 'pointer-events': 'none' })
      expect(cssRule(heroCss, '.badge')).toMatchObject({ 'pointer-events': 'auto' })
    })

    it('la imagen llena el hueco reservado', () => {
      expect(cssRule(heroCss, '.photo')).toMatchObject({ width: '100%', height: '100%' })
    })

    // El busto termina en corte recto abajo: la máscara lo funde con el fondo
    // sin tocar el archivo. A los lados la foto es silueta: no se difumina.
    it('se desvanece solo hacia abajo con una máscara', () => {
      expect(cssRule(heroCss, '.photo')).toMatchObject({
        'mask-image': 'linear-gradient(to bottom, black 72%, transparent)',
      })
      expect(cssRule(heroCss, '.photo')['mask-image']).not.toMatch(/to (right|left)/)
      expect(cssRule(heroCss, '.photo')).not.toHaveProperty('mask-composite')
    })

    it('lleva un halo que la separa del fondo, con tokens', () => {
      expect(cssRule(heroCss, '.glow')).toMatchObject({
        filter: 'drop-shadow(0 0 var(--portrait-halo-blur) var(--color-halo))',
      })
      expect(cssToken(tokensCss, '--portrait-halo-blur')).toMatch(/^[\d.]+rem$/)
      expect(cssToken(tokensCss, '--color-halo')).toMatch(/^rgba\(/)
    })

    // La máscara recorta todo lo que sale del cuadro de la imagen. Si el halo
    // fuera de la propia imagen, se cortaría en línea recta en ese borde: va
    // en el envoltorio, que lo calcula sobre la imagen ya desvanecida.
    it('el halo va en el envoltorio y la máscara en la imagen, nunca juntos', () => {
      expect(cssRule(heroCss, '.photo')).not.toHaveProperty('filter')
      expect(cssRule(heroCss, '.photo')).toHaveProperty('mask-image')
      expect(cssRule(heroCss, '.glow')).not.toHaveProperty('mask-image')
    })

    it('el envoltorio del halo llena el hueco reservado, sin recortar', () => {
      expect(cssRule(heroCss, '.glow')).toMatchObject({ width: '100%', height: '100%' })
      expect(cssRule(heroCss, '.glow')).not.toHaveProperty('overflow')
      expect(cssRule(heroCss, '.portrait')).not.toHaveProperty('overflow')
    })

    it('es estática: ni transición, ni animación, ni reacción al puntero', () => {
      expect(cssRule(heroCss, '.photo')).not.toHaveProperty('transition')
      expect(cssRule(heroCss, '.photo')).not.toHaveProperty('animation')
      expect(cssRule(heroCss, '.glow')).not.toHaveProperty('transition')
      expect(cssRule(heroCss, '.glow')).not.toHaveProperty('animation')
      expect(heroCss).not.toMatch(/\.(?:photo|portrait):hover/)
    })
  })

  describe('pantallas estrechas', () => {
    const ALLOWED_BREAKPOINTS = ['1280px', '1024px', '1023px', '768px', '480px', '380px']
    const narrow = cssMedia(heroCss, '(max-width: 1023px)')
    const phone = cssMedia(heroCss, '(max-width: 480px)')

    // El texto nunca baja de lo que mide el nombre; la segunda columna
    // reserva el lado del retrato, que va anclado fuera del flujo.
    it('en escritorio hay dos columnas: texto y el lado del retrato', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({
        display: 'grid',
        'grid-template-columns': 'minmax(min-content, 1fr) minmax(0, 46%)',
      })
    })

    // Por debajo de 1024 px el texto ya no cabe en el alto que da el retrato:
    // en dos columnas el Hero crecía y la figura pisaba el párrafo.
    it('hasta 1023 px el retrato pasa debajo del texto, en una sola columna', () => {
      expect(cssRule(narrow, '.hero')).toMatchObject({ 'grid-template-columns': 'minmax(0, 1fr)' })
    })

    it('ya no se apila en 768 px: el tramo es uno solo, hasta 1023', () => {
      expect(cssMedia(heroCss, '(max-width: 768px)')).toBe('')
      expect(narrow).not.toBe('')
    })

    // Apilado: relleno arriba, sin alto mínimo y un hueco hasta el retrato,
    // los tres más cortos que en escritorio para que la cara entre antes.
    it('hasta 1023 px la sección lleva su relleno y su hueco, desde tokens', () => {
      expect(cssRule(narrow, '.hero')).toMatchObject({
        gap: 'var(--hero-stack-gap)',
        padding: 'var(--hero-stack-padding) var(--container-padding) 0',
        'min-height': 'auto',
      })
      expect(cssRule(narrow, '.text')).toMatchObject({ padding: '0' })
      expect(cssToken(tokensCss, '--hero-stack-padding')).toBe('4rem')
      expect(cssToken(tokensCss, '--hero-stack-gap')).toBe('2rem')
    })

    // 24 px en vez de 32 hasta el retrato: la cara entra antes.
    it('en teléfono el hueco hasta el retrato es menor', () => {
      expect(cssRule(phone, '.hero')).toMatchObject({ gap: 'var(--space-5)' })
      expect(parseFloat(cssToken(tokensCss, '--space-5'))).toBeLessThan(
        parseFloat(cssToken(tokensCss, '--hero-stack-gap')),
      )
    })

    it('en teléfono el relleno superior es aún menor', () => {
      expect(cssRule(phone, '.hero')).toMatchObject({
        'padding-top': 'var(--hero-stack-padding-phone)',
      })
      expect(cssToken(tokensCss, '--hero-stack-padding-phone')).toBe('3rem')
      expect(parseFloat(cssToken(tokensCss, '--hero-stack-padding-phone'))).toBeLessThan(
        parseFloat(cssToken(tokensCss, '--hero-stack-padding')),
      )
    })

    it('hasta 1023 px el retrato vuelve al flujo, centrado', () => {
      expect(cssRule(narrow, '.portrait')).toMatchObject({
        position: 'relative',
        right: 'auto',
        bottom: 'auto',
        height: 'auto',
        'justify-self': 'center',
      })
      expect(cssToken(tokensCss, '--portrait-width')).toBe('36rem')
    })

    // En un teléfono en horizontal, 36rem de ancho son 720 px de alto: dos
    // pantallas. El alto de la ventana también limita el retrato.
    it('apilado, el retrato también se limita por el alto de la ventana', () => {
      const { width, height } = portrait.aspectRatio

      expect(cssRule(narrow, '.portrait')).toMatchObject({
        width: `min(100%, var(--portrait-width), calc(var(--portrait-stack-height) * ${width} / ${height}))`,
      })
      expect(cssToken(tokensCss, '--portrait-stack-height')).toBe('95svh')
    })

    it('el comentario de tokens.css lista los mismos breakpoints', () => {
      const header = readFileSync('src/styles/tokens.css', 'utf8').split('*/')[0] ?? ''
      const listed = [...header.matchAll(/^ \*\s+(\d+px)\b/gm)].map(([, value]) => value)

      expect(listed).toEqual(ALLOWED_BREAKPOINTS)
    })

    it('solo usa los breakpoints de tokens.css, siempre con max-width', () => {
      const queries = [...heroCss.matchAll(/@media \(([a-z-]+): ([^)]+)\)/g)]
        .filter(([, feature]) => feature !== 'prefers-reduced-motion')
        .map(([, feature = '', value = '']) => ({ feature, value }))

      expect(queries.length).toBeGreaterThan(0)
      queries.forEach(({ feature, value }) => {
        expect(feature).toBe('max-width')
        expect(ALLOWED_BREAKPOINTS).toContain(value)
      })
    })
  })

  describe('reglas de estilos', () => {
    // La paleta vive en tokens.css: ni el CSS ni el componente escriben un color.
    it.each(['src/components/sections/Hero.module.css', 'src/components/sections/Hero.tsx'])(
      'no hay colores escritos a mano en %s',
      (path) => {
        const source = readFileSync(path, 'utf8')

        expect(source).not.toBe('')
        expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
      },
    )

    // Los breakpoints de @media van literales: CSS no admite variables ahí. Y
    // 1px, el grosor de un borde, no necesita variable (regla de estilos).
    it('no hay medidas sueltas en px ni en rem, salvo los breakpoints y 1px', () => {
      const withoutMediaQueries = heroCss.replace(/@media[^{]*\{/g, '')
      const withoutHairlines = withoutMediaQueries.replace(/(?<![\d.])1px\b/g, '')

      expect(heroCss).toMatch(/@media/)
      expect(withoutHairlines).not.toMatch(/\d(?:px|rem|em)\b/)
    })
  })
})
