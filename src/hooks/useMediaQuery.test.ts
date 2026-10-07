import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaQueries } from '@/config/media'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { mockMatchMedia } from '@/test/mockMatchMedia'

const QUERY: string = mediaQueries.compactNav
const OTHER_QUERY = '(min-width: 1px)'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('es false si la consulta no coincide', () => {
    mockMatchMedia(false)
    expect(renderHook(() => useMediaQuery(QUERY)).result.current).toBe(false)
  })

  it('es true si la consulta coincide', () => {
    mockMatchMedia(true)
    expect(renderHook(() => useMediaQuery(QUERY)).result.current).toBe(true)
  })

  it('pregunta por la consulta que recibe', () => {
    mockMatchMedia(false)
    renderHook(() => useMediaQuery(QUERY))
    expect(window.matchMedia).toHaveBeenCalledWith(QUERY)
  })

  // Girar el teléfono o redimensionar la ventana cambia el resultado en vivo.
  it('reacciona si el resultado cambia en un sentido y en el otro', () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery(QUERY))

    act(() => media.setMatches(true))
    expect(result.current).toBe(true)

    act(() => media.setMatches(false))
    expect(result.current).toBe(false)
  })

  it('deja de escuchar al desmontar', () => {
    const media = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery(QUERY))
    expect(media.listenerCount()).toBe(1)

    unmount()

    expect(media.listenerCount()).toBe(0)
  })

  it('si la consulta cambia, pregunta por la nueva sin acumular listeners', () => {
    const media = mockMatchMedia(false)
    const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: QUERY },
    })

    rerender({ query: OTHER_QUERY })

    expect(window.matchMedia).toHaveBeenCalledWith(OTHER_QUERY)
    expect(media.listenerCount()).toBe(1)
  })

  it('es false si el navegador no tiene matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(renderHook(() => useMediaQuery(QUERY)).result.current).toBe(false)
  })
})
