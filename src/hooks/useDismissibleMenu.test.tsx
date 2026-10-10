import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDismissibleMenu } from '@/hooks/useDismissibleMenu'

/** Menú mínimo: el botón y la lista van separados, como en la barra de navegación. */
function Menu() {
  const { open, setOpen, toggleRef, areaRef } = useDismissibleMenu<HTMLUListElement>()

  return (
    <>
      <button ref={toggleRef} type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        Abrir
      </button>
      <ul ref={areaRef} hidden={!open}>
        <li>
          <button type="button">Dentro</button>
        </li>
      </ul>
      <button type="button">Fuera</button>
    </>
  )
}

const setup = () => {
  const user = userEvent.setup()
  const view = render(<Menu />)
  const toggle = () => screen.getByRole('button', { name: 'Abrir' })
  const inside = () => screen.getByRole('button', { name: 'Dentro' })
  const outside = () => screen.getByRole('button', { name: 'Fuera' })
  const isOpen = () => toggle().getAttribute('aria-expanded') === 'true'
  return { user, toggle, inside, outside, isOpen, ...view }
}

const DISMISS_EVENTS = ['focusin', 'keydown', 'pointerdown']

const spyOnDocument = () => ({
  added: vi.spyOn(document, 'addEventListener'),
  removed: vi.spyOn(document, 'removeEventListener'),
})
const eventsOf = (spy: ReturnType<typeof spyOnDocument>['added']) =>
  spy.mock.calls.map(([type]) => type).filter((type) => DISMISS_EVENTS.includes(type))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDismissibleMenu', () => {
  it('empieza cerrado', () => {
    const { isOpen } = setup()

    expect(isOpen()).toBe(false)
  })

  it('setOpen abre y cierra', async () => {
    const { user, toggle, isOpen } = setup()

    await user.click(toggle())
    expect(isOpen()).toBe(true)

    await user.click(toggle())
    expect(isOpen()).toBe(false)
  })

  describe('abierto', () => {
    it('Escape cierra y devuelve el foco al botón', async () => {
      const { user, toggle, inside, isOpen } = setup()
      await user.click(toggle())
      inside().focus()

      await user.keyboard('{Escape}')

      expect(isOpen()).toBe(false)
      expect(toggle()).toHaveFocus()
    })

    it('otra tecla no cierra', async () => {
      const { user, toggle, isOpen } = setup()
      await user.click(toggle())

      await user.keyboard('a')

      expect(isOpen()).toBe(true)
    })

    it('un clic fuera cierra', async () => {
      const { user, toggle, outside, isOpen } = setup()
      await user.click(toggle())

      await user.click(outside())

      expect(isOpen()).toBe(false)
    })

    it('un clic dentro de la zona no cierra', async () => {
      const { user, toggle, inside, isOpen } = setup()
      await user.click(toggle())

      await user.click(inside())

      expect(isOpen()).toBe(true)
    })

    // Si el botón contara como fuera, pulsarlo cerraría y su clic volvería a abrir.
    it('pulsar el botón que abre no cuenta como fuera', async () => {
      const { user, toggle, isOpen } = setup()
      await user.click(toggle())

      fireEvent.pointerDown(toggle())

      expect(isOpen()).toBe(true)
    })

    it('llevar el foco fuera cierra, sin mover el foco', async () => {
      const { user, toggle, outside, isOpen } = setup()
      await user.click(toggle())

      act(() => outside().focus())

      expect(isOpen()).toBe(false)
      expect(outside()).toHaveFocus()
    })

    it('llevar el foco dentro de la zona no cierra', async () => {
      const { user, toggle, inside, isOpen } = setup()
      await user.click(toggle())

      act(() => inside().focus())

      expect(isOpen()).toBe(true)
    })
  })

  describe('cerrado', () => {
    it('Escape no mueve el foco', async () => {
      const { user, outside, isOpen } = setup()
      outside().focus()

      await user.keyboard('{Escape}')

      expect(isOpen()).toBe(false)
      expect(outside()).toHaveFocus()
    })
  })

  describe('listeners del documento', () => {
    it('no registra ninguno mientras está cerrado', () => {
      const { added } = spyOnDocument()

      setup()

      expect(eventsOf(added)).toEqual([])
    })

    it('los registra al abrir y quita los mismos al cerrar', async () => {
      const { user, toggle } = setup()
      const { added, removed } = spyOnDocument()

      await user.click(toggle())
      expect(eventsOf(added).sort()).toEqual(DISMISS_EVENTS)

      await user.keyboard('{Escape}')
      expect(removed.mock.calls.filter(([type]) => DISMISS_EVENTS.includes(type))).toEqual(
        added.mock.calls.filter(([type]) => DISMISS_EVENTS.includes(type)),
      )
    })

    it('los quita al desmontar con el menú abierto', async () => {
      const { user, toggle, unmount } = setup()
      const { added, removed } = spyOnDocument()
      await user.click(toggle())
      expect(eventsOf(added).sort()).toEqual(DISMISS_EVENTS)

      unmount()

      expect(removed.mock.calls.filter(([type]) => DISMISS_EVENTS.includes(type))).toEqual(
        added.mock.calls.filter(([type]) => DISMISS_EVENTS.includes(type)),
      )
    })
  })
})
