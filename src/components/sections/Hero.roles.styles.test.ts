import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'

const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const SWAP =
  'opacity var(--duration-role-swap) var(--ease-standard),\n    transform var(--duration-role-swap) var(--ease-standard)'

describe('Hero: estilos del rol que rota', () => {
  const stack = cssRule(heroCss, '.roleStack')
  const item = cssRule(heroCss, '.roleItem')
  const current = cssRule(heroCss, '.roleCurrent')
  const leaving = cssRule(heroCss, '.roleLeaving')

  describe('altura reservada', () => {
    // Todos en la misma celda: mide lo que el más largo, se vea el que se vea.
    it('los textos se apilan en la misma celda de una rejilla', () => {
      expect(stack).toEqual({ display: 'grid' })
      expect(item).toMatchObject({ 'grid-area': '1 / 1' })
    })

    it('ninguno sale del flujo ni se oculta con display: seguirían sin reservar sitio', () => {
      for (const rule of [item, current, leaving]) {
        expect(rule).not.toHaveProperty('position')
        expect(rule).not.toHaveProperty('display')
        expect(rule).not.toHaveProperty('visibility')
      }
    })
  })

  describe('animación', () => {
    it('en espera, el texto es invisible y está un poco más abajo, sin transición', () => {
      expect(item).toEqual({
        'grid-area': '1 / 1',
        opacity: '0',
        transform: 'translateY(var(--hero-role-shift))',
      })
    })

    it('el que entra sube a su sitio y aparece', () => {
      expect(current).toEqual({ opacity: '1', transform: 'translateY(0)', transition: SWAP })
    })

    it('el que sale sigue subiendo, lo mismo que bajó, y se apaga', () => {
      expect(leaving).toEqual({
        transform: 'translateY(calc(-1 * var(--hero-role-shift)))',
        transition: SWAP,
      })
    })

    it('solo se animan transform y opacity', () => {
      const animated = [current.transition, leaving.transition]
        .join(',')
        .split(',')
        .map((part) => part.trim().split(' ').at(0))

      expect(new Set(animated)).toEqual(new Set(['opacity', 'transform']))
      for (const rule of [item, current, leaving]) expect(rule).not.toHaveProperty('animation')
    })

    it('la duración y el desplazamiento salen de tokens, sin números sueltos', () => {
      expect(cssToken(tokensCss, '--duration-role-swap')).toMatch(/^\d+ms$/)
      expect(cssToken(tokensCss, '--hero-role-shift')).toMatch(/^0\.\d+em$/)
      expect(`${current.transition} ${leaving.transition}`).not.toMatch(/\d+m?s\b/)
    })

    // El que entra se declara después: con la misma especificidad, gana.
    it('las tres reglas van en ese orden y no cambian en ningún tramo', () => {
      expect(heroCss.match(/\.role(?:Stack|Item|Current|Leaving)[^{]*\{/g)).toEqual([
        '.roleStack {',
        '.roleItem {',
        '.roleCurrent {',
        '.roleLeaving {',
      ])
    })
  })

  describe('frase para lectores de pantalla', () => {
    const hidden = cssRule(heroCss, '.visuallyHidden')

    it('no se ve ni ocupa sitio, pero sigue en el árbol de accesibilidad', () => {
      expect(hidden).toEqual({
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        'clip-path': 'inset(50%)',
        'white-space': 'nowrap',
      })
    })

    it('no usa display, visibility ni opacity, que la quitarían de ahí o la dejarían a la vista', () => {
      expect(hidden).not.toHaveProperty('display')
      expect(hidden).not.toHaveProperty('visibility')
      expect(hidden).not.toHaveProperty('opacity')
    })
  })
})
