import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/CvDownload.module.css')

describe('CvDownload: estilos', () => {
  it('no lleva colores literales: todos salen de tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })

  it('solo usa el breakpoint de teléfono', () => {
    expect(css.match(/@media[^{]*/g)?.map((query) => query.trim())).toEqual([
      '@media (max-width: 480px)',
    ])
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
