/**
 * Fotogramas de la animación de carga: una frase en lenguaje natural que se
 * escribe, se borra hasta donde coincide con el código y se completa como
 * código. Sin temporizadores ni DOM.
 */

/** Pausas de la animación, en ms. */
export const INTRO_TIMING = {
  /** Antes de escribir el primer carácter. */
  startDelayMs: 200,
  /** Entre un carácter escrito y el siguiente. */
  typeMs: 35,
  /** Entre un carácter borrado y el siguiente. */
  eraseMs: 18,
  /** Con la frase completa, antes de empezar a borrarla. */
  naturalHoldMs: 450,
  /** Con el código completo, antes de terminar. */
  codeHoldMs: 600,
  /**
   * Espera máxima a que la capa termine de desvanecerse. Debe superar a
   * --duration-slow, la duración de esa transición en CSS.
   */
  exitFallbackMs: 1000,
} as const

export interface IntroFrame {
  readonly text: string
  /** Tiempo que el fotograma queda en pantalla antes del siguiente, en ms. */
  readonly holdMs: number
}

const commonPrefixLength = (a: readonly string[], b: readonly string[]) => {
  let length = 0
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1
  return length
}

/**
 * Lista de fotogramas, del texto vacío al código completo. Entre uno y el
 * siguiente cambia un solo carácter: lo que la frase y el código tienen en
 * común al principio no se borra.
 */
export function buildIntroFrames(natural: string, code: string): readonly IntroFrame[] {
  // Por puntos de código, para no partir un emoji en dos mitades inválidas.
  const naturalChars = Array.from(natural)
  const codeChars = Array.from(code)
  const shared = commonPrefixLength(naturalChars, codeChars)
  const { startDelayMs, typeMs, eraseMs, naturalHoldMs, codeHoldMs } = INTRO_TIMING

  const frames: IntroFrame[] = [{ text: '', holdMs: startDelayMs }]
  const add = (chars: readonly string[], length: number, holdMs: number) => {
    frames.push({ text: chars.slice(0, length).join(''), holdMs })
  }

  for (let length = 1; length <= naturalChars.length; length += 1) {
    add(naturalChars, length, length === naturalChars.length ? naturalHoldMs : typeMs)
  }
  for (let length = naturalChars.length - 1; length >= shared; length -= 1) {
    add(naturalChars, length, eraseMs)
  }
  for (let length = shared + 1; length <= codeChars.length; length += 1) {
    add(codeChars, length, typeMs)
  }

  // El último fotograma es siempre el código completo, sea cual sea el tramo
  // que lo produjo.
  return frames.map((frame, index) =>
    index === frames.length - 1 ? { ...frame, holdMs: codeHoldMs } : frame,
  )
}
