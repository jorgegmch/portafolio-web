import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

// Áreas de clic (auditoría de Vercel, WCAG 2.5.8): en un teléfono de 390 px
// el skip link medía 39 px de alto, el logo de la barra 24 y los enlaces de
// redes del pie 26. Los tres pasan al alto mínimo de lo que se pulsa con el
// dedo, 44 px, centrando su texto.
const TARGET = { 'min-height': 'var(--touch-target)' }

describe('áreas de clic de al menos 44 px', () => {
  it('el token vale 44 px', () => {
    expect(cssToken(readCss('src/styles/tokens.css'), '--touch-target')).toBe('2.75rem')
  })

  it.each([
    ['el skip link', 'src/components/ui/SkipLink.module.css', '.skipLink'],
    ['el logo de la barra', 'src/components/layout/Navbar.module.css', '.brand'],
    ['los enlaces de redes del pie', 'src/components/layout/Footer.module.css', '.link'],
  ])('%s', (_name, path, selector) => {
    expect(cssRule(readCss(path), selector)).toMatchObject({
      ...TARGET,
      display: 'inline-flex',
      'align-items': 'center',
    })
  })
})
