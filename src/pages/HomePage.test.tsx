import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { routes } from '@/config/routes'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { HomePage } from '@/pages/HomePage'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const setBrowserLang = (lang: keyof typeof BROWSER_LANGS) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])

const renderHome = ({ withNavbar = false } = {}) =>
  render(
    <MemoryRouter initialEntries={[routes.home]}>
      <LangProvider>
        {withNavbar && <Navbar />}
        <HomePage />
      </LangProvider>
    </MemoryRouter>,
  )

const mainHeadings = () => screen.getAllByRole('heading', { level: 1 })

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('HomePage', () => {
  it.each(['es', 'en'] as const)('en %s, su h1 es el título del diccionario', (lang) => {
    setBrowserLang(lang)

    renderHome()

    expect(
      screen.getByRole('heading', { level: 1, name: dictionaries[lang].hero.heading }),
    ).toBeInTheDocument()
  })

  it.each(['es', 'en'] as const)('en %s, el título es el nombre corto de config', (lang) => {
    expect(dictionaries[lang].hero.heading).toBe(site.shortName)
  })

  it('tiene un solo h1', () => {
    setBrowserLang('es')

    renderHome()

    expect(mainHeadings()).toHaveLength(1)
  })

  it('junto al Navbar sigue habiendo un solo h1: el de la página', () => {
    setBrowserLang('es')

    renderHome({ withNavbar: true })

    expect(mainHeadings()).toHaveLength(1)
    expect(mainHeadings().at(0)).toHaveTextContent(site.shortName)
    expect(screen.getByRole('banner')).not.toContainElement(mainHeadings().at(0) ?? null)
  })

  // El <main> lo pone el layout: si la página trajera otro, habría dos.
  it('no trae su propio landmark main', () => {
    setBrowserLang('es')

    renderHome()

    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })
})
