import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { technologies, technologyGroups, technologyLogoUrl } from '@/data/technologies'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

// «Mi stack» al final de Perfil (spec v2.1 §3.2): la lista sale del
// catálogo, en sus cinco grupos, y la cuenta también; nada se escribe a mano.
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
  const t = dictionaries[lang]
  return { t, region: screen.getByRole('region', { name: t.about.label }) }
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Perfil: «Mi stack»', () => {
  it.each(LANGS)('en %s, el título y la cuenta, que sale del catálogo', (lang) => {
    const { t, region } = renderAbout(lang)

    expect(within(region).getByRole('heading', { level: 3, name: t.about.stack.title })).toBeInTheDocument()
    expect(within(region).getByText(t.about.stack.count(technologies.length))).toBeInTheDocument()
    expect(within(region).getByText(t.about.stack.tag)).toBeInTheDocument()
  })

  it.each(LANGS)('en %s, una lista por grupo, en el orden de las columnas', (lang) => {
    const { t, region } = renderAbout(lang)

    for (const group of technologyGroups) {
      const list = within(region).getByRole('list', { name: t.about.stack.groups[group] })
      const expected = technologies
        .filter((technology) => technology.group === group)
        .map(({ id, name }) => t.technologyNames[id] ?? name)
      expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(expected)
    }
  })

  it('están todas las tecnologías del catálogo, cada una con su logo', () => {
    const { t, region } = renderAbout()
    const lists = technologyGroups.map((group) =>
      within(region).getByRole('list', { name: t.about.stack.groups[group] }),
    )

    const sources = lists.flatMap((list) =>
      [...list.querySelectorAll('img')].map((image) => image.getAttribute('src')),
    )
    expect(sources).toEqual(
      technologyGroups.flatMap((group) =>
        technologies.filter((technology) => technology.group === group).map(technologyLogoUrl),
      ),
    )
    expect(sources).toHaveLength(technologies.length)
  })

  it('en español, los agentes de IA se llaman «Agentes de IA»', () => {
    const { region } = renderAbout()

    expect(within(region).getByText('Agentes de IA')).toBeInTheDocument()
  })

  it('va al final de la escena, después del Traductor', () => {
    const { t, region } = renderAbout()
    const title = within(region).getByRole('heading', { level: 3, name: t.about.stack.title })
    const translator = within(region).getByText(t.about.translator.label)

    expect(translator.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
