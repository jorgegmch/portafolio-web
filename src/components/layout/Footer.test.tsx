import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/layout/Footer'
import { site, socialLinks } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { getEmail, getWhatsappUrl } from '@/lib/assembleContact'

const { es, en } = dictionaries

const setBrowserLangs = (langs: string[]) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)

const renderFooter = () =>
  render(
    <LangProvider>
      <Footer />
    </LangProvider>,
  )

const footer = () => screen.getByRole('contentinfo')

beforeEach(() => {
  setBrowserLangs(['es-CO'])
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Footer', () => {
  it('es el landmark contentinfo', () => {
    renderFooter()

    expect(footer()).toBeInTheDocument()
  })

  it('acredita al autor con el texto del diccionario y el nombre de config', () => {
    renderFooter()

    expect(footer()).toHaveTextContent(`${es.footer.builtBy} ${site.shortName}`)
  })

  describe('año', () => {
    it.each([
      ['el último segundo del año', new Date(2026, 11, 31, 23, 59, 59), '2026'],
      ['el primer segundo del año siguiente', new Date(2027, 0, 1, 0, 0, 0), '2027'],
      ['un 29 de febrero', new Date(2028, 1, 29, 12, 0, 0), '2028'],
    ])('muestra el año en curso en %s', (_name, now, year) => {
      vi.useFakeTimers()
      vi.setSystemTime(now)

      renderFooter()

      expect(footer()).toHaveTextContent(`${site.shortName} ${year}`)
    })

    it('tras el cambio de año, el siguiente render muestra el año nuevo', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 59))
      const { rerender } = renderFooter()
      expect(footer()).toHaveTextContent('2026')

      vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 1))
      rerender(
        <LangProvider>
          <Footer />
        </LangProvider>,
      )

      expect(footer()).toHaveTextContent('2027')
      expect(footer()).not.toHaveTextContent('2026')
    })
  })

  describe('redes', () => {
    it('son una lista con nombre, con una entrada por red de config', () => {
      renderFooter()

      const list = within(footer()).getByRole('list', { name: es.footer.social })
      expect(within(list).getAllByRole('listitem')).toHaveLength(socialLinks.length)
    })

    it.each(socialLinks)('$label abre su URL en una pestaña nueva, y lo avisa', ({ label, url }) => {
      renderFooter()

      const link = screen.getByRole('link', { name: `${label} (${es.common.opensInNewTab})` })
      expect(link).toHaveTextContent(label)
      expect(link).toHaveAttribute('href', url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('ningún enlace externo se queda sin rel', () => {
      renderFooter()

      const links = within(footer()).getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      }
    })
  })

  it('en inglés usa los textos del diccionario inglés', () => {
    setBrowserLangs(['en-US'])
    renderFooter()

    expect(footer()).toHaveTextContent(`${en.footer.builtBy} ${site.shortName}`)
    expect(screen.getByRole('list', { name: en.footer.social })).toBeInTheDocument()
    for (const { label } of socialLinks) {
      expect(
        screen.getByRole('link', { name: `${label} (${en.common.opensInNewTab})` }),
      ).toBeInTheDocument()
    }
  })

  // El valor esperado se obtiene de assembleContact, nunca se escribe aquí.
  it('no lleva correo, teléfono ni ubicación', () => {
    renderFooter()
    const html = footer().outerHTML

    expect(html).not.toContain(getEmail())
    expect(html).not.toContain(getWhatsappUrl().replace('https://wa.me/', ''))
    expect(html).not.toContain('@')
    expect(html).not.toContain('mailto:')
    expect(html).not.toContain('tel:')
    expect(html).not.toContain('wa.me')
    expect(html).not.toContain(site.location)
  })
})
