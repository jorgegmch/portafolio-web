import { act, render } from '@testing-library/react'
import { StrictMode, useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_DEVICE_PIXEL_RATIO,
  PARTICLE_COLOR_TOKEN,
  useParticleCanvas,
} from '@/hooks/useParticleCanvas'
import { PARTICLE_COUNT } from '@/lib/particles'
import { mockAnimationFrame } from '@/test/mockAnimationFrame'
import { mockCanvas } from '@/test/mockCanvas'

const TOKEN_VALUE = 'rgb(0, 212, 255)'
const DESKTOP = { width: 1920, height: 1080 }
const TABLET = { width: 768, height: 1024 }
const FRAME_MS = 16
const TEN_MINUTES_MS = 10 * 60 * 1000

function Harness({ withCanvas = true }: { withCanvas?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(ref)
  return withCanvas ? <canvas ref={ref} /> : null
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

/** Listeners del hook que siguen puestos: los añadidos menos los quitados. */
const trackListeners = () => {
  const spies = [window, document].map((target) => ({
    added: vi.spyOn(target, 'addEventListener'),
    removed: vi.spyOn(target, 'removeEventListener'),
  }))
  return {
    added: () => spies.flatMap(({ added }) => added.mock.calls.map(([type, fn]) => ({ type, fn }))),
    live: () =>
      spies.flatMap(({ added, removed }) =>
        added.mock.calls
          .filter(([type, fn]) => !removed.mock.calls.some(([t, f]) => t === type && f === fn))
          .map(([type]) => type),
      ),
  }
}

let canvas: ReturnType<typeof mockCanvas>
let frames: ReturnType<typeof mockAnimationFrame>
/** Puntos dibujados en cada pasada; la última es el estado actual. */
let draws: [number, number][][]

const lastDraw = () => draws.at(-1) ?? []

/**
 * Monta el hook sobre una raíz ya creada, para que los listeners que React
 * pone al crearla no se confundan con los del hook.
 */
const mount = ({ strict = false, withCanvas = true, supported = true } = {}) => {
  canvas.restore()
  canvas = mockCanvas({ supported })
  canvas.context.clearRect.mockImplementation(() => {
    draws.push([])
  })
  canvas.context.arc.mockImplementation((x: number, y: number) => {
    draws.at(-1)?.push([x, y])
  })
  const view = render(<></>)
  const listeners = trackListeners()
  const harness = <Harness withCanvas={withCanvas} />
  view.rerender(strict ? <StrictMode>{harness}</StrictMode> : harness)
  return { ...view, listeners, element: view.container.querySelector('canvas') }
}

beforeEach(() => {
  draws = []
  canvas = mockCanvas()
  frames = mockAnimationFrame()
  setViewport(DESKTOP)
  define(window, 'devicePixelRatio', 1)
  define(document, 'hidden', false)
  vi.stubGlobal(
    'getComputedStyle',
    vi.fn(() => ({
      getPropertyValue: (name: string) => (name === PARTICLE_COLOR_TOKEN ? ` ${TOKEN_VALUE} ` : ''),
    })),
  )
})

afterEach(() => {
  canvas.restore()
  Reflect.deleteProperty(document, 'hidden')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useParticleCanvas', () => {
  describe('al montar', () => {
    it('pide un contexto 2D y dibuja una vez antes de cualquier frame', () => {
      mount()

      expect(canvas.getContext).toHaveBeenCalledWith('2d')
      expect(draws).toHaveLength(1)
      expect(frames.pendingCount()).toBe(1)
    })

    it('ajusta el lienzo al tamaño de la ventana', () => {
      const { element } = mount()

      expect(element?.width).toBe(DESKTOP.width)
      expect(element?.height).toBe(DESKTOP.height)
      expect(canvas.context.setTransform).toHaveBeenLastCalledWith(1, 0, 0, 1, 0, 0)
    })

    it.each([
      ['por debajo del tope lo respeta', 1.5, 1.5],
      ['en el tope lo respeta', MAX_DEVICE_PIXEL_RATIO, MAX_DEVICE_PIXEL_RATIO],
      ['por encima del tope lo recorta', 3, MAX_DEVICE_PIXEL_RATIO],
      ['si no existe usa 1', undefined, 1],
      ['si vale 0 usa 1', 0, 1],
    ])('devicePixelRatio: %s', (_name, ratio, expected) => {
      define(window, 'devicePixelRatio', ratio)

      const { element } = mount()

      expect(element?.width).toBe(DESKTOP.width * expected)
      expect(element?.height).toBe(DESKTOP.height * expected)
      expect(canvas.context.setTransform).toHaveBeenLastCalledWith(expected, 0, 0, expected, 0, 0)
    })

    it.each([
      ['escritorio', DESKTOP, PARTICLE_COUNT.desktop],
      ['tablet', TABLET, PARTICLE_COUNT.tablet],
    ])('en %s dibuja la cantidad de partículas de ese modo', (_name, viewport, count) => {
      setViewport(viewport)

      mount()

      expect(lastDraw()).toHaveLength(count)
    })

    it('pinta con el color del token, leído del canvas y sin espacios', () => {
      const { element } = mount()

      expect(getComputedStyle).toHaveBeenCalledWith(element)
      expect(canvas.context.fillStyle).toBe(TOKEN_VALUE)
      expect(canvas.context.strokeStyle).toBe(TOKEN_VALUE)
    })
  })

  describe('bucle', () => {
    it('cada frame dibuja y pide el siguiente, sin acumular', () => {
      mount()

      act(() => frames.step(0))
      act(() => frames.step(FRAME_MS))

      expect(draws).toHaveLength(3)
      expect(frames.pendingCount()).toBe(1)
    })

    it('el primer frame no mueve nada: aún no hay intervalo que medir', () => {
      mount()
      const initial = lastDraw()

      act(() => frames.step(123456))

      expect(lastDraw()).toEqual(initial)
    })

    it('a partir del segundo frame las partículas avanzan', () => {
      mount()
      act(() => frames.step(0))
      const before = lastDraw()

      act(() => frames.step(FRAME_MS))

      expect(lastDraw()).not.toEqual(before)
    })
  })

  describe('pausa con la pestaña oculta', () => {
    it('al ocultarse cancela el frame pendiente y deja de dibujar', () => {
      mount()
      act(() => frames.step(0))
      const drawn = draws.length

      setHidden(true)
      act(() => frames.step(FRAME_MS))

      expect(frames.pendingCount()).toBe(0)
      expect(draws).toHaveLength(drawn)
    })

    it('si monta ya oculta, dibuja una vez y no arranca el bucle', () => {
      define(document, 'hidden', true)

      mount()

      expect(draws).toHaveLength(1)
      expect(frames.pendingCount()).toBe(0)
    })

    it('al volver retoma el bucle con un solo frame pendiente', () => {
      mount()
      setHidden(true)

      setHidden(false)

      expect(frames.pendingCount()).toBe(1)
    })

    // Sin esto, tras diez minutos fuera las partículas darían un salto.
    it('el primer frame tras volver no mueve nada, por largo que fuera el descanso', () => {
      mount()
      act(() => frames.step(0))
      act(() => frames.step(FRAME_MS))
      const beforeHiding = lastDraw()

      setHidden(true)
      setHidden(false)
      act(() => frames.step(FRAME_MS + TEN_MINUTES_MS))

      expect(lastDraw()).toEqual(beforeHiding)
    })

    it('el segundo frame tras volver ya avanza con normalidad', () => {
      mount()
      act(() => frames.step(0))
      setHidden(true)
      setHidden(false)
      act(() => frames.step(TEN_MINUTES_MS))
      const afterResume = lastDraw()

      act(() => frames.step(TEN_MINUTES_MS + FRAME_MS))

      expect(lastDraw()).not.toEqual(afterResume)
    })

    it('avisos repetidos de "visible" no duplican el bucle', () => {
      mount()

      setHidden(false)
      setHidden(false)

      expect(frames.pendingCount()).toBe(1)
    })
  })

  describe('al redimensionar', () => {
    it('reajusta el lienzo y la cantidad de partículas, y redibuja', () => {
      const { element } = mount()
      const drawn = draws.length

      resizeTo(TABLET)

      expect(element?.width).toBe(TABLET.width)
      expect(element?.height).toBe(TABLET.height)
      expect(draws).toHaveLength(drawn + 1)
      expect(lastDraw()).toHaveLength(PARTICLE_COUNT.tablet)
    })

    it('no arranca un segundo bucle', () => {
      mount()

      resizeTo(TABLET)
      resizeTo(DESKTOP)

      expect(frames.pendingCount()).toBe(1)
    })
  })

  describe('sin canvas utilizable', () => {
    it.each([
      ['el navegador no entrega contexto 2D', { supported: false }],
      ['la referencia no apunta a ningún canvas', { withCanvas: false }],
    ])('si %s, no rompe ni deja nada en marcha', (_name, options) => {
      let listeners: ReturnType<typeof trackListeners> | undefined

      expect(() => {
        listeners = mount(options).listeners
      }).not.toThrow()

      expect(frames.pendingCount()).toBe(0)
      expect(draws).toHaveLength(0)
      expect(listeners?.added()).toEqual([])
    })
  })

  describe('limpieza', () => {
    it('al desmontar cancela el frame pendiente', () => {
      const { unmount } = mount()

      unmount()

      expect(frames.pendingCount()).toBe(0)
    })

    it('al desmontar quita exactamente los listeners que añadió', () => {
      const { unmount, listeners } = mount()
      expect(listeners.added().map(({ type }) => type).sort()).toEqual([
        'resize',
        'visibilitychange',
      ])

      unmount()

      expect(listeners.live()).toEqual([])
    })

    it('tras desmontar, ni el resize ni la visibilidad vuelven a dibujar o a pedir frames', () => {
      const { unmount } = mount()
      const drawn = draws.length
      unmount()

      resizeTo(TABLET)
      setHidden(true)
      setHidden(false)

      expect(draws).toHaveLength(drawn)
      expect(frames.pendingCount()).toBe(0)
    })
  })

  // StrictMode monta, desmonta y vuelve a montar cada efecto en desarrollo.
  describe('en StrictMode', () => {
    it('queda un solo bucle y un solo listener de cada tipo', () => {
      const { listeners } = mount({ strict: true })

      expect(frames.pendingCount()).toBe(1)
      expect(listeners.live().sort()).toEqual(['resize', 'visibilitychange'])
    })

    it('al desmontar no queda nada', () => {
      const { unmount, listeners } = mount({ strict: true })

      unmount()

      expect(frames.pendingCount()).toBe(0)
      expect(listeners.live()).toEqual([])
    })
  })
})
