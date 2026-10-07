import { describe, expect, it } from 'vitest'
import {
  drawParticleField,
  LINK_DISTANCE,
  LINK_OPACITY,
  LINK_WIDTH,
  PARTICLE_OPACITY,
  PARTICLE_RADIUS,
} from '@/lib/drawParticles'
import { createParticleField, type ParticleField } from '@/lib/particles'
import { createMockContext } from '@/test/mockCanvas'

const WIDTH = 800
const HEIGHT = 600
const COLOR = 'rgb(0, 212, 255)'

/** Campo con las partículas en los puntos dados; coordenadas enteras, exactas en Float32. */
const fieldWith = (points: readonly (readonly [number, number])[]): ParticleField => {
  const field = createParticleField()
  field.width = WIDTH
  field.height = HEIGHT
  field.count = points.length
  points.forEach(([x, y], i) => {
    field.x[i] = x
    field.y[i] = y
  })
  return field
}

/** Dibuja y anota con qué opacidad y color se trazó cada línea y cada relleno. */
const draw = (field: ParticleField) => {
  const context = createMockContext()
  const strokes: { alpha: number; color: string; width: number }[] = []
  const fills: { alpha: number; color: string }[] = []
  context.stroke.mockImplementation(() => {
    strokes.push({
      alpha: context.globalAlpha,
      color: context.strokeStyle,
      width: context.lineWidth,
    })
  })
  context.fill.mockImplementation(() => {
    fills.push({ alpha: context.globalAlpha, color: context.fillStyle })
  })

  const result = drawParticleField(context, field, COLOR)

  return { context, strokes, fills, result }
}

const linkOpacityAt = (distance: number) => (1 - distance / LINK_DISTANCE) * LINK_OPACITY

