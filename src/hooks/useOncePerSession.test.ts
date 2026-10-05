import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useOncePerSession } from '@/hooks/useOncePerSession'

const KEY = 'test:once'

const blockStorage = () => {
  const fail = () => {
    throw new DOMException('bloqueado', 'SecurityError')
  }
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useOncePerSession', () => {
  it('la primera vez indica que todavía no ocurrió', () => {
    const [done] = renderHook(() => useOncePerSession(KEY)).result.current
    expect(done).toBe(false)
  })

  it('después de marcarlo indica que ya ocurrió', () => {
    const { result } = renderHook(() => useOncePerSession(KEY))

    act(() => result.current[1]())

    expect(result.current[0]).toBe(true)
  })

  it('lo recuerda en la misma sesión, tras volver a montar', () => {
    const first = renderHook(() => useOncePerSession(KEY))
    act(() => first.result.current[1]())
    first.unmount()

    const [done] = renderHook(() => useOncePerSession(KEY)).result.current
    expect(done).toBe(true)
  })

  it('usa sessionStorage y no localStorage', () => {
    const { result } = renderHook(() => useOncePerSession(KEY))

    act(() => result.current[1]())

    expect(sessionStorage.getItem(KEY)).not.toBeNull()
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('cada clave se recuerda por separado', () => {
    const first = renderHook(() => useOncePerSession(KEY))
    act(() => first.result.current[1]())

    const [done] = renderHook(() => useOncePerSession('test:otra')).result.current
    expect(done).toBe(false)
  })

  it('con el almacenamiento bloqueado funciona mientras dure la página', () => {
    blockStorage()
    const { result } = renderHook(() => useOncePerSession(KEY))
    expect(result.current[0]).toBe(false)

    act(() => result.current[1]())

    expect(result.current[0]).toBe(true)
  })
})
