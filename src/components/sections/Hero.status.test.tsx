import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
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

const status = (lang: keyof typeof BROWSER_LANGS = 'es') =>
  screen.getByText(dictionaries[lang].hero.availability)

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
  it('el punto es un adorno: oculto para lectores de pantalla y sin texto', () => {
    renderHero()

    const hidden = status().querySelectorAll('[aria-hidden="true"]')

    expect(hidden).toHaveLength(1)
    expect(hidden[0]).toBeEmptyDOMElement()
    expect(status().children).toHaveLength(1)
    expect(status().textContent).toBe(dictionaries.es.hero.availability)
  })

  it('queda fuera de la capa decorativa', () => {
    renderHero()

    expect(status().closest('[aria-hidden="true"]')).toBeNull()
  })
})
