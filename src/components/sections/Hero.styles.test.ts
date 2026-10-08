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

    // El retrato llega hasta el borde inferior: su desvanecido se funde con
    // lo que venga debajo, sin hueco.
    it('no deja relleno debajo', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({
        padding: 'var(--space-9) var(--container-padding) 0',
      })
    })

    // El relleno que pierde la sección lo lleva el texto, que así sigue
    // centrado en la misma franja.
    it('la columna de texto compensa ese relleno', () => {
      expect(cssRule(heroCss, '.text')).toMatchObject({ 'padding-bottom': 'var(--space-9)' })
      expect(cssRule(heroCss, '.hero')).toMatchObject({ 'align-items': 'center' })
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

    it('su ancho máximo sale de un token: 36rem', () => {
      expect(cssRule(heroCss, '.hero')['grid-template-columns']).toContain('var(--portrait-width)')
      expect(cssToken(tokensCss, '--portrait-width')).toBe('36rem')
    })

    it('se ancla al borde inferior de la sección', () => {
      expect(cssRule(heroCss, '.portrait')).toMatchObject({ 'align-self': 'end' })
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

    // El texto nunca baja de lo que mide el nombre; el retrato ocupa hasta su
    // ancho o el 46 % de la fila, y cede si el nombre lo necesita.
    it('en escritorio hay dos columnas: texto y retrato', () => {
      expect(cssRule(heroCss, '.hero')).toMatchObject({
        display: 'grid',
        'grid-template-columns':
          'minmax(min-content, 1fr) minmax(0, min(var(--portrait-width), 46%))',
      })
    })

    it('hasta 768 px el retrato pasa debajo del texto, en una sola columna', () => {
      expect(cssRule(narrow, '.hero')).toMatchObject({ 'grid-template-columns': 'minmax(0, 1fr)' })
    })

    // Apilado, el hueco entre el texto y el retrato ya lo da la separación de la rejilla.
    it('hasta 768 px el texto no añade relleno debajo', () => {
      expect(cssRule(narrow, '.text')).toMatchObject({ 'padding-bottom': '0' })
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
