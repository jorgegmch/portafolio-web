import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingIntro } from '@/components/layout/LoadingIntro'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

// La secuencia se sustituye por un espía: así se cuenta cuántas veces pide
// saltar cada pulsación, que es lo que estos tests vigilan. La secuencia real
// tiene sus propios tests, y su unión con el componente, los de LoadingIntro.
const { skip } = vi.hoisted(() => ({ skip: vi.fn() }))
vi.mock('@/hooks/useIntroSequence', () => ({
  useIntroSequence: () => ({ text: '', phase: 'playing', skip }),
}))

const { es } = dictionaries

// El mapa por defecto de user-event no trae el Enter del teclado numérico.
const KEYBOARD = [
  { code: 'Enter', key: 'Enter' },
  { code: 'NumpadEnter', key: 'Enter', location: 3 },
  { code: 'Space', key: ' ' },
  { code: 'Escape', key: 'Escape' },
  { code: 'Tab', key: 'Tab' },
  { code: 'ArrowDown', key: 'ArrowDown' },
  { code: 'KeyA', key: 'a' },
]

const SKIP_KEYS = [
  ['Enter', '[Enter]'],
  ['el Enter del teclado numérico', '[NumpadEnter]'],
  ['Espacio', '[Space]'],
] as const

const renderIntro = () => {
  const user = userEvent.setup({ keyboardMap: KEYBOARD })
  const view = render(
    <LangProvider>
      <LoadingIntro onDone={() => {}} />
    </LangProvider>,
  )
  const layer = view.container.firstElementChild
  if (!(layer instanceof HTMLElement)) throw new Error('La intro no renderizó su capa')
  return { user, layer, button: screen.getByRole('button', { name: es.intro.skip }) }
}

/**
 * Lleva el foco a la capa y lo comprueba: si la capa no pudiera recibirlo, el
 * foco se quedaría donde estaba y los tests de la capa pasarían por otra vía.
 */
const focusLayer = (layer: HTMLElement) => {
  layer.focus()
  expect(layer).toHaveFocus()
}

beforeEach(() => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  skip.mockClear()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('LoadingIntro: teclado', () => {
  describe('con la capa enfocada', () => {
    it('la capa puede tener el foco', () => {
      const { layer } = renderIntro()

      focusLayer(layer)
    })

    it.each(SKIP_KEYS)('%s salta, una sola vez', async (_name, keys) => {
      const { user, layer } = renderIntro()
      focusLayer(layer)

      await user.keyboard(keys)

      expect(skip).toHaveBeenCalledTimes(1)
    })

    it.each([
      ['Escape', '[Escape]'],
      ['una letra', '[KeyA]'],
      ['una flecha', '[ArrowDown]'],
    ])('%s no salta', async (_name, keys) => {
      const { user, layer } = renderIntro()
      focusLayer(layer)

      await user.keyboard(keys)

      expect(skip).not.toHaveBeenCalled()
    })

    it('Tab no salta: sigue sirviendo para llegar al botón', async () => {
      const { user, layer, button } = renderIntro()
      focusLayer(layer)

      await user.keyboard('[Tab]')

      expect(skip).not.toHaveBeenCalled()
      expect(button).toHaveFocus()
    })

    it('la tecla mantenida no vuelve a saltar', () => {
      const { layer } = renderIntro()
      focusLayer(layer)

      fireEvent.keyDown(layer, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(layer, { key: 'Enter', code: 'Enter', repeat: true })
      fireEvent.keyDown(layer, { key: 'Enter', code: 'Enter', repeat: true })

      expect(skip).toHaveBeenCalledTimes(1)
    })

    it('una repetición que llega sola tampoco salta', () => {
      const { layer } = renderIntro()
      focusLayer(layer)

      fireEvent.keyDown(layer, { key: ' ', code: 'Space', repeat: true })

      expect(skip).not.toHaveBeenCalled()
    })

    // Son atajos del navegador o del sistema, no una orden de saltar.
    it.each([
      ['Ctrl', { ctrlKey: true }],
      ['Alt', { altKey: true }],
      ['Meta', { metaKey: true }],
    ])('Enter con %s no salta ni se anula', (_name, modifier) => {
      const { layer } = renderIntro()
      focusLayer(layer)

      const notPrevented = fireEvent.keyDown(layer, { key: 'Enter', code: 'Enter', ...modifier })

      expect(skip).not.toHaveBeenCalled()
      expect(notPrevented).toBe(true)
    })

    // Sin anularla, Espacio desplazaría la página que hay debajo.
    it.each([
      ['Enter', { key: 'Enter', code: 'Enter' }],
      ['Espacio', { key: ' ', code: 'Space' }],
    ])('%s se anula para que no haga nada más', (_name, key) => {
      const { layer } = renderIntro()
      focusLayer(layer)

      const notPrevented = fireEvent.keyDown(layer, key)

      expect(notPrevented).toBe(false)
    })

    it('las demás teclas no se anulan', () => {
      const { layer } = renderIntro()
      focusLayer(layer)

      expect(fireEvent.keyDown(layer, { key: 'Tab', code: 'Tab' })).toBe(true)
      expect(fireEvent.keyDown(layer, { key: 'a', code: 'KeyA' })).toBe(true)
    })
  })

  describe('con el botón enfocado', () => {
    // El botón ya salta por sí solo al activarse; si la capa atendiera también
    // la tecla que sube desde él, una pulsación pediría saltar dos veces.
    it.each(SKIP_KEYS)('%s salta, una sola vez', async (_name, keys) => {
      const { user, button } = renderIntro()
      button.focus()

      await user.keyboard(keys)

      expect(skip).toHaveBeenCalledTimes(1)
    })

    it('un clic salta, una sola vez', async () => {
      const { user, button } = renderIntro()

      await user.click(button)

      expect(skip).toHaveBeenCalledTimes(1)
    })

    it.each([
      ['Enter', { key: 'Enter', code: 'Enter' }],
      ['Espacio', { key: ' ', code: 'Space' }],
    ])('la capa ni atiende ni anula %s cuando nace en el botón', (_name, key) => {
      const { button } = renderIntro()

      // fireEvent no activa el botón: lo único que podría saltar es la capa.
      const notPrevented = fireEvent.keyDown(button, key)

      expect(skip).not.toHaveBeenCalled()
      expect(notPrevented).toBe(true)
    })

    it('otras teclas no saltan', async () => {
      const { user, button } = renderIntro()
      button.focus()

      await user.keyboard('[Escape][KeyA][ArrowDown]')

      expect(skip).not.toHaveBeenCalled()
    })
  })
})
