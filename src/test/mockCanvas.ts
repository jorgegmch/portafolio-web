import { vi } from 'vitest'

/** Contexto 2D de pega, con lo que usa el fondo de partículas. */
export function createMockContext() {
  return {
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  }
}

export type MockContext = ReturnType<typeof createMockContext>

/**
 * Hace que todo <canvas> entregue el mismo contexto 2D de pega (jsdom no
 * dibuja). Con supported: false entrega null, como un navegador sin canvas.
 * Hay que llamar a restore() al terminar el test.
 */
export function mockCanvas({ supported = true }: { supported?: boolean } = {}) {
  const context = createMockContext()
  const original = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext')
  const getContext = vi.fn(() => (supported ? context : null))

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: getContext,
  })

  return {
    context,
    getContext,
    restore() {
      if (original) Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', original)
    },
  }
}
