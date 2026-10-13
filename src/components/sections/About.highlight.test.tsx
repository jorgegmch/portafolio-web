import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import styles from '@/components/sections/About.module.css'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const renderAbout = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <MemoryRouter>
      <LangProvider>
        <About />
      </LangProvider>
    </MemoryRouter>,
  )
  return screen.getByRole('region', { name: dictionaries[lang].about.heading })
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

// El interruptor vive en config: aquí se prueba encendido.
vi.mock('@/config/about', () => ({ HIGHLIGHT_PHRASE: true }))

describe('About: frase grande con el resalte encendido', () => {
  it.each(LANGS)('en %s, el tramo final lleva la clase de resalte', (lang) => {
    const region = renderAbout(lang)

    expect(styles.highlight).toBeTruthy()
    expect(within(region).getByText(dictionaries[lang].about.phrase.highlight)).toHaveClass(
      styles.highlight ?? '',
    )
  })

  it('solo el tramo final la lleva', () => {
    const region = renderAbout()

    expect(region.querySelectorAll(`.${styles.highlight}`)).toHaveLength(1)
  })

  it.each(LANGS)('en %s, el texto de la frase no cambia', (lang) => {
    const region = renderAbout(lang)
    const { lead, highlight } = dictionaries[lang].about.phrase

    expect(within(region).getByText(highlight).parentElement?.textContent).toBe(lead + highlight)
  })
})
