import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import styles from '@/components/sections/About.module.css'
import { routes, sections } from '@/config/routes'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'
import { getEmail } from '@/lib/assembleContact'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

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
  return { region, ...view }
}

/** Verdadero si `earlier` va antes que `later` en el orden del documento. */
const precedes = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

/** El párrafo de la frase grande y su tramo final, el resaltable. */
const phraseOf = (region: HTMLElement, lang: keyof typeof BROWSER_LANGS) => {
  const tail = within(region).getByText(dictionaries[lang].about.phrase.highlight)
  const phrase = tail.parentElement
  if (!phrase) throw new Error('El tramo resaltable no tiene párrafo')
  return { phrase, tail }
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('About', () => {
  describe('estructura', () => {
    it.each(LANGS)('en %s, es una sección con el nombre de su título', (lang) => {
      const { region } = renderAbout(lang)

      expect(region.tagName).toBe('SECTION')
    })

    // El Navbar enlaza a este id.
    it('lleva el id del ancla de la sección', () => {
      const { region } = renderAbout()

      expect(region).toHaveAttribute('id', sections.about)
    })

    it.each(LANGS)('en %s, su título es un h2 con el texto del diccionario', (lang) => {
      const { region } = renderAbout(lang)

      expect(
        within(region).getByRole('heading', { level: 2, name: dictionaries[lang].about.heading }),
      ).toBeInTheDocument()
    })

    // El único h1 de la página es el del Hero.
    it('no lleva h1 ni ningún otro título', () => {
      const { region } = renderAbout()

      expect(within(region).queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
      expect(within(region).getAllByRole('heading')).toHaveLength(1)
    })
  })

  describe('frase grande', () => {
    it.each(LANGS)('en %s, es un párrafo, no un título', (lang) => {
      const { region } = renderAbout(lang)

      expect(phraseOf(region, lang).phrase.tagName).toBe('P')
    })

    it.each(LANGS)('en %s, su texto es el inicio más el tramo final', (lang) => {
      const { region } = renderAbout(lang)
      const { lead, highlight } = dictionaries[lang].about.phrase

      expect(phraseOf(region, lang).phrase.textContent).toBe(lead + highlight)
    })

    it.each(LANGS)('en %s, el tramo final va en su propio span', (lang) => {
      const { region } = renderAbout(lang)
      const { tail } = phraseOf(region, lang)

      expect(tail.tagName).toBe('SPAN')
      expect(tail.textContent).toBe(dictionaries[lang].about.phrase.highlight)
    })

    // Por defecto la frase va entera en blanco: el interruptor está apagado.
    it('con el interruptor apagado, el tramo final no lleva la clase de resalte', () => {
      const { region } = renderAbout()

      expect(styles.highlight).toBeTruthy()
      expect(phraseOf(region, 'es').tail).not.toHaveClass(styles.highlight ?? '')
      expect(region.querySelector(`.${styles.highlight}`)).not.toBeInTheDocument()
    })

    it('va después del título', () => {
      const { region } = renderAbout()

      expect(precedes(within(region).getByRole('heading'), phraseOf(region, 'es').phrase)).toBe(
        true,
      )
    })
  })

  describe('descripción', () => {
    it.each(LANGS)('en %s, son los cuatro párrafos del diccionario, en orden', (lang) => {
      const { region } = renderAbout(lang)
      const { bio } = dictionaries[lang].about
      const paragraphs = bio.map((text) => within(region).getByText(text))

      expect(paragraphs).toHaveLength(4)
      paragraphs.forEach((paragraph) => expect(paragraph.tagName).toBe('P'))
      paragraphs.slice(1).forEach((paragraph, index) => {
        expect(precedes(paragraphs[index] as Element, paragraph)).toBe(true)
      })
    })

    it('los cuatro son hermanos, sin nada entre ellos', () => {
      const { region } = renderAbout()
      const [first] = dictionaries.es.about.bio.map((text) => within(region).getByText(text))

      expect(
        [...(first?.parentElement?.children ?? [])].map((child) => child.textContent),
      ).toEqual([...dictionaries.es.about.bio])
    })

    it('va después de la frase grande', () => {
      const { region } = renderAbout()
      const [firstParagraph = ''] = dictionaries.es.about.bio

      expect(
        precedes(phraseOf(region, 'es').phrase, within(region).getByText(firstParagraph)),
      ).toBe(true)
    })

    // Sin botón «leer más»: el texto va completo.
    it('no lleva ningún botón', () => {
      const { region } = renderAbout()

      expect(within(region).queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('enlace a certificaciones', () => {
    it.each(LANGS)('en %s, lleva a la ruta de certificaciones', (lang) => {
      const { region } = renderAbout(lang)

      expect(
        within(region).getByRole('link', { name: dictionaries[lang].about.viewCertifications }),
      ).toHaveAttribute('href', routes.certifications)
    })

    it('es el único enlace y abre en la misma pestaña', () => {
      const { region } = renderAbout()

      expect(within(region).getAllByRole('link')).toHaveLength(1)
      expect(within(region).getByRole('link')).not.toHaveAttribute('target')
    })

    it('va al final, después de la descripción', () => {
      const { region } = renderAbout()
      const lastParagraph = dictionaries.es.about.bio.at(-1) ?? ''

      expect(
        precedes(within(region).getByText(lastParagraph), within(region).getByRole('link')),
      ).toBe(true)
    })
  })

  // Esta sección no muestra datos de contacto.
  it.each(LANGS)('en %s, no lleva el correo ni enlaces de contacto', (lang) => {
    const { region } = renderAbout(lang)
    const email = getEmail()

    expect(email).toContain('@')
    expect(region.textContent).not.toContain('@')
    expect(region.innerHTML).not.toContain(email)
    expect(region.innerHTML).not.toMatch(/mailto:|wa\.me/)
  })
})
