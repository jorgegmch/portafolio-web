import { useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Fracción del elemento que debe verse para considerarlo en pantalla. */
const THRESHOLD = 0.12

const canObserve = () => typeof IntersectionObserver === 'function'

/**
 * Claves de los elementos ya revelados. Vive lo que vive el módulo, es decir,
 * la carga de la página: sobrevive a que un componente se desmonte y se
 * vuelva a montar (ir a otra ruta y volver), y una recarga lo vacía.
 */
const revealed = new Set<string>()

/**
 * Indica cuándo un elemento entra en pantalla por primera vez, para animar
 * su aparición. Una vez visible, se queda visible y se deja de observar.
 *
 * Cada elemento se revela una sola vez por carga de la página: `key` lo
 * identifica, así que debe ser única. Si vuelve a montarse ya revelado, es
 * visible desde el inicio, sin animación.
 *
 * Con movimiento reducido, o sin IntersectionObserver, es visible desde el
 * inicio: el contenido nunca debe quedar oculto esperando una animación.
 */
export function useRevealOnScroll<T extends Element>(
  key: string,
): {
  ref: RefObject<T | null>
  visible: boolean
} {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()
  const [intersected, setIntersected] = useState(() => revealed.has(key))

  const skip = reducedMotion || !canObserve() || intersected

  useEffect(() => {
    const element = ref.current
    if (skip || !element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          revealed.add(key)
          setIntersected(true)
          observer.unobserve(element)
        }
      },
      { threshold: THRESHOLD },
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [skip, key])

  return { ref, visible: skip }
}
