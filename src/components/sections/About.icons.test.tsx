import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

// La edad de la terminal no es asunto de este archivo: fecha ficticia.
vi.mock('@/lib/birthDate', () => ({ getBirthDate: () => ({ year: 2000, month: 3, day: 15 }) }))

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

/** La caja de una tarjeta: el único hijo de su <li>, que es el que aparece. */
const boxOf = (item: Element) => {
  const [box, ...rest] = item.children
  if (!box || rest.length > 0) throw new Error('Cada tarjeta lleva una sola caja')
  return box
}

/** Las cajas de las tres tarjetas, en orden. */
const renderCards = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <MemoryRouter>
      <LangProvider>
        <About />
      </LangProvider>
    </MemoryRouter>,
  )
  const region = screen.getByRole('region', { name: dictionaries[lang].about.heading })
  return within(region).getAllByRole('listitem').map(boxOf)
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('About: iconos de las tarjetas', () => {
  it('cada tarjeta lleva un solo icono', () => {
    renderCards().forEach((card) => {
      expect(card.querySelectorAll('svg')).toHaveLength(1)
    })
  })

  // Orden del DOM: cifra, icono, etiqueta. El CSS lo coloca en la fila de la
  // cifra, al borde derecho; en teléfono, al final de la línea.
  it('el icono es decorativo y va justo después de la cifra, antes de la etiqueta', () => {
    renderCards().forEach((card) => {
      const svg = card.querySelector('svg')
      const [value, icon, label] = card.children

      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(card.children).toHaveLength(3)
      expect(value?.textContent).toMatch(/^\+?\d+\+?$/)
      expect(icon).toBe(svg)
      expect(label?.textContent).toMatch(/^\D+$/)
    })
  })

  it('los tres iconos son distintos', () => {
    const drawings = renderCards().map((card) => card.querySelector('svg')?.innerHTML)

    expect(drawings.every((drawing) => drawing)).toBe(true)
    expect(new Set(drawings).size).toBe(3)
  })

  // El icono no añade nada que leer: la tarjeta sigue diciendo cifra y etiqueta.
  it.each(LANGS)('en %s, el texto de cada tarjeta es solo su cifra y su etiqueta', (lang) => {
    renderCards(lang).forEach((card) => {
      const parts = [...card.children]
        .filter((child) => child.tagName.toLowerCase() !== 'svg')
        .map((child) => child.textContent)

      expect(parts).toHaveLength(2)
      expect(card.textContent).toBe(parts.join(''))
    })
  })

  it('ninguna tarjeta lleva imágenes ni URLs', () => {
    renderCards().forEach((card) => {
      expect(card.querySelectorAll('img, image, use')).toHaveLength(0)
      expect(card.innerHTML).not.toMatch(/href|url\(/i)
    })
  })
})
