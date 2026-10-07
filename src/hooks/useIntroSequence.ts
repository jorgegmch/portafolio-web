import { useCallback, useEffect, useState } from 'react'
import type { IntroFrame } from '@/lib/introFrames'

/** 'playing' mientras se recorren los fotogramas; 'leaving' cuando ya terminó o se saltó. */
export type IntroPhase = 'playing' | 'leaving'

interface IntroSequence {
  /** Texto del fotograma actual. */
  text: string
  phase: IntroPhase
  /** Pasa a la salida sin esperar al final. */
  skip: () => void
}

/**
 * Recorre los fotogramas de la animación de carga: muestra cada uno durante
 * su pausa y, tras el último, pasa a la salida. Solo hay un temporizador a la
 * vez, y se cancela al saltar o al desmontar.
 */
export function useIntroSequence(frames: readonly IntroFrame[]): IntroSequence {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<IntroPhase>('playing')

  const frame = frames[index]
  const isLast = index >= frames.length - 1
  // Sin fotogramas no hay nada que esperar.
  const holdMs = frame?.holdMs ?? 0

  // Depende de valores y no de la lista: un render con otra lista igual no
  // reinicia la pausa en curso.
  useEffect(() => {
    if (phase !== 'playing') return

    const timer = setTimeout(() => {
      if (isLast) setPhase('leaving')
      else setIndex((current) => current + 1)
    }, holdMs)

    return () => clearTimeout(timer)
  }, [phase, index, isLast, holdMs])

  const skip = useCallback(() => setPhase('leaving'), [])

  return { text: frame?.text ?? '', phase, skip }
}
