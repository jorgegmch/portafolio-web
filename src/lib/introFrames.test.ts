import { describe, expect, it } from 'vitest'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

const { naturalHoldMs, strikeHoldMs, typeMs, codeHoldMs } = INTRO_TIMING

const codes = (code: string) => buildIntroFrames(code).map((frame) => frame.code)

const struck = (code: string) => buildIntroFrames(code).map((frame) => frame.struck)

const holds = (code: string) => buildIntroFrames(code).map((frame) => frame.holdMs)

describe('buildIntroFrames', () => {
  describe('secuencia', () => {
    it('muestra la frase, la tacha y escribe el código carácter a carácter', () => {
      expect(codes('abc')).toEqual(['', '', 'a', 'ab', 'abc'])
      expect(struck('abc')).toEqual([false, true, true, true, true])
    })

    it('termina con el código completo', () => {
      expect(codes('optimize_workflow()').at(-1)).toBe('optimize_workflow()')
    })

    it.each(['optimize_workflow()', 'añ🚀'])(
      'en «%s», cada paso añade un solo carácter al final',
      (code) => {
        const typed = codes(code)
          .slice(1)
          .map((text) => Array.from(text))

        // Sin esto, una lista vacía pasaría sin comprobar ningún paso.
        expect(typed.length).toBeGreaterThan(1)
        typed.slice(1).forEach((current, index) => {
          const previous = typed[index] ?? []

          expect(current.length - previous.length).toBe(1)
          expect(current.slice(0, previous.length)).toEqual(previous)
        })
      },
    )
  })

  describe('pausas', () => {
    it('cada tramo lleva la suya: frase, tachado, escritura y código completo', () => {
      expect(holds('abc')).toEqual([naturalHoldMs, strikeHoldMs, typeMs, typeMs, codeHoldMs])
    })

    it('todas son mayores que cero', () => {
      Object.values(INTRO_TIMING).forEach((ms) => expect(ms).toBeGreaterThan(0))
    })
  })

  describe('casos límite', () => {
    it('sin código, la frase tachada es el último fotograma', () => {
      expect(buildIntroFrames('')).toEqual([
        { struck: false, code: '', holdMs: naturalHoldMs },
        { struck: true, code: '', holdMs: codeHoldMs },
      ])
    })

    it('no parte las tildes ni los emoji', () => {
      expect(codes('añ🚀')).toEqual(['', '', 'a', 'añ', 'añ🚀'])
    })
  })
})
