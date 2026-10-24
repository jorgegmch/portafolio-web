import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { LoadingIntro } from '@/components/layout/LoadingIntro'
import styles from '@/components/layout/LoadingIntro.module.css'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import type { Dictionary } from '@/i18n/types'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'

const { es, en } = dictionaries
const { exitFallbackMs } = INTRO_TIMING

// Si una clase no existiera, las comprobaciones que dependen de ella pasarían en vacío.
const LEAVING = styles.leaving ?? ''
if (!LEAVING) throw new Error('LoadingIntro.module.css no define la clase .leaving')
const STRUCK = styles.struck ?? ''
if (!STRUCK) throw new Error('LoadingIntro.module.css no define la clase .struck')
const BAR_TOP = styles.barTop ?? ''
if (!BAR_TOP) throw new Error('LoadingIntro.module.css no define la clase .barTop')
const BAR_BOTTOM = styles.barBottom ?? ''
if (!BAR_BOTTOM) throw new Error('LoadingIntro.module.css no define la clase .barBottom')

const phraseOf = (t: Dictionary) => {
  const phrase = t.intro.phrases[0]
  if (!phrase) throw new Error('El diccionario no tiene ninguna frase para la intro')
  return phrase
}

const framesOf = (t: Dictionary) => buildIntroFrames(phraseOf(t).code)

const setBrowserLangs = (langs: string[]) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)

let onDone: Mock<() => void>

