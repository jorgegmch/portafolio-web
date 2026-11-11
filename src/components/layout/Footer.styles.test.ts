import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, readCss } from '@/test/cssRules'

const css = readCss('src/components/layout/Footer.module.css')

// Pie (spec v2.1 §3.6 y tablero desktop-page): los créditos, el primero
// pegado a la izquierda y el último (el llamado a redes) a la derecha; en
// teléfono, rejilla de dos columnas. La marca es un SVG que ocupa el ancho
// de la rejilla, con un trazo fino que no cambia al escalar.
describe('Footer: créditos', () => {
  it('van de borde a borde, como la palabra de abajo', () => {
    expect(cssRule(css, '.credits')).toMatchObject({
      display: 'flex',
      'justify-content': 'space-between',
    })
  })

  it('en teléfono, rejilla de dos columnas', () => {
    expect(cssRule(cssMedia(css, '(max-width: 900px)'), '.credits')).toMatchObject({
      display: 'grid',
      'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
    })
  })

  it('el rótulo del llamado a redes va en Signal', () => {
    expect(cssRule(css, '.followLabel')).toMatchObject({ color: 'var(--color-signal)' })
  })

  it('las píldoras de redes miden 44 px y llevan el logo delante', () => {
    expect(cssRule(css, '.link')).toMatchObject({
      'min-height': 'var(--touch-target)',
      'border-radius': 'var(--radius-pill)',
    })
    expect(cssRule(css, '.mark')).toMatchObject({ width: 'var(--channel-mark-size)' })
  })
})

describe('Footer: la marca', () => {
  it('el SVG ocupa el ancho de la rejilla y conserva su proporción', () => {
    expect(cssRule(css, '.brand')).toMatchObject({
      display: 'block',
      width: '100%',
      height: 'auto',
    })
  })

  it('la palabra va en Anton, solo en contorno, con el trazo fino a cualquier tamaño', () => {
    expect(cssRule(css, '.brandText')).toMatchObject({
      fill: 'none',
      stroke: 'var(--color-outline)',
      'stroke-width': 'var(--outline-width)',
      'vector-effect': 'non-scaling-stroke',
      'font-family': 'var(--font-display)',
      'text-transform': 'uppercase',
    })
  })

  it('ya no depende del ancho del contenedor (cqi) ni de una proporción medida', () => {
    expect(css).not.toMatch(/cqi|container-type|credits-brand-ratio/)
  })
})
