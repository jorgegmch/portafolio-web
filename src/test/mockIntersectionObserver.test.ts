import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const element = () => document.body.appendChild(document.createElement('div'))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('mockIntersectionObserver', () => {
  it('instala el doble como IntersectionObserver global y guarda cada instancia', () => {
    const io = mockIntersectionObserver()

    const observer = new IntersectionObserver(() => {})

    expect(io.instances).toEqual([observer])
    expect(io.last()).toBe(observer)
  })

  it('last falla si no se creó ningún observador', () => {
    const io = mockIntersectionObserver()

    expect(() => io.last()).toThrow()
  })

  it('cada instalación empieza sin instancias', () => {
    mockIntersectionObserver()
    new IntersectionObserver(() => {})

    const io = mockIntersectionObserver()

    expect(io.instances).toEqual([])
  })

  it('registra los elementos que observa cada observador', () => {
    const io = mockIntersectionObserver()
    const first = element()
    const second = element()

    new IntersectionObserver(() => {}).observe(first)
    new IntersectionObserver(() => {}).observe(second)

    expect(io.instances.map((observer) => observer.observed)).toEqual([[first], [second]])
  })

  it('solo avisa al observador que observa ese elemento', () => {
    const io = mockIntersectionObserver()
    const first = element()
    const second = element()
    const onFirst = vi.fn()
    const onSecond = vi.fn()
    new IntersectionObserver(onFirst).observe(first)
    new IntersectionObserver(onSecond).observe(second)

    const notified = io.trigger(first, true)

    expect(notified).toBe(1)
    expect(onFirst).toHaveBeenCalledTimes(1)
    expect(onSecond).not.toHaveBeenCalled()
  })

  it('el aviso lleva una sola entrada, la del elemento, y el propio observador', () => {
    const io = mockIntersectionObserver()
    const target = element()
    const callback = vi.fn()
    const observer = new IntersectionObserver(callback)
    observer.observe(target)

    io.trigger(target, false)

    expect(callback).toHaveBeenCalledWith(
      [expect.objectContaining({ target, isIntersecting: false, intersectionRatio: 0 })],
      observer,
    )
  })

  it('al cruzarse, la entrada dice que se cruza', () => {
    const io = mockIntersectionObserver()
    const target = element()
    const callback = vi.fn()
    new IntersectionObserver(callback).observe(target)

    io.trigger(target, true)

    expect(callback).toHaveBeenCalledWith(
      [expect.objectContaining({ target, isIntersecting: true, intersectionRatio: 1 })],
      expect.anything(),
    )
  })

  it('no avisa por un elemento que nadie observa', () => {
    const io = mockIntersectionObserver()
    const callback = vi.fn()
    new IntersectionObserver(callback).observe(element())

    expect(io.trigger(element(), true)).toBe(0)
    expect(callback).not.toHaveBeenCalled()
  })

  it('tras unobserve, ese elemento ya no recibe avisos y queda registrado', () => {
    const io = mockIntersectionObserver()
    const kept = element()
    const dropped = element()
    const callback = vi.fn()
    new IntersectionObserver(callback)
    const observer = io.last()
    observer.observe(kept)
    observer.observe(dropped)

    observer.unobserve(dropped)

    expect(io.trigger(dropped, true)).toBe(0)
    expect(callback).not.toHaveBeenCalled()
    expect(observer.observed).toEqual([kept])
    expect(observer.unobserved).toEqual([dropped])
    expect(io.trigger(kept, true)).toBe(1)
  })

  it('tras disconnect no entrega nada y deja de observar todo', () => {
    const io = mockIntersectionObserver()
    const target = element()
    const callback = vi.fn()
    new IntersectionObserver(callback)
    const observer = io.last()
    observer.observe(target)

    observer.disconnect()

    expect(observer.disconnected).toBe(true)
    expect(observer.observed).toEqual([])
    expect(io.trigger(target, true)).toBe(0)
    expect(callback).not.toHaveBeenCalled()
  })
})
