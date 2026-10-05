import { vi } from 'vitest'

/**
 * Instala un window.matchMedia controlable (jsdom no lo implementa).
 * Devuelve una función para cambiar el resultado y avisar a los listeners.
 */
export function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  const listeners = new Set<() => void>()

  const mediaQuery = {
    get matches() {
      return matches
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery),
  )

  return {
    setMatches(next: boolean) {
      matches = next
      listeners.forEach((listener) => listener())
    },
    listenerCount: () => listeners.size,
  }
}
