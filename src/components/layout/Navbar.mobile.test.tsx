import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { mockMatchMedia } from '@/test/mockMatchMedia'

const { es } = dictionaries

// Enlaces que el menú pliega en pantallas estrechas.
const MENU_LINKS = [
  es.nav.about,
  es.nav.technologies,
  es.nav.projects,
  es.nav.contact,
  es.nav.certifications,
]

const setup = ({ compact }: { compact: boolean }) => {
  const media = mockMatchMedia(compact)
  const user = userEvent.setup()
  const view = render(
    <MemoryRouter>
      <LangProvider>
        <Navbar />
      </LangProvider>
      <button type="button">Fuera</button>
    </MemoryRouter>,
  )
  return { media, user, ...view }
}

const menuToggle = () =>
  screen.getByRole('button', { name: new RegExp(`^(${es.nav.openMenu}|${es.nav.closeMenu})$`) })
const queryMenuToggle = () =>
  screen.queryByRole('button', { name: new RegExp(`^(${es.nav.openMenu}|${es.nav.closeMenu})$`) })
const link = (name: string) => screen.getByRole('link', { name })
const queryLink = (name: string) => screen.queryByRole('link', { name })
const langToggle = () => screen.getByRole('button', { name: new RegExp(`^${es.nav.language}`) })
const brand = () => screen.getByRole('link', { name: new RegExp(site.handle) })

