import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const css = readCss('src/components/ui/TypedText.module.css')
const tokensCss = readCss('src/styles/tokens.css')

/** Bloque de un @keyframes, con sus pasos y declaraciones. */
const keyframes = (name: string) =>
  new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`).exec(css)?.[1] ?? ''

/** Propiedades declaradas en un bloque, sin repetir. */
const propertiesIn = (block: string) => [
  ...new Set([...block.matchAll(/([\w-]+)\s*:/g)].map(([, property]) => property)),
]

describe('TypedText: estilos', () => {
  it('mientras espera, el contenedor solo se vuelve transparente', () => {
    expect(cssRule(css, '.waiting')).toEqual({ opacity: '0' })
  })

  describe('palabras', () => {
    // El retraso de cada una va en línea; aquí, el fundido.
    it('aparecen con un fundido de --duration-fast', () => {
      expect(cssRule(css, '.word')).toEqual({
        animation: 'word-in var(--duration-fast) var(--ease-standard) both',
      })
    })

    it('el fundido solo toca opacity', () => {
      const frames = keyframes('word-in')

      expect(frames).not.toBe('')
      expect(propertiesIn(frames)).toEqual(['opacity'])
    })
  })

  describe('cursor', () => {
    // Absoluto y sin desplazamientos: queda donde acaba el texto y no ocupa
    // sitio ni mueve nada.
    it('es absoluto, azul y parpadea, sin desplazamientos', () => {
      expect(cssRule(css, '.cursor')).toEqual({
        position: 'absolute',
        color: 'var(--color-accent)',
        animation: 'blink calc(var(--duration-slow) * 2) step-end infinite',
      })
    })

    it('el «|» lo pinta el CSS', () => {
      expect(cssRule(css, '.cursor::before')).toEqual({ content: "'|'" })
    })

    it('el parpadeo solo toca opacity', () => {
      const frames = keyframes('blink')

      expect(frames).not.toBe('')
      expect(propertiesIn(frames)).toEqual(['opacity'])
    })

    // Las duraciones de los tokens casi llegan a cero: parpadearía sin parar.
    it('con movimiento reducido no parpadea', () => {
      expect(cssRule(cssMedia(css, '(prefers-reduced-motion: reduce)'), '.cursor')).toEqual({
        animation: 'none',
      })
    })

    it('el azul es el de acento de los tokens', () => {
      expect(cssToken(tokensCss, '--color-accent')).not.toBe('')
    })
  })

  it('no anima con transiciones', () => {
    expect(css).not.toMatch(/\btransition\b/)
  })

  it('todos los tokens que usa existen en tokens.css', () => {
    const used = [...css.matchAll(/var\((--[\w-]+)\)/g)].map(([, name]) => name)

    expect(used.length).toBeGreaterThan(0)
    used.forEach((name) => {
      expect(tokensCss).toContain(`${name}:`)
    })
  })

  it('no lleva colores literales', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
  })
})
