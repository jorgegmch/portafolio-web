import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLOCK_INTERVAL_MS, useClock } from '@/hooks/useClock'

const BOGOTA = 'America/Bogota'
/** 12:05:00 en Bogotá. */
const START = new Date('2026-10-24T17:05:00Z')

function Clock() {
  return <time>{useClock(BOGOTA)}</time>
}

const shown = () => screen.getByText(/^\d{2}:\d{2}$/).textContent

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(START)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useClock', () => {
  it('se refresca cada medio minuto', () => {
    expect(CLOCK_INTERVAL_MS).toBe(30_000)
  })

  it('muestra la hora de Bogotá desde el primer render', () => {
    render(<Clock />)

    expect(shown()).toBe('12:05')
  })

  it('avanza solo: al cambiar el minuto, la hora se actualiza en el siguiente refresco', () => {
    render(<Clock />)

    act(() => vi.advanceTimersByTime(CLOCK_INTERVAL_MS))
    expect(shown()).toBe('12:05')
    act(() => vi.advanceTimersByTime(CLOCK_INTERVAL_MS))
    expect(shown()).toBe('12:06')
  })

  it('una hora después marca una hora más', () => {
    render(<Clock />)

    act(() => vi.advanceTimersByTime(60 * 60 * 1000))

    expect(shown()).toBe('13:05')
  })

  it('al desmontar deja de refrescar', () => {
    const clear = vi.spyOn(window, 'clearInterval')
    const { unmount } = render(<Clock />)

    unmount()

    expect(clear).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
