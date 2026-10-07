import { useCallback, useSyncExternalStore } from 'react'

// matchMedia no existe en todos los entornos (p. ej. jsdom).
const getMediaQuery = (query: string): MediaQueryList | null =>
  typeof window.matchMedia === 'function' ? window.matchMedia(query) : null

/** true si la consulta de medios coincide; reacciona si deja de hacerlo. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = getMediaQuery(query)
      mediaQuery?.addEventListener('change', onChange)
      return () => mediaQuery?.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(subscribe, () => getMediaQuery(query)?.matches ?? false)
}
