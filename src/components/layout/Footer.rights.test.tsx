import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/layout/Footer'
import styles from '@/components/layout/Footer.module.css'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderFooter = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <LangProvider>
      <Footer />
    </LangProvider>,
  )
  return screen.getByRole('contentinfo')
}

const notice = (footer: HTMLElement) => footer.querySelector('p')

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Footer: aviso de derechos', () => {
  it.each(['es', 'en'] as const)(
    'en %s, la frase es: símbolo, año, nombre con punto y aviso del diccionario',
    (lang) => {
      const footer = renderFooter(lang)

      expect(notice(footer)?.textContent).toBe(
        `© ${site.publishedYear} ${site.shortName}. ${dictionaries[lang].footer.rights}`,
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

  it('el nombre conserva su estilo propio', () => {
    renderFooter()

    expect(screen.getByText(site.shortName)).toHaveClass(styles.name ?? '')
  })

  it('es una sola frase, y el aviso aparece una sola vez', () => {
    const footer = renderFooter()

    expect(footer.querySelectorAll('p')).toHaveLength(1)
    expect(footer.textContent.split(dictionaries.es.footer.rights)).toHaveLength(2)
  })
})
