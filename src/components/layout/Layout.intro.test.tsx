import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Layout } from '@/components/layout/Layout'
import { storageKeys } from '@/config/storage'
import { useIntroPlaying } from '@/hooks/useIntroPlaying'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// El canvas tiene sus propios tests; aquí solo importa el estado de la intro.
vi.mock('@/hooks/useParticleCanvas', () => ({ useParticleCanvas: vi.fn() }))

const { es } = dictionaries
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const INTRO_SEEN = storageKeys.session.introSeen

/** Pausas de la intro, una por fotograma, si nadie la salta. */
const holds = () => {
  const phrase = es.intro.phrases[0]
  if (!phrase) throw new Error('El diccionario no tiene ninguna frase para la intro')
  return buildIntroFrames(phrase.natural, phrase.code).map((frame) => frame.holdMs)
}

/** Cada valor que la página recibió, en orden, desde su primer render. */
let seen: boolean[]

function Probe() {
  const playing = useIntroPlaying()
  seen.push(playing)
  return <p>{playing ? 'tapada' : 'a la vista'}</p>
}

const renderLayout = () =>
  render(
    <MemoryRouter>
      <LangProvider>
        <Layout>
          <Probe />
        </Layout>
      </LangProvider>
    </MemoryRouter>,
  )

const skipIntro = () => screen.getByRole('button', { name: es.intro.skip })
const querySkipIntro = () => screen.queryByRole('button', { name: es.intro.skip })

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/**
 * Deja pasar las pausas de la intro, menos `short` milisegundos de la última.
 * Va de una en una: cada temporizador se crea al pintar el fotograma anterior.
 */
const playSequence = (short = 0) => {
  const all = holds()
  const last = all.pop() ?? 0
  for (const hold of all) advance(hold)
  advance(last - short)
}

/** jsdom no anima: el desvanecido se da por terminado con su respaldo. */
const fadeOut = () => advance(INTRO_TIMING.exitFallbackMs)

beforeEach(() => {
  seen = []
  sessionStorage.clear()
  vi.useFakeTimers()
  vi.stubGlobal('scrollTo', vi.fn())
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Layout: estado de la intro para la página', () => {
  describe('en la primera visita', () => {
    it('la página sabe que está tapada desde su primer render', () => {
      renderLayout()

      expect(skipIntro()).toBeInTheDocument()
      expect(seen.at(0)).toBe(true)
      expect(screen.getByText('tapada')).toBeInTheDocument()
    })

    it('sigue tapada mientras la intro se escribe', () => {
      renderLayout()

      playSequence(1)

      expect(new Set(seen)).toEqual(new Set([true]))
    })

    it('al terminar sola, la página pasa a estar a la vista', () => {
      renderLayout()

      playSequence()
      expect(screen.getByText('tapada')).toBeInTheDocument()
      fadeOut()

      expect(querySkipIntro()).not.toBeInTheDocument()
      expect(screen.getByText('a la vista')).toBeInTheDocument()
      expect(seen.at(-1)).toBe(false)
    })

    it('al saltarla, sigue tapada hasta que la capa termina de desvanecerse', () => {
      renderLayout()
      const layer = skipIntro().parentElement
      if (!layer) throw new Error('El botón de saltar no tiene capa')

      fireEvent.click(skipIntro())
      expect(screen.getByText('tapada')).toBeInTheDocument()

      fireEvent.transitionEnd(layer)

      expect(querySkipIntro()).not.toBeInTheDocument()
      expect(screen.getByText('a la vista')).toBeInTheDocument()
      expect(seen.at(-1)).toBe(false)
    })

    it('una vez a la vista, no vuelve a estar tapada', () => {
      renderLayout()
      playSequence()
      fadeOut()
      expect(seen.at(-1)).toBe(false)
      const after = seen.length

      advance(60_000)

      expect(seen.slice(after - 1)).not.toContain(true)
    })
  })

  // Sin intro, la página no puede verse tapada ni un instante: quien espere
  // a que termine no esperaría nunca a nada.
  describe('en una visita sin intro', () => {
    it('con movimiento reducido, nunca está tapada, tampoco al montar', () => {
      mockMatchMedia({ [REDUCED_MOTION]: true })

      renderLayout()
      advance(60_000)

      expect(querySkipIntro()).not.toBeInTheDocument()
      expect(seen.length).toBeGreaterThan(0)
      expect(seen).not.toContain(true)
    })

    it('con la intro ya vista en la sesión, nunca está tapada, tampoco al montar', () => {
      sessionStorage.setItem(INTRO_SEEN, '1')

      renderLayout()
      advance(60_000)

      expect(querySkipIntro()).not.toBeInTheDocument()
      expect(seen.length).toBeGreaterThan(0)
      expect(seen).not.toContain(true)
    })

    it('tras verla una vez, un montaje nuevo en la misma sesión ya no la tapa', () => {
      const first = renderLayout()
      playSequence()
      fadeOut()
      expect(seen.at(-1)).toBe(false)
      first.unmount()
      seen = []

      renderLayout()

      expect(seen.length).toBeGreaterThan(0)
      expect(seen).not.toContain(true)
    })
  })
})
