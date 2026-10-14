import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { worldMap } from '@/data/worldMap'
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
  const region = screen.getByRole('region', { name: dictionaries[lang].about.heading })
  const panel = within(region).getByRole('figure', { name: dictionaries[lang].about.terminalLabel })
  // El mapa se reconoce por su cuadro: los iconos de las tarjetas son de 24.
  const map = region.querySelector(`svg[viewBox="0 0 ${worldMap.width} ${worldMap.height}"]`)
  const textColumn = within(region).getByText(dictionaries[lang].about.bio[0] ?? '').parentElement
    ?.parentElement
  return { region, panel, map, textColumn }
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('About: mapa', () => {
  it('hay un mapa, y solo uno', () => {
    const { region } = renderAbout()

    expect(region.querySelectorAll(`svg[viewBox="0 0 ${worldMap.width} ${worldMap.height}"]`)).toHaveLength(1)
  })

  describe('lugar', () => {
    // Celda derecha: la terminal arriba y el mapa debajo. Cada uno va en el
    // envoltorio que lo hace aparecer, y los dos envoltorios son hermanos.
    it('va en la celda de la terminal, justo después de ella', () => {
      const { panel, map } = renderAbout()
      const panelWrapper = panel.parentElement
      const mapWrapper = map?.parentElement

      expect(mapWrapper?.parentElement).toBe(panelWrapper?.parentElement)
      expect(panelWrapper?.nextElementSibling).toBe(mapWrapper)
      expect(mapWrapper?.children).toHaveLength(1)
    })

    it('no está en la columna de texto', () => {
      const { map, textColumn } = renderAbout()

      expect(textColumn).not.toContainElement(map as HTMLElement)
    })

    it('va antes de las tarjetas', () => {
      const { region, map } = renderAbout()
      const [firstCard] = within(region).getAllByRole('listitem')

      expect(
        Boolean((map as Element).compareDocumentPosition(firstCard as Element) & Node.DOCUMENT_POSITION_FOLLOWING),
      ).toBe(true)
    })
  })

  describe('decorativo', () => {
    it('va oculto al lector de pantalla, sin rol ni nombre', () => {
      const { map } = renderAbout()

      expect(map).toHaveAttribute('aria-hidden', 'true')
      expect(map).not.toHaveAttribute('role')
      expect(map).not.toHaveAttribute('aria-label')
    })

    // La sección dice lo mismo con mapa que sin él.
    it.each(LANGS)('en %s, no añade texto a la sección', (lang) => {
      const { region, map } = renderAbout(lang)
      const withoutMap = region.cloneNode(true) as HTMLElement
      withoutMap.querySelector(`svg[viewBox="0 0 ${worldMap.width} ${worldMap.height}"]`)?.remove()

      expect(map?.textContent).toBe('')
      expect(region.textContent).toBe(withoutMap.textContent)
    })

    it('no añade imágenes ni figuras accesibles', () => {
      const { region } = renderAbout()

      expect(within(region).queryAllByRole('img')).toHaveLength(0)
      expect(within(region).getAllByRole('figure')).toHaveLength(1)
    })
  })
})
