import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Contact } from '@/components/sections/Contact'
import { socialLinks } from '@/config/site'
import { socialMarks } from '@/data/socialMarks'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

// Canales de Contacto con icono o logo (spec v2.1 §3.5): «Copiar correo»
// con un sobre, y WhatsApp, GitHub y LinkedIn con sus logos oficiales de
// public/social (registrados en docs/LOGOS.md). Todos decorativos: el nombre
// del botón o del enlace no cambia.
const { es } = dictionaries

beforeEach(() => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

const renderChannels = () => {
  render(
    <LangProvider>
      <Contact />
    </LangProvider>,
  )
  return within(screen.getByRole('list', { name: es.contact.linksLabel }))
}

/** El primer hijo de un control: su icono o su logo. */
const leading = (control: HTMLElement) => control.firstElementChild

describe('Contact: canales con icono o logo', () => {
  it('el rótulo de los canales va antes de las píldoras', () => {
    renderChannels()
    const label = screen.getByText(es.contact.channelsLabel)
    const list = screen.getByRole('list', { name: es.contact.linksLabel })

    expect(label.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('«Copiar correo» lleva delante un sobre dibujado, decorativo', () => {
    const channels = renderChannels()
    const button = channels.getByRole('button', { name: es.contact.copyEmail })

    expect(leading(button)?.tagName.toLowerCase()).toBe('svg')
    expect(leading(button)).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveTextContent(es.contact.copyEmail)
  })

  it('WhatsApp lleva delante su logo oficial, decorativo y con sus dimensiones', () => {
    const channels = renderChannels()
    const button = channels.getByRole('button', {
      name: `${es.contact.whatsapp} (${es.common.opensInNewTab})`,
    })

    expect(leading(button)).toHaveAttribute('src', socialMarks.whatsapp.src)
    expect(leading(button)).toHaveAttribute('alt', '')
    expect(leading(button)).toHaveAttribute('width', String(socialMarks.whatsapp.width))
    expect(leading(button)).toHaveAttribute('height', String(socialMarks.whatsapp.height))
  })

  it('GitHub y LinkedIn llevan delante su logo oficial, decorativo', () => {
    const channels = renderChannels()

    socialLinks.forEach(({ id, label }) => {
      const link = channels.getByRole('link', { name: `${label} (${es.common.opensInNewTab})` })

      expect(leading(link)).toHaveAttribute('src', socialMarks[id].src)
      expect(leading(link)).toHaveAttribute('alt', '')
    })
  })

  it('ninguno añade texto al nombre accesible', () => {
    const channels = renderChannels()

    expect(channels.queryAllByRole('img')).toHaveLength(0)
  })
})
