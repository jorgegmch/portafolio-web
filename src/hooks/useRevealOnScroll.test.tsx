import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

let io: ReturnType<typeof mockIntersectionObserver>

const lastObserver = () => io.last()

/** El elemento del hook entra en pantalla (true) o sigue fuera (false). */
const trigger = (isIntersecting: boolean) => io.trigger(screen.getByTestId('probe'), isIntersecting)

function Probe() {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="probe">
      {visible ? 'visible' : 'oculto'}
    </div>
  )
}

beforeEach(() => {
  io = mockIntersectionObserver()
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useRevealOnScroll', () => {
  it('empieza oculto y observa su elemento', () => {
    render(<Probe />)

    expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
    expect(lastObserver().observed).toEqual([screen.getByTestId('probe')])
  })

  it('sigue oculto mientras el elemento no entra en pantalla', () => {
    render(<Probe />)

    act(() => {
      trigger(false)
    })

    expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
  })

  it('se marca visible al entrar en pantalla y deja de observar', () => {
    render(<Probe />)
    const observer = lastObserver()

    act(() => {
      trigger(true)
    })

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
    expect(observer.disconnected).toBe(true)
    expect(io.instances).toHaveLength(1)
  })

  it('deja de observar al desmontar', () => {
    const { unmount } = render(<Probe />)
    const observer = lastObserver()

    unmount()

    expect(observer.disconnected).toBe(true)
  })

  it('con movimiento reducido es visible desde el inicio y no observa', () => {
    mockMatchMedia(true)
    render(<Probe />)

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
    expect(io.instances).toHaveLength(0)
  })

  it('sin IntersectionObserver es visible desde el inicio', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
  })
})
