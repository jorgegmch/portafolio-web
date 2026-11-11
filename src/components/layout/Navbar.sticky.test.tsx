import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { sections } from '@/config/routes'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

const { es } = dictionaries

// Barra que acompaña (spec v2.1 §3.0): arriba del todo vive dentro del Hero
// con «Hablemos»; al salir del Hero pasa a píldora fija, sin «Hablemos», y
// marca la escena visible con aria-current. En teléfono, la píldora lleva el
// nombre de la escena actual junto al botón de menú.
const setup = ({ compact = false } = {}) => {
  mockMatchMedia({ '(max-width: 900px)': compact })
  const io = mockIntersectionObserver()
  render(
    <MemoryRouter>
      <LangProvider>
        <Navbar />
        <main>
          {Object.values(sections).map((id) => (
            <section key={id} id={id} />
          ))}
        </main>
      </LangProvider>
    </MemoryRouter>,
  )
  const sentinel = document.querySelector('[data-nav-sentinel]')
  if (!sentinel) throw new Error('Falta la marca de la barra')
  const section = (id: string) => {
    const element = document.getElementById(id)
    if (!element) throw new Error(`Falta #${id}`)
    return element
  }
  return {
    sentinel,
    leaveHero: () => act(() => void io.trigger(sentinel, false)),
    backToTop: () => act(() => void io.trigger(sentinel, true)),
    show: (id: string) => act(() => void io.trigger(section(id), true)),
    hide: (id: string) => act(() => void io.trigger(section(id), false)),
  }
}

const banner = () => screen.getByRole('banner')
const cta = () => screen.queryByRole('link', { name: es.nav.cta })
const navLink = (name: string) =>
  within(screen.getByRole('navigation', { name: es.nav.main })).getByRole('link', {
    name: new RegExp(name),
  })

beforeEach(() => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

describe('Navbar: barra que acompaña', () => {
  it('la marca que decide si se fijó está fuera del árbol accesible', () => {
    const { sentinel } = setup()

    expect(sentinel).toHaveAttribute('aria-hidden', 'true')
  })

  it('arriba del todo vive dentro del Hero, con «Hablemos»', () => {
    setup()

    expect(banner()).not.toHaveAttribute('data-stuck')
    expect(cta()).toBeInTheDocument()
  })

  it('al salir del Hero pasa a píldora fija, sin «Hablemos»', () => {
    const { leaveHero } = setup()

    leaveHero()

    expect(banner()).toHaveAttribute('data-stuck')
    expect(cta()).not.toBeInTheDocument()
    expect(navLink(es.nav.contact)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: es.nav.pauseAnimations })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^ES \/ EN: / })).toBeInTheDocument()
  })

  it('al volver arriba recupera su estado inicial', () => {
    const { leaveHero, backToTop } = setup()
    leaveHero()

    backToTop()

    expect(banner()).not.toHaveAttribute('data-stuck')
    expect(cta()).toBeInTheDocument()
  })

  describe('escena actual', () => {
    it('marca con aria-current="true" el enlace de la escena visible, y solo ese', () => {
      const { leaveHero, show } = setup()
      leaveHero()

      show(sections.projects)

      expect(navLink(es.nav.projects)).toHaveAttribute('aria-current', 'true')
      for (const name of [es.nav.about, es.nav.services, es.nav.contact]) {
        expect(navLink(name)).not.toHaveAttribute('aria-current')
      }
    })

    it('cambia al pasar a otra escena', () => {
      const { leaveHero, show, hide } = setup()
      leaveHero()
      show(sections.projects)

      show(sections.contact)
      hide(sections.projects)

      expect(navLink(es.nav.contact)).toHaveAttribute('aria-current', 'true')
      expect(navLink(es.nav.projects)).not.toHaveAttribute('aria-current')
    })

    it('en el Hero ningún enlace es la escena actual', () => {
      const { show } = setup()

      show(sections.hero)

      for (const name of [es.nav.about, es.nav.services, es.nav.projects, es.nav.contact]) {
        expect(navLink(name)).not.toHaveAttribute('aria-current')
      }
    })
  })

  describe('en teléfono', () => {
    const label = () => document.querySelector('[data-nav-scene]')

    it('la píldora fija nombra la escena actual con su número, solo a la vista', () => {
      const { leaveHero, show } = setup({ compact: true })
      leaveHero()

      show(sections.projects)

      expect(label()).toHaveTextContent(`03 ${es.nav.projects}`)
      expect(label()).toHaveAttribute('aria-hidden', 'true')
    })

    it('arriba del todo no lleva ese rótulo', () => {
      const { show } = setup({ compact: true })

      show(sections.projects)

      expect(label()).toBeNull()
    })

    it('el botón de menú sigue a la vista en la píldora', () => {
      const { leaveHero } = setup({ compact: true })

      leaveHero()

      expect(screen.getByRole('button', { name: es.nav.openMenu })).toBeInTheDocument()
    })
  })
})
