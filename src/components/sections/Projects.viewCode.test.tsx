import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Projects } from '@/components/sections/Projects'
import { featuredProjects, githubMark, projectUrl } from '@/data/projects'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { cssRule, readCss } from '@/test/cssRules'

// «Ver código ↗» de cada tarjeta lleva delante el logo de GitHub (spec v2.1
// §3.4): el oficial de public/social, decorativo. Las etiquetas de stack
// siguen solo con texto.
const { es } = dictionaries

const renderProjects = () => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  render(
    <MemoryRouter>
      <LangProvider>
        <Projects />
      </LangProvider>
    </MemoryRouter>,
  )
}

const codeLinks = () =>
  screen.getAllByRole('link', { name: new RegExp(`^${es.projects.viewCode}: `) })

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Proyectos: «Ver código»', () => {
  it('hay uno por tarjeta, cada uno a su repo', () => {
    renderProjects()

    expect(codeLinks().map((link) => link.getAttribute('href'))).toEqual(
      featuredProjects.map(({ id }) => projectUrl(id)),
    )
  })

  it('cada uno lleva el logo oficial de GitHub delante del texto, decorativo y con sus dimensiones', () => {
    renderProjects()

    for (const link of codeLinks()) {
      const mark = link.firstElementChild
      expect(mark?.tagName).toBe('IMG')
      expect(mark).toHaveAttribute('src', githubMark.src)
      expect(mark).toHaveAttribute('alt', '')
      expect(mark).toHaveAttribute('width', String(githubMark.width))
      expect(mark).toHaveAttribute('height', String(githubMark.height))
    }
  })

  it('el nombre accesible no cambia: el logo no añade texto', () => {
    renderProjects()

    expect(codeLinks()[0]).toHaveAccessibleName(
      `${es.projects.viewCode}: ${featuredProjects[0]?.title ?? ''} (${es.common.opensInNewTab})`,
    )
  })

  it('las etiquetas de stack siguen sin logos', () => {
    renderProjects()

    for (const list of screen.getAllByRole('list', { name: es.projects.stackLabel })) {
      expect(list.querySelector('img')).toBeNull()
    }
  })

  it('el logo mide lo mismo que el de «Ver todos en GitHub»', () => {
    const css = readCss('src/components/ui/ProjectCard.module.css')

    expect(cssRule(css, '.mark')).toMatchObject({
      width: 'var(--github-mark-size)',
      height: 'var(--github-mark-size)',
    })
  })
})
