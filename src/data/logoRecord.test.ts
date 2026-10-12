import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// docs/LOGOS.md anota de dónde salió cada logo e icono y su SHA-256. Aquí se
// comprueba que el documento dice la verdad: que cada hash es el del archivo
// que hay en disco y que ningún archivo se queda sin anotar.
//
// No sustituye a socialLogos.test.ts ni a brandLogos.test.ts: aquellos vigilan
// que el logo sea el oficial; este, que el registro no se quede atrás.
//
// Todo se lee de disco, desde la raíz del repo.
const RECORD = 'docs/LOGOS.md'

const FORMAT = [
  `Formato esperado en ${RECORD}: un título de sección que nombra la carpeta`,
  'entre comillas invertidas (por ejemplo «### Redes (`public/social/`)») y,',
  'debajo, una tabla con una fila por archivo. La primera celda es el nombre',
  'del archivo entre comillas invertidas y la última es su SHA-256, 64',
  'hexadecimales en minúscula, también entre comillas invertidas:',
  '| `github.svg` | de dónde salió | `ccd84c89…` |',
].join('\n')

/**
 * Las imágenes sueltas en la raíz de public/ son el favicon y sus variantes,
 * que tienen su propio registro en docs/FAVICON.md. Los logos y los iconos
 * van siempre dentro de una carpeta.
 */
const IN_A_FOLDER = /^public\/[^/]+\//

const HEADING_WITH_FOLDER = /^#{1,6} .*`(public\/[^`]+\/)`/
const FILE_CELL = /^`([^`/]+\.[a-z0-9]+)`$/
const HASH_CELL = /^`([0-9a-f]{64})`$/
const SEPARATOR_ROW = /^\|[\s|:-]+\|$/

interface Row {
  /** Ruta del archivo desde la raíz del repo. */
  path: string
  sha256: string
  line: number
}

/**
 * Filas de las tablas del registro. Solo cuentan las filas de tabla: un hash
 * citado en una línea suelta no es el de ningún archivo del repo. Es el caso
 * del original de PrimeIcons, que va en una nota bajo la tabla de iconos; el
 * hash de `ai-agents.svg` que se compara es el de su fila.
 */
const parseRecord = (markdown: string) => {
  const rows: Row[] = []
  const malformed: string[] = []
  let folder: string | undefined
  let header = false

  markdown.split('\n').forEach((text, index) => {
    const line = index + 1

    if (text.startsWith('#')) {
      folder = HEADING_WITH_FOLDER.exec(text)?.[1]
      header = false
      return
    }
    if (folder === undefined || !text.startsWith('|')) return
    if (SEPARATOR_ROW.test(text)) return
    // La primera fila de cada tabla es su cabecera.
    if (!header) {
      header = true
      return
    }

    const cells = text.split('|').slice(1, -1).map((cell) => cell.trim())
    const file = FILE_CELL.exec(cells[0] ?? '')?.[1]
    const sha256 = HASH_CELL.exec(cells[cells.length - 1] ?? '')?.[1]

    if (file === undefined || sha256 === undefined) {
      malformed.push(`línea ${line}: «${text.slice(0, 60)}…»`)
      return
    }
    rows.push({ path: `${folder}${file}`, sha256, line })
  })

  return { rows, malformed }
}

const sha256Of = async (path: string) => {
  const digest = await crypto.subtle.digest('SHA-256', Uint8Array.from(readFileSync(path)))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const { rows, malformed } = parseRecord(readFileSync(RECORD, 'utf8'))

/**
 * Imágenes que hay en las carpetas de public/, las tres de hoy y cualquiera
 * que se añada. Vite resuelve el patrón al transformar el test, así que la
 * lista es la del disco; no se importa ningún archivo.
 */
const published = Object.keys(import.meta.glob('/public/**/*.{svg,png,webp,jpg,jpeg,gif,avif,ico}'))
  .map((key) => key.replace(/^\//, ''))
  .filter((path) => IN_A_FOLDER.test(path))
  .sort()

describe('registro de logos e iconos (docs/LOGOS.md)', () => {
  // Control positivo: si el documento cambiara de forma y no saliera ninguna
  // fila, los demás tests pasarían sin comprobar nada.
  it('tiene filas para las tres carpetas de logos e iconos', () => {
    const folders = new Set(rows.map(({ path }) => path.slice(0, path.lastIndexOf('/') + 1)))

    expect([...folders].sort(), FORMAT).toEqual(['public/icons/', 'public/social/', 'public/tech/'])
  })

  it('la búsqueda en disco encuentra las imágenes de public/', () => {
    expect(published).toContain('public/social/github.svg')
    expect(published).not.toContain('public/favicon.svg')
    expect(published.length).toBeGreaterThanOrEqual(rows.length)
  })

  it('cada fila tiene el nombre del archivo y su SHA-256', () => {
    expect(malformed, `Filas que no se entienden.\n${FORMAT}`).toEqual([])
  })

  it('ningún archivo está anotado dos veces', () => {
    const paths = rows.map(({ path }) => path)

    expect(paths.filter((path, index) => paths.indexOf(path) !== index)).toEqual([])
  })

  it('cada fila apunta a un archivo que existe', () => {
    const missing = rows.filter(({ path }) => !existsSync(path)).map(({ path, line }) => `${path} (línea ${line})`)

    expect(missing, `Filas de ${RECORD} sin archivo en disco`).toEqual([])
  })

  it('el SHA-256 de cada fila es el del archivo', async () => {
    const wrong: string[] = []

    for (const { path, sha256, line } of rows) {
      if (!existsSync(path)) continue
      const actual = await sha256Of(path)
      if (actual !== sha256) wrong.push(`${path} (línea ${line}): el documento dice ${sha256} y el archivo da ${actual}`)
    }

    expect(
      wrong,
      `El hash que se compara es el de la fila de la tabla, no uno citado en otra línea.\n${FORMAT}`,
    ).toEqual([])
  })

  it('cada imagen de las carpetas de public/ tiene su fila', () => {
    const recorded = new Set(rows.map(({ path }) => path))
    const unrecorded = published.filter((path) => !recorded.has(path))

    expect(unrecorded, `Archivos sin fila en ${RECORD}.\n${FORMAT}`).toEqual([])
  })
})
