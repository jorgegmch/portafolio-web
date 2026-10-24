import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { SCRAMBLE_TIMING } from '@/lib/nameScramble'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// El logo se traduce (spec §4.2): en reposo «jorgegmch_»; con el puntero
// fino encima o con el foco del teclado, «Jorge Gómez_», y al salir vuelve.
// Reloj falso: se opera con fireEvent.

const { es, en } = dictionaries
const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const ENOUGH_MS = SCRAMBLE_TIMING.stepMs * 40

const renderNavbar = (langs: readonly string[] = ['es-CO']) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)
  render(
    <MemoryRouter>
      <LangProvider>
        <Navbar />
      </LangProvider>
    </MemoryRouter>,
  )
}

const brand = () => screen.getByRole('link', { name: new RegExp(site.handle) })
/** Lo que se ve del logo: la capa de texto, sin la reserva de ancho. */
const shown = () => brand().querySelector('[data-logo-text]')?.textContent
/**
 * Avanza el reloj de paso en paso: cada temporizador nace al renderizar el
 * paso anterior, así que un solo avance largo solo daría un paso.
 */
const advance = (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += SCRAMBLE_TIMING.stepMs) {
    act(() => vi.advanceTimersByTime(SCRAMBLE_TIMING.stepMs))
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  mockMatchMedia({ [FINE_POINTER]: true, [REDUCED_MOTION]: false })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

describe('Navbar: el logo se traduce', () => {
  it('en reposo dice «jorgegmch_», y no cambia solo', () => {
    renderNavbar()

    advance(ENOUGH_MS)

    expect(shown()).toBe(`${site.handle}_`)
  })

  it('con el puntero encima pasa a «Jorge Gómez_», y al salir vuelve', () => {
    renderNavbar()

    fireEvent.pointerEnter(brand(), { pointerType: 'mouse' })
    advance(ENOUGH_MS)
    expect(shown()).toBe(`${site.shortName}_`)

    fireEvent.pointerLeave(brand(), { pointerType: 'mouse' })
    advance(ENOUGH_MS)
    expect(shown()).toBe(`${site.handle}_`)
  })

  it('con el foco del teclado también, y al perderlo vuelve', () => {
    renderNavbar()

    act(() => brand().focus())
    advance(ENOUGH_MS)
    expect(shown()).toBe(`${site.shortName}_`)

    act(() => brand().blur())
    advance(ENOUGH_MS)
    expect(shown()).toBe(`${site.handle}_`)
  })

  it('el foco que llega de pulsarlo con el puntero no lo traduce', () => {
    mockMatchMedia({ [FINE_POINTER]: false, [REDUCED_MOTION]: false })
    renderNavbar()

    fireEvent.pointerDown(brand(), { pointerType: 'touch' })
    act(() => brand().focus())
    advance(ENOUGH_MS)

    expect(shown()).toBe(`${site.handle}_`)
  })

  it('con un toque no se traduce: solo con puntero fino', () => {
    mockMatchMedia({ [FINE_POINTER]: false, [REDUCED_MOTION]: false })
    renderNavbar()

    fireEvent.pointerEnter(brand(), { pointerType: 'touch' })
    advance(ENOUGH_MS)

    expect(shown()).toBe(`${site.handle}_`)
  })

  it('con movimiento reducido el texto cambia de golpe', () => {
    mockMatchMedia({ [FINE_POINTER]: true, [REDUCED_MOTION]: true })
    renderNavbar()

    fireEvent.pointerEnter(brand(), { pointerType: 'mouse' })

    expect(shown()).toBe(`${site.shortName}_`)
  })

  it.each([
    ['es', ['es-CO'], es],
    ['en', ['en-US'], en],
  ] as const)('en %s, el nombre accesible no cambia y contiene las dos formas', (_, langs, dict) => {
    renderNavbar(langs)
    const name = `${site.shortName} (${site.handle}), ${dict.nav.home}`
    expect(brand()).toHaveAccessibleName(name)

    fireEvent.pointerEnter(brand(), { pointerType: 'mouse' })
    advance(ENOUGH_MS)

    expect(brand()).toHaveAccessibleName(name)
  })

  it('lo que se ve, con el guion bajo, va con aria-hidden', () => {
    renderNavbar()

    const visible = brand().querySelector('[data-logo-text]')
    expect(visible?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(visible?.lastElementChild).toHaveTextContent('_')
  })

  // Reserva el ancho del texto más largo: la barra no se mueve al traducirse.
  it('reserva el sitio del texto más largo', () => {
    renderNavbar()

    expect(brand().querySelector('[data-logo-sizer]')).toHaveTextContent(`${site.shortName}_`)
  })
})
