import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

let io: ReturnType<typeof mockIntersectionObserver>

const lastObserver = () => io.last()

/** El elemento de la sonda entra en pantalla (true) o sigue fuera (false). */
const trigger = (isIntersecting: boolean, testId = 'probe') =>
  io.trigger(screen.getByTestId(testId), isIntersecting)

// El registro de lo revelado dura toda la carga del módulo, también entre
// los tests de este archivo: cada test usa su propia clave.
let testCount = 0
let key = ''

interface ProbeProps {
  revealKey?: string
  testId?: string
  /** El hook que usa la sonda; por defecto, el del import de arriba. */
  useReveal?: typeof useRevealOnScroll
}

function Probe({ revealKey = key, testId = 'probe', useReveal = useRevealOnScroll }: ProbeProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(revealKey)
  return (
    <div ref={ref} data-testid={testId}>
      {visible ? 'visible' : 'oculto'}
    </div>
  )
}

beforeEach(() => {
  testCount += 1
  key = `test-${testCount}`
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

  it('al revelar deja de observar su elemento con unobserve', () => {
    render(<Probe />)
    const observer = lastObserver()
    const probe = screen.getByTestId('probe')

    act(() => {
      trigger(true)
    })

    expect(observer.unobserved).toEqual([probe])
  })

  describe('una vez por carga', () => {
    it('una clave ya revelada vuelve a montarse visible y sin observador', () => {
      const { unmount } = render(<Probe />)
      act(() => {
        trigger(true)
      })
      unmount()

      render(<Probe />)

      expect(screen.getByTestId('probe')).toHaveTextContent('visible')
      expect(io.instances).toHaveLength(1)
    })

    it('si se desmonta sin haber entrado en pantalla, vuelve oculto y observa de nuevo', () => {
      const { unmount } = render(<Probe />)
      act(() => {
        trigger(false)
      })
      unmount()

      render(<Probe />)

      expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
      expect(lastObserver().observed).toEqual([screen.getByTestId('probe')])
    })

    it('dos claves distintas no se pisan', () => {
      const other = `${key}-otra`
      const { unmount } = render(
        <>
          <Probe />
          <Probe revealKey={other} testId="other" />
        </>,
      )
      act(() => {
        trigger(true)
      })

      expect(screen.getByTestId('probe')).toHaveTextContent('visible')
      expect(screen.getByTestId('other')).toHaveTextContent('oculto')

      unmount()
      render(<Probe revealKey={other} testId="other" />)

      expect(screen.getByTestId('other')).toHaveTextContent('oculto')
    })

    // Una recarga de la página carga el módulo de nuevo: vi.resetModules lo
    // simula, y el import dinámico trae esa copia nueva.
    it('una carga nueva olvida lo revelado', async () => {
      const { unmount } = render(<Probe />)
      act(() => {
        trigger(true)
      })
      unmount()

      vi.resetModules()
      const reloaded = await import('@/hooks/useRevealOnScroll')
      render(<Probe useReveal={reloaded.useRevealOnScroll} />)

      expect(reloaded.useRevealOnScroll).not.toBe(useRevealOnScroll)
      expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
    })
  })

  // Lo que está bajo la animación de carga no se ve: el revelado espera a
  // que termine, como la rotación de roles del Hero.
  describe('con la animación de carga encima', () => {
    const withIntro = (playing: boolean) => (
      <IntroPlayingContext value={playing}>
        <Probe />
      </IntroPlayingContext>
    )

    it('no observa ni revela mientras la intro está encima', () => {
      render(withIntro(true))

      expect(io.instances).toHaveLength(0)
      expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
    })

    it('aunque esté en pantalla durante la intro, sigue oculto', () => {
      render(withIntro(true))

      act(() => {
        trigger(true)
      })

      expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
    })

    it('al terminar la intro empieza a observar, y revela al entrar en pantalla', () => {
      const { rerender } = render(withIntro(true))

      rerender(withIntro(false))

      expect(lastObserver().observed).toEqual([screen.getByTestId('probe')])
      expect(screen.getByTestId('probe')).toHaveTextContent('oculto')

      act(() => {
        trigger(true)
      })

      expect(screen.getByTestId('probe')).toHaveTextContent('visible')
    })

    it('mientras espera no marca el registro: si se desmonta, vuelve oculto', () => {
      const { unmount } = render(withIntro(true))
      act(() => {
        trigger(true)
      })
      unmount()

      render(withIntro(false))

      expect(screen.getByTestId('probe')).toHaveTextContent('oculto')
      expect(lastObserver().observed).toEqual([screen.getByTestId('probe')])
    })

    it('con movimiento reducido se ve aunque la intro siga encima', () => {
      mockMatchMedia(true)
      render(withIntro(true))

      expect(screen.getByTestId('probe')).toHaveTextContent('visible')
      expect(io.instances).toHaveLength(0)
    })

    it('sin IntersectionObserver se ve aunque la intro siga encima', () => {
      vi.stubGlobal('IntersectionObserver', undefined)
      render(withIntro(true))

      expect(screen.getByTestId('probe')).toHaveTextContent('visible')
    })
  })
})
