import { Fragment, type AnimationEvent } from 'react'
import styles from '@/components/ui/TypedText.module.css'
import { PARAGRAPH_PAUSE_MS, WORD_STEP_MS } from '@/config/aboutMotion'
import { useWordReveal } from '@/hooks/useWordReveal'
import { wordRevealSchedule } from '@/lib/wordReveal'

const TIMING = { stepMs: WORD_STEP_MS, pauseMs: PARAGRAPH_PAUSE_MS }

/** Lo que separa dos palabras: el mismo espacio que en el texto plano. */
const WORD_SEPARATOR = ' '

interface TypedTextProps {
  /** Identifica el texto en el registro de lo revelado: única en la página. */
  revealKey: string
  /** Los párrafos, ya traducidos. */
  paragraphs: readonly string[]
  /** Clase de quien lo usa, sumada a las suyas. */
  className?: string
}

/**
 * Párrafos que se escriben palabra por palabra la primera vez que entran en
 * pantalla, y terminan con un cursor que parpadea. Cuándo se escriben lo
 * decide useWordReveal; aquí solo se pinta cada fase:
 * - antes de entrar en pantalla, el texto plano, transparente;
 * - mientras se escribe, una palabra por span, cada una con su retraso y un
 *   fundido;
 * - al terminar, otra vez el texto plano, con el cursor al final.
 *
 * El texto completo está siempre en el DOM: el lector de pantalla lo lee
 * entero en cualquier fase. Los spans solo existen mientras se escribe, y
 * el cursor va oculto al lector.
 *
 * No hay control para pausar la escritura (unos 6 s) ni el parpadeo del
 * cursor, que no se detiene: es una decisión del autor. No se afirma que
 * esto cumpla el criterio 2.2.2 de WCAG (pausar, detener, ocultar).
 */
export function TypedText({ revealKey, paragraphs, className }: TypedTextProps) {
  const { ref, phase, finish } = useWordReveal<HTMLDivElement>(revealKey, paragraphs)
  const classes = [phase === 'waiting' ? styles.waiting : undefined, className]

  // Solo cuenta el fin de la animación de la propia palabra, no uno que suba
  // desde algo que tenga dentro.
  const handleLastWordEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target === event.currentTarget) finish()
  }

  const renderTyping = () => {
    const schedule = wordRevealSchedule(paragraphs, TIMING)
    const lastParagraph = schedule.paragraphs.findLastIndex((words) => words.length > 0)

    return schedule.paragraphs.map((words, paragraphIndex) => (
      <p key={paragraphIndex}>
        {words.map(({ text, delayMs }, wordIndex) => {
          const isLast = paragraphIndex === lastParagraph && wordIndex === words.length - 1
          return (
            <Fragment key={wordIndex}>
              {wordIndex > 0 && WORD_SEPARATOR}
              <span
                className={styles.word}
                style={{ animationDelay: `${delayMs}ms` }}
                onAnimationEnd={isLast ? handleLastWordEnd : undefined}
              >
                {text}
              </span>
            </Fragment>
          )
        })}
      </p>
    ))
  }

  const renderPlain = () =>
    paragraphs.map((paragraph, paragraphIndex) => (
      <p key={paragraphIndex}>
        {paragraph}
        {phase === 'done' && paragraphIndex === paragraphs.length - 1 && (
          <span className={styles.cursor} aria-hidden="true" />
        )}
      </p>
    ))

  return (
    <div ref={ref} className={classes.filter(Boolean).join(' ')}>
      {phase === 'typing' ? renderTyping() : renderPlain()}
    </div>
  )
}
