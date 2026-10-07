import { describe, expect, it } from 'vitest'
import {
  clearPointer,
  createParticleField,
  MAX_PARTICLES,
  MAX_STEP_MS,
  PARTICLE_COUNT,
  particleModeFor,
  POINTER_RADIUS,
  resizeParticleField,
  setPointer,
  stepParticleField,
  TABLET_MAX_WIDTH,
  type ParticleField,
} from '@/lib/particles'

/** Generador determinista (mulberry32): misma semilla, misma secuencia. */
const seededRandom = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const WIDTH = 800
const HEIGHT = 600

const fieldOf = (count: number, width = WIDTH, height = HEIGHT, seed = 1): ParticleField => {
  const field = createParticleField()
  resizeParticleField(field, width, height, count, seededRandom(seed))
  return field
}

/** Coloca la partícula 0 con posición y velocidad conocidas. */
const place = (field: ParticleField, x: number, y: number, vx: number, vy: number) => {
  field.x[0] = x
  field.y[0] = y
  field.vx[0] = vx
  field.vy[0] = vy
}

const active = (values: Float32Array, field: ParticleField) =>
  Array.from(values.subarray(0, field.count))

const expectAllInside = (field: ParticleField) => {
  for (const x of active(field.x, field)) {
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThanOrEqual(field.width)
  }
  for (const y of active(field.y, field)) {
    expect(y).toBeGreaterThanOrEqual(0)
    expect(y).toBeLessThanOrEqual(field.height)
  }
}

const expectAllFinite = (field: ParticleField) => {
  for (const values of [field.x, field.y, field.vx, field.vy]) {
    expect(Array.from(values).every(Number.isFinite)).toBe(true)
  }
}

