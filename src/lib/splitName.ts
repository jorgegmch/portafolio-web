export interface NameParts {
  first: string
  last: string
}

/**
 * "Ana María Rojas" -> { first: "Ana María", last: "Rojas" }.
 *
 * Parte por el último espacio, para mostrar el apellido con otro color sin
 * guardar el nombre dos veces. Con una sola palabra no hay apellido.
 */
export function splitName(name: string): NameParts {
  const words = name.split(/\s+/).filter(Boolean)
  const last = words.length > 1 ? (words.pop() ?? '') : ''

  return { first: words.join(' '), last }
}
