import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { MAP_BOUNDS, MAP_SIZE, project } from '@/lib/mapProjection'

/** Píxeles por grado en cada eje. */
const scaleX = MAP_SIZE.width / (MAP_BOUNDS.east - MAP_BOUNDS.west)
const scaleY = MAP_SIZE.height / (MAP_BOUNDS.north - MAP_BOUNDS.south)

describe('proyección del mapa', () => {
  describe('recorte y cuadro', () => {
    // Sin la Antártida ni el Ártico extremo.
    it('va de 84° N a 60° S y de 180° O a 180° E', () => {
      expect(MAP_BOUNDS).toEqual({ north: 84, south: -60, west: -180, east: 180 })
    })

    it('el cuadro es de 1000 × 400', () => {
      expect(MAP_SIZE).toEqual({ width: 1000, height: 400 })
    })

    // 360° de ancho y 144° de alto: con 1000 × 400, los dos ejes llevan
    // 1000 / 360 ≈ 2,78 px por grado. Con 1000 × 500, el eje Y llevaría
    // 3,47 y el mapa saldría estirado en vertical.
    it('mismos píxeles por grado en los dos ejes', () => {
      expect(scaleY).toBeCloseTo(scaleX, 10)
    })

    it('un grado mide lo mismo en vertical que en horizontal', () => {
      const origin = project({ lat: 10, lon: 10 })
      const north = project({ lat: 11, lon: 10 })
      const east = project({ lat: 10, lon: 11 })

      expect(origin.y - north.y).toBeCloseTo(east.x - origin.x, 10)
    })
  })

  describe('puntos conocidos', () => {
    it.each([
      ['noroeste', { lat: 84, lon: -180 }, { x: 0, y: 0 }],
      ['noreste', { lat: 84, lon: 180 }, { x: 1000, y: 0 }],
      ['suroeste', { lat: -60, lon: -180 }, { x: 0, y: 400 }],
      ['sureste', { lat: -60, lon: 180 }, { x: 1000, y: 400 }],
    ])('la esquina %s va a su esquina del cuadro', (_, point, expected) => {
      const { x, y } = project(point)

      expect(x).toBeCloseTo(expected.x, 10)
      expect(y).toBeCloseTo(expected.y, 10)
    })

    // El meridiano 0 parte el cuadro a la mitad; el ecuador queda por debajo
    // de la mitad, porque el recorte quita más al sur que al norte.
    it('el cruce del ecuador y el meridiano 0 está en (500, 233,33)', () => {
      const { x, y } = project({ lat: 0, lon: 0 })

      expect(x).toBeCloseTo(500, 10)
      expect(y).toBeCloseTo((84 / 144) * 400, 10)
    })

    it('el norte queda arriba y el este a la derecha', () => {
      const origin = project({ lat: 0, lon: 0 })
      const northEast = project({ lat: 1, lon: 1 })

      expect(northEast.y).toBeLessThan(origin.y)
      expect(northEast.x).toBeGreaterThan(origin.x)
    })

    // (−73,1 + 180) / 360 × 1000 y (84 − 7) / 144 × 400.
    it('la ciudad de config cae en (296,94, 213,89)', () => {
      const { x, y } = project(site.coordinates)

      expect(x).toBeCloseTo(296.94, 2)
      expect(y).toBeCloseTo(213.89, 2)
    })
  })

  describe('fuera del recorte', () => {
    it.each([
      ['al norte de 84° N', { lat: 84.1, lon: 0 }],
      ['al sur de 60° S', { lat: -60.1, lon: 0 }],
      ['en el polo sur', { lat: -90, lon: 0 }],
      ['al oeste de 180° O', { lat: 0, lon: -180.1 }],
      ['al este de 180° E', { lat: 0, lon: 180.1 }],
      ['con latitud no numérica', { lat: Number.NaN, lon: 0 }],
      ['con longitud no numérica', { lat: 0, lon: Number.NaN }],
    ])('lanza RangeError %s', (_, point) => {
      expect(() => project(point)).toThrow(RangeError)
    })
  })

  // El script que genera el mapa la importa tal cual con Node, sin el alias @/.
  it('el módulo no importa nada', () => {
    const source = readFileSync('src/lib/mapProjection.ts', 'utf8')

    expect(source).not.toMatch(/^\s*import\s/m)
    expect(source).not.toMatch(/\brequire\(/)
  })
})
