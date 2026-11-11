import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Projects } from '@/components/sections/Projects'
import { featuredProjects, projectUrl } from '@/data/projects'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { readCss } from '@/test/cssRules'

// «Ver código ↗» de cada tarjeta es solo texto, sin logo, en escritorio y en
// móvil (spec v2.1 §3.4): el logo de GitHub queda únicamente en «Ver todos en
// GitHub». Su nombre accesible nombra el proyecto y GitHub.
const { es, en } = dictionaries

const renderProjects = (language: string) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue([language])
  render(
    <MemoryRouter>
      <LangProvider>
        <Projects />
      </LangProvider>
    </MemoryRouter>,
  )
}

const codeLinks = (dictionary: typeof es) =>
  screen.getAllByRole('link', { name: new RegExp(`^${dictionary.projects.viewCode} `) })

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Proyectos: «Ver código»', () => {
  it('hay uno por tarjeta, cada uno a su repo', () => {
    renderProjects('es-CO')

    expect(codeLinks(es).map((link) => link.getAttribute('href'))).toEqual(
      featuredProjects.map(({ id }) => projectUrl(id)),
    )
  })

  it('ninguno lleva logo: solo el texto y la flecha', () => {
    renderProjects('es-CO')

    for (const link of codeLinks(es)) {
      expect(link.querySelector('img')).toBeNull()
      expect(link).toHaveTextContent(new RegExp(`^${es.projects.viewCode}$`))
    }
  })

  it('el nombre accesible dice el proyecto, GitHub y que se abre en una pestaña nueva', () => {
    renderProjects('es-CO')

    expect(codeLinks(es).map((link) => link.getAttribute('aria-label'))).toEqual(
      featuredProjects.map(
        ({ title }) => `Ver código de ${title} en GitHub (${es.common.opensInNewTab})`,
      ),
    )
  })

  it('en inglés, el nombre accesible sigue el mismo patrón', () => {
    renderProjects('en-US')

    expect(codeLinks(en)[0]).toHaveAccessibleName(
      `View code for ${featuredProjects[0]?.title ?? ''} on GitHub (${en.common.opensInNewTab})`,
    )
  })

  it('las etiquetas de stack siguen sin logos', () => {
    renderProjects('es-CO')

    for (const list of screen.getAllByRole('list', { name: es.projects.stackLabel })) {
      expect(list.querySelector('img')).toBeNull()
    }
  })

  it('la hoja de la tarjeta ya no tiene regla para el logo', () => {
    const css = readCss('src/components/ui/ProjectCard.module.css')

    expect(css).not.toMatch(/\.mark\b/)
  })
})
