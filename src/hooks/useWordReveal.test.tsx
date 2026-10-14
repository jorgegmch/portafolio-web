import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import { useWordReveal } from '@/hooks/useWordReveal'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// Textos de prueba: el hook no sabe de idiomas, solo de que el texto cambie.
const SPANISH = ['uno dos tres', 'cuatro cinco']
const ENGLISH = ['one two three', 'four five']

let io: ReturnType<typeof mockIntersectionObserver>
let media: ReturnType<typeof mockMatchMedia>

// El registro de lo revelado dura toda la carga del módulo, también entre
// los tests de este archivo: cada test usa su propia clave.
let testCount = 0
let key = ''

/** Cada función finish distinta que ha devuelto el hook. */
let finishes = new Set<() => void>()

interface ProbeProps {
  paragraphs?: readonly string[]
  revealKey?: string
}

function Probe({ paragraphs = SPANISH, revealKey = key }: ProbeProps) {
  const { ref, phase, finish } = useWordReveal<HTMLDivElement>(revealKey, paragraphs)
  useEffect(() => {
    finishes.add(finish)
  })
  return (
    <div ref={ref} data-testid="probe">
      <output>{phase}</output>
      <button type="button" onClick={finish}>
        terminar
      </button>
    </div>
  )
}

/** Solo revela: otro componente que comparte el registro. */
function RevealProbe({ revealKey }: { revealKey: string }) {
  const { ref } = useRevealOnScroll<HTMLDivElement>(revealKey)
  return <div ref={ref} data-testid="reveal-only" />
}

const phase = () => screen.getByRole('status').textContent

const enter = () => {
  act(() => {
    expect(io.trigger(screen.getByTestId('probe'), true)).toBe(1)
  })
}

const finish = () => fireEvent.click(screen.getByRole('button', { name: 'terminar' }))

beforeEach(() => {
  testCount += 1
  key = `word-test-${testCount}`
  finishes = new Set()
  io = mockIntersectionObserver()
  media = mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useWordReveal', () => {
  describe('al montar', () => {
    it('sin IntersectionObserver termina directamente', () => {
      vi.stubGlobal('IntersectionObserver', undefined)
      render(<Probe />)

      expect(phase()).toBe('done')
    })

    it('con movimiento reducido termina directamente y no observa', () => {
      mockMatchMedia(true)
      render(<Probe />)

      expect(phase()).toBe('done')
      expect(io.instances).toHaveLength(0)
    })

    it('con una clave que otro ya reveló termina directamente', () => {
      const { unmount } = render(<RevealProbe revealKey={key} />)
      act(() => {
        io.trigger(screen.getByTestId('reveal-only'), true)
      })
      unmount()

      render(<Probe />)

      expect(phase()).toBe('done')
    })

    it('fuera de pantalla espera y observa su elemento', () => {
      render(<Probe />)

      expect(phase()).toBe('waiting')
      expect(io.last().observed).toEqual([screen.getByTestId('probe')])
    })
  })

  it('al entrar en pantalla empieza a escribir', () => {
    render(<Probe />)

    enter()

    expect(phase()).toBe('typing')
  })

  describe('finish', () => {
    it('mientras escribe, termina', () => {
      render(<Probe />)
      enter()

      finish()

      expect(phase()).toBe('done')
    })

    it('mientras espera no hace nada: al entrar en pantalla escribe igual', () => {
      render(<Probe />)

      finish()

      expect(phase()).toBe('waiting')
      enter()
      expect(phase()).toBe('typing')
    })

    it('una segunda llamada no cambia nada', () => {
      render(<Probe />)
      enter()
      finish()

      finish()

      expect(phase()).toBe('done')
    })

    it('es la misma función en cada render', () => {
      const { rerender } = render(<Probe />)
      enter()
      rerender(<Probe paragraphs={[...SPANISH]} />)
      finish()

      expect(phase()).toBe('done')
      expect(finishes.size).toBe(1)
    })
  })

  // Cambio de idioma a mitad: termina al instante en el idioma nuevo.
  it('si cambia el texto mientras escribe, termina', () => {
    const { rerender } = render(<Probe />)
    enter()

    rerender(<Probe paragraphs={ENGLISH} />)

    expect(phase()).toBe('done')
  })

  it('si se activa el movimiento reducido mientras escribe, termina, y no vuelve a escribir al desactivarlo', () => {
    render(<Probe />)
    enter()

    act(() => media.setMatches(true))
    expect(phase()).toBe('done')

    act(() => media.setMatches(false))
    expect(phase()).toBe('done')
  })

  describe('con la animación de carga encima', () => {
    const withIntro = (playing: boolean) => (
      <IntroPlayingContext value={playing}>
        <Probe />
      </IntroPlayingContext>
    )

    it('espera aunque esté en pantalla, y escribe al entrar cuando termina', () => {
      const { rerender } = render(withIntro(true))
      act(() => {
        io.trigger(screen.getByTestId('probe'), true)
      })

      expect(phase()).toBe('waiting')

      rerender(withIntro(false))
      expect(phase()).toBe('waiting')

      enter()
      expect(phase()).toBe('typing')
    })
  })

  it('al volver a montar después de empezar a escribir, termina directamente', () => {
    const { unmount } = render(<Probe />)
    enter()
    unmount()

    render(<Probe />)

    expect(phase()).toBe('done')
  })

  it('terminado es definitivo: ni un texto nuevo ni otro render lo cambian', () => {
    const { rerender } = render(<Probe />)
    enter()
    finish()

    rerender(<Probe paragraphs={ENGLISH} />)
    rerender(<Probe paragraphs={ENGLISH} />)

    expect(phase()).toBe('done')
  })

  describe('controles', () => {
    // Un render nuevo de la sección (por ejemplo, por la edad) trae un arreglo
    // nuevo con el mismo texto: no es un cambio de texto.
    it('un arreglo nuevo con el mismo texto sigue escribiendo', () => {
      const { rerender } = render(<Probe />)
      enter()

      rerender(<Probe paragraphs={[...SPANISH]} />)

      expect(phase()).toBe('typing')
    })

    it('un texto distinto mientras espera sigue esperando, y al entrar escribe', () => {
      const { rerender } = render(<Probe />)

      rerender(<Probe paragraphs={ENGLISH} />)
      expect(phase()).toBe('waiting')

      enter()
      expect(phase()).toBe('typing')
    })
  })
})
