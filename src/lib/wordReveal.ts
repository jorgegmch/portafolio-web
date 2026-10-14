/** Ritmo de la escritura: espera entre palabras y pausa extra por párrafo. */
export interface WordRevealTiming {
  stepMs: number
  pauseMs: number
}

/** Una palabra, con la puntuación pegada, y cuándo aparece. */
export interface ScheduledWord {
  text: string
  delayMs: number
}

export interface WordRevealSchedule {
  /** Las palabras de cada párrafo, en el mismo orden que los textos. */
  paragraphs: ScheduledWord[][]
  /** Cuándo aparece la última palabra; 0 si no hay ninguna. */
  lastDelayMs: number
}

/**
 * Calcula cuándo aparece cada palabra de unos párrafos que se escriben uno
 * detrás de otro. Cada palabra espera `stepMs` tras la anterior, también al
 * pasar de un párrafo al siguiente, y cada párrafo con palabras, salvo el
 * primero, suma una pausa de `pauseMs`. Un párrafo vacío no aporta palabras
 * ni pausa.
 *
 * Las palabras se separan por cualquier espacio en blanco, así que nunca hay
 * palabras vacías. Con un solo espacio entre palabras, unirlas con un espacio
 * devuelve el párrafo tal cual.
 */
export function wordRevealSchedule(
  paragraphs: readonly string[],
  { stepMs, pauseMs }: WordRevealTiming,
): WordRevealSchedule {
  let wordIndex = 0
  let pauses = 0
  let lastDelayMs = 0

  const scheduled = paragraphs.map((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) return []
    if (wordIndex > 0) pauses += 1

    return words.map((text) => {
      lastDelayMs = wordIndex * stepMs + pauses * pauseMs
      wordIndex += 1
      return { text, delayMs: lastDelayMs }
    })
  })

  return { paragraphs: scheduled, lastDelayMs }
}
