import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACTIVE_LINE_MARGIN, useActiveSection } from '@/hooks/useActiveSection'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const IDS = ['hero', 'about', 'projects'] as const

function Probe() {
  const active = useActiveSection(IDS)
  return (
    <>
      <output aria-label="actual">{active ?? 'ninguna'}</output>
      {IDS.map((id) => (
        <section key={id} id={id} />
      ))}
    </>
  )
}

const shown = () => screen.getByRole('status', { name: 'actual' }).textContent
const section = (id: string) => {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Falta #${id}`)
  return element
}

let io: ReturnType<typeof mockIntersectionObserver>

beforeEach(() => {
  io = mockIntersectionObserver()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useActiveSection', () => {
  it('observa cada sección con una línea fina de la ventana', () => {
    render(<Probe />)

    expect(io.last().observed.map((element) => element.id)).toEqual([...IDS])
    expect(ACTIVE_LINE_MARGIN).toBe('-40% 0px -59% 0px')
  })

  it('mientras ninguna cruza la línea, no hay escena actual', () => {
    render(<Probe />)

    expect(shown()).toBe('ninguna')
  })

  it('la escena actual es la que cruza la línea', () => {
    render(<Probe />)

    act(() => {
      io.trigger(section('about'), true)
    })

    expect(shown()).toBe('about')
  })

  // Con la cortina, el panel de abajo sigue fijado (y cruzando la línea)
  // mientras el siguiente sube encima: se ve el que va después en la página.
  it('si cruzan varias, gana la que va después en la página', () => {
    render(<Probe />)

    act(() => {
      io.trigger(section('projects'), true)
      io.trigger(section('about'), true)
    })

    expect(shown()).toBe('projects')
  })

  it('al salir una, vuelve la que sigue cruzando', () => {
    render(<Probe />)
    act(() => {
      io.trigger(section('about'), true)
      io.trigger(section('projects'), true)
    })

    act(() => {
      io.trigger(section('projects'), false)
    })

    expect(shown()).toBe('about')
  })

  it('al desmontarse desconecta el observador', () => {
    const { unmount } = render(<Probe />)

    unmount()

    expect(io.last().disconnected).toBe(true)
  })

  it('sin IntersectionObserver no rompe ni marca ninguna', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    render(<Probe />)

    expect(shown()).toBe('ninguna')
  })
})
