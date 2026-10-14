/**
 * Genera src/data/worldMap.ts: la silueta de la tierra de Natural Earth
 * 1:110m como un solo path SVG, proyectada con src/lib/mapProjection.ts.
 *
 * Uso, desde la raíz del repo, con Node 24 y sin compilar:
 *   node scripts/generate-world-map.ts
 *
 * No corre en el build ni en CI: se ejecuta a mano y su salida se commitea.
 * Descarga la fuente desde un commit fijo de Natural Earth y comprueba su
 * SHA-256; si no coincide, o si algo de la geometría no encaja, falla sin
 * escribir nada.
 */
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
// Node no entiende el alias @/: la ruta es relativa y con extensión.
import { MAP_BOUNDS, MAP_SIZE, project } from '../src/lib/mapProjection.ts'

// Natural Earth es de dominio público: https://www.naturalearthdata.com/about/terms-of-use/
const SOURCE_COMMIT = '693f11422f4e08d2da4566b854dda53eb7c39fb3'
const SOURCE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/693f11422f4e08d2da4566b854dda53eb7c39fb3/geojson/ne_110m_land.geojson'
const SOURCE_SHA256 = '9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9'
const OUTPUT = 'src/data/worldMap.ts'

type Position = [number, number]
type Ring = Position[]
interface LandCollection {
  features: { geometry: { type: string; coordinates: Ring[] } }[]
}

const download = async (): Promise<string> => {
  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`No se pudo descargar la fuente: HTTP ${response.status}`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (sha256 !== SOURCE_SHA256) {
    throw new Error(`El SHA-256 no coincide: se esperaba ${SOURCE_SHA256} y llegó ${sha256}`)
  }
  return bytes.toString('utf8')
}

/**
 * Los polígonos que caben en el recorte. Los que quedan enteros al sur del
 * límite (la Antártida) se descartan; uno que lo cruce a medias es un error.
 */
const polygonsInside = (land: LandCollection): Ring[][] => {
  const { north, south, west, east } = MAP_BOUNDS
  const kept: Ring[][] = []
  let discarded = 0
  for (const { geometry } of land.features) {
    if (geometry.type !== 'Polygon') {
      throw new Error(`Geometría inesperada: ${geometry.type}`)
    }
    const vertices = geometry.coordinates.flat()
    if (vertices.every(([, lat]) => lat < south)) {
      discarded++
      continue
    }
    const inside = vertices.every(
      ([lon, lat]) => lat >= south && lat <= north && lon >= west && lon <= east,
    )
    if (!inside) {
      throw new Error('Un polígono cruza el borde del recorte')
    }
    kept.push(geometry.coordinates)
  }
  console.log(`Polígonos: ${kept.length} dentro del recorte, ${discarded} al sur descartados`)
  return kept
}

/** Un anillo proyectado y redondeado, sin puntos repetidos seguidos ni el de cierre. */
const projectRing = (ring: Ring): Position[] => {
  const points: Position[] = []
  for (const [lon, lat] of ring) {
    const { x, y } = project({ lat, lon })
    const point: Position = [Math.round(x), Math.round(y)]
    const last = points.at(-1)
    if (!last || last[0] !== point[0] || last[1] !== point[1]) {
      points.push(point)
    }
  }
  const [first] = points
  const last = points.at(-1)
  if (first && last && points.length > 1 && first[0] === last[0] && first[1] === last[1]) {
    points.pop()
  }
  return points
}

/**
 * Un solo path: cada anillo es un subtrazado con M absoluto, tramos l
 * relativos y z. Un tramo de más de medio cuadro sería un salto por el
 * antimeridiano, que pintaría una raya de lado a lado: es un error.
 */
const toPath = (polygons: Ring[][]): string => {
  let path = ''
  let skipped = 0
  for (const ring of polygons.flat()) {
    const points = projectRing(ring)
    if (points.length < 3) {
      skipped++
      continue
    }
    points.forEach(([x, y], i) => {
      const [nx, ny] = points[(i + 1) % points.length] ?? [x, y]
      if (Math.abs(nx - x) > MAP_SIZE.width / 2 || Math.abs(ny - y) > MAP_SIZE.height / 2) {
        throw new Error(`Tramo de lado a lado en (${x}, ${y}) → (${nx}, ${ny})`)
      }
    })
    const [[startX, startY], ...rest] = points as [Position, ...Position[]]
    path += `M${startX} ${startY}`
    let [px, py] = [startX, startY]
    for (const [x, y] of rest) {
      path += `l${x - px} ${y - py}`
      ;[px, py] = [x, y]
    }
    path += 'z'
  }
  console.log(`Anillos demasiado pequeños para el cuadro, omitidos: ${skipped}`)
  return path
}

const render = (path: string, generatedOn: string): string =>
  [
    '// Generado por scripts/generate-world-map.ts. No se edita a mano.',
    '// Fuente: Natural Earth 1:110m, tierra (dominio público).',
    `// URL: ${SOURCE_URL}`,
    `// Commit de Natural Earth: ${SOURCE_COMMIT}`,
    `// SHA-256: ${SOURCE_SHA256}`,
    `// Generado el: ${generatedOn}`,
    '',
    '/** Silueta de la tierra: un solo path, en el cuadro y el recorte de lib/mapProjection. */',
    'export const worldMap = {',
    `  width: ${MAP_SIZE.width},`,
    `  height: ${MAP_SIZE.height},`,
    `  bounds: { north: ${MAP_BOUNDS.north}, south: ${MAP_BOUNDS.south}, west: ${MAP_BOUNDS.west}, east: ${MAP_BOUNDS.east} },`,
    `  path: '${path}',`,
    '} as const',
    '',
  ].join('\n')

// El error se captura en vez de lanzarse: en Windows, Node aborta con una
// aserción de libuv si sale por una excepción mientras fetch cierra la conexión.
try {
  const land = JSON.parse(await download()) as LandCollection
  const path = toPath(polygonsInside(land))
  writeFileSync(OUTPUT, render(path, new Date().toISOString().slice(0, 10)))
  console.log(
    `${OUTPUT}: path de ${path.length} bytes (${(path.length / 1024).toFixed(1)} KB), ` +
      `${gzipSync(path).length} bytes con gzip (${(gzipSync(path).length / 1024).toFixed(1)} KB)`,
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  console.error(`No se escribió ${OUTPUT}.`)
  process.exitCode = 1
}
