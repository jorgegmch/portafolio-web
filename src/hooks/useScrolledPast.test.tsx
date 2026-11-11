import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrolledPast } from '@/hooks/useScrolledPast'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

function Probe() {
  const ref = useRef<HTMLDivElement>(null)
  const past = useScrolledPast(ref)
  return (
    <>
      <div ref={ref} data-testid="marca" />
      <output aria-label="pasado">{past ? 'sí' : 'no'}</output>
    </>
  )
}

const shown = () => screen.getByRole('status', { name: 'pasado' }).textContent

let io: ReturnType<typeof mockIntersectionObserver>

beforeEach(() => {
  io = mockIntersectionObserver()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useScrolledPast', () => {
  it('al cargar, con la marca a la vista, no se ha pasado', () => {
    render(<Probe />)

    expect(io.last().observed).toEqual([screen.getByTestId('marca')])
    expect(shown()).toBe('no')
  })

  it('cuando la marca sale de la ventana, se ha pasado', () => {
    render(<Probe />)

    act(() => {
      io.trigger(screen.getByTestId('marca'), false)
    })

    expect(shown()).toBe('sí')
  })

  it('al volver a verla, deja de estarlo', () => {
    render(<Probe />)
    act(() => {
      io.trigger(screen.getByTestId('marca'), false)
    })

    act(() => {
      io.trigger(screen.getByTestId('marca'), true)
    })

    expect(shown()).toBe('no')
  })

  it('al desmontarse desconecta el observador', () => {
    const { unmount } = render(<Probe />)

    unmount()

    expect(io.last().disconnected).toBe(true)
  })

  it('sin IntersectionObserver no rompe y no se da por pasada', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    render(<Probe />)

    expect(shown()).toBe('no')
  })
})
