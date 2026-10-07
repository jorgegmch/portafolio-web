import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIntroSequence } from '@/hooks/useIntroSequence'
import type { IntroFrame } from '@/lib/introFrames'

// Pausas distintas entre sí, para distinguir de cuál depende cada paso.
const FIRST_HOLD = 100
const SECOND_HOLD = 200
const LAST_HOLD = 300
const TOTAL = FIRST_HOLD + SECOND_HOLD + LAST_HOLD

const FRAMES: readonly IntroFrame[] = [
  { text: '', holdMs: FIRST_HOLD },
  { text: 'a', holdMs: SECOND_HOLD },
  { text: 'ab', holdMs: LAST_HOLD },
]

// Milisegundo a milisegundo: React aplica los cambios al salir de act, así que
// el temporizador del fotograma siguiente no existe hasta entonces. Con un
// solo salto largo se dispararía uno y los demás no llegarían a programarse.
const advance = (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 1) {
    act(() => {
      vi.advanceTimersByTime(1)
    })
  }
}

/** Deja correr los temporizadores que vencen ya, sin avanzar el reloj. */
const flush = () => {
  act(() => {
    vi.advanceTimersByTime(0)
  })
}

const mount = (frames: readonly IntroFrame[] = FRAMES) =>
  renderHook(({ list }) => useIntroSequence(list), { initialProps: { list: frames } })

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useIntroSequence', () => {
  describe('avance', () => {
    it('al montar muestra el primer fotograma y está en reproducción', () => {
      const { result } = mount()

      expect(result.current.text).toBe('')
      expect(result.current.phase).toBe('playing')
    })

    it('no avanza hasta que pasa la pausa del fotograma', () => {
      const { result } = mount()

      advance(FIRST_HOLD - 1)
      expect(result.current.text).toBe('')

      advance(1)
      expect(result.current.text).toBe('a')
    })

    it('cada fotograma espera su propia pausa', () => {
      const { result } = mount()

      advance(FIRST_HOLD + SECOND_HOLD - 1)
      expect(result.current.text).toBe('a')

      advance(1)
      expect(result.current.text).toBe('ab')
    })

    it('tras la pausa del último pasa a la salida, y no antes', () => {
      const { result } = mount()

      advance(TOTAL - 1)
      expect(result.current.phase).toBe('playing')

      advance(1)
      expect(result.current.phase).toBe('leaving')
    })

    it('en la salida conserva el último texto', () => {
      const { result } = mount()

      advance(TOTAL)

      expect(result.current.text).toBe('ab')
    })

    it('avanza aunque dos fotogramas seguidos tengan la misma pausa', () => {
      const { result } = mount([
        { text: 'x', holdMs: FIRST_HOLD },
        { text: 'xy', holdMs: FIRST_HOLD },
        { text: 'xyz', holdMs: FIRST_HOLD },
      ])

      advance(FIRST_HOLD * 2)

      expect(result.current.text).toBe('xyz')
    })

    it('volver a renderizar con una lista igual no reinicia la pausa en curso', () => {
      const { result, rerender } = mount()

      advance(FIRST_HOLD - 1)
      rerender({ list: [...FRAMES] })
      advance(1)

      expect(result.current.text).toBe('a')
    })
  })

  describe('temporizadores', () => {
    it('nunca hay más de uno pendiente', () => {
      mount()

      expect(vi.getTimerCount()).toBe(1)
      advance(FIRST_HOLD)
      expect(vi.getTimerCount()).toBe(1)
      advance(SECOND_HOLD)
      expect(vi.getTimerCount()).toBe(1)
    })

    it('al llegar a la salida no queda ninguno', () => {
      const { result } = mount()

      advance(TOTAL)

      expect(result.current.phase).toBe('leaving')
      expect(vi.getTimerCount()).toBe(0)
    })

    it('desmontar a mitad no deja ninguno', () => {
      const { unmount } = mount()
      advance(FIRST_HOLD + 1)
      expect(vi.getTimerCount()).toBe(1)

      unmount()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('con el doble montaje de StrictMode queda uno solo y la secuencia no se duplica', () => {
      const { result } = renderHook(() => useIntroSequence(FRAMES), { wrapper: StrictMode })

      expect(vi.getTimerCount()).toBe(1)
      advance(FIRST_HOLD)
      expect(result.current.text).toBe('a')
      expect(vi.getTimerCount()).toBe(1)
    })
  })

  describe('skip', () => {
    it.each([
      ['en el primer fotograma', 0],
      ['a mitad de una pausa', FIRST_HOLD + 1],
      ['en el último fotograma', FIRST_HOLD + SECOND_HOLD],
    ])('%s salta a la salida', (_when, elapsed) => {
      const { result } = mount()
      advance(elapsed)

      act(() => result.current.skip())

      expect(result.current.phase).toBe('leaving')
    })

    it('no deja temporizadores pendientes', () => {
      const { result } = mount()
      advance(FIRST_HOLD + 1)
      expect(vi.getTimerCount()).toBe(1)

      act(() => result.current.skip())

      expect(vi.getTimerCount()).toBe(0)
    })

    it('el texto se queda donde estaba y ya no avanza', () => {
      const { result } = mount()
      advance(FIRST_HOLD)

      act(() => result.current.skip())
      advance(TOTAL)

      expect(result.current.text).toBe('a')
    })

    it('llamarlo otra vez, o ya en la salida, no cambia nada', () => {
      const { result } = mount()

      act(() => result.current.skip())
      act(() => result.current.skip())
      advance(TOTAL)

      expect(result.current.phase).toBe('leaving')
      expect(vi.getTimerCount()).toBe(0)
    })

    it('es la misma función entre renders', () => {
      const { result } = mount()
      const first = result.current.skip

      advance(FIRST_HOLD)

      // El texto cambió: hubo un render nuevo entre las dos lecturas.
      expect(result.current.text).toBe('a')
      expect(result.current.skip).toBe(first)
    })
  })

  describe('casos límite', () => {
    it('sin fotogramas muestra texto vacío y pasa a la salida enseguida', () => {
      const { result } = mount([])
      expect(result.current.text).toBe('')

      flush()

      expect(result.current.phase).toBe('leaving')
      expect(vi.getTimerCount()).toBe(0)
    })

    it('con un solo fotograma espera su pausa y pasa a la salida', () => {
      const { result } = mount([{ text: 'x', holdMs: FIRST_HOLD }])

      advance(FIRST_HOLD - 1)
      expect(result.current.phase).toBe('playing')

      advance(1)
      expect(result.current.phase).toBe('leaving')
      expect(result.current.text).toBe('x')
    })
  })
})
