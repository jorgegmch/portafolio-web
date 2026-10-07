import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/config/routes'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { CertificationsPage } from '@/pages/CertificationsPage'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const setBrowserLang = (lang: keyof typeof BROWSER_LANGS) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={[routes.certifications]}>
      <LangProvider>
        <CertificationsPage />
      </LangProvider>
    </MemoryRouter>,
  )

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('CertificationsPage', () => {
  it.each(['es', 'en'] as const)('en %s, su h1 es el título del diccionario', (lang) => {
    setBrowserLang(lang)

    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: dictionaries[lang].certifications.heading }),
    ).toBeInTheDocument()
  })

  it('el título cambia con el idioma', () => {
    expect(dictionaries.es.certifications.heading).not.toBe(
      dictionaries.en.certifications.heading,
    )
  })

  it('tiene un solo h1', () => {
    setBrowserLang('es')

    renderPage()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  // El <main> lo pone el layout: si la página trajera otro, habría dos.
  it('no trae su propio landmark main', () => {
    setBrowserLang('es')

    renderPage()

    expect(screen.queryByRole('main')).not.toBeInTheDocument()
  })
})
