import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { heroCodeWindow, heroStack } from '@/data/heroSides'
import { technologies, technologyLogoUrl, technologyName } from '@/data/technologies'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

// Paneles laterales del Hero (spec v2.1 §3.1): señales de programador,
// decorativas. A la izquierda, una ventana de código con un archivo real;
// a la derecha, «// stack principal» y seis fichas con logo.
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

const sides = (container: HTMLElement) => [...container.querySelectorAll('[data-hero-side]')]

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero: paneles laterales', () => {
  it('son dos y los dos quedan fuera del árbol accesible', () => {
    const { container } = renderHero()

    expect(sides(container)).toHaveLength(2)
    sides(container).forEach((side) => expect(side).toHaveAttribute('aria-hidden', 'true'))
  })

  it('no tienen nada que reciba el foco', () => {
    const { container } = renderHero()

    sides(container).forEach((side) => {
      expect(side.querySelector('a, button, input, [tabindex]')).toBeNull()
    })
  })

  describe('ventana de código', () => {
    it('lleva el nombre del archivo y sus líneas, en orden', () => {
      const { container } = renderHero()
      const window = container.querySelector('[data-hero-side="code"]')

      expect(window).toHaveTextContent(heroCodeWindow.file)
      const lines = [...(window?.querySelectorAll('pre > span') ?? [])].map((line) => line.textContent)
      expect(lines).toEqual(
        heroCodeWindow.lines.map((line) => line.map((segment) => segment.text).join('')),
      )
    })

    it('cada tramo resaltado lleva su clase de voz', () => {
      const { container } = renderHero()
      const window = container.querySelector('[data-hero-side="code"]')

      const kinds = [...(window?.querySelectorAll('[data-kind]') ?? [])].map((segment) => [
        segment.textContent,
        segment.getAttribute('data-kind'),
      ])
      expect(kinds).toContainEqual(['@RestController', 'keyword'])
      expect(kinds).toContainEqual(['"/auth"', 'string'])
      expect(kinds).toContainEqual(['    // …', 'comment'])
    })
  })

  describe('fichas «// stack principal»', () => {
    it.each(LANGS)('en %s, el rótulo es «// %s»', (lang) => {
      const { container } = renderHero(lang)
      const tiles = container.querySelector('[data-hero-side="stack"]')

      expect(tiles?.firstElementChild).toHaveTextContent(`// ${dictionaries[lang].hero.mainStack}`)
    })

    it('son seis, en el orden de la spec, con el nombre de cada tecnología', () => {
      const { container } = renderHero()
      const items = [...container.querySelectorAll('[data-hero-side="stack"] li')]

      expect(items.map((item) => item.textContent)).toEqual(heroStack.map(technologyName))
    })

    it('cada una lleva su logo del catálogo, como imagen decorativa', () => {
      const { container } = renderHero()
      const images = [...container.querySelectorAll('[data-hero-side="stack"] img')]

      expect(images.map((image) => image.getAttribute('src'))).toEqual(
        heroStack.map((id) => {
          const technology = technologies.find((entry) => entry.id === id)
          return technology ? technologyLogoUrl(technology) : ''
        }),
      )
      images.forEach((image) => expect(image).toHaveAttribute('alt', ''))
    })
  })
})
