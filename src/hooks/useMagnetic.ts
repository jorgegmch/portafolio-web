import { type RefObject, useEffect } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Cuánto se acerca el botón al puntero, como mucho, en px (spec §4.6). */
export const MAGNETIC_MAX_SHIFT = 18

/** Solo con un puntero preciso: en táctil no hay puntero que seguir. */
export const FINE_POINTER_QUERY = '(pointer: fine)'

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

/**
 * Botón magnético (spec §4.6): mientras el puntero pasa por encima, el
 * elemento se desplaza hacia él, hasta MAGNETIC_MAX_SHIFT px en cada eje, y
 * al salir vuelve a su sitio. Solo mueve con translate, una vez por
 * fotograma; la vuelta suave la pone la transición del CSS.
 *
 * Quieto en táctil y con movimiento reducido. Lo mueve el visitante, no se
 * mueve solo: la pausa global no lo detiene.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, maxShift = MAGNETIC_MAX_SHIFT): void {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY)
  const reducedMotion = useReducedMotion()
  const active = finePointer && !reducedMotion

  useEffect(() => {
    const element = ref.current
    if (!element || !active) return

    let frame = 0
    let x = 0
    let y = 0
    const apply = () => {
      frame = 0
      element.style.transform = x === 0 && y === 0 ? '' : `translate(${x}px, ${y}px)`
    }
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(apply)
    }

    const move = (event: PointerEvent) => {
      // La caja ya incluye el desplazamiento actual: se descuenta para medir
      // desde el sitio del botón, no desde donde se ha movido.
      const box = element.getBoundingClientRect()
      const centerX = box.left - x + box.width / 2
      const centerY = box.top - y + box.height / 2
      x = Math.round(clamp((event.clientX - centerX) / (box.width / 2)) * maxShift)
      y = Math.round(clamp((event.clientY - centerY) / (box.height / 2)) * maxShift)
      schedule()
    }
    const leave = () => {
      x = 0
      y = 0
      schedule()
    }

    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', leave)
      element.style.transform = ''
    }
  }, [ref, active, maxShift])
}
