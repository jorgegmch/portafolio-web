import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS, type Lang } from '@/i18n/types'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderHero = (lang: Lang = 'es') => {
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

// El registro vive en data: aquí se prueba sin ningún archivo.
vi.mock('@/data/cv', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/data/cv')>()),
  cvFiles: [],
  cvFilesFor: () => [],
}))

describe('Hero: descarga del CV, con el registro vacío', () => {
  it.each(LANGS)('en %s, no muestra el botón ni un enlace con ese nombre', (lang) => {
    renderHero(lang)

    const name = dictionaries[lang].hero.downloadCv

    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name })).not.toBeInTheDocument()
    expect(screen.getByRole('region').textContent).not.toContain(name)
    expect(screen.queryByText(dictionaries[lang].hero.downloadCvShort)).not.toBeInTheDocument()
  })

  it('no deja ningún enlace a un PDF', () => {
    const { container } = renderHero()

    expect(container.querySelectorAll('a[href$=".pdf"]')).toHaveLength(0)
    expect(container.querySelectorAll('a[download]')).toHaveLength(0)
  })

  it('no deja ningún elemento vacío en la fila de botones', () => {
    renderHero()

    const row = screen.getByRole('link', { name: dictionaries.es.hero.viewProjects }).parentElement

    expect(row?.children).toHaveLength(1)
  })

  it('el resto del Hero sigue en su sitio', () => {
    renderHero()

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: dictionaries.es.hero.viewProjects })).toBeInTheDocument()
  })
})
