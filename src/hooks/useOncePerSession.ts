import { useCallback, useState } from 'react'
import { safeStorage } from '@/lib/safeStorage'

const DONE = '1'

/**
 * Para cosas que ocurren una sola vez por sesión del navegador, como la
 * animación de carga. Devuelve si ya ocurrió y una función para marcarla.
 *
 * Con sessionStorage bloqueado sigue funcionando mientras dure la página,
 * pero no recuerda nada tras una recarga.
 */
export function useOncePerSession(key: string): [done: boolean, markDone: () => void] {
  const [done, setDone] = useState(() => safeStorage.get('session', key) === DONE)

  const markDone = useCallback(() => {
    setDone(true)
    safeStorage.set('session', key, DONE)
  }, [key])

  return [done, markDone]
}
