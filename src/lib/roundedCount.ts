/** Hasta aquí la cifra se muestra exacta; por encima, baja a la decena. */
const EXACT_UP_TO = 20
const STEP = 10

/** Un conteo listo para mostrar. El «+» lo pone quien lo muestra. */
export interface RoundedCount {
  value: number
  /** La cifra se queda corta: hay unidades de sobra tras la última decena. */
  approximate: boolean
}

/**
 * Redondea un conteo para una tarjeta: exacto hasta 20 y, por encima, bajado
 * a la decena y marcado como aproximado si sobran unidades. Solo admite
 * enteros desde 0.
 */
export function roundedCount(count: number): RoundedCount {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Conteo inválido: ${count}`)
  }

  return count <= EXACT_UP_TO
    ? { value: count, approximate: false }
    : { value: Math.floor(count / STEP) * STEP, approximate: count % STEP !== 0 }
}
