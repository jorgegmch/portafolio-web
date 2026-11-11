import { describe, expect, it } from 'vitest'
import { readCss } from '@/test/cssRules'

const css = readCss('src/components/sections/Services.module.css')
const tokensCss = readCss('src/styles/tokens.css')

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

describe('Services: estilos', () => {
  it('al llegar por el ancla, el panel queda a un hueco del borde', () => {
    expect(rule(css, '.services')).toMatchObject({ 'scroll-margin-top': 'var(--scroll-offset)' })
  })

  it('es la escena clara: Paper con tinta encima', () => {
    expect(rule(css, '.services')).toMatchObject({
      'background-color': 'var(--color-paper)',
      color: 'var(--color-ink-text)',
    })
  })

  // El Signal del anillo global no llega a 3:1 sobre Paper.
  it('el anillo de foco va en tinta dentro de la escena', () => {
    expect(rule(css, '.services')).toMatchObject({ '--color-focus': 'var(--color-ink-text)' })
  })

  it('una fila cerrada no ocupa sitio', () => {
    expect(rule(css, '.panel[hidden]')).toMatchObject({ display: 'none' })
  })

  it('no declara animaciones ni transiciones propias', () => {
    expect(css).not.toMatch(/\banimation\s*:|\btransition\s*:|@keyframes/)
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

    // inherit no es un color nuevo: toma el de la escena.
    it('cada color sale de un token', () => {
      const colors = [...css.matchAll(/(?:^|[\s;{])(?:color|background-color|border-color)\s*:\s*([^;]+);/g)]

      expect(colors.length).toBeGreaterThan(0)
      colors.forEach(([, value]) => expect(value).toMatch(/^(?:var\(--color-[\w-]+\)|inherit)$/))
    })
  })
})
