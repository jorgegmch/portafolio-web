/**
 * Lo único de Node que usan los tests: leer un archivo como texto. Se declara
 * aquí, en vez de cargar los tipos de Node, para que sus globales (process,
 * Buffer, los timers de Node) no se cuelen en el código de la aplicación.
 */
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string
}
