import { useSyncExternalStore } from 'react'

/** Píxeles de scroll a partir de los cuales la página cuenta como desplazada. */
export const SCROLL_THRESHOLD = 50

// passive: el listener nunca cancela el scroll, así que no lo frena.
const LISTENER_OPTIONS = { passive: true } as const

const subscribe = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, LISTENER_OPTIONS)
  return () => window.removeEventListener('scroll', onChange)
}

const getSnapshot = () => window.scrollY > SCROLL_THRESHOLD

/** true cuando la página se desplazó más allá del umbral; reacciona al scroll. */
export function useScrolled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
