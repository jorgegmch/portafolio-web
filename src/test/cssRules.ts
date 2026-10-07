import { readFileSync } from 'node:fs'

// Vitest no procesa el CSS (css: false) y jsdom no lo aplica: se comprueba el
// texto de los archivos tal como está en disco, desde la raíz del repo.
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g

/** Texto de un CSS, sin comentarios. La ruta es relativa a la raíz del repo. */
export const readCss = (path: string) => readFileSync(path, 'utf8').replace(CSS_COMMENT, '')

/** Declaraciones de la regla que tiene exactamente ese selector. */
export const cssRule = (css: string, selector: string) => {
  const escaped = selector.replace('.', '\\.')
  const body = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

/** Primer valor de una variable en un CSS: el de :root, antes de los @media. */
export const cssToken = (css: string, name: string) =>
  new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1] ?? ''
