import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// matchMedia no existe en todos los entornos (p. ej. jsdom).
const getMediaQuery = (): MediaQueryList | null =>
  typeof window.matchMedia === 'function' ? window.matchMedia(QUERY) : null

const subscribe = (onChange: () => void) => {
  const mediaQuery = getMediaQuery()
  mediaQuery?.addEventListener('change', onChange)
  return () => mediaQuery?.removeEventListener('change', onChange)
}

const getSnapshot = () => getMediaQuery()?.matches ?? false

/** true si el visitante pidió reducir el movimiento; reacciona si lo cambia. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
