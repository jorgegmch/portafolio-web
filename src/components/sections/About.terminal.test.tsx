import { act, cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { developer } from '@/config/developer'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'
import { getEmail, getWhatsappUrl } from '@/lib/assembleContact'

// Fecha de nacimiento ficticia: el test no usa la de config/.
const BIRTH = { year: 2000, month: 3, day: 15 }
vi.mock('@/lib/birthDate', () => ({ getBirthDate: () => BIRTH }))

/** Formas en que la fecha ficticia podría colarse en el DOM. */
const BIRTH_TRACES = ['2000', '03-15', '15-03', '15/03', '03/15', '3/15', '15/3'] as const

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

/** Reloj fijo: mediodía del día indicado (el mes va de 1 a 12). */
const setToday = (year: number, month: number, day: number) =>
  vi.setSystemTime(new Date(year, month - 1, day, 12, 0))

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
  const panel = () => within(region).getByRole('figure', { name: dictionaries[lang].about.terminalLabel })
  /** Valor que la terminal muestra para un campo. */
  const valueOf = (field: string) => {
    const term = within(panel())
      .getAllByRole('term')
      .find((candidate) => candidate.textContent === field)
    return term?.nextElementSibling?.textContent
  }
  return { region, panel, valueOf, ...view }
}

beforeEach(() => {
  vi.useFakeTimers()
  setToday(2026, 6, 1)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('About: terminal del desarrollador', () => {
  it.each(LANGS)('en %s, el panel lleva el nombre accesible del diccionario', (lang) => {
    const { panel } = renderAbout(lang)

    expect(panel()).toBeInTheDocument()
  })

  it('muestra el comando de config', () => {
    const { panel } = renderAbout()

    expect(within(panel()).getByText(developer.command)).toBeInTheDocument()
  })

  it('muestra los campos de config, en su orden', () => {
    const { panel } = renderAbout()

    expect(
      within(panel())
        .getAllByRole('term')
        .map((term) => term.textContent),
    ).toEqual([...developer.fields])
  })

  it('el nombre, la ubicación, el rol y la pasión son los de config', () => {
    const { valueOf } = renderAbout()

    expect(valueOf('name')).toBe(site.legalName)
    expect(valueOf('location')).toBe(site.locationShort)
    expect(valueOf('role')).toBe(site.role)
    expect(valueOf('passion')).toBe(developer.values.passion)
  })

  // No se traduce: es la salida de un programa.
  it('la salida es idéntica en español y en inglés', () => {
    const outputs = LANGS.map((lang) => {
      const output = renderAbout(lang).panel().textContent
      cleanup()
      return output
    })

    expect(outputs[0]).toBeTruthy()
    expect(outputs[1]).toBe(outputs[0])
  })

  describe('edad', () => {
    it('es la edad en la fecha del reloj, y solo el número', () => {
      const { valueOf } = renderAbout()

      expect(valueOf('age')).toBe('26')
    })

    it('la víspera del cumpleaños todavía no suma el año', () => {
      setToday(2026, 3, 14)
      const { valueOf } = renderAbout()

      expect(valueOf('age')).toBe('25')
    })

    it('el día siguiente al cumpleaños ya lo suma', () => {
      setToday(2026, 3, 16)
      const { valueOf } = renderAbout()

      expect(valueOf('age')).toBe('26')
    })

    // En vivo: con la sección ya en pantalla, cambia al cambiar el día.
    it('cambia con la sección montada cuando el reloj pasa del cumpleaños', () => {
      setToday(2026, 3, 14)
      const { valueOf } = renderAbout()
      expect(valueOf('age')).toBe('25')

      setToday(2026, 3, 16)
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
      })

      expect(valueOf('age')).toBe('26')
    })
  })

  describe('datos personales', () => {
    // Al DOM solo llega la edad, nunca la fecha ni nada que la delate.
    it.each(LANGS)('en %s, la fecha de nacimiento no aparece en ningún lugar del DOM', (lang) => {
      renderAbout(lang)

      BIRTH_TRACES.forEach((trace) => expect(document.body.innerHTML).not.toContain(trace))
    })

    it('tampoco aparece después de recalcular la edad', () => {
      setToday(2026, 3, 14)
      renderAbout()
      setToday(2026, 3, 16)
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'))
      })

      BIRTH_TRACES.forEach((trace) => expect(document.body.innerHTML).not.toContain(trace))
    })

    it('de la edad solo hay cifras en su valor: ningún otro campo lleva números', () => {
      const { panel } = renderAbout()
      const withDigits = within(panel())
        .getAllByRole('definition')
        .filter((definition) => /\d/.test(definition.textContent ?? ''))

      expect(withDigits).toHaveLength(1)
      expect(withDigits[0]?.textContent).toMatch(/^\d{1,3}$/)
    })

    it.each(LANGS)('en %s, no lleva el correo ni el teléfono', (lang) => {
      const { region } = renderAbout(lang)
      const email = getEmail()
      const phone = getWhatsappUrl().replace(/\D/g, '')

      expect(email).toContain('@')
      expect(phone.length).toBeGreaterThan(6)
      expect(region.innerHTML).not.toContain(email)
      expect(region.innerHTML).not.toContain(email.split('@')[0])
      expect(region.innerHTML).not.toContain(phone)
      expect(region.textContent).not.toContain('@')
    })
  })

  describe('lugar en la sección', () => {
    it('va después de la descripción y antes del enlace a certificaciones', () => {
      const { region, panel } = renderAbout()
      const lastParagraph = within(region).getByText(dictionaries.es.about.bio.at(-1) ?? '')
      const follows = (earlier: Element, later: Element) =>
        Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

      expect(follows(lastParagraph, panel())).toBe(true)
      expect(follows(panel(), within(region).getByRole('link'))).toBe(true)
    })

    // Comparten la rejilla de dos columnas: una celda cada uno.
    it('comparte contenedor con la descripción, como segunda celda', () => {
      const { region, panel } = renderAbout()
      const bio = within(region).getByText(dictionaries.es.about.bio[0] ?? '').parentElement
      const cells = [...(bio?.parentElement?.children ?? [])]

      expect(cells).toHaveLength(2)
      expect(cells[0]).toBe(bio)
      expect(cells[1]).toContainElement(panel())
    })

    it('es el único panel de la sección', () => {
      const { region } = renderAbout()

      expect(within(region).getAllByRole('figure')).toHaveLength(1)
    })
  })
})
