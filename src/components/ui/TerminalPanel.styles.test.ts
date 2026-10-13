import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/TerminalPanel.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const BACKGROUND = '--color-surface'
const PROMPT = '--color-accent-alt'
const FIELD = '--color-text-muted'
const VALUE = '--color-text'
const AA_TEXT = 4.5

/** Luminancia relativa de un color #rrggbb, según WCAG 2. */
const luminance = (hex: string) => {
  const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!channels) throw new Error(`Color no hexadecimal: «${hex}»`)
  const [red = 0, green = 0, blue = 0] = channels.slice(1).map((channel) => {
    const value = Number.parseInt(channel, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/** Contraste WCAG entre dos tokens de color de tokens.css. */
const contrast = (foreground: string, background: string) => {
  const [lighter = 0, darker = 0] = [foreground, background]
    .map((name) => luminance(cssToken(tokensCss, name)))
    .sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('TerminalPanel: estilos', () => {
  it('no lleva colores literales: todos salen de tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })

  it('no tiene tramos por ancho: se adapta partiendo las líneas', () => {
    expect(css).not.toContain('@media')
  })

  it('no anima nada: su aparición la pone quien lo usa', () => {
    expect(css).not.toMatch(/\b(?:transition|animation)\b|@keyframes/)
  })

  it('usa la fuente mono del proyecto', () => {
    expect(cssRule(css, '.panel')).toMatchObject({ 'font-family': 'var(--font-mono)' })
  })

  describe('colores', () => {
    it('el fondo del panel es el de superficie', () => {
      expect(cssRule(css, '.panel')).toMatchObject({ 'background-color': `var(${BACKGROUND})` })
    })

    it('el prompt va en el verde de la paleta', () => {
      expect(cssRule(css, '.prompt')).toMatchObject({ color: `var(${PROMPT})` })
    })

    it('los nombres de campo van en el gris claro', () => {
      expect(cssRule(css, '.name')).toMatchObject({ color: `var(${FIELD})` })
    })

    it('el comando y los valores van en el color de texto', () => {
      expect(cssRule(css, '.panel')).toMatchObject({ color: `var(${VALUE})` })
      expect(cssRule(css, '.value')).not.toHaveProperty('color')
      expect(cssRule(css, '.command')).not.toHaveProperty('color')
    })

    it.each([
      ['el prompt', PROMPT, 14.26],
      ['los nombres de campo', FIELD, 6.92],
      ['el comando y los valores', VALUE, 16.52],
    ])('%s cumple AA sobre el fondo del panel', (_, token, expected) => {
      expect(contrast(token, BACKGROUND)).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(token, BACKGROUND)).toBeCloseTo(expected, 1)
    })
  })

  describe('símbolos decorativos', () => {
    it('el «$» lo pinta el CSS en el prompt', () => {
      expect(cssRule(css, '.prompt::before')).toEqual({ content: "'$'" })
    })

    // cssRule separa por los dos puntos: esta regla se lee del texto.
    it('los dos puntos los pinta el CSS tras el nombre del campo', () => {
      expect(css).toMatch(/\.name::after\s*\{\s*content:\s*':';\s*\}/)
    })
  })

  // El nombre completo no cabe en una línea en un teléfono.
  describe('líneas largas', () => {
    it('el valor se parte por los espacios y, si no hay, por donde haga falta', () => {
      expect(cssRule(css, '.value')).toMatchObject({
        'min-width': '0',
        'overflow-wrap': 'anywhere',
      })
    })

    it('el nombre del campo no se parte ni se encoge', () => {
      expect(cssRule(css, '.name')).toMatchObject({ 'flex-shrink': '0', 'white-space': 'nowrap' })
    })

    it('el panel no deja que su contenido lo ensanche', () => {
      expect(cssRule(css, '.panel')).toMatchObject({ 'min-width': '0', 'max-width': '100%' })
    })

    it('el comando también se parte si no cabe', () => {
      expect(cssRule(css, '.command')).toMatchObject({ 'overflow-wrap': 'anywhere' })
    })
  })
})
