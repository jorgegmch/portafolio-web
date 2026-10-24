import { useCallback, useEffect, useState } from 'react'
import { useIntroPlaying } from '@/hooks/useIntroPlaying'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMotionPause } from '@/hooks/useMotionPause'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { buildNameScramble, type ScrambledWord, type ScrambleStep } from '@/lib/nameScramble'

/** Solo con un puntero fino que pasa por encima: ni en táctil ni en teclado. */
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'

interface NameScramble {
  /** Las palabras a medio traducir, o null si el nombre está en reposo. */
  words: readonly ScrambledWord[] | null
  /** Arranca una pasada de ida y vuelta, si no hay otra en curso. */
  start: () => void
}

/**
 * Nombre que se traduce al pasar el puntero (spec §4.2). Cada pasada sortea
 * sus letras de relleno al empezar y recorre los pasos con un solo
 * temporizador a la vez.
 *
 * No hace nada sin puntero fino, con movimiento reducido, con las animaciones
 * pausadas ni con la intro encima. Si se pausa a mitad, el nombre vuelve al
 * reposo y la pasada queda detenida donde iba: sigue al reanudar.
 */
export function useNameScramble(names: readonly string[], target: string): NameScramble {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY)
  const reducedMotion = useReducedMotion()
  const { paused } = useMotionPause()
  const introPlaying = useIntroPlaying()
  const enabled = finePointer && !reducedMotion && !paused && !introPlaying

  const [run, setRun] = useState<{ steps: readonly ScrambleStep[]; index: number } | null>(null)
  const step = enabled ? run?.steps[run.index] : undefined

  useEffect(() => {
    if (!step) return

    const timer = setTimeout(() => {
      setRun((current) =>
        current && current.index + 1 < current.steps.length
          ? { ...current, index: current.index + 1 }
          : null,
      )
    }, step.holdMs)
    return () => clearTimeout(timer)
  }, [step])

  const start = useCallback(() => {
    if (!enabled) return
    // El azar se sortea aquí, en el evento, y no dentro del setState.
    const steps = buildNameScramble(names, target)
    if (steps.length === 0) return
    setRun((current) => current ?? { steps, index: 0 })
  }, [enabled, names, target])

  return { words: step?.words ?? null, start }
}
