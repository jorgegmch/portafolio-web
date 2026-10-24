import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { storageKeys } from '@/config/storage'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

const { es, en } = dictionaries
const LANG_KEY = storageKeys.local.lang

const setUrl = (path: string) => window.history.replaceState(null, '', path)

const renderNavbar = () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <LangProvider>
        <Navbar />
      </LangProvider>
    </MemoryRouter>,
  )
  return { user }
}

/** El botón de idioma: su nombre empieza por lo que se ve, «ES / EN». */
const langToggle = () => screen.getByRole('button', { name: /^ES \/ EN: / })

beforeEach(() => {
  setUrl('/')
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  setUrl('/')
  document.documentElement.removeAttribute('lang')
})

describe('Navbar', () => {
  describe('estructura', () => {
    it('es un banner con una navegación con nombre', () => {
      renderNavbar()

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: es.nav.main })).toBeInTheDocument()
    })

    it('el nombre del sitio enlaza al inicio', () => {
      renderNavbar()

      const brand = screen.getByRole('link', { name: new RegExp(site.handle) })
      expect(brand).toHaveAttribute('href', routes.home)
      expect(brand).toHaveAccessibleName(`${site.shortName} (${site.handle}), ${es.nav.home}`)
      expect(brand).toHaveTextContent(site.handle)
    })

    it.each([
      [es.nav.about, sections.about],
      [es.nav.services, sections.services],
      [es.nav.projects, sections.projects],
      [es.nav.contact, sections.contact],
    ])('el enlace "%s" lleva al ancla #%s de la home', (name, id) => {
      renderNavbar()

      expect(screen.getByRole('link', { name })).toHaveAttribute('href', `${routes.home}#${id}`)
    })

    it('el botón de idioma muestra los dos códigos y dice qué hace', () => {
      renderNavbar()

      expect(langToggle()).toHaveAccessibleName(`ES / EN: ${es.nav.language}`)
      expect(langToggle()).toHaveTextContent('ES / EN')
    })
  })

  describe('al cambiar de idioma', () => {
    it('cambia los textos, <html lang> y guarda la preferencia', async () => {
      const { user } = renderNavbar()

      await user.click(langToggle())

      expect(screen.getByRole('navigation', { name: en.nav.main })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: en.nav.about })).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('en')
      expect(localStorage.getItem(LANG_KEY)).toBe('en')
    })

    it('las anclas no cambian con el idioma', async () => {
      const { user } = renderNavbar()

      await user.click(langToggle())

      expect(screen.getByRole('link', { name: en.nav.projects })).toHaveAttribute(
        'href',
        `${routes.home}#${sections.projects}`,
      )
    })

    it('quita ?lang= de la URL y conserva el resto', async () => {
      setUrl('/?utm=x&lang=en')
      const { user } = renderNavbar()

      await user.click(langToggle())

      expect(window.location.search).toBe('?utm=x')
      expect(localStorage.getItem(LANG_KEY)).toBe('es')
    })

    it('funciona con localStorage bloqueado', async () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('bloqueado', 'SecurityError')
      })
      const { user } = renderNavbar()

      await user.click(langToggle())

      expect(screen.getByRole('navigation', { name: en.nav.main })).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('en')
    })
  })
})
