import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/Reveal.module.css')
const tokensCss = readCss('src/styles/tokens.css')
const reducedTokens = cssMedia(tokensCss, '(prefers-reduced-motion: reduce)')

/** Un valor con saltos de línea y sangría, en una sola línea. */
const oneLine = (value: string | undefined) => (value ?? '').replace(/\s+/g, ' ')

const ORDERS = [0, 1, 2, 3] as const

describe('Reveal: estilos', () => {
  describe('tokens', () => {
    it('la duración, la distancia y el escalonado están en tokens.css', () => {
      expect(cssToken(tokensCss, '--duration-reveal')).toBe('300ms')
      expect(cssToken(tokensCss, '--reveal-distance')).toBe('1.875rem')
      expect(cssToken(tokensCss, '--reveal-stagger')).toBe('80ms')
    })

    // Con movimiento reducido el hook ya lo muestra directo; esto es la red
    // de seguridad del CSS: sin duración, sin desplazamiento y sin espera.
    it('el movimiento reducido los anula', () => {
      expect(cssToken(reducedTokens, '--duration-reveal')).toBe('0.01ms')
      expect(cssToken(reducedTokens, '--reveal-distance')).toBe('0')
      expect(cssToken(reducedTokens, '--reveal-stagger')).toBe('0ms')
    })

    it('todos los tokens que usa existen en tokens.css', () => {
      const used = [...css.matchAll(/var\((--[\w-]+)\)/g)].map(([, name]) => name)

      expect(used.length).toBeGreaterThan(0)
      used.forEach((name) => {
        expect(tokensCss).toContain(`${name}:`)
      })
    })
  })

  it('tiene exactamente estas reglas, en este orden', () => {
    const selectors = [...css.matchAll(/([^{}]+)\{/g)].map(([, selector]) => selector?.trim())

    expect(selectors).toEqual(['.reveal', '.hidden', '.order0', '.order1', '.order2', '.order3'])
  })

  it('el envoltorio solo declara su transición', () => {
    const rule = cssRule(css, '.reveal')

    expect(Object.keys(rule)).toEqual(['transition'])
    expect(oneLine(rule.transition)).toBe(
      'opacity var(--duration-reveal) var(--ease-standard), transform var(--duration-reveal) var(--ease-standard)',
    )
  })

  it('oculto: transparente y desplazado hacia abajo, nada más', () => {
    expect(cssRule(css, '.hidden')).toEqual({
      opacity: '0',
      transform: 'translateY(var(--reveal-distance))',
    })
  })

  it.each(ORDERS)('.order%i espera ese número de pasos del escalonado', (order) => {
    expect(cssRule(css, `.order${order}`)).toEqual({
      'transition-delay': `calc(var(--reveal-stagger) * ${order})`,
    })
  })

  // El escalonado se aplica al revelar y al ocultar, pero nunca se vuelve a
  // ocultar: solo cuenta al aparecer.
  it('solo anima opacity y transform', () => {
    const animated = oneLine(cssRule(css, '.reveal').transition)
      .split(',')
      .map((part) => part.trim().split(' ')[0])

    expect(animated).toEqual(['opacity', 'transform'])
    expect(css).not.toMatch(/\banimation\b|@keyframes|transition-property/)
  })

  // En 3.5 se mide en el navegador; aquí se fija que el CSS no lo toca.
  it('no cambia el layout de lo que envuelve', () => {
    expect(css).not.toMatch(
      /\b(?:margin|padding|display|overflow|position|width|height|inset|top|right|bottom|left|float|flex|grid|gap|contain|will-change)[\w-]*\s*:/,
    )
  })

  // El hover vive en otro elemento: Reveal no anima el elemento que escala.
  it('no lleva :hover ni escala', () => {
    expect(css).not.toMatch(/:hover|\bscale/)
  })

  it('no lleva colores literales', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })
})