const renderIntro = (t: Dictionary = es) => {
  render(
    <LangProvider>
      <LoadingIntro onDone={onDone} />
    </LangProvider>,
  )
  const layer = screen.getByRole('dialog', { name: t.intro.label })
  const barTop = layer.querySelector(`.${BAR_TOP}`)
  const barBottom = layer.querySelector(`.${BAR_BOTTOM}`)
  if (!barTop || !barBottom) throw new Error('Faltan las barras de la capa')
  return { layer, barTop, barBottom }
}

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
  // Sin botón «Saltar»: la capa es un diálogo modal con nombre, y su
  // descripción dice cómo saltarla. El resto de la página está inerte.
  describe('capa', () => {
    it.each([
      ['es', ['es-CO'], es],
      ['en', ['en-US'], en],
    ] as const)('en %s es un diálogo modal con su nombre y cómo saltarla', (_lang, langs, t) => {
      setBrowserLangs([...langs])
      const { layer } = renderIntro(t)

      expect(layer).toHaveAttribute('aria-modal', 'true')
      expect(layer).toHaveAccessibleDescription(t.intro.hint)
    })

    it('no tiene ningún botón', () => {
      renderIntro()

      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })
  })

  describe('foco', () => {
    it('al montar está en la capa', () => {
      const { layer } = renderIntro()

      expect(layer).toHaveFocus()
    })

    it('la capa puede recibirlo sin entrar en el orden de tabulación', () => {
      const { layer } = renderIntro()

      expect(layer).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('texto animado', () => {
    it('empieza con la frase del diccionario, sin tachar y sin código', () => {
      const { natural, code } = phraseOf(es)
      renderIntro()

      expect(screen.getByText(natural).closest('p')).not.toHaveClass(STRUCK)
      expect(screen.queryByText(code)).not.toBeInTheDocument()
    })

    it('tacha la frase y debajo escribe su código, hasta completarlo', () => {
      const { natural, code } = phraseOf(es)
      const frames = framesOf(es)
      renderIntro()

      playFrames(1)
      expect(screen.getByText(natural).closest('p')).toHaveClass(STRUCK)

      // El resto, menos la pausa del último: aún no ha entrado en la salida.
      frames.slice(1, -1).forEach((frame) => advance(frame.holdMs))
      expect(screen.getByText(code)).toBeInTheDocument()
      // La frase tachada sigue a la vista sobre el código.
      expect(screen.getByText(natural).closest('p')).toHaveClass(STRUCK)
    })

    // Tachar a lápiz: dos trazos, uno de ida y otro de vuelta.
    it('el tachado son dos trazos decorativos, dentro de la frase', () => {
      renderIntro()

      const strokes = screen.getByText(phraseOf(es).natural).closest('p')?.querySelectorAll('[data-stroke]')

      expect(strokes).toHaveLength(2)
    })

    it('en inglés usa la frase en inglés', () => {
      setBrowserLangs(['en-US'])
      const { natural, code } = phraseOf(en)
      renderIntro(en)

      expect(screen.getByText(natural)).toBeInTheDocument()

      playToEnd(en)
      expect(screen.getByText(code)).toBeInTheDocument()
    })

    it('queda fuera del árbol de accesibilidad', () => {
      const { natural, code } = phraseOf(es)
      renderIntro()

      playToEnd()

      expect(screen.getByText(natural).closest('[aria-hidden="true"]')).not.toBeNull()
      expect(screen.getByText(code).closest('[aria-hidden="true"]')).not.toBeNull()
    })
  })

  describe('barras de cine', () => {
    it('son dos, decorativas, y quedan fuera del árbol de accesibilidad', () => {
      const { barTop, barBottom } = renderIntro()

      expect(barTop).toHaveAttribute('aria-hidden', 'true')
      expect(barBottom).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('salida', () => {
    it('mientras se reproduce no está en la salida', () => {
      const { layer } = renderIntro()

      playFrames(framesOf(es).length - 1)

      expect(layer).not.toHaveClass(LEAVING)
    })

    it('con el código completo espera dos segundos más antes de salir', () => {
      const { layer } = renderIntro()
      playFrames(framesOf(es).length - 1)

      advance(INTRO_TIMING.codeHoldMs - 1)
      expect(layer).not.toHaveClass(LEAVING)
      expect(INTRO_TIMING.codeHoldMs).toBeGreaterThanOrEqual(2000)

      advance(1)
      expect(layer).toHaveClass(LEAVING)
    })

    it('entrar en la salida todavía no avisa: faltan las barras por abrirse', () => {
      renderIntro()

      playToEnd()

      expect(onDone).not.toHaveBeenCalled()
    })

    it('avisa cuando la barra de arriba termina de abrirse', () => {
      const { barTop } = renderIntro()
      playToEnd()

      fireEvent.transitionEnd(barTop)

      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('una transición que termina antes de la salida no avisa', () => {
      const { barTop } = renderIntro()

      fireEvent.transitionEnd(barTop)

      expect(onDone).not.toHaveBeenCalled()
    })

    // El desvanecimiento del texto también es una transición.
    it('las transiciones de la capa o del texto no avisan', () => {
      const { layer } = renderIntro()
      playToEnd()

      fireEvent.transitionEnd(layer)
      fireEvent.transitionEnd(screen.getByText(phraseOf(es).natural))

      expect(onDone).not.toHaveBeenCalled()
    })
  })

  describe('saltar', () => {
    it.each([
      ['un clic', (layer: Element) => fireEvent.click(layer)],
      [
        'un toque',
        (layer: Element) => {
          fireEvent.pointerDown(layer, { pointerType: 'touch' })
          fireEvent.click(layer)
        },
      ],
    ])('con %s en la capa entra en la salida sin esperar a la secuencia', (_name, press) => {
      const { layer } = renderIntro()

      press(layer)

      expect(layer).toHaveClass(LEAVING)
    })

    it('con Esc entra en la salida', () => {
      const { layer } = renderIntro()

      fireEvent.keyDown(layer, { key: 'Escape', code: 'Escape' })

      expect(layer).toHaveClass(LEAVING)
    })

    it('tras saltar avisa al abrirse las barras, igual que al acabar', () => {
      const { layer, barTop } = renderIntro()
      fireEvent.click(layer)
      expect(layer).toHaveClass(LEAVING)
      expect(onDone).not.toHaveBeenCalled()

      fireEvent.transitionEnd(barTop)

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

    it('también cubre la salida al saltarla', () => {
      const { layer } = renderIntro()
      fireEvent.click(layer)

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
      const { barTop } = renderIntro()
      playToEnd()

      fireEvent.transitionEnd(barTop)
      fireEvent.transitionEnd(barTop)
      advance(exitFallbackMs)

      expect(onDone).toHaveBeenCalledTimes(1)
    })
  })

  describe('limpieza', () => {
    it('desmontar durante la secuencia no deja temporizadores', () => {
      const { unmount } = renderIntroWithUnmount()
      playFrames(1)
      expect(vi.getTimerCount()).toBe(1)

      unmount()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('desmontar durante la salida no deja el respaldo pendiente ni avisa después', () => {
      const { unmount } = renderIntroWithUnmount()
      playToEnd()
      expect(vi.getTimerCount()).toBe(1)

      unmount()
      advance(exitFallbackMs)

      expect(vi.getTimerCount()).toBe(0)
      expect(onDone).not.toHaveBeenCalled()
    })

    it('al desmontar deja de escuchar el teclado de la página', () => {
      const { unmount } = renderIntroWithUnmount()
      const remove = vi.spyOn(document, 'removeEventListener')

      unmount()

      expect(remove.mock.calls.map(([type]) => type)).toContain('keydown')
    })
  })
})

/** Como renderIntro, pero devolviendo también cómo desmontarla. */
function renderIntroWithUnmount() {
  const view = render(
    <LangProvider>
      <LoadingIntro onDone={onDone} />
    </LangProvider>,
  )
  return { unmount: view.unmount }
}
