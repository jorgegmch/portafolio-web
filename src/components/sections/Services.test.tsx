import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Services } from '@/components/sections/Services'
import { sections } from '@/config/routes'
import { projectUrl } from '@/data/projects'
import { services } from '@/data/services'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'
import { getEmail } from '@/lib/assembleContact'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderServices = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <LangProvider>
      <Services />
    </LangProvider>,
  )
  const { services: text, common } = dictionaries[lang]
  const region = screen.getByRole('region', { name: text.label })
  const rows = within(within(region).getByRole('list')).getAllByRole('listitem')
  return { region, rows, text, common }
}

/** El botón de cada fila, en el orden de data/. */
const toggles = (region: HTMLElement) =>
  within(region)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => within(heading).getByRole('button'))

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Services', () => {
  describe('estructura', () => {
    it.each(LANGS)('en %s, es una sección con el nombre de la escena, con el ancla services', (lang) => {
      const { region } = renderServices(lang)

      expect(region.tagName).toBe('SECTION')
      expect(region).toHaveAttribute('id', sections.services)
    })

    it.each(LANGS)('en %s, el único h2 es el título, en sus dos líneas', (lang) => {
      const { region, text } = renderServices(lang)

      expect(within(region).getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(within(region).getByRole('heading', { level: 2 })).toHaveTextContent(
        `${text.title[0]} ${text.title[1]}`,
      )
    })

    // Las cintas cruzadas cuelgan de Proyectos, que se pinta encima.
    it('ya no lleva las tecnologías ni las cintas: solo la lista de servicios', () => {
      const { region } = renderServices()

      expect(within(region).getAllByRole('list')).toHaveLength(1)
      expect(within(region).queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('filas', () => {
    it.each(LANGS)('en %s, son las seis de data/, en orden, cada título un h3 con su botón', (lang) => {
      const { region, rows, text } = renderServices(lang)

      expect(rows).toHaveLength(services.length)
      expect(toggles(region).map((button) => button.textContent)).toEqual(
        services.map(({ id }) => text.items[id].title),
      )
    })

    it('al cargar está abierta solo la primera, con su descripción a la vista', () => {
      const { region, text } = renderServices()
      const [first, ...rest] = toggles(region)
      const [firstService] = services
      if (!first || !firstService) throw new Error('Falta la primera fila')

      expect(first).toHaveAttribute('aria-expanded', 'true')
      rest.forEach((button) => expect(button).toHaveAttribute('aria-expanded', 'false'))
      expect(screen.getByText(text.items[firstService.id].description)).toBeVisible()
    })

    it('cada botón controla el panel de su fila, que se nombra con el título', () => {
      const { region } = renderServices()

      toggles(region).forEach((button) => {
        const panel = document.getElementById(button.getAttribute('aria-controls') ?? '')

        expect(panel).not.toBeNull()
        expect(panel).toHaveAttribute('aria-labelledby', button.id)
      })
    })

    it('abrir otra fila cierra la abierta, y volver a pulsarla la cierra', async () => {
      const user = userEvent.setup()
      const { region } = renderServices()
      const [first, second] = toggles(region)
      if (!first || !second) throw new Error('Faltan filas')

      await user.click(second)
      expect(second).toHaveAttribute('aria-expanded', 'true')
      expect(first).toHaveAttribute('aria-expanded', 'false')

      await user.click(second)
      expect(second).toHaveAttribute('aria-expanded', 'false')
    })

    it.each(['{Enter}', ' '])('con el teclado (%s) se abre y se cierra', async (key) => {
      const user = userEvent.setup()
      const { region } = renderServices()
      const [, second] = toggles(region)
      if (!second) throw new Error('Falta la segunda fila')

      second.focus()
      await user.keyboard(key)
      expect(second).toHaveAttribute('aria-expanded', 'true')

      await user.keyboard(key)
      expect(second).toHaveAttribute('aria-expanded', 'false')
    })

    it('el número y el signo de cada fila son decorativos', () => {
      const { rows } = renderServices()

      rows.forEach((row) => {
        const decorative = row.querySelectorAll('[aria-hidden="true"]')
        expect(decorative.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('enlaces', () => {
    /** Abre cada fila por turno y devuelve su enlace, si lo tiene. */
    const linkOfEachRow = async (lang: keyof typeof BROWSER_LANGS = 'es') => {
      const user = userEvent.setup()
      const rendered = renderServices(lang)
      const links: (HTMLElement | null)[] = []
      for (const [index, button] of toggles(rendered.region).entries()) {
        if (button.getAttribute('aria-expanded') !== 'true') await user.click(button)
        const row = rendered.rows[index]
        links.push(row ? within(row).queryByRole('link') : null)
      }
      return { ...rendered, links }
    }

    it.each(LANGS)('en %s, las cinco con repo lo abren en una pestaña nueva, y lo avisan', async (lang) => {
      const { links, text, common } = await linkOfEachRow(lang)

      services.forEach(({ id, project }, index) => {
        const link = links[index]
        if (!project) return

        expect(link).toHaveAttribute('href', projectUrl(project))
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(link).toHaveAccessibleName(
          `${text.items[id].title}: ${text.relatedProject} (${common.opensInNewTab})`,
        )
        expect(link).toHaveTextContent(text.relatedProject)
      })
    })

    it('la de comunicación, la sexta, no lleva enlace', async () => {
      const { links } = await linkOfEachRow()

      expect(services[5]?.project).toBeNull()
      expect(links[5]).toBeNull()
      expect(links.filter(Boolean)).toHaveLength(5)
    })
  })

  it.each(LANGS)('en %s, no lleva el correo ni enlaces de contacto', (lang) => {
    const { region } = renderServices(lang)
    const email = getEmail()

    expect(email).toContain('@')
    expect(region.innerHTML).not.toContain(email)
    expect(region.innerHTML).not.toMatch(/mailto:|wa\.me/)
  })
})
