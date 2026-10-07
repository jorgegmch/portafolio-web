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

const YEARS_LATER = 15

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

  it('nombra al autor con el nombre de config, seguido del aviso del diccionario', () => {
    renderFooter()

    expect(footer()).toHaveTextContent(`${site.shortName}. ${es.footer.rights}`)
  })

  describe('año', () => {
    it('muestra el año de publicación de config', () => {
      renderFooter()

      expect(footer()).toHaveTextContent(`© ${site.publishedYear} ${site.shortName}`)
    })

    // Es el año de primera publicación: no avanza con el calendario.
    it('aunque el reloj marque un año muy posterior, sigue mostrando el de publicación', () => {
      const yearsLater = site.publishedYear + YEARS_LATER
      vi.useFakeTimers()
      vi.setSystemTime(new Date(yearsLater, 0, 1))

      renderFooter()

      expect(footer()).toHaveTextContent(`© ${site.publishedYear} ${site.shortName}`)
      expect(footer()).not.toHaveTextContent(String(yearsLater))
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

    expect(footer()).toHaveTextContent(`${site.shortName}. ${en.footer.rights}`)
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
