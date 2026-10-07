import type { ParticleField } from '@/lib/particles'

/** Lo que el dibujo necesita de un contexto 2D; lo cumple el real y el de los tests. */
export type ParticleContext = Pick<
  CanvasRenderingContext2D,
  | 'fillStyle'
  | 'strokeStyle'
  | 'globalAlpha'
  | 'lineWidth'
  | 'clearRect'
  | 'beginPath'
  | 'arc'
  | 'fill'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
>

/** Radio de cada punto, en px. */
export const PARTICLE_RADIUS = 1.5

/** Opacidad de los puntos. */
export const PARTICLE_OPACITY = 0.6

/** Distancia, en px, a partir de la cual dos partículas ya no se unen. */
export const LINK_DISTANCE = 120

/** Opacidad de una línea entre dos partículas pegadas; baja con la distancia. */
export const LINK_OPACITY = 0.18

/** Grosor de las líneas, en px. */
export const LINK_WIDTH = 1

const FULL_TURN = Math.PI * 2
const OPAQUE = 1

/**
 * Pinta el campo en el contexto: una línea entre cada par de partículas
 * cercanas y un punto por partícula, todo en el color recibido. No crea
 * objetos ni cadenas: la opacidad se ajusta con globalAlpha.
 */
export function drawParticleField(
  context: ParticleContext,
  field: ParticleField,
  color: string,
): void {
  const { x, y, count, width, height } = field

  context.clearRect(0, 0, width, height)
  if (count === 0) return

  context.fillStyle = color
  context.strokeStyle = color
  context.lineWidth = LINK_WIDTH

  // Cada línea lleva su propia opacidad, así que se traza por separado.
  for (let i = 0; i < count; i += 1) {
    const fromX = x[i] ?? 0
    const fromY = y[i] ?? 0
    for (let j = i + 1; j < count; j += 1) {
      const toX = x[j] ?? 0
      const toY = y[j] ?? 0
      const distance = Math.hypot(toX - fromX, toY - fromY)
      // A distancia 0 la línea no tendría longitud.
      if (distance === 0 || distance >= LINK_DISTANCE) continue

      context.globalAlpha = (1 - distance / LINK_DISTANCE) * LINK_OPACITY
      context.beginPath()
      context.moveTo(fromX, fromY)
      context.lineTo(toX, toY)
      context.stroke()
    }
  }

  // Todos los puntos comparten opacidad: van en un solo trazo.
  context.globalAlpha = PARTICLE_OPACITY
  context.beginPath()
  for (let i = 0; i < count; i += 1) {
    const pointX = x[i] ?? 0
    const pointY = y[i] ?? 0
    // Sin este salto, el trazo uniría cada círculo con el anterior.
    context.moveTo(pointX + PARTICLE_RADIUS, pointY)
    context.arc(pointX, pointY, PARTICLE_RADIUS, 0, FULL_TURN)
  }
  context.fill()

  context.globalAlpha = OPAQUE
}
