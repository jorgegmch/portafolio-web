import { describe, expect, it } from 'vitest'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

const { startDelayMs, typeMs, eraseMs, naturalHoldMs, codeHoldMs } = INTRO_TIMING

const texts = (natural: string, code: string) =>
  buildIntroFrames(natural, code).map((frame) => frame.text)

const holds = (natural: string, code: string) =>
  buildIntroFrames(natural, code).map((frame) => frame.holdMs)

describe('buildIntroFrames', () => {
  describe('secuencia', () => {
    it('escribe la frase, borra lo que no coincide con el código y lo completa', () => {
      expect(texts('abc', 'abde')).toEqual(['', 'a', 'ab', 'abc', 'ab', 'abd', 'abde'])
    })

    it('sin nada en común borra la frase entera', () => {
      expect(texts('ab', 'xy')).toEqual(['', 'a', 'ab', 'a', '', 'x', 'xy'])
    })

    it('empieza vacío y termina con el código completo', () => {
      const frames = texts('ordenar datos', 'order_data()')

      expect(frames[0]).toBe('')
      expect(frames.at(-1)).toBe('order_data()')
    })

    it('la frase aparece completa antes de empezar a borrarse', () => {
      const frames = texts('ordenar datos', 'order_data()')
      const complete = frames.indexOf('ordenar datos')

      expect(complete).toBeGreaterThan(0)
      expect(frames[complete + 1]).toBe('ordenar dato')
    })

    it.each([
      ['ordenar datos', 'order_data()'],
      ['ab', 'xy'],
      ['añ🙂', 'añ🚀'],
    ])('de «%s» a «%s», cada paso añade o quita un solo carácter', (natural, code) => {
      const frames = texts(natural, code).map((text) => Array.from(text))

      // Sin esto, una lista vacía pasaría sin comprobar ningún paso.
      expect(frames.length).toBeGreaterThan(1)
      frames.slice(1).forEach((current, index) => {
        const previous = frames[index] ?? []
        const [shorter, longer] =
          current.length < previous.length ? [current, previous] : [previous, current]

        expect(longer.length - shorter.length).toBe(1)
        expect(longer.slice(0, shorter.length)).toEqual(shorter)
      })
    })
  })

  describe('pausas', () => {
    it('cada tramo lleva la suya: inicio, escritura, frase completa, borrado y código completo', () => {
      expect(holds('abc', 'abde')).toEqual([
        startDelayMs,
        typeMs,
        typeMs,
        naturalHoldMs,
        eraseMs,
        typeMs,
        codeHoldMs,
      ])
    })

    it('todas son mayores que cero', () => {
      Object.values(INTRO_TIMING).forEach((ms) => expect(ms).toBeGreaterThan(0))
    })
  })

  describe('casos límite', () => {
    it('sin frase escribe solo el código', () => {
      expect(texts('', 'ab')).toEqual(['', 'a', 'ab'])
      expect(holds('', 'ab')).toEqual([startDelayMs, typeMs, codeHoldMs])
    })

    it('sin código escribe la frase y la borra entera', () => {
      expect(texts('ab', '')).toEqual(['', 'a', 'ab', 'a', ''])
      expect(holds('ab', '').at(-1)).toBe(codeHoldMs)
    })

    it('sin frase ni código queda un solo fotograma vacío', () => {
      expect(buildIntroFrames('', '')).toEqual([{ text: '', holdMs: codeHoldMs }])
    })

    it('si la frase y el código son iguales, no borra ni reescribe', () => {
      expect(texts('ab', 'ab')).toEqual(['', 'a', 'ab'])
      expect(holds('ab', 'ab').at(-1)).toBe(codeHoldMs)
    })

    it('si el código es el comienzo de la frase, solo borra lo que sobra', () => {
      expect(texts('abc', 'ab')).toEqual(['', 'a', 'ab', 'abc', 'ab'])
    })

    it('si la frase es el comienzo del código, sigue escribiendo sin borrar', () => {
      expect(texts('ab', 'abc')).toEqual(['', 'a', 'ab', 'abc'])
      expect(holds('ab', 'abc')).toEqual([startDelayMs, typeMs, naturalHoldMs, codeHoldMs])
    })

    it('no parte las tildes ni los emoji', () => {
      expect(texts('añ🙂', 'añ🚀')).toEqual(['', 'a', 'añ', 'añ🙂', 'añ', 'añ🚀'])
    })
  })
})
