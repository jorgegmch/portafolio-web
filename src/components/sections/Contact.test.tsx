import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Footer } from '@/components/layout/Footer'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { Services } from '@/components/sections/Services'
import { site, socialLinks } from '@/config/site'
import { cvFilesFor, cvUrl } from '@/data/cv'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

// Regla de contacto (.claude/rules/contacto.md) y spec §3.5: el correo y el
// teléfono no están en la página ni en los archivos de src/. Los valores
// salen de assembleContact, nunca se escriben aquí, y ninguna aserción los
// imprime si falla: se comparan con booleanos o se listan rutas.

const { es } = dictionaries

/** Lo que no puede aparecer: el correo, su parte local y el número, con y sin indicativo. */
const secrets = () => {
  const email = getEmail()
  const digits = getWhatsappUrl().replace('https://wa.me/', '')
  return [email, email.split('@')[0] ?? email, digits, digits.slice(-10)]
}

/** Cuántos de esos datos contiene un texto (0 es lo correcto). */
const leaks = (text: string) => secrets().filter((secret) => text.includes(secret)).length

const html = () => document.documentElement.outerHTML

let open: MockInstance<typeof window.open>

beforeEach(() => {
  open = vi.spyOn(window, 'open').mockImplementation(() => null)
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

const renderContact = () =>
  render(
    <LangProvider>
      <Contact />
    </LangProvider>,
  )

const contactRegion = () => screen.getByRole('region', { name: es.contact.label })
const links = () => within(contactRegion()).getByRole('list', { name: es.contact.linksLabel })

describe('Contact: datos de contacto', () => {
  // Control positivo: los datos existen y tienen forma; si salieran vacíos,
  // los «no contiene» de abajo pasarían sin probar nada.
  it('los datos a buscar existen y tienen forma de correo y de número', () => {
    const [email = '', local = '', digits = '', national = ''] = secrets()

    expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(true)
    expect(local.length).toBeGreaterThan(2)
    expect(/^\d{10,15}$/.test(digits)).toBe(true)
    expect(national.length).toBe(10)
  })

  describe('antes de interactuar', () => {
    it('ni el correo ni el número están en la página, ni en texto ni en atributos', () => {
      render(
        <MemoryRouter>
          <LangProvider>
            <Hero />
            <About />
            <Services />
            <Projects />
            <Contact />
            <Footer />
          </LangProvider>
        </MemoryRouter>,
      )

      expect(screen.getByRole('region', { name: es.contact.label })).toBeInTheDocument()
      expect(leaks(html())).toBe(0)
      expect(html().includes('mailto:')).toBe(false)
      expect(html().includes('wa.me')).toBe(false)
    })

    it('«Copiar correo» y WhatsApp son botones, no enlaces', () => {
      renderContact()

      expect(within(links()).getByRole('button', { name: es.contact.copyEmail })).toBeInTheDocument()
      expect(
        within(links()).getByRole('button', { name: `${es.contact.whatsapp} (${es.common.opensInNewTab})` }),
      ).toBeInTheDocument()
      expect(open).not.toHaveBeenCalled()
    })
  })

  describe('«Copiar correo»', () => {
    it('lleva el correo al portapapeles, lo anuncia y no lo escribe en la página', async () => {
      const user = userEvent.setup()
      const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
      renderContact()
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

      await user.click(within(links()).getByRole('button', { name: es.contact.copyEmail }))

      expect(writeText).toHaveBeenCalledOnce()
      expect(writeText.mock.calls[0]?.[0] === getEmail()).toBe(true)
      expect(within(links()).getByRole('status')).toHaveTextContent(es.contact.emailCopied)
      expect(leaks(html())).toBe(0)
    })

    it('si el navegador no deja copiar, abre el programa de correo y lo dice', async () => {
      const user = userEvent.setup()
      const writeText = vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error('sin permiso'))
      renderContact()
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

      await user.click(within(links()).getByRole('button', { name: es.contact.copyEmail }))

      expect(open).toHaveBeenCalledOnce()
      expect(open.mock.calls[0]?.[0] === getEmailUrl()).toBe(true)
      expect(open.mock.calls[0]?.[1]).toBe('_self')
      expect(within(links()).getByRole('status')).toHaveTextContent(es.contact.copyFailed)
      expect(leaks(html())).toBe(0)
    })

    it('sin portapapeles en el navegador, también abre el programa de correo', async () => {
      const user = userEvent.setup()
      renderContact()
      vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })

      await user.click(within(links()).getByRole('button', { name: es.contact.copyEmail }))

      expect(open.mock.calls[0]?.[0] === getEmailUrl()).toBe(true)
    })
  })

  it('WhatsApp abre el chat en una pestaña nueva y el número no entra en la página', async () => {
    const user = userEvent.setup()
    renderContact()

    await user.click(
      within(links()).getByRole('button', { name: `${es.contact.whatsapp} (${es.common.opensInNewTab})` }),
    )

    expect(open).toHaveBeenCalledOnce()
    expect(open.mock.calls[0]?.[0] === getWhatsappUrl()).toBe(true)
    expect(open.mock.calls[0]?.slice(1)).toEqual(['_blank', 'noopener,noreferrer'])
    expect(leaks(html())).toBe(0)
  })

  describe('píldoras', () => {
    it('LinkedIn y GitHub se abren en una pestaña nueva, sin dar acceso a esta', () => {
      renderContact()

      socialLinks.forEach(({ label, url }) => {
        const link = within(links()).getByRole('link', { name: `${label} (${es.common.opensInNewTab})` })

        expect(link).toHaveAttribute('href', url)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    // Un solo botón de CV, en el idioma activo del sitio, que funciona como
    // «Descargar CV» del Hero: abre las dos versiones de ese idioma.
    it.each([
      ['es', ['es-CO'], es],
      ['en', ['en-US'], dictionaries.en],
    ] as const)('en %s, un solo botón de CV abre las versiones de ese idioma', async (lang, langs, dict) => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)
      const user = userEvent.setup()
      renderContact()
      const region = screen.getByRole('region', { name: dict.contact.label })
      const list = within(region).getByRole('list', { name: dict.contact.linksLabel })
      const { short, name } = dict.contact.cv
      const button = within(list).getByRole('button', { name: `${short}: ${name}` })

      expect(button).toHaveTextContent(short)
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(within(list).queryAllByRole('link', { name: /CV/ })).toHaveLength(0)

      await user.click(button)

      const files = cvFilesFor(lang)
      const options = within(list).getAllByRole('link', { name: /PDF/ })
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(options.map((option) => option.getAttribute('href'))).toEqual(files.map((file) => cvUrl(file)))
      options.forEach((option) => expect(option).toHaveAttribute('download'))
    })

    it('el menú del CV se cierra con Escape y devuelve el foco a su botón', async () => {
      const user = userEvent.setup()
      renderContact()
      const { short, name } = es.contact.cv
      const button = within(links()).getByRole('button', { name: `${short}: ${name}` })

      await user.click(button)
      await user.keyboard('{Escape}')

      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveFocus()
    })

    it('la escena dice la ciudad del autor', () => {
      renderContact()

      expect(contactRegion()).toHaveTextContent(site.locationCredits)
    })
  })
})

describe('archivos de texto de src/', () => {
  /**
   * Todos los archivos de texto de src/. Vite resuelve el patrón al
   * transformar el test, así que la lista es la del disco; cada archivo se
   * lee sin importarlo.
   */
  const files = Object.keys(import.meta.glob('/src/**/*.{ts,tsx,css,json,md,svg,html,txt}')).map((key) =>
    key.replace(/^\//, ''),
  )

  it('la búsqueda encuentra los archivos, también el que guarda los datos codificados', () => {
    expect(files).toContain('src/config/contact.ts')
    expect(files).toContain('src/components/sections/Contact.tsx')
    expect(files.length).toBeGreaterThan(100)
  })

  it('ninguno contiene el correo, su parte local ni el número', () => {
    const withData = files.filter((path) => leaks(readFileSync(path, 'utf8')) > 0)

    expect(withData).toEqual([])
  })
})
