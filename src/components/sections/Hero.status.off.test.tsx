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

// El interruptor vive en config: aquí se prueba apagado.
vi.mock('@/config/availability', () => ({ AVAILABLE_FOR_FREELANCE: false }))

describe('Hero: estado de disponibilidad, desactivado', () => {
  it.each(LANGS)('en %s, no muestra el texto', (lang) => {
    renderHero(lang)

    expect(screen.queryByText(dictionaries[lang].hero.availability)).not.toBeInTheDocument()
  })

  // Sin estado no queda ni su párrafo ni su punto: solo saludo, rol y presentación.
  it('no deja ningún elemento vacío en su lugar', () => {
    renderHero()

    const region = screen.getByRole('region')

    expect(region.querySelectorAll('p')).toHaveLength(3)
    expect(region.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1)
  })

  it('el resto del Hero sigue en su sitio', () => {
    renderHero()

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: dictionaries.es.hero.viewProjects })).toBeInTheDocument()
  })
})
