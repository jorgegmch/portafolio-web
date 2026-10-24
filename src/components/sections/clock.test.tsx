import { act, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Contact } from '@/components/sections/Contact'
import { Hero } from '@/components/sections/Hero'
import { site } from '@/config/site'
import { CLOCK_INTERVAL_MS } from '@/hooks/useClock'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

// La hora de la ciudad en el Hero y en Contacto (spec §3.1 y §3.5): la de
// America/Bogota, con «GMT-5», que avanza sola. Reloj falso: sin user-event.

const { es } = dictionaries
/** 23:58:30 en Bogotá. */
const START = new Date('2026-10-25T04:58:30Z')

const renderInPage = (node: ReactNode) =>
  render(
    <MemoryRouter>
      <LangProvider>{node}</LangProvider>
    </MemoryRouter>,
  )

/** El <time> de un elemento y el texto del párrafo que lo contiene. */
const clockIn = (container: HTMLElement) => {
  const time = container.querySelector('time')
  if (!time) throw new Error('No hay <time>')
  return { time: time.textContent, line: time.parentElement?.textContent ?? '' }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(START)
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('reloj de la ciudad', () => {
  it('el Hero da la hora de Bogotá con su ciudad y GMT-5', () => {
    renderInPage(<Hero />)
    const hero = screen.getByRole('region', { name: es.hero.heading })

    const { time, line } = clockIn(hero)

    expect(time).toBe('23:58')
    expect(line).toContain(site.locationShort)
    expect(line).toContain(site.utcOffsetLabel)
  })

  it('Contacto da la hora de Bogotá con «Piedecuesta, Colombia» y GMT-5', () => {
    renderInPage(<Contact />)
    const contact = screen.getByRole('region', { name: es.contact.label })

    const { time, line } = clockIn(contact)

    expect(time).toBe('23:58')
    expect(line).toBe(`${site.locationCredits} · 23:58 ${site.utcOffsetLabel}`)
  })

  it('avanzan solos y cruzan la medianoche', () => {
    renderInPage(
      <>
        <Hero />
        <Contact />
      </>,
    )

    act(() => vi.advanceTimersByTime(CLOCK_INTERVAL_MS * 4))

    const hero = within(screen.getByRole('region', { name: es.hero.heading }))
    const contact = within(screen.getByRole('region', { name: es.contact.label }))
    expect(hero.getByText('00:00')).toBeInTheDocument()
    expect(contact.getByText('00:00')).toBeInTheDocument()
  })
})
