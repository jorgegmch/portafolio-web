import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import styles from '@/components/sections/Hero.module.css'
import { site } from '@/config/site'
import { heroSocial, heroSocialIconUrl } from '@/data/social'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS, type Lang } from '@/i18n/types'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderHero = (lang: Lang = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  return render(
    <MemoryRouter>
      <LangProvider>
        <Hero />
      </LangProvider>
    </MemoryRouter>,
  )
}

// El valor esperado se obtiene de assembleContact, nunca se escribe aquí.
const whatsappDigits = () => getWhatsappUrl().replace('https://wa.me/', '')

/** Nombre accesible de cada entrada: el del diccionario y, si abre pestaña, el aviso. */
const name = (id: (typeof heroSocial)[number]['id'], lang: Lang = 'es') => {
  const t = dictionaries[lang]
  return id === 'email' ? t.hero.social[id] : `${t.hero.social[id]} (${t.common.opensInNewTab})`
}

const row = (lang: Lang = 'es') =>
  screen.getByRole('list', { name: dictionaries[lang].hero.socialLabel })
const github = (lang: Lang = 'es') => screen.getByRole('link', { name: name('github', lang) })
const linkedin = (lang: Lang = 'es') => screen.getByRole('link', { name: name('linkedin', lang) })
const email = (lang: Lang = 'es') => screen.getByRole('button', { name: name('email', lang) })
const whatsapp = (lang: Lang = 'es') => screen.getByRole('button', { name: name('whatsapp', lang) })
const controls = (lang: Lang = 'es') => [github(lang), linkedin(lang), email(lang), whatsapp(lang)]

/** Verdadero si `earlier` va antes que `later` en el orden del documento. */
const precedes = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

let open: MockInstance<typeof window.open>

