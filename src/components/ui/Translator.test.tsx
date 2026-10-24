import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TRANSLATOR_INTERVAL_MS, Translator, type TranslatorItem } from '@/components/ui/Translator'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { MotionPauseContext } from '@/hooks/MotionPauseContext'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// El Traductor (spec §3.2): pestañas con aria-pressed que pasan solas cada
// 4,2 s; quietas con movimiento reducido, con la pausa global, mientras la
// intro tapa la página o en cuanto el visitante elige una. Usa el reloj
// falso, así que se opera con fireEvent (user-event se cuelga con él).
// Con tres pestañas, tres avances vuelven a la primera: para ver que algo
// está quieto se avanza dos veces, que sin pausa dejarían marcada la tercera.

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const ITEMS: readonly TranslatorItem[] = [
  {
    id: 'a',
    tab: 'Inventario',
    say: 'Avísame del stock bajo',
    where: 'repo-a · A.java',
    href: 'https://example.com/a',
    code: [[{ text: 'a()' }]],
  },
  {
    id: 'b',
    tab: 'Permisos',
    say: 'Que solo entre el admin',
    where: 'repo-b · B.java',
    href: 'https://example.com/b',
    code: [[{ text: 'b()', kind: 'keyword' }]],
  },
  {
    id: 'c',
    tab: 'Noticias',
    say: 'Resúmeme las noticias',
    where: 'repo-c · c.json',
    href: 'https://example.com/c',
    code: [[{ text: '// c', kind: 'comment' }]],
  },
]

interface Options {
  paused?: boolean
  introPlaying?: boolean
}

/** El Traductor con el estado de la pausa y de la intro que se le pida. */
const translator = ({ paused = false, introPlaying = false }: Options = {}): ReactNode => (
  <IntroPlayingContext value={introPlaying}>
    <MotionPauseContext value={{ paused, togglePaused: () => {} }}>
      <Translator
        label="Traductor"
        examplesLabel="Ejemplos"
        saysLabel="Lo que dice el negocio"
        writesLabel="Lo que escribo"
        viewRepo="Ver el repo"
        opensInNewTab="se abre en una pestaña nueva"
        items={ITEMS}
      />
    </MotionPauseContext>
  </IntroPlayingContext>
)

const renderTranslator = (options: Options = {}) => render(translator(options))

const tabs = () => within(screen.getByRole('group', { name: 'Ejemplos' })).getAllByRole('button')
/** Índice de la pestaña marcada. */
const pressed = () => tabs().findIndex((tab) => tab.getAttribute('aria-pressed') === 'true')
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

beforeEach(() => {
  vi.useFakeTimers()
  mockMatchMedia({ [REDUCED_MOTION]: false })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Translator', () => {
  describe('pestañas', () => {
    it('son botones de un grupo con nombre, uno por ejemplo', () => {
      renderTranslator()

      expect(tabs().map((tab) => tab.textContent)).toEqual(ITEMS.map(({ tab }) => tab))
    })

    it('al cargar está marcada la primera, y solo ella', () => {
      renderTranslator()

      expect(tabs().map((tab) => tab.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
    })

    it('cada pestaña enseña su ejemplo: la frase, el código y el enlace a su repo', () => {
      renderTranslator()
      const [, second] = tabs()
      if (!second) throw new Error('Falta la segunda pestaña')

      fireEvent.click(second)

      expect(screen.getByText('Que solo entre el admin')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Lo que escribo' })).toHaveTextContent('b()')
      expect(screen.getByRole('link', { name: /Ver el repo/ })).toHaveAttribute('href', 'https://example.com/b')
      expect(screen.queryByText('Avísame del stock bajo')).not.toBeInTheDocument()
    })
  })

  describe('rotación', () => {
    it(`pasa sola a la siguiente cada ${TRANSLATOR_INTERVAL_MS} ms, y tras la última vuelve a la primera`, () => {
      renderTranslator()

      advance(TRANSLATOR_INTERVAL_MS - 1)
      expect(pressed()).toBe(0)
      advance(1)
      expect(pressed()).toBe(1)
      advance(TRANSLATOR_INTERVAL_MS)
      expect(pressed()).toBe(2)
      advance(TRANSLATOR_INTERVAL_MS)
      expect(pressed()).toBe(0)
    })

    it('al elegir una pestaña se queda en ella', () => {
      renderTranslator()
      const [, , third] = tabs()
      if (!third) throw new Error('Falta la tercera pestaña')

      fireEvent.click(third)
      advance(TRANSLATOR_INTERVAL_MS * 3)

      expect(pressed()).toBe(2)
    })

    it('quieto con movimiento reducido: solo cambian las pestañas', () => {
      mockMatchMedia({ [REDUCED_MOTION]: true })
      renderTranslator()

      advance(TRANSLATOR_INTERVAL_MS * 2)
      expect(pressed()).toBe(0)

      const [, second] = tabs()
      if (!second) throw new Error('Falta la segunda pestaña')
      fireEvent.click(second)
      expect(pressed()).toBe(1)
    })

    it('quieto con la pausa global', () => {
      renderTranslator({ paused: true })

      advance(TRANSLATOR_INTERVAL_MS * 2)

      expect(pressed()).toBe(0)
    })

    it('quieto mientras la intro tapa la página', () => {
      renderTranslator({ introPlaying: true })

      advance(TRANSLATOR_INTERVAL_MS * 2)

      expect(pressed()).toBe(0)
    })

    it('al quitar la pausa, sigue rotando', () => {
      const { rerender } = renderTranslator({ paused: true })
      advance(TRANSLATOR_INTERVAL_MS * 2)

      rerender(translator({ paused: false }))
      advance(TRANSLATOR_INTERVAL_MS)

      expect(pressed()).toBe(1)
    })
  })
})
