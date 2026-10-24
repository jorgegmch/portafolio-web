import { describe, expect, it } from 'vitest'
import { buildScramble, SCRAMBLE_GLYPHS, SCRAMBLE_TIMING, SCRAMBLE_WINDOW } from '@/lib/nameScramble'

/** Azar fijo: siempre el primer carácter de relleno. */
const firstGlyph = () => 0
const textOf = (step: { words: readonly { code: string; rest: string }[] }) =>
  step.words.map(({ code, rest }) => code + rest).join(' ')

describe('buildScramble (un solo sentido)', () => {
  it('termina leyendo el destino, ya asentado', () => {
    const steps = buildScramble(['jorgegmch'], 'Jorge Gómez', firstGlyph)

    expect(textOf(steps.at(-1) ?? { words: [] })).toBe('Jorge Gómez')
  })

  it('no vuelve atrás: el último paso es el destino, no el origen', () => {
    const steps = buildScramble(['Jorge Gómez'], 'jorgegmch', firstGlyph)

    expect(textOf(steps.at(-1) ?? { words: [] })).toBe('jorgegmch')
    expect(steps.map(textOf)).not.toContain('Jorge Gómez')
  })

  it('el frente avanza una letra por paso, con una ventana de letras a medio codificar', () => {
    const steps = buildScramble(['abcdef'], 'uvwxyz', firstGlyph)
    const glyph = SCRAMBLE_GLYPHS.charAt(0)

    expect(steps).toHaveLength(6 + SCRAMBLE_WINDOW)
    expect(textOf(steps[0] ?? { words: [] })).toBe(`${glyph}bcdef`)
    expect(textOf(steps[SCRAMBLE_WINDOW] ?? { words: [] })).toBe(`u${glyph.repeat(SCRAMBLE_WINDOW)}ef`)
  })

  it('cada paso dura lo mismo', () => {
    buildScramble(['jorgegmch'], 'Jorge Gómez', firstGlyph).forEach((step) =>
      expect(step.holdMs).toBe(SCRAMBLE_TIMING.stepMs),
    )
  })

  it('ningún paso es más largo que el más largo de los dos textos', () => {
    const steps = buildScramble(['jorgegmch'], 'Jorge Gómez', Math.random)

    steps.forEach((step) => expect(Array.from(textOf(step)).length).toBeLessThanOrEqual(11))
  })

  it('sin nada que traducir no hay pasos', () => {
    expect(buildScramble([''], '', firstGlyph)).toEqual([])
  })
})
