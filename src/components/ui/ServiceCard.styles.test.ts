import { describe, expect, it } from 'vitest'
import { cssMedia, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/ServiceCard.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const REDUCED = '(prefers-reduced-motion: reduce)'

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

describe('ServiceCard: estilos', () => {
  describe('las dos caras', () => {
    // Apiladas en la misma celda: la tarjeta mide lo que la cara más alta,
    // sin alturas fijas.
    it('van en la misma celda de una rejilla de una sola celda', () => {
      expect(rule(css, '.inner')).toMatchObject({ display: 'grid' })
      expect(rule(css, '.front')).toMatchObject({ 'grid-area': '1 / 1' })
      expect(rule(css, '.back')).toMatchObject({ 'grid-area': '1 / 1' })
      expect(css).not.toMatch(/(?:^|[\s;{])(?:height|min-height)\s*:\s*\d/)
    })

    it('no enseñan su reverso al girar, también en Safari', () => {
      ;['.front', '.back'].forEach((face) => {
        expect(rule(css, face)).toMatchObject({
          'backface-visibility': 'hidden',
          '-webkit-backface-visibility': 'hidden',
        })
      })
    })

    it('el dorso empieza vuelto y la tarjeta girada lo pone de frente', () => {
      expect(rule(css, '.back')).toMatchObject({ transform: 'rotateY(180deg)' })
      expect(rule(css, '.flipped .inner')).toEqual({ transform: 'rotateY(180deg)' })
      expect(rule(css, '.inner')).toMatchObject({ 'transform-style': 'preserve-3d' })
      expect(rule(css, '.card')).toMatchObject({ perspective: 'var(--flip-perspective)' })
    })
  })

  describe('movimiento', () => {
    it('solo se transicionan transform y opacity', () => {
      const transitions = [...css.matchAll(/transition:\s*([^;]+);/g)].map(([, value = '']) => value)

      expect(transitions.length).toBeGreaterThan(0)
      transitions.forEach((value) => {
        value.split(',').forEach((part) => expect(part.trim()).toMatch(/^(transform|opacity)\s/))
      })
      expect(css).not.toMatch(/@keyframes|animation\s*:/)
    })

    // Sin giro: la cara cambia con un fundido, sin rotar.
    it('con movimiento reducido no gira: la cara cambia con opacity', () => {
      const reduced = cssMedia(css, REDUCED)

      expect(reduced).not.toMatch(/rotate/)
      expect(rule(reduced, '.inner')).toMatchObject({ transform: 'none' })
      expect(rule(reduced, '.flipped .inner')).toMatchObject({ transform: 'none' })
      expect(rule(reduced, '.back')).toMatchObject({ transform: 'none', opacity: '0' })
      expect(rule(reduced, '.flipped .front')).toEqual({ opacity: '0' })
      expect(rule(reduced, '.flipped .back')).toEqual({ opacity: '1' })
    })
  })

  describe('respuesta al puntero y al foco', () => {
    // Las tarjetas ya no se elevan: responden con el cursor y el contorno de
    // foco de siempre. Las fichas de tecnologías sí conservan su escala.
    it('no escala', () => {
      expect(css).not.toMatch(/scale\(/)
      expect(css).not.toMatch(/:hover/)
    })

    it('lo que gira lleva cursor de mano', () => {
      expect(rule(css, '.flip')).toMatchObject({ cursor: 'pointer' })
      expect(rule(css, '.flipBack')).toMatchObject({ cursor: 'pointer' })
    })

    it('no quita el contorno de foco', () => {
      expect(css).not.toMatch(/outline\s*:\s*(?:none|0)/)
    })
  })

  describe('enlace del dorso', () => {
    // WCAG 2.2, 2.5.8: al menos 24 px de alto; aquí, el objetivo táctil.
    it('mide al menos el objetivo táctil de alto, en una sola línea', () => {
      expect(rule(css, '.link')).toMatchObject({
        'min-height': 'var(--touch-target)',
        'white-space': 'nowrap',
      })
    })

    // Encima del botón de volver: tocar el enlace abre el repo, no gira.
    it('queda por encima del botón de volver, que cubre el dorso', () => {
      expect(rule(css, '.flipBack')).toMatchObject({ position: 'absolute', inset: '0' })
      expect(rule(css, '.link')).toMatchObject({ position: 'relative', 'z-index': '1' })
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
      colors.forEach(([, value]) => expect(value).toMatch(/^(?:var\(--color-[\w-]+\)|inherit|transparent)$/))
    })
  })
})
