/**
 * Modelo del campo de partículas del fondo: posiciones y velocidades, sin
 * canvas ni DOM. Los arreglos se reservan una vez y cada paso trabaja sobre
 * ellos, sin crear objetos.
 */

export type ParticleMode = 'desktop' | 'tablet' | 'reduced'

/** Cantidad de partículas según el modo. */
export const PARTICLE_COUNT: Record<ParticleMode, number> = {
  desktop: 80,
  tablet: 50,
  reduced: 24,
}

/** Capacidad que se reserva: la mayor de las cantidades. */
export const MAX_PARTICLES = Math.max(...Object.values(PARTICLE_COUNT))

/** Ancho máximo, en px, que todavía cuenta como tablet. */
export const TABLET_MAX_WIDTH = 1024

/** Tope del paso, en ms: al volver de una pestaña oculta el intervalo es enorme. */
export const MAX_STEP_MS = 50

/** Radio, en px, dentro del cual el puntero aparta a las partículas. */
export const POINTER_RADIUS = 120

/** Rapidez propia de cada partícula, en px por segundo. */
const MIN_SPEED = 4
const MAX_SPEED = 14

/** Rapidez con la que el puntero aparta a la partícula más cercana, en px por segundo. */
const POINTER_PUSH_SPEED = 60

const MS_PER_SECOND = 1000
const FULL_TURN = Math.PI * 2

export interface ParticleField {
  /** Partículas reservadas; count nunca la supera. */
  readonly capacity: number
  /** Partículas en uso: las primeras count de cada arreglo. */
  count: number
  width: number
  height: number
  readonly x: Float32Array
  readonly y: Float32Array
  readonly vx: Float32Array
  readonly vy: Float32Array
  pointerActive: boolean
  pointerX: number
  pointerY: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Entero no negativo; lo inválido (NaN, negativo, infinito) cuenta como 0. */
const toWhole = (value: number) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0)

/** Modo del campo: reducido si se pidió; si no, según el ancho de la pantalla. */
export function particleModeFor(width: number, reduced: boolean): ParticleMode {
  if (reduced) return 'reduced'
  return width <= TABLET_MAX_WIDTH ? 'tablet' : 'desktop'
}

/** Reserva los arreglos. El campo nace vacío: el tamaño llega con resizeParticleField. */
export function createParticleField(): ParticleField {
  return {
    capacity: MAX_PARTICLES,
    count: 0,
    width: 0,
    height: 0,
    x: new Float32Array(MAX_PARTICLES),
    y: new Float32Array(MAX_PARTICLES),
    vx: new Float32Array(MAX_PARTICLES),
    vy: new Float32Array(MAX_PARTICLES),
    pointerActive: false,
    pointerX: 0,
    pointerY: 0,
  }
}

/**
 * Ajusta el campo a un tamaño y una cantidad nuevos reutilizando los arreglos.
 * Las partículas que ya existían conservan su sitio (recortado a los límites
 * nuevos); las que faltan se reparten al azar.
 */
export function resizeParticleField(
  field: ParticleField,
  width: number,
  height: number,
  count: number,
  random: () => number = Math.random,
): void {
  // Sin área previa todas estaban en el origen: no hay sitio que conservar.
  const kept = field.width > 0 && field.height > 0 ? field.count : 0

  field.width = toWhole(width)
  field.height = toWhole(height)
  field.count = Math.min(toWhole(count), field.capacity)

  for (let i = 0; i < field.count; i += 1) {
    if (i < kept) {
      field.x[i] = clamp(field.x[i] ?? 0, 0, field.width)
      field.y[i] = clamp(field.y[i] ?? 0, 0, field.height)
      continue
    }
    const angle = random() * FULL_TURN
    const speed = MIN_SPEED + random() * (MAX_SPEED - MIN_SPEED)
    field.x[i] = random() * field.width
    field.y[i] = random() * field.height
    field.vx[i] = Math.cos(angle) * speed
    field.vy[i] = Math.sin(angle) * speed
  }
}

/** Sitúa el puntero, en las mismas coordenadas que las partículas. */
export function setPointer(field: ParticleField, x: number, y: number): void {
  field.pointerActive = Number.isFinite(x) && Number.isFinite(y)
  field.pointerX = x
  field.pointerY = y
}

export function clearPointer(field: ParticleField): void {
  field.pointerActive = false
}

/** Avanza el campo dtMs milisegundos. Deja cada partícula dentro de los límites. */
export function stepParticleField(field: ParticleField, dtMs: number): void {
  if (!Number.isFinite(dtMs) || dtMs <= 0) return
  const seconds = Math.min(dtMs, MAX_STEP_MS) / MS_PER_SECOND
  const { x, y, vx, vy, width, height, pointerActive, pointerX, pointerY } = field

  for (let i = 0; i < field.count; i += 1) {
    let velocityX = vx[i] ?? 0
    let velocityY = vy[i] ?? 0
    let nextX = (x[i] ?? 0) + velocityX * seconds
    let nextY = (y[i] ?? 0) + velocityY * seconds

    if (pointerActive) {
      const offsetX = nextX - pointerX
      const offsetY = nextY - pointerY
      const distance = Math.hypot(offsetX, offsetY)
      // Cuanto más cerca del puntero, más fuerte el empuje. Justo encima no
      // hay dirección hacia la que apartarla.
      if (distance > 0 && distance < POINTER_RADIUS) {
        const push = ((1 - distance / POINTER_RADIUS) * POINTER_PUSH_SPEED * seconds) / distance
        nextX += offsetX * push
        nextY += offsetY * push
      }
    }

    // Rebote: lo que se pasó de un borde vuelve hacia dentro.
    if (nextX < 0) {
      nextX = -nextX
      velocityX = -velocityX
    } else if (nextX > width) {
      nextX = width - (nextX - width)
      velocityX = -velocityX
    }
    if (nextY < 0) {
      nextY = -nextY
      velocityY = -velocityY
    } else if (nextY > height) {
      nextY = height - (nextY - height)
      velocityY = -velocityY
    }

    x[i] = clamp(nextX, 0, width)
    y[i] = clamp(nextY, 0, height)
    vx[i] = velocityX
    vy[i] = velocityY
  }
}
