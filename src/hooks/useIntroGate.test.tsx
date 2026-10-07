import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storageKeys } from '@/config/storage'
import { useIntroGate } from '@/hooks/useIntroGate'
import { useIntroSequence } from '@/hooks/useIntroSequence'
import type { IntroFrame } from '@/lib/introFrames'
import { mockMatchMedia } from '@/test/mockMatchMedia'

const KEY = storageKeys.session.introSeen

const blockStorage = () => {
  const fail = () => {
    throw new DOMException('bloqueado', 'SecurityError')
  }
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail)
}

const mount = () => renderHook(() => useIntroGate())

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useIntroGate', () => {
  describe('una vez por sesión', () => {
    it('en la primera visita la intro está activa', () => {
      const [playing] = mount().result.current

      expect(playing).toBe(true)
    })

    it('al terminar deja de estar activa', () => {
      const { result } = mount()

      act(() => result.current[1]())

      expect(result.current[0]).toBe(false)
    })

    it('no se marca como vista hasta que termina', () => {
      const { result } = mount()
      expect(sessionStorage.getItem(KEY)).toBeNull()

      act(() => result.current[1]())

      expect(sessionStorage.getItem(KEY)).not.toBeNull()
    })

    it('se recuerda en la sesión, no entre sesiones', () => {
      const { result } = mount()

      act(() => result.current[1]())

      expect(localStorage.getItem(KEY)).toBeNull()
      expect(localStorage).toHaveLength(0)
      expect(sessionStorage).toHaveLength(1)
    })

    it('en la segunda visita de la sesión ya no está activa', () => {
      const first = mount()
      act(() => first.result.current[1]())
      first.unmount()

      const [playing] = mount().result.current

      expect(playing).toBe(false)
    })

    it('en una sesión nueva vuelve a estar activa', () => {
      const first = mount()
      act(() => first.result.current[1]())
      first.unmount()
      expect(mount().result.current[0]).toBe(false)

      sessionStorage.clear()

      expect(mount().result.current[0]).toBe(true)
    })

    it('la función de terminar es la misma entre renders', () => {
      const { result, rerender } = mount()
      const finish = result.current[1]

      rerender()

      expect(result.current[1]).toBe(finish)
    })
  })

  describe('movimiento reducido', () => {
    it('sin esa preferencia la intro está activa', () => {
      mockMatchMedia(false)

      expect(mount().result.current[0]).toBe(true)
    })

    it('con ella no está activa desde el inicio', () => {
      mockMatchMedia(true)

      expect(mount().result.current[0]).toBe(false)
    })

    it('no la marca como vista: el visitante no la vio', () => {
      mockMatchMedia(true)

      mount()

      expect(sessionStorage.getItem(KEY)).toBeNull()
    })

    it('quitar la preferencia después del montaje no la activa', () => {
      const media = mockMatchMedia(true)
      const { result } = mount()

      act(() => media.setMatches(false))

      expect(result.current[0]).toBe(false)
    })

    it('pedirla con la intro ya en marcha no la corta', () => {
      const media = mockMatchMedia(false)
      const { result } = mount()

      act(() => media.setMatches(true))

      expect(result.current[0]).toBe(true)
    })
  })

  describe('almacenamiento bloqueado', () => {
    it('la intro está activa y, al terminar, deja de estarlo mientras dure la página', () => {
      blockStorage()
      const { result } = mount()
      expect(result.current[0]).toBe(true)

      act(() => result.current[1]())

      expect(result.current[0]).toBe(false)
    })
  })

  // Montaje mínimo con la secuencia real y un botón, como lo hará la intro:
  // comprueba que los dos caminos de salida acaban marcándola como vista.
  describe('con la secuencia', () => {
    const HOLD = 100
    const FRAMES: readonly IntroFrame[] = [
      { text: '', holdMs: HOLD },
      { text: 'a', holdMs: HOLD },
    ]
    const TOTAL = HOLD * FRAMES.length
    const SKIP = 'saltar'
    const CONTENT = 'contenido'

    function Sequence({ onDone }: { onDone: () => void }) {
      const { phase, skip } = useIntroSequence(FRAMES)
      useEffect(() => {
        if (phase === 'leaving') onDone()
      }, [phase, onDone])

      return (
        <button type="button" onClick={skip}>
          {SKIP}
        </button>
      )
    }

    function Harness() {
      const [playing, finish] = useIntroGate()
      return playing ? <Sequence onDone={finish} /> : <p>{CONTENT}</p>
    }

    const advance = (ms: number) => {
      for (let elapsed = 0; elapsed < ms; elapsed += 1) {
        act(() => {
          vi.advanceTimersByTime(1)
        })
      }
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('a mitad de la secuencia todavía no está marcada como vista', () => {
      render(<Harness />)

      advance(TOTAL - 1)

      expect(screen.getByRole('button', { name: SKIP })).toBeInTheDocument()
      expect(sessionStorage.getItem(KEY)).toBeNull()
    })

    it('al terminar la secuencia queda marcada como vista', () => {
      render(<Harness />)

      advance(TOTAL)

      expect(sessionStorage.getItem(KEY)).not.toBeNull()
      expect(screen.getByText(CONTENT)).toBeInTheDocument()
    })

    it('al saltar con el botón queda marcada como vista', () => {
      render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: SKIP }))

      expect(sessionStorage.getItem(KEY)).not.toBeNull()
      expect(screen.getByText(CONTENT)).toBeInTheDocument()
    })

    it('tras saltar, la siguiente visita de la sesión no la muestra', () => {
      const first = render(<Harness />)
      fireEvent.click(screen.getByRole('button', { name: SKIP }))
      first.unmount()

      render(<Harness />)

      expect(screen.queryByRole('button', { name: SKIP })).not.toBeInTheDocument()
    })
  })
})