beforeEach(() => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

describe('Navbar: menú en pantallas estrechas', () => {
  describe('en escritorio', () => {
    it('no hay botón de menú y los enlaces están a la vista', () => {
      setup({ compact: false })

      expect(queryMenuToggle()).not.toBeInTheDocument()
      for (const name of MENU_LINKS) expect(link(name)).toBeVisible()
    })
  })

  describe('cerrado', () => {
    it('el botón se llama "abrir menú" y declara que está cerrado', () => {
      setup({ compact: true })

      expect(menuToggle()).toHaveAccessibleName(es.nav.openMenu)
      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('aria-controls apunta a la lista de enlaces, que existe', () => {
      setup({ compact: true })
      const listId = menuToggle().getAttribute('aria-controls')

      expect(listId).toBeTruthy()
      expect(document.getElementById(listId ?? '')).toBeInTheDocument()
    })

    it('ningún enlace del menú está expuesto', () => {
      setup({ compact: true })

      for (const name of MENU_LINKS) expect(queryLink(name)).not.toBeInTheDocument()
    })

    it('el foco salta del botón al selector de idioma, sin pasar por los enlaces', async () => {
      const { user } = setup({ compact: true })

      await user.tab()
      expect(brand()).toHaveFocus()
      await user.tab()
      expect(menuToggle()).toHaveFocus()
      await user.tab()
      expect(langToggle()).toHaveFocus()
    })

    it('Escape no hace nada', async () => {
      const { user } = setup({ compact: true })

      menuToggle().focus()
      await user.keyboard('{Escape}')

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
      expect(menuToggle()).toHaveFocus()
    })
  })

  describe('al abrir', () => {
    it.each([
      ['Enter', '{Enter}'],
      ['Espacio', ' '],
    ])('%s abre el menú desde el teclado', async (_name, key) => {
      const { user } = setup({ compact: true })

      menuToggle().focus()
      await user.keyboard(key)

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'true')
      expect(menuToggle()).toHaveAccessibleName(es.nav.closeMenu)
      for (const name of MENU_LINKS) expect(link(name)).toBeVisible()
    })

    it('el foco entra en los enlaces justo después del botón', async () => {
      const { user } = setup({ compact: true })

      await user.click(menuToggle())
      await user.tab()

      expect(link(es.nav.about)).toHaveFocus()
    })

    it('un segundo clic en el botón lo cierra', async () => {
      const { user } = setup({ compact: true })

      await user.click(menuToggle())
      await user.click(menuToggle())

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
      expect(queryLink(es.nav.about)).not.toBeInTheDocument()
    })
  })

  describe('al cerrar', () => {
    it('Escape cierra y devuelve el foco al botón', async () => {
      const { user } = setup({ compact: true })

      await user.click(menuToggle())
      await user.tab()
      await user.tab()
      expect(link(es.nav.technologies)).toHaveFocus()
      await user.keyboard('{Escape}')

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
      expect(menuToggle()).toHaveFocus()
    })

    it('elegir un enlace con el ratón lo cierra', async () => {
      const { user } = setup({ compact: true })

      await user.click(menuToggle())
      await user.click(link(es.nav.projects))

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
      expect(queryLink(es.nav.projects)).not.toBeInTheDocument()
    })

    it('elegir un enlace con el teclado lo cierra', async () => {
      const { user } = setup({ compact: true })

      menuToggle().focus()
      await user.keyboard('{Enter}')
      await user.tab()
      await user.keyboard('{Enter}')

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('un clic fuera lo cierra', async () => {
      const { user } = setup({ compact: true })

      await user.click(menuToggle())
      await user.click(screen.getByRole('button', { name: 'Fuera' }))

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('salir con Tab hacia el selector de idioma lo cierra', async () => {
      const { user } = setup({ compact: true })

      await user.click(menuToggle())
      for (let i = 0; i <= MENU_LINKS.length; i += 1) await user.tab()

      expect(langToggle()).toHaveFocus()
      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // Girar el teléfono o ensanchar la ventana con el menú abierto.
  describe('al cambiar de ancho', () => {
    it('al pasar a escritorio el botón desaparece y los enlaces vuelven', async () => {
      const { user, media } = setup({ compact: true })
      await user.click(menuToggle())

      act(() => media.setMatches(false))

      expect(queryMenuToggle()).not.toBeInTheDocument()
      for (const name of MENU_LINKS) expect(link(name)).toBeVisible()
    })

    it('al volver a pantalla estrecha el menú está cerrado', async () => {
      const { user, media } = setup({ compact: true })
      await user.click(menuToggle())

      act(() => media.setMatches(false))
      act(() => media.setMatches(true))

      expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
      expect(queryLink(es.nav.about)).not.toBeInTheDocument()
    })
  })

  describe('limpieza', () => {
    const spyOnDocument = () => ({
      added: vi.spyOn(document, 'addEventListener'),
      removed: vi.spyOn(document, 'removeEventListener'),
    })
    const listenersOf = (added: ReturnType<typeof spyOnDocument>['added']) =>
      added.mock.calls.map(([type, listener]) => ({ type, listener }))

    it('cerrado no añade listeners al documento', () => {
      const { added } = spyOnDocument()
      // user-event añade los suyos al preparar el documento: se descartan.
      const view = setup({ compact: true })
      added.mockClear()

      view.rerender(
        <MemoryRouter>
          <LangProvider>
            <Navbar />
          </LangProvider>
        </MemoryRouter>,
      )

      expect(added).not.toHaveBeenCalled()
    })

    it('al cerrarse quita los listeners que añadió al abrirse', async () => {
      const { added, removed } = spyOnDocument()
      const { user } = setup({ compact: true })

      added.mockClear()
      await user.click(menuToggle())
      const whileOpen = listenersOf(added)
      expect(whileOpen.length).toBeGreaterThan(0)
      await user.keyboard('{Escape}')

      for (const { type, listener } of whileOpen) {
        expect(removed).toHaveBeenCalledWith(type, listener)
      }
    })

    it('al desmontarse abierto quita todos sus listeners', async () => {
      const { added, removed } = spyOnDocument()
      const { user, unmount } = setup({ compact: true })

      added.mockClear()
      await user.click(menuToggle())
      const whileOpen = listenersOf(added)
      expect(whileOpen.length).toBeGreaterThan(0)

      unmount()

      for (const { type, listener } of whileOpen) {
        expect(removed).toHaveBeenCalledWith(type, listener)
      }
    })
  })
})
