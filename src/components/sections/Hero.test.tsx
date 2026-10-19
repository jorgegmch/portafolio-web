import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'
import { splitName } from '@/lib/splitName'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const setBrowserLang = (lang: keyof typeof BROWSER_LANGS) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])

const renderHero = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  setBrowserLang(lang)
  return render(
    <MemoryRouter>
      <LangProvider>
        <Hero />
      </LangProvider>
    </MemoryRouter>,
  )
}

const heading = () => screen.getByRole('heading', { level: 1 })

/** Verdadero si `earlier` va antes que `later` en el orden del documento. */
const precedes = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero', () => {
  describe('textos', () => {
    it.each(LANGS)('en %s, el h1 es el título del diccionario', (lang) => {
      renderHero(lang)

      expect(
        screen.getByRole('heading', { level: 1, name: dictionaries[lang].hero.heading }),
      ).toBeInTheDocument()
    })

    it.each(LANGS)('en %s, muestra la presentación', (lang) => {
      renderHero(lang)

      expect(screen.getByText(dictionaries[lang].hero.intro)).toBeInTheDocument()
    })

    it('la presentación es un párrafo, y el h1 el único título', () => {
      renderHero()

      expect(screen.getByText(dictionaries.es.hero.intro).tagName).toBe('P')
      expect(screen.getAllByRole('heading')).toHaveLength(1)
    })
  })

  describe('botón «Ver proyectos»', () => {
    const link = (lang: keyof typeof BROWSER_LANGS = 'es') =>
      screen.getByRole('link', { name: dictionaries[lang].hero.viewProjects })

    // La flecha es decorativa: el nombre accesible es el del diccionario.
    it.each(LANGS)('en %s, es un enlace con el texto del diccionario', (lang) => {
      renderHero(lang)

      expect(link(lang).tagName).toBe('A')
      expect(link(lang)).toHaveTextContent(new RegExp(`^${dictionaries[lang].hero.viewProjects}$`))
    })

    it('lleva a la sección de proyectos de la home', () => {
      renderHero()

      expect(link()).toHaveAttribute('href', `${routes.home}#${sections.projects}`)
    })

    it('se abre en la misma pestaña', () => {
      renderHero()

      expect(link()).not.toHaveAttribute('target')
    })

    it('va después de la presentación', () => {
      renderHero()

      expect(precedes(screen.getByText(dictionaries.es.hero.intro), link())).toBe(true)
    })

    it('queda fuera de lo decorativo', () => {
      renderHero()

      expect(link().closest('[aria-hidden="true"]')).toBeNull()
    })

    // El Hero se compone con dos controles: este enlace y el botón de
    // «Descargar CV», con su menú cerrado. Sin PDFs en el registro queda solo
    // el enlace: lo comprueba Hero.cv.empty.test.tsx.
    it('comparte su grupo solo con la descarga del CV', () => {
      renderHero()

      const group = link().parentElement
      const download = screen.getByRole('button', { name: dictionaries.es.hero.downloadCv })

      expect(group?.children).toHaveLength(2)
      expect(group).toContainElement(download)
      expect(screen.getAllByRole('link')).toEqual([link()])
      expect(screen.queryAllByRole('button')).toEqual([download])
    })
  })

  describe('orden', () => {
    it('el nombre va antes de la presentación', () => {
      renderHero()

      expect(precedes(heading(), screen.getByText(dictionaries.es.hero.intro))).toBe(true)
    })
  })

  describe('nombre en dos partes', () => {
    const { first, last } = splitName(site.shortName)

    it('el apellido va en su propio elemento, dentro del h1', () => {
      renderHero()

      const lastName = within(heading()).getByText(last)

      expect(lastName).not.toBe(heading())
      expect(lastName).toHaveTextContent(new RegExp(`^${last}$`))
    })

    it('el nombre queda fuera del elemento del apellido', () => {
      renderHero()

      expect(within(heading()).getByText(last)).not.toHaveTextContent(first)
      expect(heading()).toHaveTextContent(first)
    })

    // Sin el espacio entre las dos partes, un lector de pantalla las leería pegadas.
    it('el texto del h1 sigue siendo el nombre completo, con su espacio', () => {
      renderHero()

      expect(heading().textContent).toBe(site.shortName)
    })
  })

  describe('sección', () => {
    it('es una región con el nombre del título', () => {
      renderHero()

      const region = screen.getByRole('region', { name: dictionaries.es.hero.heading })

      expect(region.tagName).toBe('SECTION')
      expect(region).toContainElement(heading())
    })

    it('lleva el id del ancla de config', () => {
      renderHero()

      expect(screen.getByRole('region')).toHaveAttribute('id', sections.hero)
    })
  })
})
