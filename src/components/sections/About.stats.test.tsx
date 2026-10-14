import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { site } from '@/config/site'
import { builtProjects, featuredProjects, projects } from '@/data/projects'
import { technologies } from '@/data/technologies'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

// La edad de la terminal no es asunto de este archivo: fecha ficticia.
vi.mock('@/lib/birthDate', () => ({ getBirthDate: () => ({ year: 2000, month: 3, day: 15 }) }))

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const [START_YEAR = 0, START_MONTH = 0] = site.codingSince.split('-').map(Number)

/** Reloj fijo: el día 10 del mes que queda a `months` meses del inicio. */
const setMonthsSinceStart = (months: number) =>
  vi.setSystemTime(new Date(START_YEAR, START_MONTH - 1 + months, 10, 12, 0))

/** La caja de una tarjeta: el único hijo de su <li>, que es el que aparece. */
const boxOf = (item: Element) => {
  const [box, ...rest] = item.children
  if (!box || rest.length > 0) throw new Error('Cada tarjeta lleva una sola caja')
  return box
}

/** Lo que se lee de una tarjeta, en orden; lo decorativo (aria-hidden) no cuenta. */
const readable = (item: Element) =>
  [...boxOf(item).children].filter((child) => child.getAttribute('aria-hidden') !== 'true')

const renderAbout = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  const view = render(
    <MemoryRouter>
      <LangProvider>
        <About />
      </LangProvider>
    </MemoryRouter>,
  )
  const region = screen.getByRole('region', { name: dictionaries[lang].about.heading })
  const cards = () => within(region).getAllByRole('listitem')
  /** Textos de una tarjeta, en el orden en que se leen: la cifra y la etiqueta. */
  const card = (index: number) => {
    const item = cards()[index]
    return item ? readable(item).map((child) => child.textContent) : []
  }
  return { region, cards, card, ...view }
}

