import { useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Fracción del elemento que debe verse para considerarlo en pantalla. */
const THRESHOLD = 0.12

const canObserve = () => typeof IntersectionObserver === 'function'

/**
 * Indica cuándo un elemento entra en pantalla por primera vez, para animar
 * su aparición. Una vez visible, se queda visible y se deja de observar.
 *
 * Con movimiento reducido, o sin IntersectionObserver, es visible desde el
 * inicio: el contenido nunca debe quedar oculto esperando una animación.
 */
export function useRevealOnScroll<T extends Element>(): {
  ref: RefObject<T | null>
  visible: boolean
} {
  const ref = useRef<T>(null)
  const reducedMotion = useReducedMotion()
  const [intersected, setIntersected] = useState(false)

  const skip = reducedMotion || !canObserve() || intersected

  useEffect(() => {
    const element = ref.current
    if (skip || !element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIntersected(true)
          observer.disconnect()
        }
      },
      { threshold: THRESHOLD },
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [skip])

  return { ref, visible: skip }
}
