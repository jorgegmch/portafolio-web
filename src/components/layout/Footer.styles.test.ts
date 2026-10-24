import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/layout/Footer.module.css')
const tokensCss = readCss('src/styles/tokens.css')

// La marca «JORGEGMCH» ocupa todo el ancho de la rejilla del pie, con su
// mismo borde izquierdo. Se dimensiona solo con CSS: el pie es contenedor y
// el tamaño de letra sale de su ancho (cqi), sin medir nada con JavaScript.
describe('Footer: la marca llena el ancho de la rejilla', () => {
  it('el pie es contenedor de su ancho', () => {
    expect(cssRule(css, '.footer')).toMatchObject({ 'container-type': 'inline-size' })
  })

  it('el tamaño de letra es el ancho del contenedor entre la proporción de la palabra', () => {
    expect(cssRule(css, '.brand')).toMatchObject({
      'font-size': 'calc(100cqi / var(--credits-brand-ratio))',
      'white-space': 'nowrap',
    })
  })

  // Medido en Anton: «JORGEGMCH» mide 4,5298 veces su tamaño. Algo más de
  // divisor deja sitio al trazo del contorno, que sobresale medio grosor.
  it('la proporción es la medida, con un poco de margen, nunca menos', () => {
    const ratio = Number(cssToken(tokensCss, '--credits-brand-ratio'))

    expect(ratio).toBeGreaterThan(4.5298)
    expect(ratio).toBeLessThan(4.6)
  })

  it('no queda el tamaño anterior, que dependía de la ventana', () => {
    expect(tokensCss).not.toMatch(/--font-size-credits-brand:/)
  })

  it('conserva el trazo fino', () => {
    expect(cssRule(css, '.brand')).toMatchObject({
      '-webkit-text-stroke': 'var(--outline-width) var(--color-outline)',
    })
  })
})
