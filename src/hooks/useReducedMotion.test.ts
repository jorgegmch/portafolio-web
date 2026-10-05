import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { mockMatchMedia } from '@/test/mockMatchMedia'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useReducedMotion', () => {
  it('es false si el visitante no pidió reducir el movimiento', () => {
    mockMatchMedia(false)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
  })

  it('es true si el visitante pidió reducir el movimiento', () => {
    mockMatchMedia(true)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true)
  })

  it('consulta prefers-reduced-motion', () => {
    mockMatchMedia(false)
    renderHook(() => useReducedMotion())
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('reacciona si la preferencia cambia', () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())

    act(() => media.setMatches(true))

    expect(result.current).toBe(true)
  })

  it('deja de escuchar al desmontar', () => {
    const media = mockMatchMedia(false)
    const { unmount } = renderHook(() => useReducedMotion())
    expect(media.listenerCount()).toBe(1)

    unmount()

    expect(media.listenerCount()).toBe(0)
  })

  it('es false si el navegador no tiene matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
  })
})