describe('drawParticleField', () => {
  describe('lienzo', () => {
    it('borra todo el campo antes de dibujar nada', () => {
      const { context } = draw(fieldWith([[100, 100]]))

      expect(context.clearRect).toHaveBeenCalledExactlyOnceWith(0, 0, WIDTH, HEIGHT)
      const cleared = context.clearRect.mock.invocationCallOrder.at(0) ?? Infinity
      const firstArc = context.arc.mock.invocationCallOrder.at(0) ?? -Infinity
      expect(cleared).toBeLessThan(firstArc)
    })

    it('deja la opacidad del contexto como estaba', () => {
      const { context } = draw(
        fieldWith([
          [100, 100],
          [110, 100],
        ]),
      )

      expect(context.globalAlpha).toBe(1)
    })

    it('no devuelve nada ni modifica el campo', () => {
      const field = fieldWith([
        [100, 100],
        [130, 140],
      ])
      const before = { x: Array.from(field.x), y: Array.from(field.y), count: field.count }

      const { result } = draw(field)

      expect(result).toBeUndefined()
      expect({ x: Array.from(field.x), y: Array.from(field.y), count: field.count }).toEqual(before)
    })
  })

  describe('puntos', () => {
    it('dibuja un círculo por partícula, con el radio fijado', () => {
      const { context } = draw(
        fieldWith([
          [100, 100],
          [400, 300],
          [700, 500],
        ]),
      )

      expect(context.arc).toHaveBeenCalledTimes(3)
      expect(context.arc).toHaveBeenCalledWith(100, 100, PARTICLE_RADIUS, 0, Math.PI * 2)
      expect(context.arc).toHaveBeenCalledWith(400, 300, PARTICLE_RADIUS, 0, Math.PI * 2)
      expect(context.arc).toHaveBeenCalledWith(700, 500, PARTICLE_RADIUS, 0, Math.PI * 2)
    })

    it('los rellena con el color recibido y su opacidad', () => {
      const { fills } = draw(fieldWith([[100, 100]]))

      expect(fills).toEqual([{ alpha: PARTICLE_OPACITY, color: COLOR }])
    })

    it('solo dibuja las partículas en uso, no la capacidad reservada', () => {
      const field = fieldWith([
        [100, 100],
        [400, 300],
      ])
      field.x[2] = 50
      field.y[2] = 50

      const { context } = draw(field)

      expect(context.arc).toHaveBeenCalledTimes(2)
      expect(context.arc).not.toHaveBeenCalledWith(50, 50, PARTICLE_RADIUS, 0, Math.PI * 2)
    })
  })

  describe('líneas', () => {
    it('une dos partículas cercanas con una línea del color y el grosor fijados', () => {
      const { context, strokes } = draw(
        fieldWith([
          [100, 100],
          [100 + LINK_DISTANCE / 2, 100],
        ]),
      )

      expect(context.moveTo).toHaveBeenCalledWith(100, 100)
      expect(context.lineTo).toHaveBeenCalledExactlyOnceWith(100 + LINK_DISTANCE / 2, 100)
      expect(strokes).toHaveLength(1)
      expect(strokes.at(0)?.color).toBe(COLOR)
      expect(strokes.at(0)?.width).toBe(LINK_WIDTH)
      expect(strokes.at(0)?.alpha).toBeCloseTo(linkOpacityAt(LINK_DISTANCE / 2))
    })

    it('cuanto más cerca están, más opaca es la línea', () => {
      const near = draw(
        fieldWith([
          [100, 100],
          [110, 100],
        ]),
      ).strokes.at(0)
      const far = draw(
        fieldWith([
          [100, 100],
          [100 + LINK_DISTANCE - 10, 100],
        ]),
      ).strokes.at(0)

      expect(near?.alpha).toBeGreaterThan(far?.alpha ?? Infinity)
      expect(near?.alpha).toBeLessThanOrEqual(LINK_OPACITY)
      expect(far?.alpha).toBeGreaterThan(0)
    })

    it('un píxel dentro de la distancia máxima todavía se unen', () => {
      const { strokes } = draw(
        fieldWith([
          [100, 100],
          [100 + LINK_DISTANCE - 1, 100],
        ]),
      )

      expect(strokes).toHaveLength(1)
    })

    it('justo a la distancia máxima ya no se unen', () => {
      const { strokes, context } = draw(
        fieldWith([
          [100, 100],
          [100 + LINK_DISTANCE, 100],
        ]),
      )

      expect(strokes).toHaveLength(0)
      expect(context.lineTo).not.toHaveBeenCalled()
    })

    it('mide la distancia en diagonal, no por ejes', () => {
      // Cada eje queda dentro del alcance, pero la diagonal lo supera.
      const side = LINK_DISTANCE - 10
      const { strokes } = draw(
        fieldWith([
          [100, 100],
          [100 + side, 100 + side],
        ]),
      )

      expect(strokes).toHaveLength(0)
    })
  })

  describe('casos límite', () => {
    it('con el campo vacío solo borra', () => {
      const { context, strokes, fills } = draw(fieldWith([]))

      expect(context.clearRect).toHaveBeenCalledTimes(1)
      expect(context.arc).not.toHaveBeenCalled()
      expect(strokes).toHaveLength(0)
      expect(fills).toHaveLength(0)
    })

    it('con una sola partícula dibuja su punto y ninguna línea', () => {
      const { context, strokes, fills } = draw(fieldWith([[400, 300]]))

      expect(context.arc).toHaveBeenCalledTimes(1)
      expect(fills).toHaveLength(1)
      expect(strokes).toHaveLength(0)
      expect(context.lineTo).not.toHaveBeenCalled()
    })

    it('dos partículas en el mismo punto no trazan línea ni dan opacidades inválidas', () => {
      const { context, strokes, fills } = draw(
        fieldWith([
          [400, 300],
          [400, 300],
        ]),
      )

      expect(strokes).toHaveLength(0)
      expect(context.arc).toHaveBeenCalledTimes(2)
      expect(fills.every(({ alpha }) => Number.isFinite(alpha))).toBe(true)
      expect(Number.isFinite(context.globalAlpha)).toBe(true)
    })

    it('con todas fuera de alcance dibuja los puntos y ninguna línea', () => {
      const gap = LINK_DISTANCE * 2
      const { context, strokes } = draw(
        fieldWith([
          [0, 0],
          [gap, 0],
          [0, gap],
          [gap, gap],
        ]),
      )

      expect(context.arc).toHaveBeenCalledTimes(4)
      expect(strokes).toHaveLength(0)
    })

    it('con todas dentro de alcance une cada par exactamente una vez', () => {
      const points = [
        [400, 300],
        [410, 300],
        [400, 310],
        [410, 310],
        [405, 320],
      ] as const
      const pairs = (points.length * (points.length - 1)) / 2

      const { context, strokes } = draw(fieldWith(points))

      expect(context.arc).toHaveBeenCalledTimes(points.length)
      expect(strokes).toHaveLength(pairs)
      for (const { alpha } of strokes) {
        expect(alpha).toBeGreaterThan(0)
        expect(alpha).toBeLessThanOrEqual(LINK_OPACITY)
      }
    })
  })
})