describe('particles', () => {
  describe('cantidad según el modo', () => {
    it('usa 80 en escritorio, 50 en tablet y 24 en modo reducido', () => {
      expect(PARTICLE_COUNT).toEqual({ desktop: 80, tablet: 50, reduced: 24 })
    })

    it('la capacidad reservada es la mayor de las cantidades', () => {
      expect(MAX_PARTICLES).toBe(80)
    })

    it.each([
      [TABLET_MAX_WIDTH + 1, false, 'desktop'],
      [1920, false, 'desktop'],
      [TABLET_MAX_WIDTH, false, 'tablet'],
      [360, false, 'tablet'],
      [0, false, 'tablet'],
      [1920, true, 'reduced'],
      [360, true, 'reduced'],
    ])('con ancho %i y reducido=%s el modo es %s', (width, reduced, mode) => {
      expect(particleModeFor(width, reduced)).toBe(mode)
    })
  })

  describe('al crear', () => {
    it('reserva los cuatro arreglos con la capacidad máxima y empieza vacío', () => {
      const field = createParticleField()

      expect(field.capacity).toBe(MAX_PARTICLES)
      expect(field.count).toBe(0)
      for (const values of [field.x, field.y, field.vx, field.vy]) {
        expect(values).toBeInstanceOf(Float32Array)
        expect(values).toHaveLength(MAX_PARTICLES)
      }
    })
  })

  describe('al dar tamaño', () => {
    it('reparte la cantidad pedida dentro de los límites', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop)

      expect(field.count).toBe(PARTICLE_COUNT.desktop)
      expect(field.width).toBe(WIDTH)
      expect(field.height).toBe(HEIGHT)
      expectAllInside(field)
      expectAllFinite(field)
    })

    it('no las amontona: ocupan buena parte del ancho y del alto', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop)
      const xs = active(field.x, field)
      const ys = active(field.y, field)

      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(WIDTH / 2)
      expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(HEIGHT / 2)
    })

    it('les da una velocidad propia, distinta de cero', () => {
      const field = fieldOf(PARTICLE_COUNT.reduced)

      expect(field.count).toBe(PARTICLE_COUNT.reduced)
      for (let i = 0; i < field.count; i += 1) {
        expect(Math.hypot(field.vx[i] ?? 0, field.vy[i] ?? 0)).toBeGreaterThan(0)
      }
    })

    it('con la misma semilla produce el mismo campo', () => {
      const first = fieldOf(PARTICLE_COUNT.tablet, WIDTH, HEIGHT, 7)
      const second = fieldOf(PARTICLE_COUNT.tablet, WIDTH, HEIGHT, 7)

      expect(Array.from(first.x)).toEqual(Array.from(second.x))
      expect(Array.from(first.vy)).toEqual(Array.from(second.vy))
    })

    it('una cantidad mayor que la capacidad se recorta a la capacidad', () => {
      expect(fieldOf(MAX_PARTICLES + 500).count).toBe(MAX_PARTICLES)
    })

    it.each([0, -5, Number.NaN])('con cantidad %s queda vacío', (count) => {
      const field = fieldOf(count)

      expect(field.count).toBe(0)
      expectAllFinite(field)
    })

    it.each([
      [0, 0],
      [0, HEIGHT],
      [WIDTH, 0],
      [-100, -100],
      [Number.NaN, Number.NaN],
    ])('con tamaño %sx%s no produce posiciones inválidas', (width, height) => {
      const field = fieldOf(PARTICLE_COUNT.desktop, width, height)

      expect(field.width).toBeGreaterThanOrEqual(0)
      expect(field.height).toBeGreaterThanOrEqual(0)
      expectAllInside(field)
      expectAllFinite(field)
    })
  })

  describe('al cambiar de tamaño', () => {
    it('reutiliza los mismos arreglos, sin reservar otros', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop)
      const { x, y, vx, vy } = field

      resizeParticleField(field, 1920, 1080, PARTICLE_COUNT.desktop, seededRandom(2))
      resizeParticleField(field, 360, 640, PARTICLE_COUNT.reduced, seededRandom(3))

      expect(field.x).toBe(x)
      expect(field.y).toBe(y)
      expect(field.vx).toBe(vx)
      expect(field.vy).toBe(vy)
    })

    it('al agrandar, las partículas que ya existían no saltan de sitio', () => {
      const field = fieldOf(PARTICLE_COUNT.tablet)
      const before = active(field.x, field)

      resizeParticleField(field, WIDTH * 2, HEIGHT * 2, PARTICLE_COUNT.tablet, seededRandom(9))

      expect(active(field.x, field)).toEqual(before)
    })

    it('al encoger, todas quedan dentro del tamaño nuevo', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop, 1920, 1080)

      resizeParticleField(field, 360, 640, PARTICLE_COUNT.desktop, seededRandom(4))

      expectAllInside(field)
    })

    it('al pedir más, conserva las anteriores y añade las nuevas dentro', () => {
      const field = fieldOf(PARTICLE_COUNT.reduced)
      const before = active(field.x, field)

      resizeParticleField(field, WIDTH, HEIGHT, PARTICLE_COUNT.desktop, seededRandom(5))

      expect(field.count).toBe(PARTICLE_COUNT.desktop)
      expect(Array.from(field.x.subarray(0, before.length))).toEqual(before)
      expectAllInside(field)
    })

    it('al pedir menos, se queda con las primeras', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop)
      const before = Array.from(field.x.subarray(0, PARTICLE_COUNT.reduced))

      resizeParticleField(field, WIDTH, HEIGHT, PARTICLE_COUNT.reduced, seededRandom(6))

      expect(field.count).toBe(PARTICLE_COUNT.reduced)
      expect(active(field.x, field)).toEqual(before)
    })

    // El canvas puede medir 0x0 al montarse y recibir su tamaño después.
    it('si nació en 0x0, al recibir tamaño se reparten en vez de quedar en la esquina', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop, 0, 0)

      resizeParticleField(field, WIDTH, HEIGHT, PARTICLE_COUNT.desktop, seededRandom(8))
      const xs = active(field.x, field)

      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(WIDTH / 2)
      expectAllInside(field)
    })
  })

  describe('al avanzar un paso', () => {
    it('mueve cada partícula según su velocidad y el tiempo transcurrido', () => {
      const field = fieldOf(1)
      place(field, 100, 200, 20, -40)

      stepParticleField(field, MAX_STEP_MS)

      expect(field.x[0]).toBeCloseTo(100 + (20 * MAX_STEP_MS) / 1000)
      expect(field.y[0]).toBeCloseTo(200 - (40 * MAX_STEP_MS) / 1000)
    })

    it.each([
      ['izquierdo', 0, HEIGHT / 2, -400, 0],
      ['derecho', WIDTH, HEIGHT / 2, 400, 0],
      ['superior', WIDTH / 2, 0, 0, -400],
      ['inferior', WIDTH / 2, HEIGHT, 0, 400],
    ])('rebota en el borde %s: sigue dentro y cambia de sentido', (_name, x, y, vx, vy) => {
      const field = fieldOf(1)
      place(field, x, y, vx, vy)

      stepParticleField(field, MAX_STEP_MS)

      expectAllInside(field)
      expect(field.vx[0]).toBe(vx === 0 ? 0 : -vx)
      expect(field.vy[0]).toBe(vy === 0 ? 0 : -vy)
    })

    // Al volver de una pestaña oculta el navegador entrega un intervalo enorme.
    it('un intervalo enorme no avanza más que el paso máximo', () => {
      const capped = fieldOf(1)
      const huge = fieldOf(1)
      place(capped, 100, 100, 30, 30)
      place(huge, 100, 100, 30, 30)

      stepParticleField(capped, MAX_STEP_MS)
      stepParticleField(huge, 10 * 60 * 1000)

      expect(huge.x[0]).toBe(capped.x[0])
      expect(huge.y[0]).toBe(capped.y[0])
    })

    it.each([0, -16, Number.NaN, Number.POSITIVE_INFINITY])(
      'con un intervalo de %s ms no mueve nada',
      (dt) => {
        const field = fieldOf(1)
        place(field, 100, 100, 30, 30)

        stepParticleField(field, dt)

        expect(field.x[0]).toBe(100)
        expect(field.y[0]).toBe(100)
      },
    )

    it('tras muchos pasos de duración dispar, todas siguen dentro y con valores finitos', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop, 320, 240)
      const random = seededRandom(11)

      // Una sola aserción por paso: con una por partícula el test tarda segundos.
      const isInside = () =>
        active(field.x, field).every((x) => x >= 0 && x <= field.width) &&
        active(field.y, field).every((y) => y >= 0 && y <= field.height)
      let firstStepOutside = -1

      for (let step = 0; step < 2000 && firstStepOutside < 0; step += 1) {
        stepParticleField(field, random() < 0.05 ? 60_000 : random() * 40)
        if (!isInside()) firstStepOutside = step
      }

      expect(firstStepOutside).toBe(-1)
      expectAllFinite(field)
    })

    it('con cantidad 0 no hace nada ni falla', () => {
      const field = fieldOf(0)
      const before = Array.from(field.x)

      expect(() => stepParticleField(field, MAX_STEP_MS)).not.toThrow()
      expect(Array.from(field.x)).toEqual(before)
    })

    it('con tamaño 0x0 mantiene todo en el origen', () => {
      const field = fieldOf(PARTICLE_COUNT.reduced, 0, 0)

      for (let step = 0; step < 10; step += 1) stepParticleField(field, MAX_STEP_MS)

      expect(active(field.x, field).every((x) => x === 0)).toBe(true)
      expect(active(field.y, field).every((y) => y === 0)).toBe(true)
      expectAllFinite(field)
    })

    it('no devuelve nada ni cambia de arreglos: trabaja sobre los mismos', () => {
      const field = fieldOf(PARTICLE_COUNT.desktop)
      const { x, y, vx, vy } = field

      expect(stepParticleField(field, MAX_STEP_MS)).toBeUndefined()

      expect(field.x).toBe(x)
      expect(field.y).toBe(y)
      expect(field.vx).toBe(vx)
      expect(field.vy).toBe(vy)
    })
  })

  describe('puntero', () => {
    const CENTER_X = WIDTH / 2
    const CENTER_Y = HEIGHT / 2

    it('aleja a la partícula que está dentro de su radio', () => {
      const field = fieldOf(1)
      place(field, CENTER_X + POINTER_RADIUS / 2, CENTER_Y, 0, 0)

      setPointer(field, CENTER_X, CENTER_Y)
      stepParticleField(field, MAX_STEP_MS)

      expect(field.x[0]).toBeGreaterThan(CENTER_X + POINTER_RADIUS / 2)
      expect(field.y[0]).toBeCloseTo(CENTER_Y)
    })

    it('no afecta a la que está fuera de su radio', () => {
      const field = fieldOf(1)
      place(field, CENTER_X + POINTER_RADIUS * 2, CENTER_Y, 0, 0)

      setPointer(field, CENTER_X, CENTER_Y)
      stepParticleField(field, MAX_STEP_MS)

      expect(field.x[0]).toBe(CENTER_X + POINTER_RADIUS * 2)
    })

    it('deja de empujar cuando el puntero se retira', () => {
      const field = fieldOf(1)
      place(field, CENTER_X + POINTER_RADIUS / 2, CENTER_Y, 0, 0)

      setPointer(field, CENTER_X, CENTER_Y)
      clearPointer(field)
      stepParticleField(field, MAX_STEP_MS)

      expect(field.x[0]).toBe(CENTER_X + POINTER_RADIUS / 2)
    })

    it('una partícula justo bajo el puntero no produce valores inválidos', () => {
      const field = fieldOf(1)
      place(field, CENTER_X, CENTER_Y, 0, 0)

      setPointer(field, CENTER_X, CENTER_Y)
      stepParticleField(field, MAX_STEP_MS)

      expectAllFinite(field)
      expectAllInside(field)
    })

    it('empujada contra un borde, sigue dentro', () => {
      const field = fieldOf(1)
      place(field, 0, CENTER_Y, 0, 0)

      setPointer(field, POINTER_RADIUS / 4, CENTER_Y)
      for (let step = 0; step < 200; step += 1) stepParticleField(field, MAX_STEP_MS)

      expectAllInside(field)
    })

    it.each([
      [Number.NaN, Number.NaN],
      [-9999, -9999],
    ])('un puntero en (%s, %s) no rompe el paso', (x, y) => {
      const field = fieldOf(PARTICLE_COUNT.reduced)

      setPointer(field, x, y)
      stepParticleField(field, MAX_STEP_MS)

      expectAllFinite(field)
      expectAllInside(field)
    })
  })
})
