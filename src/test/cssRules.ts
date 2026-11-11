import { readFileSync } from 'node:fs'

// Vitest no procesa el CSS (css: false) y jsdom no lo aplica: se comprueba el
// texto de los archivos tal como está en disco, desde la raíz del repo.
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g

/** Texto de un CSS, sin comentarios. La ruta es relativa a la raíz del repo. */
export const readCss = (path: string) => readFileSync(path, 'utf8').replace(CSS_COMMENT, '')

/**
 * Declaraciones de la regla que tiene exactamente ese selector. El selector
 * se busca tal cual: puntos, corchetes y comillas no son de expresión regular.
 */
export const cssRule = (css: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const body = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

/** Reglas de dentro de un bloque @media, por ejemplo `(max-width: 768px)`. */
export const cssMedia = (css: string, query: string) => {
  const escaped = query.replace(/[()]/g, '\\$&')
  return new RegExp(`@media ${escaped}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`).exec(css)?.[1] ?? ''
}

/** Primer valor de una variable en un CSS: el de :root, antes de los @media. */
export const cssToken = (css: string, name: string) =>
  new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1] ?? ''

/**
 * Valor final de una variable que apunta a otra (`var(--x)`), siguiendo la
 * cadena hasta un valor literal. Falla si un eslabón no existe o si la cadena
 * vuelve sobre sí misma.
 */
export const resolvedToken = (css: string, name: string) => {
  const seen = new Set<string>()
  let current = name
  for (;;) {
    if (seen.has(current)) throw new Error(`Cadena circular en ${name}`)
    seen.add(current)
    const value = cssToken(css, current)
    if (!value) throw new Error(`No existe la variable ${current}`)
    const next = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1]
    if (!next) return value
    current = next
  }
}
