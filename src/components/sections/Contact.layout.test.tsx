import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Contact } from '@/components/sections/Contact'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { cssMedia, cssRule, readCss } from '@/test/cssRules'

// Contacto en dos paneles, con el formulario a la vista (spec v2.1 §3.5):
// sin «Escríbeme», sin diálogo y sin efecto magnético. En el documento el
// orden es el del teléfono: mensaje, formulario y canales.
const { es } = dictionaries
const css = readCss('src/components/sections/Contact.module.css')

beforeEach(() => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

const renderContact = () => {
  render(
    <LangProvider>
      <Contact />
    </LangProvider>,
  )
  return screen.getByRole('region', { name: es.contact.label })
}

const follows = (earlier: Element, later: Element) =>
  Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

describe('Contact: dos paneles, formulario a la vista', () => {
  it('el formulario está en la escena desde el principio, sin abrir nada', () => {
    const region = renderContact()

    expect(within(region).getByRole('region', { name: es.contact.form.title })).toBeInTheDocument()
    expect(within(region).getByRole('button', { name: new RegExp(es.contact.form.submit) })).toBeInTheDocument()
  })

  it('ya no hay botón «Escríbeme» ni diálogo', () => {
    const region = renderContact()

    expect(within(region).queryByRole('button', { name: /Escríbeme/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(region.querySelector('[aria-haspopup="dialog"]')).toBeNull()
  })

  it('el orden del documento es mensaje, formulario y canales', () => {
    const region = renderContact()
    const title = within(region).getByRole('heading', { level: 2 })
    const form = within(region).getByRole('region', { name: es.contact.form.title })
    const channels = within(region).getByRole('list', { name: es.contact.linksLabel })

    expect(follows(title, form)).toBe(true)
    expect(follows(form, channels)).toBe(true)
  })

  it('el título de la escena es el único h2; el del formulario, un h3', () => {
    const region = renderContact()

    expect(within(region).getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(within(region).getByRole('heading', { level: 3, name: es.contact.form.title })).toBeInTheDocument()
  })
})

describe('Contact: rejilla', () => {
  it('en escritorio, dos columnas de 1,15 fr y 1 fr, separadas por el hueco de los paneles', () => {
    expect(cssRule(css, 'section.contact')).toMatchObject({
      display: 'grid',
      'grid-template-columns': 'minmax(0, 1.15fr) minmax(0, 1fr)',
      'column-gap': 'var(--panel-gap)',
      'background-color': 'var(--color-void)',
    })
  })

  it('el mensaje y los canales en Signal, el formulario en Ink', () => {
    expect(cssRule(css, '.formPanel')).toMatchObject({ 'background-color': 'var(--color-ink)' })
    expect(css).toMatch(/\.message,\s*\.channels\s*\{[^}]*background-color: var\(--color-signal\)/)
  })

  it('hasta 900 px se apilan en una columna, con los canales en Graphite', () => {
    const narrow = cssMedia(css, '(max-width: 900px)')

    expect(cssRule(narrow, 'section.contact')).toMatchObject({
      'grid-template-columns': 'minmax(0, 1fr)',
      'row-gap': 'var(--panel-gap)',
    })
    expect(cssRule(narrow, '.channels')).toMatchObject({ 'background-color': 'var(--color-graphite)' })
  })
})
