import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { worldMap } from '@/data/worldMap'
import { MAP_BOUNDS, MAP_SIZE } from '@/lib/mapProjection'

// src/data/worldMap.ts lo genera scripts/generate-world-map.ts. Estos tests
// leen el resultado: el script no se ejecuta aquí.
const generated = readFileSync('src/data/worldMap.ts', 'utf8')
const script = readFileSync('scripts/generate-world-map.ts', 'utf8')

/** Tope del dibujo, en bytes. */
const MAX_BYTES = 25 * 1024

/** Valor de una constante de texto del script: `const NAME = '...'`. */
const scriptConstant = (name: string) => script.match(new RegExp(`const ${name} = '([^']*)'`))?.[1]

/** Valor de una línea del encabezado: `// Etiqueta: valor`. */
const headerLine = (label: string) => generated.match(new RegExp(`^// ${label}: (.*)$`, 'm'))?.[1]

/**
 * Recorre el path y devuelve cada tramo con sus extremos absolutos, incluido
 * el que cierra cada subtrazado. Solo entiende los comandos que escribe el
 * script: M absoluto, l relativo y z.
 */
const segments = (path: string) => {
  const result: { from: [number, number]; to: [number, number] }[] = []
  for (const subpath of path.match(/M[^M]*/g) ?? []) {
    const numbers = (subpath.match(/-?\d+/g) ?? []).map(Number)
    const start: [number, number] = [numbers[0] ?? 0, numbers[1] ?? 0]
    let current = start
    for (let i = 2; i < numbers.length; i += 2) {
      const next: [number, number] = [current[0] + (numbers[i] ?? 0), current[1] + (numbers[i + 1] ?? 0)]
      result.push({ from: current, to: next })
      current = next
    }
    result.push({ from: current, to: start })
  }
  return result
}

describe('mapa del mundo generado', () => {
  describe('peso', () => {
    it(`el dibujo no pasa de ${MAX_BYTES / 1024} KB`, () => {
      expect(new TextEncoder().encode(worldMap.path).length).toBeLessThanOrEqual(MAX_BYTES)
    })
  })

  describe('forma del path', () => {
    // Un subtrazado: M x y absoluto, tramos l dx dy relativos y z.
    it('solo lleva los comandos M, l y z, con enteros', () => {
      expect(worldMap.path).toMatch(/^(?:M\d+ \d+(?:l-?\d+ -?\d+)+z)+$/)
    })

    it('no lleva colores ni URLs', () => {
      ;['url(', '#', 'rgb', 'hsl', 'http', '//'].forEach((fragment) =>
        expect(worldMap.path).not.toContain(fragment),
      )
    })

    it('todos los puntos caen dentro del cuadro', () => {
      segments(worldMap.path).forEach(({ to: [x, y] }) => {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(worldMap.width)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(worldMap.height)
      })
    })

    // Un tramo que cruzara el antimeridiano (±180°) iría de un borde al otro
    // y pintaría una raya horizontal sobre todo el mapa.
    it('ningún tramo cruza más de la mitad del cuadro', () => {
      const all = segments(worldMap.path)

      expect(all.length).toBeGreaterThan(0)
      all.forEach(({ from, to }) => {
        expect(Math.abs(to[0] - from[0])).toBeLessThanOrEqual(worldMap.width / 2)
        expect(Math.abs(to[1] - from[1])).toBeLessThanOrEqual(worldMap.height / 2)
      })
    })
  })

  describe('cuadro y recorte', () => {
    it('el cuadro es el de mapProjection', () => {
      expect({ width: worldMap.width, height: worldMap.height }).toEqual(MAP_SIZE)
    })

    it('el recorte es el de mapProjection', () => {
      expect(worldMap.bounds).toEqual(MAP_BOUNDS)
    })
  })

  // Una sola fuente de verdad: el encabezado se escribe desde las constantes
  // del script, y no puede separarse de ellas.
  describe('encabezado', () => {
    it('dice que es un archivo generado, y por cuál script', () => {
      expect(generated).toMatch(/^\/\/ Generado por scripts\/generate-world-map\.ts/)
    })

    it('la URL, el commit y el SHA-256 son los del script', () => {
      const url = scriptConstant('SOURCE_URL')
      const commit = scriptConstant('SOURCE_COMMIT')
      const sha256 = scriptConstant('SOURCE_SHA256')

      expect(url).toBeTruthy()
      expect(headerLine('URL')).toBe(url)
      expect(headerLine('Commit de Natural Earth')).toBe(commit)
      expect(headerLine('SHA-256')).toBe(sha256)
    })

    // La URL apunta al commit fijado, nunca a una rama que pueda cambiar.
    it('la URL lleva el commit, y los dos tienen el formato correcto', () => {
      const commit = scriptConstant('SOURCE_COMMIT') ?? ''

      expect(commit).toMatch(/^[0-9a-f]{40}$/)
      expect(scriptConstant('SOURCE_SHA256')).toMatch(/^[0-9a-f]{64}$/)
      expect(scriptConstant('SOURCE_URL')).toContain(`/${commit}/`)
    })

    it('lleva la fecha de generación', () => {
      expect(headerLine('Generado el')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
