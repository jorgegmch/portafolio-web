import { describe, expect, it } from 'vitest'
import { portrait } from '@/assets/hero/portrait'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const MEASURE_TOKEN = '--measure'

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

  describe('presentación', () => {
    it('limita su ancho con un token', () => {
      expect(cssRule(heroCss, '.intro')).toMatchObject({ 'max-width': `var(${MEASURE_TOKEN})` })
      expect(cssToken(tokensCss, MEASURE_TOKEN)).toMatch(/^[\d.]+rem$/)
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
        padding: 'var(--hero-text-offset) 0 var(--space-7)',
      })
      expect(cssToken(tokensCss, '--hero-text-offset')).toMatch(/^[\d.]+rem$/)
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
        expect(cssToken(tokensCss, '--portrait-share')).toBe('54vw')
        expect(cssToken(tokensCss, '--portrait-share-compact')).toBe('43vw')
        expect(cssToken(tokensCss, '--portrait-head-gap')).toBe('2rem')
        expect(cssToken(tokensCss, '--portrait-head-room')).toBe('0.125')
      })

      it('el tope por ancho es el menor entre el máximo y una parte de la ventana', () => {
        expect(hero['--portrait-cap']).toBe('min(var(--portrait-max-width), var(--portrait-share))')
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
    const ALLOWED_BREAKPOINTS = ['1280px', '1024px', '768px', '480px']
    const narrow = cssMedia(heroCss, '(max-width: 768px)')

    // El texto nunca baja de lo que mide el nombre; la segunda columna
    // reserva el lado del retrato, que va anclado fuera del flujo.
    it('en escritorio hay dos columnas: texto y el lado del retrato', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({
        display: 'grid',
        'grid-template-columns': 'minmax(min-content, 1fr) minmax(0, 46%)',
      })
    })

    it('hasta 768 px el retrato pasa debajo del texto, en una sola columna', () => {
      expect(cssRule(narrow, '.hero')).toMatchObject({ 'grid-template-columns': 'minmax(0, 1fr)' })
    })

    // El apilado conserva su diseño: relleno arriba, sin alto mínimo y el
    // hueco hasta el retrato que da la separación de la rejilla.
    it('hasta 768 px la sección vuelve a su relleno y el texto no añade ninguno', () => {
      expect(cssRule(narrow, '.hero')).toMatchObject({
        padding: 'var(--space-9) var(--container-padding) 0',
        'min-height': 'auto',
      })
      expect(cssRule(narrow, '.text')).toMatchObject({ padding: '0' })
    })

    it('hasta 768 px el retrato vuelve al flujo, con su ancho de siempre', () => {
      expect(cssRule(narrow, '.portrait')).toMatchObject({
        position: 'relative',
        right: 'auto',
        bottom: 'auto',
        width: 'min(100%, var(--portrait-width))',
        height: 'auto',
        'justify-self': 'center',
      })
      expect(cssToken(tokensCss, '--portrait-width')).toBe('36rem')
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
    it('no hay colores escritos a mano', () => {
      expect(heroCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    })

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
