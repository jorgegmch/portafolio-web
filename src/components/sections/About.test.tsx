import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { sections } from '@/config/routes'
import { certifications } from '@/data/certifications'
import { education } from '@/data/education'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'
import { getEmail } from '@/lib/assembleContact'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderAbout = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <MemoryRouter>
      <LangProvider>
        <About />
      </LangProvider>
    </MemoryRouter>,
  )
  const region = screen.getByRole('region', { name: dictionaries[lang].about.label })
  return { region, t: dictionaries[lang].about }
}

/** Verdadero si `earlier` va antes que `later` en el orden del documento. */
const precedes = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('About (Perfil)', () => {
  describe('estructura', () => {
    it.each(LANGS)('en %s, es una sección con el nombre de la escena, con el ancla about', (lang) => {
      const { region } = renderAbout(lang)

      expect(region.tagName).toBe('SECTION')
      expect(region).toHaveAttribute('id', sections.about)
    })

    // La frase es el único h2: sus dos líneas, la rellena y la de contorno.
    it.each(LANGS)('en %s, el h2 es la frase grande, en sus dos líneas', (lang) => {
      const { region, t } = renderAbout(lang)
      const heading = within(region).getByRole('heading', { level: 2 })

      expect(within(region).getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(heading).toHaveTextContent(`${t.phrase.filled} ${t.phrase.outline}`)
      expect(within(heading).getByText(t.phrase.filled)).not.toBe(within(heading).getByText(t.phrase.outline))
    })

    it.each(LANGS)('en %s, la bio son dos párrafos, en orden, después de la frase', (lang) => {
      const { region, t } = renderAbout(lang)
      const paragraphs = t.bio.map((paragraph) => within(region).getByText(paragraph))
      const [first, second] = paragraphs
      if (!first || !second) throw new Error('Faltan los párrafos de la bio')

      expect(paragraphs.map(({ tagName }) => tagName)).toEqual(['P', 'P'])
      expect(precedes(within(region).getByRole('heading', { level: 2 }), first)).toBe(true)
      expect(precedes(first, second)).toBe(true)
    })

    it('no lleva el mapa, la terminal ni la edad', () => {
      const { region } = renderAbout()

      expect(within(region).queryByRole('figure')).not.toBeInTheDocument()
      expect(region.querySelector('svg[viewBox^="0 0 1000"]')).toBeNull()
      expect(region.textContent).not.toMatch(/\bage\b|edad/i)
    })
  })

  describe('formación', () => {
    it.each(LANGS)('en %s, va bajo su título, con una fila por entrada del registro', (lang) => {
      const { region, t } = renderAbout(lang)
      const heading = within(region).getByRole('heading', { level: 3, name: t.educationLabel })
      const list = heading.nextElementSibling

      expect(list?.tagName).toBe('UL')
      expect(list?.children).toHaveLength(education.length)
    })

    // El título oficial va en su idioma original; en inglés, con la traducción.
    it.each(LANGS)('en %s, cada fila lleva el título oficial y la entidad', (lang) => {
      const { region, t } = renderAbout(lang)

      education.forEach((id) => {
        const record = certifications.find((certification) => certification.id === id)
        const translation = t.educationTranslation[id]

        expect(record).toBeDefined()
        expect(within(region).getByText(record?.entity ?? '')).toBeInTheDocument()
        expect(
          within(region).getByText(translation ? `${record?.title} (${translation})` : (record?.title ?? '')),
        ).toBeInTheDocument()
      })
    })

    // Dato respaldado por el autor: el nombre exacto del programa.
    it('la primera fila es el técnico de Campuslands, con su nombre exacto', () => {
      const { region } = renderAbout()

      expect(within(region).getByText('Técnico Laboral en Programación de Software')).toBeInTheDocument()
      expect(within(region).getByText('Campuslands')).toBeInTheDocument()
    })
  })

  it.each(LANGS)('en %s, no lleva el correo ni enlaces de contacto', (lang) => {
    const { region } = renderAbout(lang)
    const email = getEmail()

    expect(email).toContain('@')
    expect(region.textContent).not.toContain('@')
    expect(region.innerHTML).not.toContain(email)
    expect(region.innerHTML).not.toMatch(/mailto:|wa\.me/)
  })
})
