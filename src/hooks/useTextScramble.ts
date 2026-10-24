import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionPause } from '@/hooks/useMotionPause'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { buildScramble, type ScrambleStep } from '@/lib/nameScramble'

interface TextScramble {
  /** Lo que se ve ahora: uno de los dos textos o un paso intermedio. */
  text: string
  /** Pide el texto alternativo (true) o el de reposo (false). */
  setAlternate: (on: boolean) => void
}

const stepText = (step: ScrambleStep) => step.words.map(({ code, rest }) => code + rest).join(' ')

/**
 * Texto que se traduce a otro y se queda así mientras se pida (spec §4.2, el
 * logo de la barra): al pedirlo, las letras se codifican hasta leer el otro
 * texto; al soltarlo, vuelven desde donde estén. No cambia solo.
 *
 * Con movimiento reducido o con las animaciones pausadas, el texto cambia de
 * golpe, sin pasos intermedios. Los pasos van con un solo temporizador a la
 * vez, que se limpia al desmontar.
 */
export function useTextScramble(rest: string, alternate: string): TextScramble {
  const reducedMotion = useReducedMotion()
  const { paused } = useMotionPause()
  const animated = !reducedMotion && !paused

  const [alternateOn, setAlternateOn] = useState(false)
  const [run, setRun] = useState<{ steps: readonly ScrambleStep[]; index: number } | null>(null)
  const target = alternateOn ? alternate : rest
  const step = animated ? run?.steps[run.index] : undefined
  const text = step ? stepText(step) : target

  // Lo que se ve, para empezar desde ahí si se cambia de idea a medio camino,
  // y lo último que se pidió. Se leen en el evento, no al renderizar.
  const shown = useRef(text)
  const wanted = useRef(false)
  useEffect(() => {
    shown.current = text
  }, [text])

  useEffect(() => {
    if (!step) return
    const timer = setTimeout(() => {
      setRun((current) =>
        current && current.index + 1 < current.steps.length ? { ...current, index: current.index + 1 } : null,
      )
    }, step.holdMs)
    return () => clearTimeout(timer)
  }, [step])

  const setAlternate = useCallback(
    (on: boolean) => {
      if (wanted.current === on) return
      wanted.current = on
      // El azar se sortea aquí, en el evento, y no al renderizar.
      const steps = animated ? buildScramble([shown.current], on ? alternate : rest) : []
      setAlternateOn(on)
      setRun(steps.length > 0 ? { steps, index: 0 } : null)
    },
    [animated, alternate, rest],
  )

  return { text, setAlternate }
}
