import { useEffect, useState, useSyncExternalStore } from 'react'

interface RotatingIndexOptions {
  /** Cuánto dura cada elemento antes de pasar al siguiente. */
  intervalMs: number
  /** Con `true` se queda en el elemento actual hasta que vuelva a `false`. */
  paused?: boolean
}

const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

const isTabHidden = () => document.hidden

/**
 * Índice que recorre una lista de `count` elementos, uno cada `intervalMs`,
 * y al llegar al último vuelve al primero.
 *
 * Se detiene en pausa y con la pestaña oculta, donde nadie lo ve y el
 * navegador atrasa los temporizadores. Al reanudar sigue desde el mismo
 * elemento, que vuelve a tener su tiempo entero. Con menos de dos elementos
 * no hay nada que rotar y no programa nada.
 */
export function useRotatingIndex(
  count: number,
  { intervalMs, paused = false }: RotatingIndexOptions,
): number {
  const [index, setIndex] = useState(0)
  const hidden = useSyncExternalStore(subscribeToVisibility, isTabHidden)
  const running = count > 1 && intervalMs > 0 && !paused && !hidden

  useEffect(() => {
    if (!running) return

    const timer = setInterval(() => {
      setIndex((current) => current + 1)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [running, intervalMs])

  // El contador solo crece; la vuelta al primero se hace aquí, así que vale
  // también si la lista se acorta entre un avance y el siguiente.
  return count > 0 ? index % count : 0
}