beforeEach(() => {
  open = vi.spyOn(window, 'open').mockImplementation(() => null)
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero: fila de redes', () => {
  describe('estructura', () => {
    it.each(LANGS)('en %s, es una lista con nombre', (lang) => {
      renderHero(lang)

      expect(row(lang).tagName).toBe('UL')
    })

    it('tiene un elemento por entrada del registro', () => {
      renderHero()

      expect(within(row()).getAllByRole('listitem')).toHaveLength(heroSocial.length)
    })

    it.each(LANGS)('en %s, van GitHub, LinkedIn, correo y WhatsApp, en ese orden', (lang) => {
      renderHero(lang)

      const found = [...row(lang).querySelectorAll('a, button')]

      expect(found).toEqual(controls(lang))
    })

    it('va después del botón principal y del estado', () => {
      renderHero()

      const link = screen.getByRole('link', {
        name: dictionaries.es.hero.viewProjects,
      })

      expect(precedes(link, row())).toBe(true)
      expect(precedes(screen.getByText(dictionaries.es.hero.availability), row())).toBe(true)
    })

    it('queda fuera de la capa decorativa de las pastillas', () => {
      renderHero()

      expect(row().closest('[aria-hidden="true"]')).toBeNull()
    })

    it('sigue habiendo un solo título', () => {
      renderHero()

      expect(screen.getAllByRole('heading')).toHaveLength(1)
    })
  })

  describe('nombres accesibles', () => {
    it.each(LANGS)('en %s, cada control se llama como dice el diccionario', (lang) => {
      renderHero(lang)

      controls(lang).forEach((control) => expect(control).toBeInTheDocument())
    })

    it('los nombres propios de marca no cambian con el idioma; los demás sí', () => {
      expect(dictionaries.es.hero.social.github).toBe(dictionaries.en.hero.social.github)
      expect(dictionaries.es.hero.social.linkedin).toBe(dictionaries.en.hero.social.linkedin)
      expect(dictionaries.es.hero.social.email).not.toBe(dictionaries.en.hero.social.email)
      expect(dictionaries.es.hero.social.whatsapp).not.toBe(dictionaries.en.hero.social.whatsapp)
      expect(dictionaries.es.hero.socialLabel).not.toBe(dictionaries.en.hero.socialLabel)
    })

    // Lo que abre otra pestaña lo avisa; el correo abre el cliente de correo.
    it('el correo no anuncia pestaña nueva', () => {
      renderHero()

      expect(email()).not.toHaveAccessibleName(
        expect.stringContaining(dictionaries.es.common.opensInNewTab),
      )
    })
  })

  describe('iconos', () => {
    it('cada control lleva solo su icono, como imagen decorativa', () => {
      renderHero()

      controls().forEach((control, index) => {
        const images = control.querySelectorAll('img')
        const entry = heroSocial[index]

        expect(control.children).toHaveLength(1)
        expect(control.textContent).toBe('')
        expect(images).toHaveLength(1)
        expect(images[0]).toHaveAttribute('alt', '')
        expect(images[0]).toHaveAttribute('src', entry && heroSocialIconUrl(entry))
      })
    })

    // Se cargan con <img>: el CSS de la página no puede teñir el logo.
    it('ninguno va incrustado como svg ni lleva estilos en línea', () => {
      renderHero()

      expect(row().querySelector('svg')).toBeNull()
      row()
        .querySelectorAll('*')
        .forEach((element) => expect(element).not.toHaveAttribute('style'))
    })

    it('todos los iconos comparten clase, y todos los controles también', () => {
      renderHero()

      expect(styles.socialIcon).toBeTruthy()
      expect(styles.socialControl).toBeTruthy()
      controls().forEach((control) => {
        expect(control).toHaveClass(styles.socialControl ?? '', {
          exact: true,
        })
        expect(control.querySelector('img')).toHaveClass(styles.socialIcon ?? '', { exact: true })
      })
    })

    it('no cuentan como imágenes con contenido: la única es el retrato', () => {
      renderHero()

      expect(screen.getAllByRole('img')).toHaveLength(1)
    })
  })

  describe('GitHub y LinkedIn', () => {
    it('son enlaces al perfil, con la URL de config/site', () => {
      renderHero()

      expect(github()).toHaveAttribute('href', site.social.github)
      expect(linkedin()).toHaveAttribute('href', site.social.linkedin)
    })

    it('se abren en pestaña nueva, sin dar acceso a esta', () => {
      renderHero()

      for (const link of [github(), linkedin()]) {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      }
    })
  })

  describe('correo y WhatsApp, antes de interactuar', () => {
    it('son botones, no enlaces: sin href', () => {
      renderHero()

      for (const button of [email(), whatsapp()]) {
        expect(button.tagName).toBe('BUTTON')
        expect(button).toHaveAttribute('type', 'button')
        expect(button).not.toHaveAttribute('href')
      }
    })

    it.each(LANGS)('en %s, ni el correo ni el número existen en el DOM', (lang) => {
      renderHero(lang)
      const html = document.documentElement.outerHTML

      expect(html).not.toContain(getEmail())
      expect(html).not.toContain(getEmail().split('@')[0])
      expect(html).not.toContain(getEmail().split('@')[1])
      expect(html).not.toContain(whatsappDigits())
      expect(html).not.toContain('@')
      expect(html).not.toContain('mailto:')
      expect(html).not.toContain('wa.me')
    })

    it('no se abre nada', () => {
      renderHero()

      expect(open).not.toHaveBeenCalled()
    })

    // Sin sitio para el texto: el correo no se revela, así que no hay región.
    it('no hay región de estado para el correo', () => {
      renderHero()

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('al usar el correo', () => {
    it('abre mailto: en esta pestaña y no deja el correo en el DOM', async () => {
      const user = userEvent.setup()
      renderHero()

      await user.click(email())

      expect(open).toHaveBeenCalledTimes(1)
      expect(open).toHaveBeenCalledWith(getEmailUrl(), '_self')
      expect(document.documentElement.outerHTML).not.toContain(getEmail())
      expect(document.documentElement.outerHTML).not.toContain('mailto:')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('al usar WhatsApp', () => {
    it('abre wa.me en pestaña nueva, sin dar acceso a esta, y el número no entra al DOM', async () => {
      const user = userEvent.setup()
      renderHero()

      await user.click(whatsapp())

      expect(open).toHaveBeenCalledTimes(1)
      expect(open).toHaveBeenCalledWith(getWhatsappUrl(), '_blank', 'noopener,noreferrer')
      expect(document.documentElement.outerHTML).not.toContain(whatsappDigits())
      expect(document.documentElement.outerHTML).not.toContain('wa.me')
    })
  })

  describe('teclado', () => {
    it('el tabulador pasa por GitHub, LinkedIn, correo y WhatsApp, en ese orden', async () => {
      const user = userEvent.setup()
      renderHero()

      screen.getByRole('link', { name: dictionaries.es.hero.viewProjects }).focus()
      for (const control of controls()) {
        await user.tab()
        expect(control).toHaveFocus()
      }
    })

    it('ningún control cambia el orden con tabindex', () => {
      renderHero()

      controls().forEach((control) => expect(control).not.toHaveAttribute('tabindex'))
    })

    it('Enter en el correo y Espacio en WhatsApp los activan', async () => {
      const user = userEvent.setup()
      renderHero()

      email().focus()
      await user.keyboard('{Enter}')
      whatsapp().focus()
      await user.keyboard(' ')

      expect(open).toHaveBeenNthCalledWith(1, getEmailUrl(), '_self')
      expect(open).toHaveBeenNthCalledWith(2, getWhatsappUrl(), '_blank', 'noopener,noreferrer')
    })
  })
})
