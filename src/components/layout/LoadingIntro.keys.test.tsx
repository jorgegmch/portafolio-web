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
  useIntroSequence: () => ({ frame: undefined, phase: 'playing', skip }),
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

// Sin botón: Esc es la tecla de saltar, y Enter y Espacio también sirven.
const SKIP_KEYS = [
  ['Escape', '[Escape]'],
  ['Enter', '[Enter]'],
  ['el Enter del teclado numérico', '[NumpadEnter]'],
  ['Espacio', '[Space]'],
] as const

const renderIntro = () => {
  const user = userEvent.setup({ keyboardMap: KEYBOARD })
  render(
    <LangProvider>
      <LoadingIntro onDone={() => {}} />
    </LangProvider>,
  )
  return { user, layer: screen.getByRole('dialog', { name: es.intro.label }) }
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
  it('la capa tiene el foco al montar', () => {
    const { layer } = renderIntro()

    expect(layer).toHaveFocus()
  })

  it.each(SKIP_KEYS)('%s salta, una sola vez', async (_name, keys) => {
    const { user } = renderIntro()

    await user.keyboard(keys)

    expect(skip).toHaveBeenCalledTimes(1)
  })

  // Si el foco sale de la capa (por ejemplo, con Tab hacia el navegador), la
  // tecla sigue llegando: se escucha en todo el documento.
  it('Esc salta también con el foco fuera de la capa', () => {
    renderIntro()

    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' })

    expect(skip).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['una letra', '[KeyA]'],
    ['una flecha', '[ArrowDown]'],
    ['Tab', '[Tab]'],
  ])('%s no salta', async (_name, keys) => {
    const { user } = renderIntro()

    await user.keyboard(keys)

    expect(skip).not.toHaveBeenCalled()
  })

  it('la tecla mantenida no vuelve a saltar', () => {
    const { layer } = renderIntro()

    fireEvent.keyDown(layer, { key: 'Escape', code: 'Escape' })
    fireEvent.keyDown(layer, { key: 'Escape', code: 'Escape', repeat: true })
    fireEvent.keyDown(layer, { key: 'Enter', code: 'Enter', repeat: true })

    expect(skip).toHaveBeenCalledTimes(1)
  })

  // Son atajos del navegador o del sistema, no una orden de saltar.
  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Alt', { altKey: true }],
    ['Meta', { metaKey: true }],
  ])('Esc con %s no salta ni se anula', (_name, modifier) => {
    const { layer } = renderIntro()

    const notPrevented = fireEvent.keyDown(layer, { key: 'Escape', code: 'Escape', ...modifier })

    expect(skip).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  // Sin anularla, Espacio desplazaría la página que hay debajo.
  it.each([
    ['Escape', { key: 'Escape', code: 'Escape' }],
    ['Enter', { key: 'Enter', code: 'Enter' }],
    ['Espacio', { key: ' ', code: 'Space' }],
  ])('%s se anula para que no haga nada más', (_name, key) => {
    const { layer } = renderIntro()

    expect(fireEvent.keyDown(layer, key)).toBe(false)
  })

  it('las demás teclas no se anulan', () => {
    const { layer } = renderIntro()

    expect(fireEvent.keyDown(layer, { key: 'Tab', code: 'Tab' })).toBe(true)
    expect(fireEvent.keyDown(layer, { key: 'a', code: 'KeyA' })).toBe(true)
  })

  it('un clic en la capa salta, una sola vez', () => {
    const { layer } = renderIntro()

    fireEvent.click(layer)

    expect(skip).toHaveBeenCalledTimes(1)
  })
})
