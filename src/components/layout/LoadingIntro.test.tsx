import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { LoadingIntro } from '@/components/layout/LoadingIntro'
import styles from '@/components/layout/LoadingIntro.module.css'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import type { Dictionary } from '@/i18n/types'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

const { es, en } = dictionaries
const { exitFallbackMs } = INTRO_TIMING

// Si la clase no existiera, las comprobaciones de la salida pasarían en vacío.
const LEAVING = styles.leaving ?? ''
if (!LEAVING) throw new Error('LoadingIntro.module.css no define la clase .leaving')

const phraseOf = (t: Dictionary) => {
  const phrase = t.intro.phrases[0]
  if (!phrase) throw new Error('El diccionario no tiene ninguna frase para la intro')
  return phrase
}

const framesOf = (t: Dictionary) => {
  const { natural, code } = phraseOf(t)
  return buildIntroFrames(natural, code)
}

const setBrowserLangs = (langs: string[]) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)

let onDone: Mock<() => void>

const renderIntro = () => {
  const view = render(
    <LangProvider>
      <LoadingIntro onDone={onDone} />
    </LangProvider>,
  )
  return { ...view, layer: view.container.firstElementChild }
}

const skipButton = (t: Dictionary = es) => screen.getByRole('button', { name: t.intro.skip })

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/**
 * Deja pasar la pausa de los primeros `count` fotogramas, una por una: React
 * aplica cada cambio al salir de act, y solo entonces programa la siguiente.
 */
const playFrames = (count: number, t: Dictionary = es) => {
  framesOf(t)
    .slice(0, count)
    .forEach((frame) => advance(frame.holdMs))
}

/** Recorre la secuencia entera: al volver, la intro está en la salida. */
const playToEnd = (t: Dictionary = es) => playFrames(framesOf(t).length, t)

