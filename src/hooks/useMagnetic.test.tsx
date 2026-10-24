import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FINE_POINTER_QUERY, MAGNETIC_MAX_SHIFT, useMagnetic } from '@/hooks/useMagnetic'
import { mockAnimationFrame } from '@/test/mockAnimationFrame'
import { mockMatchMedia } from '@/test/mockMatchMedia'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
/** El botón mide 200 × 200 y su centro está en (100, 100). */
const BOX = { left: 0, top: 0, width: 200, height: 200 }

function Magnet() {
  const ref = useRef<HTMLButtonElement>(null)
  useMagnetic(ref)
  return (
    <button ref={ref} type="button">
      Escríbeme
    </button>
  )
}

const renderMagnet = () => {
  const result = render(<Magnet />)
  const button = screen.getByRole('button')
  // jsdom no mide: la caja se fija a mano.
  vi.spyOn(button, 'getBoundingClientRect').mockImplementation(() =>
    DOMRect.fromRect({ x: BOX.left, y: BOX.top, width: BOX.width, height: BOX.height }),
  )
  return { ...result, button }
}

let frames: ReturnType<typeof mockAnimationFrame>

beforeEach(() => {
  frames = mockAnimationFrame()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useMagnetic (botón magnético, spec §4.6)', () => {
  describe('con puntero fino y sin preferencia de movimiento', () => {
    beforeEach(() => {
      mockMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION]: false })
    })

    it('se acerca al puntero, en el fotograma siguiente', () => {
      const { button } = renderMagnet()

      fireEvent.pointerMove(button, { clientX: 150, clientY: 100 })
      expect(button.style.transform).toBe('')

      frames.step(16)
      expect(button.style.transform).toBe(`translate(${MAGNETIC_MAX_SHIFT / 2}px, 0px)`)
    })

    it(`no pasa de ${MAGNETIC_MAX_SHIFT} px en cada eje`, () => {
      const { button } = renderMagnet()

      fireEvent.pointerMove(button, { clientX: 900, clientY: -900 })
      frames.step(16)

      expect(button.style.transform).toBe(`translate(${MAGNETIC_MAX_SHIFT}px, -${MAGNETIC_MAX_SHIFT}px)`)
    })

    it('mide desde su sitio, no desde donde ya se movió', () => {
      const { button } = renderMagnet()
      fireEvent.pointerMove(button, { clientX: 200, clientY: 100 })
      frames.step(16)
      // Movido 18 px, su caja también se corre: el centro sigue siendo 100.
      vi.spyOn(button, 'getBoundingClientRect').mockImplementation(() =>
        DOMRect.fromRect({ x: MAGNETIC_MAX_SHIFT, y: 0, width: 200, height: 200 }),
      )

      fireEvent.pointerMove(button, { clientX: 100, clientY: 100 })
      frames.step(32)

      expect(button.style.transform).toBe('')
    })

    it('al salir el puntero vuelve a su sitio', () => {
      const { button } = renderMagnet()
      fireEvent.pointerMove(button, { clientX: 200, clientY: 200 })
      frames.step(16)

      fireEvent.pointerLeave(button)
      frames.step(32)

      expect(button.style.transform).toBe('')
    })

    it('pide un solo fotograma por muchos movimientos', () => {
      const { button } = renderMagnet()

      fireEvent.pointerMove(button, { clientX: 120, clientY: 100 })
      fireEvent.pointerMove(button, { clientX: 140, clientY: 100 })
      fireEvent.pointerMove(button, { clientX: 160, clientY: 100 })

      expect(frames.pendingCount()).toBe(1)
    })

    it('al desmontar cancela el fotograma pendiente y deja de escuchar', () => {
      const { button, unmount } = renderMagnet()
      fireEvent.pointerMove(button, { clientX: 200, clientY: 100 })
      const remove = vi.spyOn(button, 'removeEventListener')

      unmount()

      expect(frames.pendingCount()).toBe(0)
      expect(remove.mock.calls.map(([type]) => type).sort()).toEqual(['pointerleave', 'pointermove'])
    })
  })

  it('quieto con movimiento reducido', () => {
    mockMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION]: true })
    const { button } = renderMagnet()

    fireEvent.pointerMove(button, { clientX: 200, clientY: 200 })
    frames.step(16)

    expect(frames.pendingCount()).toBe(0)
    expect(button.style.transform).toBe('')
  })

  it('quieto en táctil, sin puntero fino', () => {
    mockMatchMedia({ [FINE_POINTER_QUERY]: false, [REDUCED_MOTION]: false })
    const { button } = renderMagnet()

    fireEvent.pointerMove(button, { clientX: 200, clientY: 200 })
    frames.step(16)

    expect(button.style.transform).toBe('')
  })

  it('si pasa a pedir movimiento reducido, vuelve a su sitio y se queda quieto', () => {
    const media = mockMatchMedia({ [FINE_POINTER_QUERY]: true, [REDUCED_MOTION]: false })
    const { button } = renderMagnet()
    fireEvent.pointerMove(button, { clientX: 200, clientY: 100 })
    frames.step(16)
    expect(button.style.transform).not.toBe('')

    act(() => media.setMatches(true, REDUCED_MOTION))
    fireEvent.pointerMove(button, { clientX: 200, clientY: 100 })
    frames.step(32)

    expect(button.style.transform).toBe('')
  })
})
