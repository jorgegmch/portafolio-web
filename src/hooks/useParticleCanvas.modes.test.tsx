import { act, render } from '@testing-library/react'
import { StrictMode, useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mediaQueries } from '@/config/media'
import { useParticleCanvas } from '@/hooks/useParticleCanvas'
import { clearPointer, PARTICLE_COUNT, setPointer } from '@/lib/particles'
import { mockAnimationFrame } from '@/test/mockAnimationFrame'
import { mockCanvas } from '@/test/mockCanvas'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// El modelo real, con setPointer y clearPointer espiados para ver cuándo se usan.
vi.mock('@/lib/particles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/particles')>()
  return {
    ...actual,
    setPointer: vi.fn(actual.setPointer),
    clearPointer: vi.fn(actual.clearPointer),
  }
})

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const NO_HOVER = mediaQueries.noHover
const DESKTOP = { width: 1920, height: 1080 }
const TABLET = { width: 768, height: 1024 }
const FRAME_MS = 16

const ANIMATED_WITH_POINTER = ['pointerleave', 'pointermove', 'resize', 'visibilitychange']
const ANIMATED_WITHOUT_POINTER = ['resize', 'visibilitychange']
const STATIC = ['resize']

function Harness() {
  const ref = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(ref)
  return <canvas ref={ref} />
}

const define = (target: object, key: string, value: unknown) =>
  Object.defineProperty(target, key, { value, configurable: true, writable: true })

const setViewport = ({ width, height }: { width: number; height: number }) => {
  define(window, 'innerWidth', width)
  define(window, 'innerHeight', height)
}

const setHidden = (hidden: boolean) =>
  act(() => {
    define(document, 'hidden', hidden)
    document.dispatchEvent(new Event('visibilitychange'))
  })

const resizeTo = (viewport: { width: number; height: number }) =>
  act(() => {
    setViewport(viewport)
    window.dispatchEvent(new Event('resize'))
  })

const movePointerTo = (clientX: number, clientY: number) =>
  act(() => {
    document.body.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY, bubbles: true }))
  })

const pointerLeavesPage = () =>
  act(() => {
    document.documentElement.dispatchEvent(new MouseEvent('pointerleave'))
  })

/** Listeners del hook que siguen puestos: los añadidos menos los quitados. */
const trackListeners = () => {
  const spies = [window, document, document.documentElement].map((target) => ({
    added: vi.spyOn(target, 'addEventListener'),
    removed: vi.spyOn(target, 'removeEventListener'),
  }))
  return {
    added: () => spies.flatMap(({ added }) => added.mock.calls),
    live: () =>
      spies
        .flatMap(({ added, removed }) =>
          added.mock.calls
            .filter(([type, fn]) => !removed.mock.calls.some(([t, f]) => t === type && f === fn))
            .map(([type]) => type),
        )
        .sort(),
  }
}

let canvas: ReturnType<typeof mockCanvas>
let frames: ReturnType<typeof mockAnimationFrame>
/** Cantidad de puntos dibujados en cada pasada; la última es el estado actual. */
let draws: number[]

const lastDrawCount = () => draws.at(-1)

const mount = ({ reducedMotion = false, noHover = false, strict = false } = {}) => {
  const media = mockMatchMedia({ [REDUCED_MOTION]: reducedMotion, [NO_HOVER]: noHover })
  canvas.context.clearRect.mockImplementation(() => {
    draws.push(0)
  })
  canvas.context.arc.mockImplementation(() => {
    draws[draws.length - 1] = (draws.at(-1) ?? 0) + 1
  })
  // La raíz se crea antes de espiar, para no contar los listeners de React.
  const view = render(<></>)
  const listeners = trackListeners()
  view.rerender(
    strict ? (
      <StrictMode>
        <Harness />
      </StrictMode>
    ) : (
      <Harness />
    ),
  )
  return {
    ...view,
    listeners,
    setReducedMotion: (next: boolean) => act(() => media.setMatches(next, REDUCED_MOTION)),
    setNoHover: (next: boolean) => act(() => media.setMatches(next, NO_HOVER)),
    mediaListeners: () => media.listenerCount(),
  }
}

