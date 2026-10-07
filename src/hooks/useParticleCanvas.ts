import { useEffect, useRef, type RefObject } from 'react'
import { mediaQueries } from '@/config/media'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { drawParticleField } from '@/lib/drawParticles'
import {
  clearPointer,
  createParticleField,
  PARTICLE_COUNT,
  particleModeFor,
  resizeParticleField,
  setPointer,
  stepParticleField,
  type ParticleField,
} from '@/lib/particles'

/** Tope de devicePixelRatio: por encima, el lienzo crece mucho y apenas se nota. */
export const MAX_DEVICE_PIXEL_RATIO = 2

/** Token de color con el que se pintan las partículas. */
export const PARTICLE_COLOR_TOKEN = '--color-accent'

const DEFAULT_PIXEL_RATIO = 1
/** requestAnimationFrame nunca devuelve 0: sirve para decir "no hay frame pedido". */
const NO_FRAME = 0
/** Marca de "todavía no hubo un frame desde el que medir el intervalo". */
const NO_PREVIOUS_FRAME = -1

// passive: el listener nunca cancela el movimiento, así que no lo frena.
const PASSIVE = { passive: true } as const

/**
 * Anima el fondo de partículas en el canvas de la referencia: lo ajusta a la
 * ventana, avanza y dibuja el campo en cada frame, y se detiene mientras la
 * pestaña está oculta. Al desmontar cancela el frame y quita sus listeners.
 *
 * Tres modos, que cambian en caliente si cambia la preferencia:
 * - con prefers-reduced-motion, un solo dibujo estático, sin bucle;
 * - en táctil (hover: none), animado con menos partículas y sin puntero;
 * - en el resto, animado y apartando las partículas del puntero.
 */
export function useParticleCanvas(canvasRef: RefObject<HTMLCanvasElement | null>): void {
  const reducedMotion = useReducedMotion()
  const noHover = useMediaQuery(mediaQueries.noHover)
  // El campo se reserva una vez y sobrevive a los remontajes del efecto.
  const fieldRef = useRef<ParticleField | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const field = (fieldRef.current ??= createParticleField())
    const color = getComputedStyle(canvas).getPropertyValue(PARTICLE_COLOR_TOKEN).trim()
    const fewerParticles = reducedMotion || noHover
    const followsPointer = !reducedMotion && !noHover
    const root = document.documentElement
    let frame = NO_FRAME
    let previous = NO_PREVIOUS_FRAME

    const resize = () => {
      const ratio = Math.min(
        window.devicePixelRatio || DEFAULT_PIXEL_RATIO,
        MAX_DEVICE_PIXEL_RATIO,
      )
      const width = window.innerWidth
      const height = window.innerHeight

      // El lienzo tiene más píxeles que la ventana; la escala lo compensa para
      // que el dibujo siga trabajando en píxeles de CSS.
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const mode = particleModeFor(width, fewerParticles)
      resizeParticleField(field, width, height, PARTICLE_COUNT[mode])
      drawParticleField(context, field, color)
    }

    const tick = (now: number) => {
      stepParticleField(field, previous === NO_PREVIOUS_FRAME ? 0 : now - previous)
      previous = now
      drawParticleField(context, field, color)
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (reducedMotion || frame !== NO_FRAME || document.hidden) return
      // Tras una pausa, el primer frame no debe medir el tiempo que duró.
      previous = NO_PREVIOUS_FRAME
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = NO_FRAME
    }

    const onVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }

    const onPointerMove = (event: PointerEvent) => {
      setPointer(field, event.clientX, event.clientY)
    }

    const onPointerLeave = () => {
      clearPointer(field)
    }

    resize()
    start()
    window.addEventListener('resize', resize)
    // Sin bucle no hay nada que pausar.
    if (!reducedMotion) document.addEventListener('visibilitychange', onVisibilityChange)
    if (followsPointer) {
      root.addEventListener('pointermove', onPointerMove, PASSIVE)
      root.addEventListener('pointerleave', onPointerLeave)
    }

    return () => {
      stop()
      // El campo sobrevive al efecto: sin esto, el siguiente modo heredaría el puntero.
      clearPointer(field)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [canvasRef, reducedMotion, noHover])
}
