import { useCallback, useEffect, useMemo, useRef, type TransitionEvent } from 'react'
import styles from '@/components/layout/LoadingIntro.module.css'
import { useIntroSequence } from '@/hooks/useIntroSequence'
import { useLang } from '@/hooks/useLang'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

interface LoadingIntroProps {
  /** Se llama una sola vez, cuando la capa ya terminó de desvanecerse. */
  onDone: () => void
}

/**
 * Animación de carga: una frase que se escribe y se transforma en código
 * sobre una capa que tapa la página. Al acabar, o al saltarla, la capa se
 * desvanece y avisa con onDone para que quien la monta la retire.
 */
export function LoadingIntro({ onDone }: LoadingIntroProps) {
  const { t } = useLang()
  const phrase = t.intro.phrases[0]
  const frames = useMemo(
    () => buildIntroFrames(phrase?.natural ?? '', phrase?.code ?? ''),
    [phrase],
  )
  const { text, phase, skip } = useIntroSequence(frames)
  const leaving = phase === 'leaving'

  const skipRef = useRef<HTMLButtonElement>(null)
  const finished = useRef(false)

  // La capa tapa la página: el foco empieza en lo único que se puede usar.
  useEffect(() => {
    skipRef.current?.focus()
  }, [])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    onDone()
  }, [onDone])

  // Respaldo: si la transición no llega a terminar (pestaña en segundo plano,
  // transición anulada), la página no puede quedarse tapada.
  useEffect(() => {
    if (!leaving) return

    const timer = setTimeout(finish, INTRO_TIMING.exitFallbackMs)
    return () => clearTimeout(timer)
  }, [leaving, finish])

  // Solo cuenta la transición de la propia capa, no las de su contenido.
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (leaving && event.target === event.currentTarget) finish()
  }

  return (
    <div
      className={leaving ? `${styles.intro} ${styles.leaving}` : styles.intro}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Letras que cambian una a una: para un lector de pantalla son ruido. */}
      <p className={styles.line} aria-hidden="true">
        <span>{text}</span>
        <span className={styles.cursor} />
      </p>
      <button ref={skipRef} type="button" className={styles.skip} onClick={skip}>
        {t.intro.skip}
      </button>
    </div>
  )
}
