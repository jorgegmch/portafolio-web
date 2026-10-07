import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SCROLL_THRESHOLD, useScrolled } from '@/hooks/useScrolled'

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, configurable: true })
}

const scrollTo = (value: number) =>
  act(() => {
    setScrollY(value)
    window.dispatchEvent(new Event('scroll'))
  })

afterEach(() => {
  setScrollY(0)
  vi.restoreAllMocks()
})

describe('useScrolled', () => {
  it('es false con la página arriba', () => {
    expect(renderHook(() => useScrolled()).result.current).toBe(false)
  })

  it('es true al pasar el umbral', () => {
    const { result } = renderHook(() => useScrolled())

    scrollTo(SCROLL_THRESHOLD + 1)

    expect(result.current).toBe(true)
  })

  it('vuelve a false al regresar arriba', () => {
    const { result } = renderHook(() => useScrolled())

    scrollTo(SCROLL_THRESHOLD + 200)
    scrollTo(0)

    expect(result.current).toBe(false)
  })

  it('justo en el umbral todavía es false', () => {
    const { result } = renderHook(() => useScrolled())

    scrollTo(SCROLL_THRESHOLD)

    expect(result.current).toBe(false)
  })

  // Al recargar a mitad de página el navegador restaura el scroll sin que
  // haya ocurrido ningún evento todavía.
  it('es true si la página ya estaba desplazada al montar', () => {
    setScrollY(SCROLL_THRESHOLD + 300)

    expect(renderHook(() => useScrolled()).result.current).toBe(true)
  })

  it('escucha el scroll en modo passive', () => {
    const added = vi.spyOn(window, 'addEventListener')

    renderHook(() => useScrolled())

    expect(added).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      expect.objectContaining({ passive: true }),
    )
  })

  it('deja de escuchar al desmontar', () => {
    const added = vi.spyOn(window, 'addEventListener')
    const removed = vi.spyOn(window, 'removeEventListener')
    const { result, unmount } = renderHook(() => useScrolled())
    const scrollListeners = added.mock.calls
      .filter(([type]) => type === 'scroll')
      .map(([, listener]) => listener)
    expect(scrollListeners).toHaveLength(1)

    unmount()

    expect(removed).toHaveBeenCalledWith('scroll', scrollListeners.at(0))
    scrollTo(SCROLL_THRESHOLD + 1)
    expect(result.current).toBe(false)
  })
})
