import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MotionPauseContext } from '@/hooks/MotionPauseContext'
import { useTextScramble } from '@/hooks/useTextScramble'
import { SCRAMBLE_TIMING } from '@/lib/nameScramble'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// Texto que se traduce a otro y se queda así mientras se pida (el logo de la
// barra). Reloj falso: se opera con act y los botones de prueba.

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
/** Pasos de sobra para cualquier traducción entre los dos textos. */
const ENOUGH_MS = SCRAMBLE_TIMING.stepMs * 40

function Probe() {
  const { text, setAlternate } = useTextScramble('jorgegmch', 'Jorge Gómez')
  return (
    <>
      <p data-testid="text">{text}</p>
      <button type="button" onClick={() => setAlternate(true)}>
        pedir
      </button>
      <button type="button" onClick={() => setAlternate(false)}>
        soltar
      </button>
    </>
  )
}

const renderProbe = ({ paused = false } = {}) =>
  render(
    <MotionPauseContext value={{ paused, togglePaused: () => {} }}>
      <Probe />
    </MotionPauseContext>,
  )

const text = () => screen.getByTestId('text').textContent
/**
 * Avanza el reloj de paso en paso: cada temporizador nace al renderizar el
 * paso anterior, así que un solo avance largo solo daría un paso.
 */
const advance = (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += SCRAMBLE_TIMING.stepMs) {
    act(() => vi.advanceTimersByTime(SCRAMBLE_TIMING.stepMs))
  }
}
const set = (on: boolean) => fireEvent.click(screen.getByRole('button', { name: on ? 'pedir' : 'soltar' }))

beforeEach(() => {
  vi.useFakeTimers()
  mockMatchMedia({ [REDUCED_MOTION]: false })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useTextScramble', () => {
  it('en reposo enseña el texto de reposo, y no cambia solo', () => {
    renderProbe()

    advance(ENOUGH_MS)

    expect(text()).toBe('jorgegmch')
  })

  it('al pedirlo se traduce letra a letra y se queda en el otro texto', () => {
    renderProbe()

    set(true)
    advance(SCRAMBLE_TIMING.stepMs)
    expect(text()).not.toBe('jorgegmch')
    expect(text()).not.toBe('Jorge Gómez')

    advance(ENOUGH_MS)
    expect(text()).toBe('Jorge Gómez')
    advance(ENOUGH_MS)
    expect(text()).toBe('Jorge Gómez')
  })

  it('al dejar de pedirlo vuelve al texto de reposo', () => {
    renderProbe()
    set(true)
    advance(ENOUGH_MS)

    set(false)
    advance(ENOUGH_MS)

    expect(text()).toBe('jorgegmch')
  })

  it('si se suelta a medio camino, vuelve desde donde iba', () => {
    renderProbe()
    set(true)
    advance(SCRAMBLE_TIMING.stepMs * 4)

    set(false)
    advance(ENOUGH_MS)

    expect(text()).toBe('jorgegmch')
  })

  it('con movimiento reducido cambia de golpe, sin pasos intermedios', () => {
    mockMatchMedia({ [REDUCED_MOTION]: true })
    renderProbe()

    set(true)
    expect(text()).toBe('Jorge Gómez')
    set(false)
    expect(text()).toBe('jorgegmch')
  })

  it('con la pausa global cambia de golpe', () => {
    renderProbe({ paused: true })

    set(true)

    expect(text()).toBe('Jorge Gómez')
  })

  it('al desmontar no deja temporizadores', () => {
    const { unmount } = renderProbe()
    set(true)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
