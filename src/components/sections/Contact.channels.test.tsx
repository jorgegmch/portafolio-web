import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Contact } from '@/components/sections/Contact'
import { socialLinks } from '@/config/site'
import { mediaQueries } from '@/config/media'
import { socialMarks, socialMarksBlack } from '@/data/socialMarks'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { cssMedia, cssRule, readCss } from '@/test/cssRules'

// Canales de Contacto con icono o logo (spec v2.1 §3.5): «Copiar correo»
// con un sobre, y WhatsApp, GitHub y LinkedIn con sus logos oficiales de
// public/social (registrados en docs/LOGOS.md), en el color del texto de su
// panel: la variante negra de un solo color sobre Signal y, con la escena
// apilada (hasta 900 px), la blanca sobre Graphite. Todos decorativos: el
// nombre del botón o del enlace no cambia.
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

type MarkId = keyof typeof socialMarksBlack

/** Comprueba el logo de un canal: <picture> con la negra y la blanca apilada. */
const expectChannelMark = (control: HTMLElement, id: MarkId) => {
  const picture = leading(control)
  expect(picture?.tagName.toLowerCase()).toBe('picture')

  const img = picture?.querySelector('img')
  expect(img).toHaveAttribute('src', socialMarksBlack[id].src)
  expect(img).toHaveAttribute('alt', '')
  expect(img).toHaveAttribute('width', String(socialMarksBlack[id].width))
  expect(img).toHaveAttribute('height', String(socialMarksBlack[id].height))

  const sources = picture?.querySelectorAll('source') ?? []
  expect(sources).toHaveLength(1)
  expect(sources[0]).toHaveAttribute('media', mediaQueries.stackedContact)
  expect(sources[0]).toHaveAttribute('srcset', socialMarks[id].src)
}

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

    expectChannelMark(button, 'whatsapp')
  })

  it('GitHub y LinkedIn llevan delante su logo oficial, decorativo', () => {
    const channels = renderChannels()

    socialLinks.forEach(({ id, label }) => {
      const link = channels.getByRole('link', { name: `${label} (${es.common.opensInNewTab})` })

      expectChannelMark(link, id)
    })
  })

  it('por defecto, ningún logo de canal es blanco: sobre Signal van en negro', () => {
    const channels = renderChannels()
    const sources = channels
      .getAllByRole('listitem')
      .flatMap((item) => [...item.querySelectorAll('img')].map((img) => img.getAttribute('src')))

    expect(sources).toEqual(
      expect.arrayContaining([
        socialMarksBlack.whatsapp.src,
        socialMarksBlack.github.src,
        socialMarksBlack.linkedin.src,
      ]),
    )
    Object.values(socialMarks).forEach(({ src }) => expect(sources).not.toContain(src))
  })

  it('la blanca entra justo donde los canales pasan a Graphite, con texto Bone', () => {
    const stacked = cssMedia(readCss('src/components/sections/Contact.module.css'), mediaQueries.stackedContact)

    expect(mediaQueries.stackedContact).toBe('(max-width: 900px)')
    expect(cssRule(stacked, '.channels')).toMatchObject({
      'background-color': 'var(--color-graphite)',
      color: 'var(--color-bone)',
    })
  })

  it('las variantes negras miden lo mismo que las blancas: mismo lienzo oficial', () => {
    ;(['github', 'linkedin', 'whatsapp'] as const).forEach((id) => {
      expect(socialMarksBlack[id].width).toBe(socialMarks[id].width)
      expect(socialMarksBlack[id].height).toBe(socialMarks[id].height)
      expect(socialMarksBlack[id].src).toMatch(new RegExp(`/social/${id}-black\\.(svg|png)$`))
    })
  })

  it('ninguno añade texto al nombre accesible', () => {
    const channels = renderChannels()

    expect(channels.queryAllByRole('img')).toHaveLength(0)
  })
})
