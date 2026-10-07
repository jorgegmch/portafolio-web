import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { sections } from '@/config/routes'
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
    <LangProvider>
      <Hero />
    </LangProvider>,
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

    // Las mayúsculas sostenidas son cosa del CSS: al DOM llega el texto normal.
    it.each(LANGS)('en %s, muestra el saludo tal como está en el diccionario', (lang) => {
      renderHero(lang)

      expect(screen.getByText(dictionaries[lang].hero.greeting)).toBeInTheDocument()
    })

    it.each(LANGS)('en %s, muestra la presentación', (lang) => {
      renderHero(lang)

      expect(screen.getByText(dictionaries[lang].hero.intro)).toBeInTheDocument()
    })

    it('el saludo y la presentación son párrafos, no títulos', () => {
      renderHero()

      expect(screen.getByText(dictionaries.es.hero.greeting).tagName).toBe('P')
      expect(screen.getByText(dictionaries.es.hero.intro).tagName).toBe('P')
      expect(screen.getAllByRole('heading')).toHaveLength(1)
    })
  })

  describe('orden', () => {
    it('el saludo va antes del nombre y la presentación después', () => {
      renderHero()

      const greeting = screen.getByText(dictionaries.es.hero.greeting)
      const intro = screen.getByText(dictionaries.es.hero.intro)

      expect(precedes(greeting, heading())).toBe(true)
      expect(precedes(heading(), intro)).toBe(true)
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
