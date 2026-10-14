import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'

/**
 * - waiting: todavía no ha entrado en pantalla.
 * - typing: se está escribiendo.
 * - done: texto completo, sin animación.
 */
export type WordRevealPhase = 'waiting' | 'typing' | 'done'

/**
 * Decide cuándo se escribe un texto palabra por palabra: la primera vez que
 * entra en pantalla en esta carga de la página, cuando ya no está la
 * animación de carga encima. Usa useRevealOnScroll, y con él su registro:
 * lo que ya se escribió, o empezó a escribirse, no se vuelve a escribir.
 *
 * Termina directamente, sin escribir, si al montar ya era visible (ya
 * revelado, sin IntersectionObserver o con movimiento reducido). Mientras
 * escribe, termina al llamar a `finish`, si cambia el texto (otro idioma:
 * aparece completo en el nuevo) o si se activa el movimiento reducido. Una
 * vez terminado, no vuelve atrás.
 *
 * El texto se compara por su contenido, no por el arreglo: un render nuevo
 * con el mismo texto no cambia nada.
 *
 * Si nunca llega el fin de la animación de la última palabra, se queda en
 * typing: el texto se ve completo, pero sin cursor.
 */
export function useWordReveal<T extends Element>(
  key: string,
  paragraphs: readonly string[],
): {
  ref: RefObject<T | null>
  phase: WordRevealPhase
  finish: () => void
} {
  const { ref, visible } = useRevealOnScroll<T>(key)
  const reducedMotion = useReducedMotion()
  // Solo puede ser visible en el primer render si no hay nada que animar.
  const [visibleAtMount] = useState(visible)
  const [finished, setFinished] = useState(false)

  const textKey = paragraphs.join('\n')
  const [prevKey, setPrevKey] = useState(textKey)

  // Ajustes de estado durante el render, a partir de lo que cambió desde el
  // anterior: así no hay un render intermedio que empiece a animar.
  if (textKey !== prevKey) {
    setPrevKey(textKey)
    if (visible) setFinished(true)
  }
  if (reducedMotion && !finished) setFinished(true)

  const phase: WordRevealPhase =
    visibleAtMount || finished ? 'done' : visible ? 'typing' : 'waiting'

  // finish es estable: lee la fase del último render ya pintado.
  const typing = useRef(false)
  useEffect(() => {
    typing.current = phase === 'typing'
  })
  const finish = useCallback(() => {
    if (typing.current) setFinished(true)
  }, [])

  return { ref, phase, finish }
}
