import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/CvDownload.module.css')

describe('CvDownload: estilos', () => {
  it('no lleva colores literales: todos salen de tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })

  it('solo usa los breakpoints de teléfono y de teléfono estrecho', () => {
    expect(css.match(/@media[^{]*/g)?.map((query) => query.trim())).toEqual([
      '@media (max-width: 480px)',
      '@media (max-width: 380px)',
    ])
  })

  describe('texto corto', () => {
    const narrow = cssMedia(css, '(max-width: 380px)')

    it('por defecto se ve el largo y el corto no existe', () => {
      expect(cssRule(css, '.labelShort')).toEqual({ display: 'none' })
      expect(cssRule(css, '.labelLong')).toEqual({})
    })

    // Con display: none el oculto tampoco existe para un lector de pantalla.
    it('hasta 380 px se cambian: sale el corto y el largo deja de existir', () => {
      expect(cssRule(narrow, '.labelLong')).toEqual({ display: 'none' })
      expect(cssRule(narrow, '.labelShort')).toEqual({ display: 'inline' })
    })

    it('el botón no cambia de tamaño de letra ni de relleno en ese corte', () => {
      expect(cssRule(narrow, '.toggle')).toEqual({})
    })
  })

  // Segundo en la fila y más estrecho que la lista: a la izquierda se saldría de la pantalla.
  it('en teléfono la lista se alinea al borde derecho del control', () => {
    expect(cssRule(cssMedia(css, '(max-width: 480px)'), '.list')).toEqual({
      right: '0',
      left: 'auto',
    })
  })

  it('el control es una cápsula de contorno con el alto táctil', () => {
    expect(cssRule(css, '.toggle')).toMatchObject({
      'min-height': 'var(--touch-target)',
      border: '1px solid var(--color-accent-alt)',
      'border-radius': 'var(--radius-pill)',
      'background-color': 'transparent',
      color: 'var(--color-accent-alt)',
    })
  })

  it('el texto del control no se parte', () => {
    expect(cssRule(css, '.toggle')).toMatchObject({ 'white-space': 'nowrap' })
  })

  describe('flecha del menú', () => {
    it('se separa del texto con un espacio de la escala', () => {
      expect(cssRule(css, '.toggle')).toMatchObject({ gap: 'var(--space-2)' })
    })

    it('sigue el tamaño y el color del texto, con el trazo de los iconos', () => {
      expect(cssRule(css, '.caret')).toMatchObject({
        width: '1em',
        height: '1em',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 'var(--icon-stroke-width)',
      })
    })

    // La duración sale de un token que tokens.css anula con prefers-reduced-motion.
    it('solo anima transform, con la duración de tokens', () => {
      expect(cssRule(css, '.caret')).toMatchObject({
        transition: 'transform var(--duration-fast) var(--ease-standard)',
      })
      expect(css.match(/transition\s*:/g)).toHaveLength(1)
    })

    it('gira media vuelta con el menú abierto', () => {
      expect(css).toMatch(
        /\.toggle\[aria-expanded='true'\] \.caret\s*\{\s*transform:\s*rotate\(180deg\);\s*\}/,
      )
    })

    it('la duración se anula con prefers-reduced-motion en tokens.css', () => {
      const tokens = readCss('src/styles/tokens.css')

      expect(cssMedia(tokens, '(prefers-reduced-motion: reduce)')).toMatch(/--duration-fast:\s*0\.01ms;/)
    })
  })

  it('la lista flota bajo el control, sin empujar el contenido', () => {
    expect(cssRule(css, '.root')).toMatchObject({ position: 'relative' })
    expect(cssRule(css, '.list')).toMatchObject({
      position: 'absolute',
      top: 'calc(100% + var(--space-2))',
      left: '0',
    })
  })

  // El atributo hidden deja de ocultar si la regla fija un display.
  it('la lista no fija display, para que hidden la oculte', () => {
    expect(cssRule(css, '.list')).not.toHaveProperty('display')
  })

  it('cada enlace de la lista tiene el alto táctil', () => {
    expect(cssRule(css, '.option')).toMatchObject({
      display: 'flex',
      'min-height': 'var(--touch-target)',
    })
  })

  it('no quita el anillo de foco', () => {
    expect(css).not.toMatch(/outline\s*:/)
  })

  it('en teléfono el control se estrecha sin perder el alto táctil', () => {
    const phone = cssMedia(css, '(max-width: 480px)')

    expect(cssRule(phone, '.toggle')).toMatchObject({
      padding: 'var(--space-2) var(--space-4)',
      'font-size': 'var(--font-size-sm)',
    })
    expect(cssRule(phone, '.toggle')).not.toHaveProperty('min-height')
  })
})
