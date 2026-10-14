/**
 * Ritmo con el que se escribe la biografía de «Sobre mí», palabra por
 * palabra. Los textos viven en los diccionarios (about.bio); el fundido de
 * cada palabra lo pone el CSS.
 *
 * Con la bio actual, la última palabra empieza a los 5,85 s en español y a
 * los 6,21 s en inglés. Un test avisa si pasa de 7 s.
 */

/** Lo que espera cada palabra tras la anterior. */
export const WORD_STEP_MS = 30

/** Pausa extra al empezar cada párrafo, salvo el primero. */
export const PARAGRAPH_PAUSE_MS = 200
