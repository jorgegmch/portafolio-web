import { useCallback, useEffect, useId, useMemo, useRef, type TransitionEvent } from 'react'
import styles from '@/components/layout/LoadingIntro.module.css'
import { useIntroSequence } from '@/hooks/useIntroSequence'
import { useLang } from '@/hooks/useLang'
import { useMotionPause } from '@/hooks/useMotionPause'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

interface LoadingIntroProps {
  /** Se llama una sola vez, cuando las barras ya terminaron de abrirse. */
  onDone: () => void
}

/** Teclas que saltan la intro: Esc, y también Enter y Espacio. */
const SKIP_KEYS = new Set(['Escape', 'Enter', ' '])

/**
 * Animación de carga (spec §4.1): una frase de negocio que se tacha a lápiz
 * y se reescribe como código, entre dos barras de cine que tapan la página.
 * Al acabar, o al saltarla, el texto se desvanece y las barras se abren hacia
 * arriba y hacia abajo; entonces avisa con onDone para que quien la monta la
 * retire.
 *
 * Sin botón: se salta con un clic o un toque en la capa, o con Esc (también
 * Enter y Espacio). La capa es un diálogo modal con nombre, que recibe el
 * foco al montarse; su descripción, que solo oye el lector de pantalla, dice
 * cómo saltarla. El resto de la página está inerte mientras tanto. Al salir,
 * el foco vuelve al principio del documento: el siguiente Tab llega al skip
 * link.
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
  const hintId = useId()

  const layerRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)

  // La capa tapa la página, así que el foco empieza en ella.
  useEffect(() => {
    layerRef.current?.focus()
  }, [])

  // Un clic o un toque en cualquier punto de la capa la salta. Es un atajo
  // del puntero: con teclado se salta con Esc.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.addEventListener('click', skip)
    return () => layer.removeEventListener('click', skip)
  }, [skip])

  // Las teclas se escuchan en todo el documento: si el foco sale de la capa
  // (con Tab hacia el navegador, por ejemplo), Esc sigue saltándola.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!SKIP_KEYS.has(event.key)) return
      // Ni la tecla mantenida ni los atajos del navegador son una orden de saltar.
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      // Espacio desplazaría la página de debajo.
      event.preventDefault()
      skip()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [skip])

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

  const struck = frame?.struck ?? false

  return (
    <div
      ref={layerRef}
      className={leaving ? `${styles.intro} ${styles.leaving}` : styles.intro}
      role="dialog"
      aria-modal="true"
      aria-label={t.intro.label}
      aria-describedby={hintId}
      tabIndex={-1}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={topBarRef} className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />
      {/* Letras que cambian una a una: para un lector de pantalla son ruido. */}
      <div className={styles.content} aria-hidden="true">
        <p className={struck ? `${styles.natural} ${styles.struck}` : styles.natural}>
          <span className={styles.phrase}>{phrase?.natural}</span>
          {/* Tachado a lápiz: un trazo de ida y otro de vuelta. Van fuera de
              la frase para no apagarse con ella. */}
          <span className={`${styles.stroke} ${styles.strokeFirst}`} data-stroke="">
            <span className={styles.ink} />
          </span>
          <span className={`${styles.stroke} ${styles.strokeSecond}`} data-stroke="">
            <span className={styles.ink} />
          </span>
        </p>
        <p className={styles.code}>
          <span>{frame?.code}</span>
          <span className={styles.cursor} />
        </p>
      </div>
      <p id={hintId} className={styles.hint}>
        {t.intro.hint}
      </p>
    </div>
  )
}