beforeEach(() => {
  vi.useFakeTimers()
  setMonthsSinceStart(14)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('About: tarjetas', () => {
  describe('estructura', () => {
    it('son exactamente tres, en una lista', () => {
      const { region, cards } = renderAbout()

      expect(within(region).getAllByRole('list')).toHaveLength(1)
      expect(cards()).toHaveLength(3)
    })

    // Dentro de la misma tarjeta y en este orden: un lector de pantalla los lee juntos.
    it.each(LANGS)('en %s, cada una lleva su cifra y, después, su etiqueta', (lang) => {
      const { cards } = renderAbout(lang)

      cards().forEach((item) => {
        const [value, label, ...rest] = readable(item).map((child) => child.textContent)

        expect(rest).toEqual([])
        expect(value).toMatch(/^\+?\d+\+?$/)
        expect(label).toMatch(/^[^\d+]+$/)
      })
    })

    it('van en este orden: tiempo, proyectos y tecnologías', () => {
      const { card } = renderAbout()
      const { stats } = dictionaries.es.about

      expect(card(0)[1]).toBe(stats.codingTime.years(1))
      expect(card(1)[1]).toBe(stats.projects(builtProjects.length))
      expect(card(2)[1]).toBe(stats.technologies(technologies.length))
    })

    // Debajo de las dos columnas, a todo el ancho: lo último de la sección.
    it('van después de la terminal y del enlace a certificaciones', () => {
      const { region, cards } = renderAbout()
      const follows = (earlier: Element, later: Element) =>
        Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)
      const [first] = cards()

      expect(follows(within(region).getByRole('figure'), first as Element)).toBe(true)
      expect(follows(within(region).getByRole('link'), first as Element)).toBe(true)
    })

    it('su lista es lo último de la sección, fuera de las columnas', () => {
      const { region } = renderAbout()
      const list = within(region).getByRole('list')

      expect(list.parentElement).toBe(region)
      expect(region.lastElementChild).toBe(list)
    })

    it('no son enlaces ni botones', () => {
      const { cards } = renderAbout()

      cards().forEach((item) => {
        expect(item.querySelectorAll('a, button, [tabindex]')).toHaveLength(0)
      })
    })
  })

  describe('tiempo programando', () => {
    const MONTHS = { es: 'Meses programando', en: 'Months of coding' } as const
    const MONTH = { es: 'Mes programando', en: 'Month of coding' } as const
    const YEAR = { es: 'Año programando', en: 'Year of coding' } as const
    const YEARS = { es: 'Años programando', en: 'Years of coding' } as const

    describe('por debajo de 12 meses, en meses y sin «+»', () => {
      it.each(LANGS)('en %s, el mes del inicio dice 0 y la etiqueta en plural', (lang) => {
        setMonthsSinceStart(0)
        const { card } = renderAbout(lang)

        expect(card(0)).toEqual(['0', MONTHS[lang]])
      })

      it.each(LANGS)('en %s, al mes dice 1 y la etiqueta en singular', (lang) => {
        setMonthsSinceStart(1)
        const { card } = renderAbout(lang)

        expect(card(0)).toEqual(['1', MONTH[lang]])
      })

      it.each(LANGS)('en %s, a los 11 meses sigue en meses', (lang) => {
        setMonthsSinceStart(11)
        const { card } = renderAbout(lang)

        expect(card(0)).toEqual(['11', MONTHS[lang]])
      })
    })

    describe('desde 12 meses, en años', () => {
      it.each(LANGS)('en %s, a los 12 meses es 1 año justo, sin «+» y en singular', (lang) => {
        setMonthsSinceStart(12)
        const { card } = renderAbout(lang)

        expect(card(0)).toEqual(['1', YEAR[lang]])
      })

      it.each(LANGS)('en %s, a los 24 meses son 2 años justos, sin «+»', (lang) => {
        setMonthsSinceStart(24)
        const { card } = renderAbout(lang)

        expect(card(0)).toEqual(['2', YEARS[lang]])
      })
    })

    // Con meses de sobra la cifra lleva «+»: delante en español, detrás en inglés.
    describe('con meses de sobra, el «+» va en la cifra', () => {
      it.each([
        [13, '+1', YEAR.es],
        [14, '+1', YEAR.es],
        [23, '+1', YEAR.es],
        [25, '+2', YEARS.es],
        [47, '+3', YEARS.es],
      ])('en español, a los %i meses dice «%s»', (months, value, label) => {
        setMonthsSinceStart(months)
        const { card } = renderAbout('es')

        expect(card(0)).toEqual([value, label])
      })

      it.each([
        [13, '1+', YEAR.en],
        [14, '1+', YEAR.en],
        [23, '1+', YEAR.en],
        [25, '2+', YEARS.en],
        [47, '3+', YEARS.en],
      ])('en inglés, a los %i meses dice «%s»', (months, value, label) => {
        setMonthsSinceStart(months)
        const { card } = renderAbout('en')

        expect(card(0)).toEqual([value, label])
      })
    })

    // El inicio no registra el día: el primero y el último del mes dan lo mismo.
    describe('no depende del día del mes', () => {
      it.each([
        ['el primer día, a las 00:05', 1, 0, 5],
        ['el día 28, a las 23:55', 28, 23, 55],
      ])('a los 14 meses, %s', (_, day, hours, minutes) => {
        vi.setSystemTime(new Date(START_YEAR, START_MONTH - 1 + 14, day, hours, minutes))
        const { card } = renderAbout()

        expect(card(0)).toEqual(['+1', YEAR.es])
      })

      it('el primer día del mes 12 ya es 1 año justo', () => {
        vi.setSystemTime(new Date(START_YEAR, START_MONTH - 1 + 12, 1, 0, 5))
        const { card } = renderAbout()

        expect(card(0)).toEqual(['1', YEAR.es])
      })

      it('el último día del mes 11 todavía son 11 meses', () => {
        vi.setSystemTime(new Date(START_YEAR, START_MONTH - 1 + 11, 28, 23, 55))
        const { card } = renderAbout()

        expect(card(0)).toEqual(['11', MONTHS.es])
      })
    })
  })

  describe('proyectos y tecnologías', () => {
    // Hasta 20 la cifra es exacta: con los datos de hoy no lleva «+».
    it.each(LANGS)('en %s, los proyectos son los construidos de data/', (lang) => {
      const { card } = renderAbout(lang)

      expect(builtProjects.length).toBeGreaterThan(1)
      expect(builtProjects.length).toBeLessThanOrEqual(20)
      expect(card(1)).toEqual([
        String(builtProjects.length),
        dictionaries[lang].about.stats.projects(builtProjects.length),
      ])
    })

    it('no cuenta todos los proyectos ni solo los destacados', () => {
      const { card } = renderAbout()

      expect(card(1)[0]).not.toBe(String(projects.length))
      expect(card(1)[0]).not.toBe(String(featuredProjects.length))
    })

    it.each(LANGS)('en %s, las tecnologías son las del catálogo de data/', (lang) => {
      const { card } = renderAbout(lang)

      expect(technologies.length).toBeGreaterThan(1)
      expect(card(2)).toEqual([
        String(technologies.length),
        dictionaries[lang].about.stats.technologies(technologies.length),
      ])
    })

    it('con más de uno, las etiquetas van en plural', () => {
      const { card } = renderAbout()

      expect(card(1)[1]).toBe('Proyectos construidos')
      expect(card(2)[1]).toBe('Tecnologías')
    })
  })

  // Sin conteo ascendente: la cifra final está desde el primer render.
  describe('sin conteo animado', () => {
    it('las cifras no cambian con el paso del tiempo', () => {
      const { card } = renderAbout()
      const initial = [card(0), card(1), card(2)]

      act(() => {
        vi.advanceTimersByTime(10_000)
      })

      expect([card(0), card(1), card(2)]).toEqual(initial)
      expect(initial.map(([value]) => value)).toEqual([
        '+1',
        String(builtProjects.length),
        String(technologies.length),
      ])
    })
  })
})
