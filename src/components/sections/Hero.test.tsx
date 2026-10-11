import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import styles from '@/components/sections/Hero.module.css'
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

  describe('rol', () => {
    const CURSOR = styles.cursor ?? ''
    if (!CURSOR) throw new Error('Hero.module.css no define la clase .cursor')

    /** Frase fija con los tres textos: lo único del rol que no es adorno. */
    const phrase = (lang: keyof typeof BROWSER_LANGS = 'es') =>
      screen.getByText(dictionaries[lang].hero.roles.join(', '))
    const role = (lang: keyof typeof BROWSER_LANGS = 'es') => {
      const paragraph = phrase(lang).parentElement
      if (!paragraph) throw new Error('La frase del rol no tiene párrafo')
      return paragraph
    }
    /** Capa animada: los textos apilados, cada uno con su cursor. */
    const stack = (lang: keyof typeof BROWSER_LANGS = 'es') => {
      const layer = role(lang).querySelector('[aria-hidden="true"]')
      if (!layer) throw new Error('El rol no tiene capa decorativa')
      return layer
    }

    // El primero es el que se ve al llegar. En inglés es el rol de config, el
    // mismo del título: ese no se traduce.
    it.each(LANGS)('en %s, muestra primero el primer texto del diccionario', (lang) => {
      renderHero(lang)

      const [first] = dictionaries[lang].hero.roles

      expect(role(lang)).toBeInTheDocument()
      expect(stack(lang).firstElementChild?.firstChild?.textContent).toBe(first)
      expect(dictionaries.en.hero.roles.at(0)).toBe(site.role)
    })

    it('es un párrafo, no un título', () => {
      renderHero()

      expect(role().tagName).toBe('P')
      expect(screen.getAllByRole('heading')).toHaveLength(1)
    })

    it('va entre el nombre y la presentación', () => {
      renderHero()

      expect(precedes(heading(), role())).toBe(true)
      expect(precedes(role(), screen.getByText(dictionaries.es.hero.intro))).toBe(true)
    })

    // El cursor es un adorno: una barra vertical que un lector de pantalla no
    // anuncia. Cada texto lleva el suyo, y todos van dentro de la única capa
    // oculta; fuera de ella, el párrafo solo lleva la frase con los textos.
    it.each(LANGS)(
      'en %s, lleva un cursor decorativo por texto, oculto para lectores de pantalla',
      (lang) => {
        renderHero(lang)

        const { roles } = dictionaries[lang].hero
        const hidden = role(lang).querySelectorAll('[aria-hidden="true"]')
        const cursors = role(lang).querySelectorAll(`.${CURSOR}`)

        expect(hidden).toHaveLength(1)
        expect(cursors).toHaveLength(roles.length)
        for (const cursor of cursors) {
          expect(cursor.textContent).toBe('|')
          expect(stack(lang).contains(cursor)).toBe(true)
        }
        expect(role(lang).children).toHaveLength(2)
        expect(stack(lang).textContent).toBe(roles.map((text) => `${text}|`).join(''))
        expect(phrase(lang).textContent).not.toContain('|')
        expect(role(lang).textContent).toBe(`${roles.join(', ')}${stack(lang).textContent}`)
      },
    )

    it.each(LANGS)('en %s, cada cursor va pegado a su texto, sin espacio en el texto', (lang) => {
      renderHero(lang)

      const { roles } = dictionaries[lang].hero
      const items = [...stack(lang).children]

      expect(items).toHaveLength(roles.length)
      items.forEach((item, index) => {
        expect(item.children).toHaveLength(1)
        expect(item.lastChild).toBe(item.querySelector(`.${CURSOR}`))
        expect(item.firstChild?.textContent).toBe(roles[index])
      })
    })
  })

  describe('botón «Ver proyectos»', () => {
    const link = (lang: keyof typeof BROWSER_LANGS = 'es') =>
      screen.getByRole('link', { name: dictionaries[lang].hero.viewProjects })

    // Las mayúsculas son cosa del CSS: el nombre accesible es el del diccionario.
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

    it('queda fuera de la capa decorativa', () => {
      renderHero()

      expect(link().closest('[aria-hidden="true"]')).toBeNull()
    })

    // El Hero se compone con dos controles: este enlace y el botón de
    // «Descargar CV», con su menú cerrado. Los demás enlaces y botones son
    // los de la fila de redes. Sin PDFs en el registro queda solo el enlace:
    // lo comprueba Hero.cv.empty.test.tsx.
    it('comparte su grupo solo con la descarga del CV', () => {
      renderHero()

      const group = link().parentElement
      const social = screen.getByRole('list', { name: dictionaries.es.hero.socialLabel })
      const outside = <T extends Element>(elements: T[]) =>
        elements.filter((element) => !social.contains(element))
      const download = screen.getByRole('button', { name: dictionaries.es.hero.downloadCv })

      expect(group?.children).toHaveLength(2)
      expect(group).toContainElement(download)
      expect(outside(screen.getAllByRole('link'))).toEqual([link()])
      expect(outside(screen.queryAllByRole('button'))).toEqual([download])
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
