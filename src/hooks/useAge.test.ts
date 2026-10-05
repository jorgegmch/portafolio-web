import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAge } from '@/hooks/useAge'
import type { DateParts } from '@/lib/calculateAge'

// Fecha ficticia: los tests no dependen de la fecha real de config/.
const birth: DateParts = { year: 2000, month: 3, day: 15 }

const MINUTE = 60_000

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useAge', () => {
  it('devuelve la edad correcta al montar', () => {
    vi.setSystemTime(new Date(2026, 5, 1, 12, 0))
    const { result } = renderHook(() => useAge(birth))
    expect(result.current).toBe(26)
  })

  it('cambia al cruzar la medianoche del cumpleaños con el componente montado', () => {
    vi.setSystemTime(new Date(2026, 2, 14, 23, 59))
    const { result } = renderHook(() => useAge(birth))
    expect(result.current).toBe(25)

    act(() => {
      vi.advanceTimersByTime(2 * MINUTE)
    })

    expect(result.current).toBe(26)
  })

  it('sigue programando la siguiente medianoche después de la primera', () => {
    vi.setSystemTime(new Date(2026, 2, 13, 23, 59))
    const { result } = renderHook(() => useAge(birth))

    act(() => {
      vi.advanceTimersByTime(2 * MINUTE)
    })
    expect(result.current).toBe(25)

    act(() => {
      vi.advanceTimersByTime(24 * 60 * MINUTE)
    })
    expect(result.current).toBe(26)
  })

  it('recalcula al volver a la pestaña, aunque el timer no haya corrido', () => {
    vi.setSystemTime(new Date(2026, 2, 14, 10, 0))
    const { result } = renderHook(() => useAge(birth))
    expect(result.current).toBe(25)

    // El reloj salta sin avanzar los timers, como en una pestaña suspendida.
    vi.setSystemTime(new Date(2026, 2, 16, 10, 0))
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current).toBe(26)
  })

  it('nunca programa un timer de más de 24 horas', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    vi.setSystemTime(new Date(2026, 5, 1, 0, 0, 1))

    renderHook(() => useAge(birth))

    const delays = setTimeoutSpy.mock.calls.map(([, delay]) => delay ?? 0)
    expect(delays.length).toBeGreaterThan(0)
    expect(Math.max(...delays)).toBeLessThanOrEqual(24 * 60 * MINUTE)
  })

  it('limpia el timer y el listener al desmontar', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener')
    vi.setSystemTime(new Date(2026, 5, 1, 12, 0))
    const { unmount } = renderHook(() => useAge(birth))
    expect(vi.getTimerCount()).toBe(1)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
