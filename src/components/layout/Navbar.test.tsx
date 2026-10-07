import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { storageKeys } from '@/config/storage'
import { SCROLL_THRESHOLD } from '@/hooks/useScrolled'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANG_NAMES } from '@/i18n/types'

const { es, en } = dictionaries
const LANG_KEY = storageKeys.local.lang

const setUrl = (path: string) => window.history.replaceState(null, '', path)
const setScrollY = (value: number) =>
  Object.defineProperty(window, 'scrollY', { value, configurable: true })
const scrollTo = (value: number) =>
  act(() => {
    setScrollY(value)
    window.dispatchEvent(new Event('scroll'))
  })

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

const langToggle = (label: string) => screen.getByRole('button', { name: new RegExp(`^${label}`) })

const chooseLang = async (user: ReturnType<typeof userEvent.setup>, from: string, to: string) => {
  await user.click(langToggle(from))
  await user.click(screen.getByRole('button', { name: to }))
}

beforeEach(() => {
  setUrl('/')
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  setUrl('/')
  setScrollY(0)
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

      const brand = screen.getByRole('link', { name: new RegExp(site.shortName) })
      expect(brand).toHaveAttribute('href', routes.home)
      expect(brand).toHaveAccessibleName(`${site.shortName}: ${es.nav.home}`)
    })

    it.each([
      [es.nav.about, sections.about],
      [es.nav.technologies, sections.technologies],
      [es.nav.projects, sections.projects],
      [es.nav.contact, sections.contact],
    ])('el enlace "%s" lleva al ancla #%s de la home', (name, id) => {
      renderNavbar()

      expect(screen.getByRole('link', { name })).toHaveAttribute('href', `${routes.home}#${id}`)
    })

    it('el enlace de certificaciones lleva a su página', () => {
      renderNavbar()

      expect(screen.getByRole('link', { name: es.nav.certifications })).toHaveAttribute(
        'href',
        routes.certifications,
      )
    })

    it('el selector nombra el idioma activo', () => {
      renderNavbar()

      expect(langToggle(es.nav.language)).toHaveAccessibleName(
        `${es.nav.language}: ${LANG_NAMES.es}`,
      )
    })
  })

  describe('al elegir un idioma', () => {
    it('cambia los textos, <html lang> y guarda la preferencia', async () => {
      const { user } = renderNavbar()

      await chooseLang(user, es.nav.language, LANG_NAMES.en)

      expect(screen.getByRole('navigation', { name: en.nav.main })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: en.nav.about })).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('en')
      expect(localStorage.getItem(LANG_KEY)).toBe('en')
    })

    it('las anclas no cambian con el idioma', async () => {
      const { user } = renderNavbar()

      await chooseLang(user, es.nav.language, LANG_NAMES.en)

      expect(screen.getByRole('link', { name: en.nav.projects })).toHaveAttribute(
        'href',
        `${routes.home}#${sections.projects}`,
      )
    })

    it('quita ?lang= de la URL y conserva el resto', async () => {
      setUrl('/?utm=x&lang=en')
      const { user } = renderNavbar()

      await chooseLang(user, en.nav.language, LANG_NAMES.es)

      expect(window.location.search).toBe('?utm=x')
      expect(localStorage.getItem(LANG_KEY)).toBe('es')
    })

    // Quien llegó con ?lang= y confirma ese idioma espera que se recuerde.
    it('elegir el idioma ya activo también lo guarda y limpia la URL', async () => {
      setUrl('/?lang=en')
      const { user } = renderNavbar()
      expect(localStorage.getItem(LANG_KEY)).toBeNull()

      await chooseLang(user, en.nav.language, LANG_NAMES.en)

      expect(localStorage.getItem(LANG_KEY)).toBe('en')
      expect(window.location.search).toBe('')
      expect(screen.getByRole('navigation', { name: en.nav.main })).toBeInTheDocument()
    })

    it('funciona con localStorage bloqueado', async () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('bloqueado', 'SecurityError')
      })
      const { user } = renderNavbar()

      await chooseLang(user, es.nav.language, LANG_NAMES.en)

      expect(screen.getByRole('navigation', { name: en.nav.main })).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('en')
    })
  })

  describe('fondo', () => {
    it('no lo muestra con la página arriba', () => {
      renderNavbar()

      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'false')
    })

    it('lo muestra al pasar el umbral y lo quita al volver', () => {
      renderNavbar()

      scrollTo(SCROLL_THRESHOLD + 1)
      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true')

      scrollTo(0)
      expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'false')
    })
  })
})
