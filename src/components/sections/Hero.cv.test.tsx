import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { cvFiles, cvUrl } from '@/data/cv'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS, type Lang } from '@/i18n/types'

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

const toggle = (lang: Lang = 'es') =>
  screen.getByRole('button', { name: dictionaries[lang].hero.downloadCv })
const viewProjects = (lang: Lang = 'es') =>
  screen.getByRole('link', { name: dictionaries[lang].hero.viewProjects })

/** URL del registro para un idioma y una versión: el valor esperado no se escribe aquí. */
const registered = (lang: Lang, version: (typeof cvFiles)[number]['version']) => {
  const entry = cvFiles.find((file) => file.lang === lang && file.version === version)
  if (!entry) throw new Error(`El registro no tiene ${version} en ${lang}`)
  return cvUrl(entry)
}

/** Verdadero si `earlier` va antes que `later` en el orden del documento. */
const precedes = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero: descarga del CV', () => {
  describe.each(LANGS)('en %s', (lang) => {
    const t = dictionaries[lang].hero

    it('muestra el botón con el texto del diccionario, cerrado', () => {
      renderHero(lang)

      expect(toggle(lang)).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('link', { name: t.cvInfographic })).not.toBeInTheDocument()
    })

    // El CSS deja ver uno de los dos textos según el ancho; el nombre no cambia.
    it('lleva el texto largo y el corto, y se llama igual con cualquiera de los dos', () => {
      renderHero(lang)

      const texts = [...toggle(lang).querySelectorAll('span')].map((span) => span.textContent)

      expect(texts).toEqual([t.downloadCv, t.downloadCvShort])
      expect(toggle(lang)).toHaveAccessibleName(t.downloadCv)
    })

    it('va en la misma fila que «Ver proyectos», después de él', () => {
      renderHero(lang)

      const row = viewProjects(lang).parentElement

      expect(row).toContainElement(toggle(lang))
      expect(precedes(viewProjects(lang), toggle(lang))).toBe(true)
    })

    it('al abrir ofrece la versión infográfica y la ATS, en ese orden', async () => {
      const user = userEvent.setup()
      renderHero(lang)

      await user.click(toggle(lang))

      const list = document.getElementById(toggle(lang).getAttribute('aria-controls') ?? '')
      if (!list) throw new Error('El botón no controla ninguna lista')
      const names = within(list)
        .getAllByRole('link')
        .map((link) => link.textContent)
      expect(names).toEqual([t.cvInfographic, t.cvAts])
    })

    it('cada versión descarga el archivo de este idioma que dice el registro', async () => {
      const user = userEvent.setup()
      renderHero(lang)

      await user.click(toggle(lang))

      const infographic = screen.getByRole('link', { name: t.cvInfographic })
      const ats = screen.getByRole('link', { name: t.cvAts })
      expect(infographic).toHaveAttribute('href', registered(lang, 'infographic'))
      expect(ats).toHaveAttribute('href', registered(lang, 'ats'))
      for (const link of [infographic, ats]) {
        expect(link.getAttribute('href')).toMatch(new RegExp(`-${lang}\\.pdf$`))
        expect(link).toHaveAttribute('download')
        expect(link).not.toHaveAttribute('target')
      }
    })

    it('no enlaza ningún archivo de otro idioma', () => {
      const { container } = renderHero(lang)

      const pdfs = [...container.querySelectorAll('a[href$=".pdf"]')].map((link) =>
        link.getAttribute('href'),
      )

      expect(pdfs).toHaveLength(2)
      expect(pdfs.every((href) => href?.endsWith(`-${lang}.pdf`))).toBe(true)
    })
  })

  it('Escape cierra el menú y devuelve el foco al botón', async () => {
    const user = userEvent.setup()
    renderHero()
    await user.click(toggle())

    await user.keyboard('{Escape}')

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).toHaveFocus()
  })
})
