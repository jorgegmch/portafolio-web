import { vi } from 'vitest'

interface MediaEntry {
  matches: boolean
  listeners: Set<() => void>
}

/**
 * Instala un window.matchMedia controlable (jsdom no lo implementa).
 * Con un booleano, todas las consultas responden lo mismo. Con un objeto,
 * cada consulta responde lo suyo, y las que no aparecen en él, false.
 * Devuelve funciones para cambiar el resultado y avisar a los listeners.
 */
export function mockMatchMedia(initialMatches: boolean | Record<string, boolean>) {
  let defaults = initialMatches
  const entries = new Map<string, MediaEntry>()

  const entryFor = (query: string): MediaEntry => {
    const known = entries.get(query)
    if (known) return known
    const matches = typeof defaults === 'boolean' ? defaults : (defaults[query] ?? false)
    const entry: MediaEntry = { matches, listeners: new Set() }
    entries.set(query, entry)
    return entry
  }

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      const entry = entryFor(query)
      return {
        get matches() {
          return entry.matches
        },
        addEventListener: (_type: string, listener: () => void) => entry.listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) =>
          entry.listeners.delete(listener),
      }
    }),
  )

  return {
    /** Sin consulta, cambia todas: las ya pedidas y las que se pidan después. */
    setMatches(next: boolean, query?: string) {
      if (query === undefined) defaults = next
      const targets = query === undefined ? [...entries.values()] : [entryFor(query)]
      for (const entry of targets) {
        entry.matches = next
        entry.listeners.forEach((listener) => listener())
      }
    },
    /** Sin consulta, cuenta los listeners de todas. */
    listenerCount: (query?: string) =>
      query === undefined
        ? [...entries.values()].reduce((total, entry) => total + entry.listeners.size, 0)
        : entryFor(query).listeners.size,
  }
}
