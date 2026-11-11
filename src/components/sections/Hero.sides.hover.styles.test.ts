import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

// Hover de los paneles laterales del Hero (spec v2.1 §3.1): solo con un
// puntero fino que pueda pasar por encima. La ventana de código se endereza y
// sube; de las fichas, solo la que está bajo el puntero sube y crece un poco.
// El realce en Signal es un pseudo-elemento superpuesto del que solo cambia la
// opacidad; con movimiento reducido no hay movimiento, solo ese realce.
const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const FINE_POINTER_MOTION = `${FINE_POINTER} and (prefers-reduced-motion: no-preference)`
const finePointer = cssMedia(heroCss, FINE_POINTER)
const finePointerMotion = cssMedia(heroCss, FINE_POINTER_MOTION)

/** Veces que aparece un selector seguido de su llave, en cualquier parte del CSS. */
const occurrences = (css: string, selector: string) =>
  css.split(selector).length - 1

describe('Hero: hover de los paneles laterales', () => {
  it('los dos bloques @media existen', () => {
    expect(finePointer).not.toBe('')
    expect(finePointerMotion).not.toBe('')
  })

  it('todo :hover de la ventana y de las fichas vive dentro de esos bloques', () => {
    for (const selector of ['.codeWindow:hover', '.tile:hover']) {
      const total = occurrences(heroCss, selector)
      expect(total, selector).toBeGreaterThan(0)
      expect(occurrences(finePointer, selector) + occurrences(finePointerMotion, selector), selector).toBe(
        total,
      )
    }
  })

  it('con puntero fino, la ventana y cada ficha reciben el puntero; el panel sigue sin recibirlo', () => {
    expect(cssRule(heroCss, '.side')).toMatchObject({ 'pointer-events': 'none' })
    expect(cssRule(finePointer, '.codeWindow,\n  .tile')).toMatchObject({ 'pointer-events': 'auto' })
  })

  describe('realce en Signal', () => {
    it('es un pseudo-elemento superpuesto, con borde de 1,5 px en Signal y oculto en reposo', () => {
      expect(cssRule(heroCss, '.codeWindow::after,\n.tile::after')).toMatchObject({
        position: 'absolute',
        inset: '-1px',
        border: 'var(--hero-highlight-border) solid var(--color-signal)',
        'border-radius': 'inherit',
        'box-shadow': 'var(--glow-signal)',
        opacity: '0',
        'pointer-events': 'none',
      })
    })

    it('con el puntero encima pasa a opacidad 1, animando solo la opacidad', () => {
      expect(cssRule(finePointer, '.codeWindow::after,\n  .tile::after')).toMatchObject({
        transition: 'opacity var(--duration-base) var(--ease-cine)',
      })
      expect(cssRule(finePointer, '.codeWindow:hover::after,\n  .tile:hover::after')).toMatchObject({
        opacity: '1',
      })
    })

    it('el borde mide 1,5 px y el brillo es Signal suave, a baja opacidad', () => {
      expect(cssToken(tokensCss, '--hero-highlight-border')).toBe('1.5px')
      expect(cssToken(tokensCss, '--color-signal')).toBe('#ff5b24')
      expect(cssToken(tokensCss, '--color-signal-haze')).toBe('rgba(255, 91, 36, 0.22)')
      expect(cssToken(tokensCss, '--glow-signal')).toContain('var(--color-signal-haze)')
      expect(cssToken(tokensCss, '--glow-signal')).not.toMatch(/--color-code/)
    })
  })

  describe('movimiento, solo sin preferencia de movimiento reducido', () => {
    it('la ventana se endereza de -3° a 0° y sube, en unos 300 ms con --ease-cine', () => {
      expect(cssRule(finePointerMotion, '.codeWindow,\n  .tile')).toMatchObject({
        transition: 'transform var(--duration-base) var(--ease-cine)',
      })
      expect(cssRule(finePointerMotion, '.codeWindow:hover')).toMatchObject({
        transform: 'rotate(0deg) translateY(calc(-1 * var(--hero-code-lift)))',
      })
      expect(cssToken(tokensCss, '--duration-base')).toBe('300ms')
      expect(cssToken(tokensCss, '--hero-code-lift')).toBe('0.5rem')
    })

    it('la ficha bajo el puntero sube 4 px y crece al 104 %', () => {
      expect(cssRule(finePointerMotion, '.tile:hover')).toMatchObject({
        transform: 'translateY(calc(-1 * var(--hero-tile-lift))) scale(var(--hero-tile-hover-scale))',
      })
      expect(cssToken(tokensCss, '--hero-tile-lift')).toBe('0.25rem')
      expect(cssToken(tokensCss, '--hero-tile-hover-scale')).toBe('1.04')
    })

    it('fuera de ese bloque, nada cambia el transform al pasar el puntero', () => {
      expect(cssRule(finePointer, '.codeWindow:hover')).not.toHaveProperty('transform')
      expect(cssRule(finePointer, '.tile:hover')).not.toHaveProperty('transform')
    })
  })

  it('al moverse, la zona de hover cubre el hueco que deja, para que no parpadee', () => {
    expect(cssRule(finePointer, '.codeWindow:hover::before')).toMatchObject({
      inset: 'calc(-1 * var(--hero-hover-reach))',
    })
    expect(cssRule(finePointer, '.tile:hover::before')).toMatchObject({
      inset: '0 0 calc(-1 * var(--hero-tile-lift))',
    })
  })

  it('la ventana y las fichas no cambian de capa: siguen detrás de la foto', () => {
    for (const block of [finePointer, finePointerMotion]) {
      expect(block).not.toMatch(/z-index/)
    }
  })
})
