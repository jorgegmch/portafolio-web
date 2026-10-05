import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// jsdom no implementa IntersectionObserver: este doble guarda el callback
// para que el test decida cuándo el elemento "entra en pantalla".
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  observed: Element[] = []
  disconnected = false
  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }

  observe(element: Element) {
    this.observed.push(element)
  }

  disconnect() {
    this.disconnected = true
  }

  trigger(isIntersecting: boolean) {
    const entries = this.observed.map((target) => ({ target, isIntersecting }))
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver,
    )
  }
}

const lastObserver = () => {
  const observer = FakeIntersectionObserver.instances.at(-1)
  if (!observer) throw new Error('No se creó ningún IntersectionObserver')
  return observer
}

function Probe() {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="probe">
      {visible ? 'visible' : 'oculto'}
    </div>
  )
}

beforeEach(() => {
  FakeIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
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

    act(() => lastObserver().trigger(false))

    expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
  })

  it('se marca visible al entrar en pantalla y deja de observar', () => {
    render(<Probe />)
    const observer = lastObserver()

    act(() => observer.trigger(true))

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
    expect(observer.disconnected).toBe(true)
    expect(FakeIntersectionObserver.instances).toHaveLength(1)
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
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('sin IntersectionObserver es visible desde el inicio', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)

    expect(screen.getByTestId('probe')).toHaveTextContent('visible')
  })
})
