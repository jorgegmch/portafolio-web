import { vi } from 'vitest'

/**
 * Sustituye requestAnimationFrame y cancelAnimationFrame por una cola que el
 * test avanza a mano, para decidir cuándo ocurre cada frame y con qué marca de
 * tiempo. Se deshace con vi.unstubAllGlobals().
 */
export function mockAnimationFrame() {
  let lastId = 0
  const pending = new Map<number, FrameRequestCallback>()

  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      lastId += 1
      pending.set(lastId, callback)
      return lastId
    }),
  )
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => {
      pending.delete(id)
    }),
  )

  return {
    /** Ejecuta los frames pendientes con la marca de tiempo dada, en ms. */
    step(now: number) {
      const callbacks = [...pending.values()]
      pending.clear()
      callbacks.forEach((callback) => callback(now))
    },
    /** Frames pedidos que aún no se ejecutaron ni se cancelaron. */
    pendingCount: () => pending.size,
  }
}
