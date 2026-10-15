import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { routes, sections } from '@/config/routes'
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

  // «Servicios» va entre «Sobre mí» y Proyectos, que aún no existe.
  it('las secciones van en orden: Hero, Sobre mí y Servicios', () => {
    setBrowserLang('es')

    const { container } = renderHome()

    expect([...container.querySelectorAll('section[id]')].map((section) => section.id)).toEqual([
      sections.hero,
      sections.about,
      sections.services,
    ])
  })

  // La barra y el menú móvil enlazan a #services: la sección tiene que existir.
  it('el enlace «Servicios» de la barra lleva a una sección que existe', () => {
    setBrowserLang('es')

    const { container } = renderHome({ withNavbar: true })
    const link = screen.getByRole('link', { name: dictionaries.es.nav.services })
    const target = link.getAttribute('href')?.split('#')[1] ?? ''

    expect(target).toBe(sections.services)
    expect(container.querySelector(`section#${target}`)).toBeInTheDocument()
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

  it.each(['es', 'en'] as const)('en %s, «Sobre mí» va después del Hero', (lang) => {
    setBrowserLang(lang)

    renderHome()

    const hero = screen.getByRole('region', { name: dictionaries[lang].hero.heading })
    const about = screen.getByRole('region', { name: dictionaries[lang].about.heading })

    expect(hero.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  // El <main> lo pone el layout: si la página trajera otro, habría dos.
  it('no trae su propio landmark main', () => {
    setBrowserLang('es')

    renderHome()

    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })
})
