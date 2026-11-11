import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/layout/Footer'
import { site, socialLinks } from '@/config/site'
import { socialMarks } from '@/data/socialMarks'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { getEmail, getWhatsappUrl } from '@/lib/assembleContact'

const { es, en } = dictionaries

const setBrowserLangs = (langs: string[]) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)

const renderFooter = () =>
  render(
    <MemoryRouter>
      <LangProvider>
        <Footer />
      </LangProvider>
    </MemoryRouter>,
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

  // Créditos (spec v2.1 §3.6): quién, con qué y desde dónde. Las redes ya
  // no son un crédito: van en su llamado.
  it('los créditos son tres: diseño y código, con qué y desde dónde', () => {
    renderFooter()

    const terms = within(footer())
      .getAllByRole('term')
      .map((term) => term.textContent)
    expect(terms).toEqual([es.footer.credits.design, es.footer.credits.builtWith, es.footer.credits.from])
  })

  // La marca como SVG: «JORGEGMCH» ocupa exactamente el ancho de la rejilla
  // (textLength), decorativa.
  it('la marca es un SVG decorativo con la palabra estirada al ancho de la rejilla', () => {
    renderFooter()

    const brand = footer().querySelector('svg[data-footer-brand]')
    const text = brand?.querySelector('text')
    expect(brand).toHaveAttribute('aria-hidden', 'true')
    expect(brand).toHaveAttribute('viewBox', '0 0 1288 316')
    expect(text).toHaveAttribute('textLength', '1288')
    expect(text).toHaveAttribute('lengthAdjust', 'spacingAndGlyphs')
    expect(text).toHaveAttribute('y', '312')
    expect(text?.textContent).toBe(site.handle)
  })

  describe('redes', () => {
    it('son una lista con el nombre de su llamado, «Sígueme en redes», con una entrada por red de config', () => {
      renderFooter()

      const list = within(footer()).getByRole('list', { name: es.footer.follow })
      expect(within(list).getAllByRole('listitem')).toHaveLength(socialLinks.length)
      expect(within(footer()).getByText(es.footer.follow)).toBeInTheDocument()
    })

    it.each(socialLinks)('$label lleva delante su logo oficial, decorativo', ({ id, label }) => {
      renderFooter()

      const link = screen.getByRole('link', { name: `${label} (${es.common.opensInNewTab})` })
      expect(link.firstElementChild).toHaveAttribute('src', socialMarks[id].src)
      expect(link.firstElementChild).toHaveAttribute('alt', '')
    })

    it.each(socialLinks)('$label abre su URL en una pestaña nueva, y lo avisa', ({ label, url }) => {
      renderFooter()

      const link = screen.getByRole('link', { name: `${label} (${es.common.opensInNewTab})` })
      expect(link).toHaveTextContent(label)
      expect(link).toHaveAttribute('href', url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    // Todo enlace a otro sitio se abre aparte y lleva rel; «Volver arriba» es
    // de la propia página.
    it('ningún enlace externo se queda sin rel', () => {
      renderFooter()

      const external = within(footer())
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.startsWith('http'))
      expect(external).toHaveLength(socialLinks.length)
      for (const link of external) {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      }
    })
  })

  it('en inglés usa los textos del diccionario inglés', () => {
    setBrowserLangs(['en-US'])
    renderFooter()

    expect(footer()).toHaveTextContent(`${site.shortName}. ${en.footer.rights}`)
    expect(screen.getByRole('list', { name: en.footer.follow })).toBeInTheDocument()
    for (const { label } of socialLinks) {
      expect(
        screen.getByRole('link', { name: `${label} (${en.common.opensInNewTab})` }),
      ).toBeInTheDocument()
    }
  })

  // El valor esperado se obtiene de assembleContact, nunca se escribe aquí.
  it('no lleva correo ni teléfono', () => {
    renderFooter()
    const html = footer().outerHTML

    expect(html).not.toContain(getEmail())
    expect(html).not.toContain(getWhatsappUrl().replace('https://wa.me/', ''))
    expect(html).not.toContain('@')
    expect(html).not.toContain('mailto:')
    expect(html).not.toContain('tel:')
    expect(html).not.toContain('wa.me')
  })
})
