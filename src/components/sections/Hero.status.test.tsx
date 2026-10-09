import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import styles from '@/components/sections/Hero.module.css'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderHero = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  return render(
    <MemoryRouter>
      <LangProvider>
        <Hero />
      </LangProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

/** Verdadero si `earlier` va antes que `later` en el orden del documento. */
const precedes = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

/** Párrafo del estado: el que contiene el texto largo del diccionario. */
const status = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  const paragraph = screen.getByText(dictionaries[lang].hero.availability).closest('p')
  if (!paragraph) throw new Error('El estado no está en un párrafo')
  return paragraph
}

const dots = (lang: keyof typeof BROWSER_LANGS = 'es') =>
  status(lang).querySelectorAll('[aria-hidden="true"]')

describe('Hero: estado de disponibilidad, activado', () => {
  // Las mayúsculas son cosa del CSS: al DOM llega el texto del diccionario.
  it.each(LANGS)('en %s, muestra el texto del diccionario', (lang) => {
    renderHero(lang)

    expect(status(lang)).toBeInTheDocument()
  })

  it('es un párrafo, no un título ni un control', () => {
    renderHero()

    expect(status().tagName).toBe('P')
    expect(screen.getAllByRole('heading')).toHaveLength(1)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('va después del botón', () => {
    renderHero()

    const link = screen.getByRole('link', { name: dictionaries.es.hero.viewProjects })

    expect(precedes(link, status())).toBe(true)
  })

  // El estado lo dice el texto; el punto verde solo lo acompaña.
  it.each(LANGS)('en %s, el punto es un adorno: oculto para lectores de pantalla y sin texto', (lang) => {
    renderHero(lang)

    expect(dots(lang)).toHaveLength(1)
    expect(dots(lang)[0]).toBeEmptyDOMElement()
    expect(status(lang).firstElementChild).toBe(dots(lang)[0])
  })

  it('queda fuera de la capa decorativa', () => {
    renderHero()

    expect(status().closest('[aria-hidden="true"]')).toBeNull()
  })

  // El texto largo no cabe en una línea en los teléfonos más estrechos: en
  // español van los dos y el CSS deja ver uno según el ancho.
  describe('en español, con texto largo y corto', () => {
    const { availability, availabilityShort = '' } = dictionaries.es.hero

    it('lleva los dos textos del diccionario, cada uno en su elemento', () => {
      renderHero('es')

      expect(availabilityShort).not.toBe('')
      expect(screen.getByText(availability).tagName).toBe('SPAN')
      expect(screen.getByText(availabilityShort).tagName).toBe('SPAN')
      expect(status('es')).toContainElement(screen.getByText(availabilityShort))
      expect(status('es').children).toHaveLength(3)
      expect(status('es').textContent).toBe(`${availability}${availabilityShort}`)
    })

    it('cada texto lleva la clase que lo oculta en su tramo', () => {
      renderHero('es')

      expect(styles.statusLong).toBeTruthy()
      expect(styles.statusShort).toBeTruthy()
      expect(styles.statusLong).not.toBe(styles.statusShort)
      expect(screen.getByText(availability)).toHaveClass(styles.statusLong ?? '', { exact: true })
      expect(screen.getByText(availabilityShort)).toHaveClass(styles.statusShort ?? '', {
        exact: true,
      })
    })

    // Se ocultan con CSS, no con aria-hidden: display: none ya los saca del
    // árbol de accesibilidad, y así nunca quedan los dos ocultos.
    it('ninguno de los dos textos lleva aria-hidden ni hidden', () => {
      renderHero('es')

      for (const text of [availability, availabilityShort]) {
        expect(screen.getByText(text)).not.toHaveAttribute('aria-hidden')
        expect(screen.getByText(text)).not.toHaveAttribute('hidden')
      }
    })
  })

  describe('en inglés, con un solo texto', () => {
    it('no hay texto corto en el diccionario', () => {
      expect(dictionaries.en.hero.availabilityShort).toBeUndefined()
    })

    it('el párrafo solo lleva el punto y el texto, sin elementos de más', () => {
      renderHero('en')

      expect(status('en').children).toHaveLength(1)
      expect(status('en').textContent).toBe(dictionaries.en.hero.availability)
      expect(screen.queryByText(dictionaries.es.hero.availabilityShort ?? '')).not.toBeInTheDocument()
    })
  })
})
