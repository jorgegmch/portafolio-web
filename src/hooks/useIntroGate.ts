import { useState } from 'react'
import { storageKeys } from '@/config/storage'
import { useOncePerSession } from '@/hooks/useOncePerSession'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Decide si la animación de carga se muestra: una vez por sesión y nunca si
 * el visitante pidió reducir el movimiento. Devuelve si está activa y la
 * función que la da por terminada, tanto si acabó como si se saltó.
 *
 * Se marca como vista al terminar, no al montar: una recarga a mitad la
 * vuelve a mostrar.
 */
export function useIntroGate(): [playing: boolean, finish: () => void] {
  const [seen, markSeen] = useOncePerSession(storageKeys.session.introSeen)
  const reducedMotion = useReducedMotion()
  // Solo cuenta la preferencia del montaje: si cambia después, la intro no
  // aparece sobre el contenido ni se corta a mitad.
  const [reducedAtMount] = useState(reducedMotion)

  return [!seen && !reducedAtMount, markSeen]
}
