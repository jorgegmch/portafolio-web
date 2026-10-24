import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Projects } from '@/components/sections/Projects'
import { allProjectsUrl } from '@/data/projects'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { cssRule, readCss } from '@/test/cssRules'

// «Ver todos en GitHub» lleva el logo de GitHub: el oficial de public/social,
// registrado en docs/LOGOS.md. Es decorativo: el texto ya dice GitHub.

const { es } = dictionaries
const css = readCss('src/components/sections/Projects.module.css')

/** Declaraciones de la regla con exactamente ese selector (escapado entero). */
const rule = (source: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const body = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? ''
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

const renderProjects = () => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  render(
    <MemoryRouter>
      <LangProvider>
        <Projects />
      </LangProvider>
    </MemoryRouter>,
  )
  return screen.getByRole('link', { name: `${es.projects.viewAll} (${es.common.opensInNewTab})` })
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Proyectos: «Ver todos en GitHub»', () => {
  it('lleva el logo oficial de GitHub, decorativo y con sus dimensiones', () => {
    const link = renderProjects()

    const mark = link.querySelector('img')
    expect(mark).not.toBeNull()
    expect(mark?.getAttribute('src')).toMatch(/\/social\/github\.svg$/)
    expect(mark).toHaveAttribute('alt', '')
    expect(mark).toHaveAttribute('width', '98')
    expect(mark).toHaveAttribute('height', '96')
  })

  it('el enlace sigue igual: su destino, su nombre y que se abre aparte', () => {
    const link = renderProjects()

    expect(link).toHaveAttribute('href', allProjectsUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(link).getByText(es.projects.viewAll)).toBeInTheDocument()
  })

  describe('estilos', () => {
    it('sin borde, y con el alto táctil de zona de clic', () => {
      expect(cssRule(css, '.viewAll')).toMatchObject({ 'min-height': 'var(--touch-target)' })
      expect(cssRule(css, '.viewAll')).not.toHaveProperty('border')
    })

    it('se subraya con el puntero encima y con el foco del teclado', () => {
      expect(rule(css, '.viewAll:hover,\n.viewAll:focus-visible')).toMatchObject({
        'text-decoration': 'underline',
        'text-underline-offset': 'var(--underline-offset)',
      })
    })

    it('el logo tiene un tamaño de token y no se altera (sin filtros ni opacidad)', () => {
      expect(cssRule(css, '.mark')).toMatchObject({
        width: 'var(--github-mark-size)',
        height: 'var(--github-mark-size)',
      })
      expect(cssRule(css, '.mark')).not.toHaveProperty('filter')
      expect(cssRule(css, '.mark')).not.toHaveProperty('opacity')
    })
  })
})