beforeEach(() => {
  vi.useFakeTimers()
  setBrowserLangs(['es-CO'])
  onDone = vi.fn()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('LoadingIntro', () => {
  describe('botón de saltar', () => {
    it('lleva el texto del diccionario', () => {
      renderIntro()

      expect(skipButton(es)).toBeInTheDocument()
    })

    it('en inglés lleva el texto en inglés', () => {
      setBrowserLangs(['en-US'])
      renderIntro()

      expect(skipButton(en)).toBeInTheDocument()
    })

    it('es el único control y no envía formularios', () => {
      renderIntro()

      expect(screen.getAllByRole('button')).toHaveLength(1)
      expect(skipButton()).toHaveAttribute('type', 'button')
    })
  })

  // El foco empieza en la capa y no en el botón: así el anillo del botón solo
  // aparece cuando se llega a él con el teclado.
  describe('foco', () => {
    it('al montar está en la capa, no en el botón', () => {
      const { layer } = renderIntro()

      expect(layer).toHaveFocus()
      expect(skipButton()).not.toHaveFocus()
    })

    it('la capa puede recibirlo sin entrar en el orden de tabulación', () => {
      const { layer } = renderIntro()

      expect(layer).toHaveAttribute('tabindex', '-1')
    })

    it('con un Tab pasa al botón', async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      renderIntro()

      await user.tab()

      expect(skipButton()).toHaveFocus()
    })
  })

  describe('texto animado', () => {
    it('empieza vacío', () => {
      const { layer } = renderIntro()

      expect(layer).toHaveTextContent(new RegExp(`^${es.intro.skip}$`))
    })

    it('escribe la frase del diccionario y termina con su código', () => {
      const { natural, code } = phraseOf(es)
      const frames = framesOf(es)
      const naturalAt = frames.findIndex((frame) => frame.text === natural)
      const { layer } = renderIntro()

      playFrames(naturalAt)
      expect(layer).toHaveTextContent(natural)

      // El resto, menos la pausa del último: aún no ha entrado en la salida.
      frames.slice(naturalAt, -1).forEach((frame) => advance(frame.holdMs))
      expect(layer).toHaveTextContent(code)
      expect(layer).not.toHaveTextContent(natural)
    })

    it('en inglés usa la frase en inglés', () => {
      setBrowserLangs(['en-US'])
      const { natural } = phraseOf(en)
      const frames = framesOf(en).map((frame) => frame.text)
      const { layer } = renderIntro()

      playFrames(frames.indexOf(natural), en)

      expect(layer).toHaveTextContent(natural)
    })

    it('queda fuera del árbol de accesibilidad', () => {
      const { code } = phraseOf(es)
      renderIntro()

      playToEnd()

      expect(screen.getByText(code).closest('[aria-hidden="true"]')).not.toBeNull()
    })
  })

  describe('salida', () => {
    it('mientras se reproduce no está en la salida', () => {
      const { layer } = renderIntro()

      playFrames(framesOf(es).length - 1)

      expect(layer).not.toHaveClass(LEAVING)
    })

    it('al acabar la secuencia entra en la salida', () => {
      const { layer } = renderIntro()

      playToEnd()

      expect(layer).toHaveClass(LEAVING)
    })

    it('entrar en la salida todavía no avisa: falta el desvanecimiento', () => {
      renderIntro()

      playToEnd()

      expect(onDone).not.toHaveBeenCalled()
    })

    it('avisa cuando termina la transición de la capa', () => {
      const { layer } = renderIntro()
      playToEnd()

      if (layer) fireEvent.transitionEnd(layer)

      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('una transición que termina antes de la salida no avisa', () => {
      const { layer } = renderIntro()

      if (layer) fireEvent.transitionEnd(layer)

      expect(onDone).not.toHaveBeenCalled()
    })

    it('la transición de un elemento interior no avisa', () => {
      renderIntro()
      playToEnd()

      fireEvent.transitionEnd(skipButton())

      expect(onDone).not.toHaveBeenCalled()
    })
  })

  describe('saltar', () => {
    // user-event espera con temporizadores propios, que los falsos dejarían
    // parados: estos tres casos usan el reloj real y no esperan a nada.
    describe('con ratón y con teclado', () => {
      beforeEach(() => {
        vi.useRealTimers()
      })

      it('con un clic entra en la salida sin esperar a la secuencia', async () => {
        const user = userEvent.setup()
        const { layer } = renderIntro()

        await user.click(skipButton())

        expect(layer).toHaveClass(LEAVING)
      })

      it.each([
        ['Enter', '{Enter}'],
        ['Espacio', ' '],
      ])('con %s, sin tocar el ratón, entra en la salida', async (_key, keys) => {
        const user = userEvent.setup()
        const { layer } = renderIntro()

        await user.keyboard(keys)

        expect(layer).toHaveClass(LEAVING)
      })
    })

    it('tras saltar avisa al terminar la transición, igual que al acabar', () => {
      const { layer } = renderIntro()
      fireEvent.click(skipButton())
      expect(layer).toHaveClass(LEAVING)
      expect(onDone).not.toHaveBeenCalled()

      if (layer) fireEvent.transitionEnd(layer)

      expect(onDone).toHaveBeenCalledTimes(1)
    })
  })

  // Si la transición no llega a terminar (pestaña en segundo plano, transición
  // anulada), la página no puede quedarse tapada.
  describe('respaldo si la transición no termina', () => {
    it('avisa al vencer el respaldo, y no antes', () => {
      renderIntro()
      playToEnd()

      advance(exitFallbackMs - 1)
      expect(onDone).not.toHaveBeenCalled()

      advance(1)
      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('también cubre la salida por el botón', () => {
      renderIntro()
      fireEvent.click(skipButton())

      advance(exitFallbackMs)

      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('no corre mientras la secuencia se reproduce', () => {
      renderIntro()

      playFrames(framesOf(es).length - 1)
      expect(vi.getTimerCount()).toBe(1)
      advance(INTRO_TIMING.codeHoldMs - 1)

      expect(onDone).not.toHaveBeenCalled()
    })

    it('si la transición sí terminó, el respaldo no avisa otra vez', () => {
      const { layer } = renderIntro()
      playToEnd()

      if (layer) fireEvent.transitionEnd(layer)
      if (layer) fireEvent.transitionEnd(layer)
      advance(exitFallbackMs)

      expect(onDone).toHaveBeenCalledTimes(1)
    })
  })

  describe('limpieza', () => {
    it('desmontar durante la secuencia no deja temporizadores', () => {
      const { unmount } = renderIntro()
      playFrames(1)
      expect(vi.getTimerCount()).toBe(1)

      unmount()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('desmontar durante la salida no deja el respaldo pendiente ni avisa después', () => {
      const { unmount } = renderIntro()
      playToEnd()
      expect(vi.getTimerCount()).toBe(1)

      unmount()
      advance(exitFallbackMs)

      expect(vi.getTimerCount()).toBe(0)
      expect(onDone).not.toHaveBeenCalled()
    })
  })
})