beforeEach(() => {
  draws = []
  canvas = mockCanvas()
  frames = mockAnimationFrame()
  setViewport(DESKTOP)
  define(window, 'devicePixelRatio', 1)
  define(document, 'hidden', false)
  vi.mocked(setPointer).mockClear()
  vi.mocked(clearPointer).mockClear()
})

afterEach(() => {
  canvas.restore()
  Reflect.deleteProperty(document, 'hidden')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useParticleCanvas: modos', () => {
  describe('con prefers-reduced-motion', () => {
    it('dibuja una sola vez y no arranca ningún bucle', () => {
      mount({ reducedMotion: true })

      expect(draws).toHaveLength(1)
      expect(frames.pendingCount()).toBe(0)
      expect(requestAnimationFrame).not.toHaveBeenCalled()
    })

    it('usa la cantidad reducida aunque la pantalla sea de escritorio', () => {
      mount({ reducedMotion: true })

      expect(lastDrawCount()).toBe(PARTICLE_COUNT.reduced)
    })

    it('solo escucha el resize: ni visibilidad ni puntero', () => {
      const { listeners } = mount({ reducedMotion: true })

      expect(listeners.live()).toEqual(STATIC)
    })

    it('al redimensionar redibuja una vez, sin arrancar el bucle', () => {
      mount({ reducedMotion: true })

      resizeTo(TABLET)

      expect(draws).toHaveLength(2)
      expect(lastDrawCount()).toBe(PARTICLE_COUNT.reduced)
      expect(frames.pendingCount()).toBe(0)
    })

    it('ocultar y volver a mostrar la pestaña no arranca el bucle', () => {
      mount({ reducedMotion: true })

      setHidden(true)
      setHidden(false)

      expect(frames.pendingCount()).toBe(0)
      expect(draws).toHaveLength(1)
    })

    it('mover el puntero no hace nada', () => {
      mount({ reducedMotion: true })

      movePointerTo(100, 100)

      expect(setPointer).not.toHaveBeenCalled()
    })
  })

  describe('en dispositivos táctiles, con (hover: none)', () => {
    it('sigue animando, con la cantidad reducida', () => {
      mount({ noHover: true })

      expect(frames.pendingCount()).toBe(1)
      expect(lastDrawCount()).toBe(PARTICLE_COUNT.reduced)
    })

    it('no sigue el puntero', () => {
      const { listeners } = mount({ noHover: true })

      movePointerTo(100, 100)

      expect(setPointer).not.toHaveBeenCalled()
      expect(listeners.live()).toEqual(ANIMATED_WITHOUT_POINTER)
    })

    it('se pausa con la pestaña oculta, como en escritorio', () => {
      mount({ noHover: true })

      setHidden(true)

      expect(frames.pendingCount()).toBe(0)
    })
  })

  describe('puntero en modo animado', () => {
    it('al moverse, sitúa el puntero del campo en las coordenadas de la ventana', () => {
      mount()

      movePointerTo(320, 240)

      expect(setPointer).toHaveBeenLastCalledWith(expect.anything(), 320, 240)
    })

    it('escucha el movimiento en modo passive', () => {
      const { listeners } = mount()

      expect(listeners.added()).toContainEqual([
        'pointermove',
        expect.any(Function),
        expect.objectContaining({ passive: true }),
      ])
    })

    it('cuando el puntero sale de la página, lo retira del campo', () => {
      mount()
      movePointerTo(320, 240)
      vi.mocked(clearPointer).mockClear()

      pointerLeavesPage()

      expect(clearPointer).toHaveBeenCalledTimes(1)
    })

    it('mantiene la cantidad de escritorio', () => {
      mount()

      expect(lastDrawCount()).toBe(PARTICLE_COUNT.desktop)
    })

    it('al desmontar quita exactamente los listeners que añadió', () => {
      const { unmount, listeners } = mount()
      expect(listeners.live()).toEqual(ANIMATED_WITH_POINTER)

      unmount()

      expect(listeners.live()).toEqual([])
    })

    it('tras desmontar, mover el puntero ya no llega al campo', () => {
      const { unmount } = mount()
      unmount()
      vi.mocked(setPointer).mockClear()

      movePointerTo(50, 50)

      expect(setPointer).not.toHaveBeenCalled()
    })
  })

  // El visitante cambia la preferencia del sistema con la página abierta.
  describe('cambio en caliente', () => {
    it('de animado a movimiento reducido: para el bucle y deja un dibujo estático', () => {
      const { setReducedMotion, listeners } = mount()
      act(() => frames.step(0))
      const drawnWhileAnimated = draws.length

      setReducedMotion(true)
      act(() => frames.step(FRAME_MS))

      expect(frames.pendingCount()).toBe(0)
      expect(draws).toHaveLength(drawnWhileAnimated + 1)
      expect(lastDrawCount()).toBe(PARTICLE_COUNT.reduced)
      expect(listeners.live()).toEqual(STATIC)
    })

    it('de movimiento reducido a animado: arranca un solo bucle y vuelve a escuchar', () => {
      const { setReducedMotion, listeners } = mount({ reducedMotion: true })

      setReducedMotion(false)

      expect(frames.pendingCount()).toBe(1)
      expect(lastDrawCount()).toBe(PARTICLE_COUNT.desktop)
      expect(listeners.live()).toEqual(ANIMATED_WITH_POINTER)
    })

    it('al pasar a táctil deja de seguir el puntero y lo retira del campo', () => {
      const { setNoHover, listeners } = mount()
      movePointerTo(320, 240)
      vi.mocked(setPointer).mockClear()
      vi.mocked(clearPointer).mockClear()

      setNoHover(true)
      movePointerTo(10, 10)

      expect(clearPointer).toHaveBeenCalled()
      expect(setPointer).not.toHaveBeenCalled()
      expect(listeners.live()).toEqual(ANIMATED_WITHOUT_POINTER)
      expect(frames.pendingCount()).toBe(1)
      expect(lastDrawCount()).toBe(PARTICLE_COUNT.reduced)
    })

    it('al volver de táctil a puntero, lo sigue de nuevo', () => {
      const { setNoHover, listeners } = mount({ noHover: true })

      setNoHover(false)
      movePointerTo(320, 240)

      expect(setPointer).toHaveBeenLastCalledWith(expect.anything(), 320, 240)
      expect(listeners.live()).toEqual(ANIMATED_WITH_POINTER)
    })

    it('varios cambios seguidos no acumulan bucles ni listeners', () => {
      const { setReducedMotion, setNoHover, listeners, mediaListeners } = mount()
      const mediaListenersAtStart = mediaListeners()

      for (let round = 0; round < 3; round += 1) {
        setReducedMotion(true)
        setNoHover(true)
        setReducedMotion(false)
        setNoHover(false)
      }

      expect(frames.pendingCount()).toBe(1)
      expect(listeners.live()).toEqual(ANIMATED_WITH_POINTER)
      expect(mediaListeners()).toBe(mediaListenersAtStart)
    })

    it('desmontar después de varios cambios no deja nada', () => {
      const { setReducedMotion, setNoHover, listeners, mediaListeners, unmount } = mount()
      setReducedMotion(true)
      setReducedMotion(false)
      setNoHover(true)

      unmount()

      expect(frames.pendingCount()).toBe(0)
      expect(listeners.live()).toEqual([])
      expect(mediaListeners()).toBe(0)
    })
  })

  describe('en StrictMode', () => {
    it('animado: un solo bucle y un solo listener de cada tipo', () => {
      const { listeners } = mount({ strict: true })

      expect(frames.pendingCount()).toBe(1)
      expect(listeners.live()).toEqual(ANIMATED_WITH_POINTER)
    })

    it('con movimiento reducido: ningún bucle y solo el resize', () => {
      const { listeners } = mount({ reducedMotion: true, strict: true })

      expect(frames.pendingCount()).toBe(0)
      expect(listeners.live()).toEqual(STATIC)
    })
  })
})
