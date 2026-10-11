import { render, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { useIntroPlaying } from '@/hooks/useIntroPlaying'

const within =
  (playing: boolean) =>
  ({ children }: { children: ReactNode }) => (
    <IntroPlayingContext value={playing}>{children}</IntroPlayingContext>
  )

describe('useIntroPlaying', () => {
  // Una sección montada sola, sin el armazón, no tiene intro encima.
  it('sin proveedor, la intro no está activa', () => {
    const { result } = renderHook(() => useIntroPlaying())

    expect(result.current).toBe(false)
  })

  it.each([true, false])('devuelve lo que dice el proveedor: %s', (playing) => {
    const { result } = renderHook(() => useIntroPlaying(), { wrapper: within(playing) })

    expect(result.current).toBe(playing)
  })

  it('quien lo usa se entera cuando la intro termina', () => {
    function Probe() {
      return <p>{useIntroPlaying() ? 'intro' : 'página'}</p>
    }
    const { rerender } = render(<Probe />, { wrapper: within(true) })
    expect(screen.getByText('intro')).toBeInTheDocument()

    rerender(
      <IntroPlayingContext value={false}>
        <Probe />
      </IntroPlayingContext>,
    )

    expect(screen.getByText('página')).toBeInTheDocument()
  })
})
