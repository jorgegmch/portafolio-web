/**
 * Fotogramas de la animación de carga (spec §4.1): la frase de negocio se
 * muestra, se tacha y debajo se escribe su código, carácter a carácter. Sin
 * temporizadores ni DOM.
 */

/** Pausas de la animación, en ms. */
export const INTRO_TIMING = {
  /** Con la frase a la vista, sin tachar, para que dé tiempo a leerla. */
  naturalHoldMs: 400,
  /** Con la frase ya tachada, antes de escribir el código. */
  strikeHoldMs: 250,
  /** Entre un carácter del código y el siguiente. */
  typeMs: 18,
  /** Con el código completo, antes de abrir las barras. */
  codeHoldMs: 350,
  /**
   * Espera máxima a que las barras terminen de abrirse. Debe superar a
   * --dur-intro-exit, la duración de esa transición en CSS.
   */
  exitFallbackMs: 900,
} as const

/**
 * Límites de la duración total de la intro, del primer fotograma a las barras
 * abiertas, en ms. El tope es el --dur-intro de la spec (≤ 2,2 s); el mínimo
 * deja tiempo para leer la frase. Los vigila introFrames.duration.test.ts con
 * las frases reales de cada idioma.
 */
export const INTRO_MIN_TOTAL_MS = 1600
export const INTRO_MAX_TOTAL_MS = 2200

/**
 * Margen por fotograma, en ms: cada temporizador encadenado llega algo tarde
 * (el navegador lo redondea y React pinta antes de programar el siguiente).
 * Medido en Chrome sobre el build de producción: entre 5,0 y 6,3 ms.
 */
export const INTRO_FRAME_DRIFT_MS = 7

export interface IntroFrame {
  /** Si la frase de negocio ya está tachada. */
  readonly struck: boolean
  /** Lo que va escrito del código. */
  readonly code: string
  /** Tiempo que el fotograma queda en pantalla antes del siguiente, en ms. */
  readonly holdMs: number
}

/**
 * Lista de fotogramas: la frase sin tachar, la frase tachada y, desde ahí, el
 * código con un carácter más en cada uno. El último es siempre el código
 * completo.
 */
export function buildIntroFrames(code: string): readonly IntroFrame[] {
  // Por puntos de código, para no partir un emoji en dos mitades inválidas.
  const codeChars = Array.from(code)
  const { naturalHoldMs, strikeHoldMs, typeMs, codeHoldMs } = INTRO_TIMING

  const frames: IntroFrame[] = [
    { struck: false, code: '', holdMs: naturalHoldMs },
    { struck: true, code: '', holdMs: strikeHoldMs },
  ]
  for (let length = 1; length <= codeChars.length; length += 1) {
    frames.push({ struck: true, code: codeChars.slice(0, length).join(''), holdMs: typeMs })
  }

  return frames.map((frame, index) =>
    index === frames.length - 1 ? { ...frame, holdMs: codeHoldMs } : frame,
  )
}
