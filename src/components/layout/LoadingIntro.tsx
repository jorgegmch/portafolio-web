import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type TransitionEvent,
} from 'react'
import styles from '@/components/layout/LoadingIntro.module.css'
import { useIntroSequence } from '@/hooks/useIntroSequence'
import { useLang } from '@/hooks/useLang'
import { useMotionPause } from '@/hooks/useMotionPause'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

interface LoadingIntroProps {
  /** Se llama una sola vez, cuando las barras ya terminaron de abrirse. */
  onDone: () => void
}

/**
 * Animación de carga (spec §4.1): una frase de negocio que se tacha y se
 * reescribe como código, entre dos barras de cine que tapan la página. Al
 * acabar, o al saltarla, el texto se desvanece y las barras se abren hacia
 * arriba y hacia abajo; entonces avisa con onDone para que quien la monta la
 * retire.
 *
 * Si se pausan las animaciones, termina en el acto, sin abrir las barras.
 */
export function LoadingIntro({ onDone }: LoadingIntroProps) {
  const { t } = useLang()
  const { paused } = useMotionPause()
  const phrase = t.intro.phrases[0]
  const frames = useMemo(() => buildIntroFrames(phrase?.code ?? ''), [phrase])
  const { frame, phase, skip } = useIntroSequence(frames)
  const leaving = phase === 'leaving'

  const layerRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)

  // La capa tapa la página, así que el foco empieza en ella. No va al botón:
  // un foco puesto por código al cargar le mostraría el anillo sin que nadie
  // hubiera usado el teclado. Desde la capa, el primer Tab llega al botón.
  useEffect(() => {
    layerRef.current?.focus()
  }, [])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    onDone()
  }, [onDone])

  // Pausar es pedir que nada se mueva: ni la escritura ni las barras.
  useEffect(() => {
    if (paused) finish()
  }, [paused, finish])

  // Respaldo: si la transición no llega a terminar (pestaña en segundo plano,
  // transición anulada), la página no puede quedarse tapada.
  useEffect(() => {
    if (!leaving) return

    const timer = setTimeout(finish, INTRO_TIMING.exitFallbackMs)
    return () => clearTimeout(timer)
  }, [leaving, finish])

  // Las dos barras se abren a la vez y con la misma duración: basta con
  // esperar a la de arriba. Las transiciones del texto no cuentan.
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (leaving && event.target === topBarRef.current) finish()
  }

  // Con el foco en la capa, Enter y Espacio saltan sin pasar antes por el
  // botón. Las teclas que nacen en el botón no se tocan: él ya salta al
  // activarse, y atenderlas aquí también pediría saltar dos veces.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    // Ni la tecla mantenida ni los atajos del navegador son una orden de saltar.
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    // El Enter del teclado numérico llega con la misma key que el principal.
    if (event.key !== 'Enter' && event.key !== ' ') return

    // Espacio desplazaría la página de debajo.
    event.preventDefault()
    skip()
  }

  const struck = frame?.struck ?? false

  return (
    // La capa no es un control: recibe el foco por código al montar para
    // atender Enter y Espacio, y el elemento accesible es el botón de dentro.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={layerRef}
      className={leaving ? `${styles.intro} ${styles.leaving}` : styles.intro}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={topBarRef} className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />
      {/* Letras que cambian una a una: para un lector de pantalla son ruido. */}
      <div className={styles.content} aria-hidden="true">
        <p className={struck ? `${styles.natural} ${styles.struck}` : styles.natural}>
          {phrase?.natural}
        </p>
        <p className={styles.code}>
          <span>{frame?.code}</span>
          <span className={styles.cursor} />
        </p>
      </div>
      <button type="button" className={styles.skip} onClick={skip}>
        {t.intro.skip}
      </button>
    </div>
  )
}
