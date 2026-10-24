/**
 * Pasos de un texto que se traduce a otro (spec §4.2, el logo de la barra):
 * las letras se codifican de izquierda a derecha hasta leer el destino, y ahí
 * se quedan. Para volver se piden los pasos al revés, desde lo que se vea.
 * Sin temporizadores ni DOM; el azar llega como parámetro para poder fijarlo.
 */

/** Caracteres de relleno mientras una letra se codifica. */
export const SCRAMBLE_GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789_'

/** Cuántas letras a la vez están a medio codificar, por detrás del frente. */
export const SCRAMBLE_WINDOW = 3

/** Pausas, en ms. */
export const SCRAMBLE_TIMING = {
  /** Entre un paso y el siguiente. */
  stepMs: 40,
} as const

/** Una palabra a medio traducir: lo ya codificado y lo que queda del original. */
export interface ScrambledWord {
  readonly code: string
  readonly rest: string
}

export interface ScrambleStep {
  /** Una entrada por palabra del nombre, en su orden. */
  readonly words: readonly ScrambledWord[]
  /** Tiempo que el paso queda en pantalla antes del siguiente, en ms. */
  readonly holdMs: number
}

/**
 * Reparte el destino entre las palabras: cada una, menos la última, se lleva
 * tantos caracteres como letras tiene; la última, lo que sobre. Así
 * «Jorge Gómez» y «jorgegmch» quedan en «jorge» y «gmch».
 */
export function splitTarget(words: readonly string[], target: string): string[] {
  const chars = Array.from(target)
  let start = 0
  return words.map((word, index) => {
    const isLast = index === words.length - 1
    const end = isLast ? chars.length : start + Array.from(word).length
    const part = chars.slice(start, end).join('')
    start = end
    return part
  })
}

const glyph = (random: () => number) =>
  SCRAMBLE_GLYPHS[Math.floor(random() * SCRAMBLE_GLYPHS.length)] ?? '_'

/** Una palabra en el paso `step`: el frente avanza una letra por paso. */
const scrambleWord = (from: string, to: string, step: number, random: () => number) => {
  const fromChars = Array.from(from)
  const toChars = Array.from(to)
  const settled = step - SCRAMBLE_WINDOW
  const code = toChars
    .slice(0, Math.min(step, toChars.length))
    .map((char, index) => (index < settled ? char : glyph(random)))
    .join('')

  return { code, rest: fromChars.slice(Math.min(step, fromChars.length)).join('') }
}

/**
 * Pasos de ida, de `words` (lo que se ve ahora) al destino, sin el texto de
 * partida: ese ya está en pantalla. El último paso es el destino asentado.
 */
export function buildScramble(
  words: readonly string[],
  target: string,
  random: () => number = Math.random,
): readonly ScrambleStep[] {
  const targets = splitTarget(words, target)
  const longest = Math.max(
    0,
    ...words.map((word, index) =>
      Math.max(Array.from(word).length, Array.from(targets[index] ?? '').length),
    ),
  )
  const total = longest + SCRAMBLE_WINDOW
  if (longest === 0) return []

  const steps: ScrambleStep[] = []
  for (let step = 1; step <= total; step += 1) {
    steps.push({
      words: words.map((word, index) => scrambleWord(word, targets[index] ?? '', step, random)),
      holdMs: SCRAMBLE_TIMING.stepMs,
    })
  }
  return steps
}
