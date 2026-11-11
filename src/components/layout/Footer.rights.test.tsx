import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/layout/Footer'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderFooter = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <MemoryRouter>
      <LangProvider>
        <Footer />
      </LangProvider>
    </MemoryRouter>,
  )
  return screen.getByRole('contentinfo')
}

/** El aviso es el último párrafo del pie, el de la línea final. */
const notice = (footer: HTMLElement) => [...footer.querySelectorAll('p')].at(-1) ?? null

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Footer: aviso de derechos', () => {
  it.each(['es', 'en'] as const)(
    'en %s, la frase es: símbolo, año, nombre con punto y aviso del diccionario, con punto final',
    (lang) => {
      const footer = renderFooter(lang)

      expect(notice(footer)?.textContent).toBe(
        `© ${site.publishedYear} ${site.shortName}. ${dictionaries[lang].footer.rights}.`,
      )
    },
  )

  it('el aviso cambia con el idioma', () => {
    expect(dictionaries.es.footer.rights).not.toBe(dictionaries.en.footer.rights)
  })

  // Texto real, no un adorno de CSS: se puede copiar y lo lee el lector de pantalla.
  it('el símbolo © es texto del documento, y va al principio', () => {
    const footer = renderFooter()

    expect(notice(footer)?.textContent).toMatch(/^© /)
  })

  it('el punto va pegado al nombre', () => {
    const footer = renderFooter()

    expect(notice(footer)?.textContent).toContain(`${site.shortName}. `)
  })

  it('es una sola frase, y el aviso aparece una sola vez', () => {
    const footer = renderFooter()

    // El pie tiene ahora otro párrafo, el rótulo «Sígueme en redes»: el aviso
    // sigue siendo uno solo, entero en su párrafo.
    const withNotice = [...footer.querySelectorAll('p')].filter((paragraph) =>
      paragraph.textContent.includes(dictionaries.es.footer.rights),
    )
    expect(withNotice).toHaveLength(1)
    expect(withNotice[0]?.textContent).toMatch(/^©.*\.$/)
    expect(footer.textContent.split(dictionaries.es.footer.rights)).toHaveLength(2)
  })
})
