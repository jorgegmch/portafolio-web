import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRotatingIndex } from '@/hooks/useRotatingIndex'

const INTERVAL = 4000

/** Simula que la pestaña pasa a segundo plano o vuelve, con su evento. */
const setTabHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

interface Props {
  count: number
  intervalMs: number
  paused: boolean
}

const setup = (initial: Partial<Props> = {}) =>
  renderHook(
    ({ count, intervalMs, paused }: Props) => useRotatingIndex(count, { intervalMs, paused }),
    { initialProps: { count: 3, intervalMs: INTERVAL, paused: false, ...initial } },
  )

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  // Quita la propiedad simulada: vuelve la del prototipo de jsdom.
  Reflect.deleteProperty(document, 'hidden')
})

describe('useRotatingIndex', () => {
  describe('avance', () => {
    it('empieza en el primero', () => {
      const { result } = setup()

      expect(result.current).toBe(0)
    })

    it('no avanza antes de cumplirse el intervalo, y avanza justo al cumplirse', () => {
      const { result } = setup()

      advance(INTERVAL - 1)
      expect(result.current).toBe(0)

      advance(1)
      expect(result.current).toBe(1)
    })

    it('sigue avanzando de uno en uno y, tras el último, vuelve al primero', () => {
      const { result } = setup()

      advance(INTERVAL)
      expect(result.current).toBe(1)
      advance(INTERVAL)
      expect(result.current).toBe(2)
      advance(INTERVAL)
      expect(result.current).toBe(0)
      advance(INTERVAL)
      expect(result.current).toBe(1)
    })

    it('usa el intervalo que recibe, también si cambia', () => {
      const { result, rerender } = setup({ intervalMs: 1000 })

      advance(1000)
      expect(result.current).toBe(1)

      rerender({ count: 3, intervalMs: 500, paused: false })
      advance(500)
      expect(result.current).toBe(2)
    })
  })

  describe('pausa', () => {
    it('en pausa desde el montaje no avanza ni deja temporizador', () => {
      const { result } = setup({ paused: true })

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(0)
    })

    it('al pausar se queda donde estaba y retira el temporizador', () => {
      const { result, rerender } = setup()
      advance(INTERVAL)

      rerender({ count: 3, intervalMs: INTERVAL, paused: true })

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(1)
    })

    // El texto que estaba a la vista vuelve a tener su tiempo entero.
    it('al reanudar sigue desde el mismo, con el intervalo completo', () => {
      const { result, rerender } = setup()
      advance(INTERVAL / 2)
      rerender({ count: 3, intervalMs: INTERVAL, paused: true })
      advance(INTERVAL * 5)

      rerender({ count: 3, intervalMs: INTERVAL, paused: false })

      advance(INTERVAL - 1)
      expect(result.current).toBe(0)
      advance(1)
      expect(result.current).toBe(1)
    })
  })

  describe('pestaña oculta', () => {
    it('no avanza mientras la pestaña está oculta, ni deja temporizador', () => {
      const { result } = setup()

      setTabHidden(true)

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(0)
    })

    it('al volver sigue desde el mismo, con el intervalo completo', () => {
      const { result } = setup()
      advance(INTERVAL)
      advance(INTERVAL / 2)
      setTabHidden(true)
      advance(INTERVAL * 5)

      setTabHidden(false)

      advance(INTERVAL - 1)
      expect(result.current).toBe(1)
      advance(1)
      expect(result.current).toBe(2)
    })

    it('si monta con la pestaña ya oculta, espera a que se vea', () => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
      const { result } = setup()

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(0)

      setTabHidden(false)
      advance(INTERVAL)
      expect(result.current).toBe(1)
    })

    it('volver a la pestaña no reanuda si está en pausa', () => {
      const { result } = setup({ paused: true })

      setTabHidden(true)
      setTabHidden(false)

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(0)
    })
  })

  describe('casos límite', () => {
    it.each([0, 1])('con %i elementos no hay nada que rotar: ni avanza ni deja temporizador', (count) => {
      const { result } = setup({ count })

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(0)
    })

    it.each([0, -1, Number.NaN])('con un intervalo de %s no programa nada', (intervalMs) => {
      const { result } = setup({ intervalMs })

      expect(vi.getTimerCount()).toBe(0)
      advance(INTERVAL * 5)
      expect(result.current).toBe(0)
    })

    it('si la lista se acorta, el índice nunca queda fuera de ella', () => {
      const { result, rerender } = setup()
      advance(INTERVAL * 2)
      expect(result.current).toBe(2)

      rerender({ count: 2, intervalMs: INTERVAL, paused: false })

      expect(result.current).toBeLessThan(2)
    })
  })

  describe('limpieza', () => {
    it('al desmontar no queda ningún temporizador', () => {
      const { unmount } = setup()
      expect(vi.getTimerCount()).toBe(1)

      unmount()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('nunca hay más de un temporizador a la vez', () => {
      const { rerender } = setup()

      advance(INTERVAL * 3)
      rerender({ count: 3, intervalMs: INTERVAL, paused: true })
      rerender({ count: 3, intervalMs: INTERVAL, paused: false })
      setTabHidden(true)
      setTabHidden(false)

      expect(vi.getTimerCount()).toBe(1)
    })

    it('al desmontar retira el listener de visibilidad que registró', () => {
      const added = vi.spyOn(document, 'addEventListener')
      const removed = vi.spyOn(document, 'removeEventListener')
      const calls = (spy: typeof added) =>
        spy.mock.calls.filter(([type]) => type === 'visibilitychange')

      const { unmount } = setup()
      expect(calls(added)).toHaveLength(1)

      unmount()

      expect(calls(removed)).toHaveLength(1)
      expect(calls(removed).at(0)?.[1]).toBe(calls(added).at(0)?.[1])
    })

    it('después de desmontar, volver a la pestaña no programa nada', () => {
      const { unmount } = setup()
      unmount()

      setTabHidden(true)
      setTabHidden(false)

      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
