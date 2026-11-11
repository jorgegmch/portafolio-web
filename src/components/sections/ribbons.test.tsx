import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { codeFragments } from '@/data/codeRibbon'
import { technologies } from '@/data/technologies'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

// Las cintas de la página (spec §3.1, §3.3 y §4.4): cada lista se oye una
// sola vez, aunque en pantalla vaya dos veces para cerrar el bucle.

const { es } = dictionaries

const renderInPage = (node: ReactNode) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  render(
    <MemoryRouter>
      <LangProvider>{node}</LangProvider>
    </MemoryRouter>,
  )
}

/** Textos de los elementos de una lista, en orden. */
const itemsOf = (list: HTMLElement) => within(list).getAllByRole('listitem').map((item) => item.textContent)

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('cintas de la página', () => {
  // Con el nombre del idioma del sitio: en español, «Agentes de IA».
  it('la del Hero lista una vez las tecnologías del catálogo, en su orden', () => {
    renderInPage(<Hero />)

    const lists = screen.getAllByRole('list', { name: es.hero.stackLabel })

    expect(lists).toHaveLength(1)
    expect(itemsOf(lists[0] as HTMLElement)).toEqual(
      technologies.map(({ id, name }) => es.technologyNames[id] ?? name),
    )
    expect(itemsOf(lists[0] as HTMLElement)).toContain('Agentes de IA')
  })

  it('las cruzadas de Proyectos listan una vez los fragmentos y los verbos', () => {
    renderInPage(<Projects />)

    const code = screen.getAllByRole('list', { name: es.services.ribbons.codeLabel })
    const verbs = screen.getAllByRole('list', { name: es.services.ribbons.verbsLabel })

    expect(code).toHaveLength(1)
    expect(verbs).toHaveLength(1)
    expect(itemsOf(code[0] as HTMLElement)).toEqual([...codeFragments])
    expect(itemsOf(verbs[0] as HTMLElement)).toEqual([...es.services.ribbons.verbs])
  })
})
