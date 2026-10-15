import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import aboutStyles from '@/components/sections/About.module.css'
import revealStyles from '@/components/ui/Reveal.module.css'
import { worldMap } from '@/data/worldMap'
import { dictionaries } from '@/i18n/index'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

/** Nombre real de una clase de un módulo; falla si el módulo no la tiene. */
const classOf = (styles: CSSModuleClasses, name: string) => {
  const value = styles[name]
  if (!value) throw new Error(`El módulo no tiene la clase .${name}`)
  return value
}

const REVEAL = classOf(revealStyles, 'reveal')
const HIDDEN = classOf(revealStyles, 'hidden')
const ORDER_CLASSES = [0, 1, 2, 3].map((order) => classOf(revealStyles, `order${order}`))
const STAT = classOf(aboutStyles, 'stat')
const PANEL = classOf(aboutStyles, 'panel')

const { about } = dictionaries.es

let io: ReturnType<typeof mockIntersectionObserver>

// El registro de lo revelado vive en el módulo del hook y dura toda la carga.
// Cada test carga About de nuevo, así que empieza con el registro vacío.
const loadAbout = async () => {
  vi.resetModules()
  const [{ About }, { LangProvider }] = await Promise.all([
    import('@/components/sections/About'),
    import('@/i18n/LangProvider'),
  ])
  return () => (
    <MemoryRouter>
      <LangProvider>
        <About />
      </LangProvider>
    </MemoryRouter>
  )
}

/** Monta la sección y devuelve sus partes, en el orden de la tabla. */
const renderAbout = async () => {
  const Section = await loadAbout()
  const view = render(<Section />)
  const region = screen.getByRole('region', { name: about.heading })
  const phrase = within(region).getByText(about.phrase.highlight).parentElement
  const map = region.querySelector(`svg[viewBox="0 0 ${worldMap.width} ${worldMap.height}"]`)
  if (!phrase || !map) throw new Error('Falta la frase o el mapa')
  const blocks = {
    heading: within(region).getByRole('heading', { level: 2 }),
    phrase,
    terminal: within(region).getByRole('figure'),
    cta: within(region).getByRole('link'),
    map,
  }
  const cards = within(region).getAllByRole('listitem')
  return { Section, region, blocks, cards, ...view }
}

/** Los envoltorios que revelan, en el orden del documento. */
const wrappersIn = (region: HTMLElement) => [...region.querySelectorAll(`.${REVEAL}`)]

const enter = (element: Element) => {
  act(() => {
    expect(io.trigger(element, true)).toBe(1)
  })
}

beforeEach(() => {
  io = mockIntersectionObserver()
  mockMatchMedia(false)
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

describe('About: revelado al hacer scroll', () => {
  describe('qué se revela', () => {
    it('hay ocho envoltorios, todos ocultos al empezar', async () => {
      const { region } = await renderAbout()
      const wrappers = wrappersIn(region)

      expect(wrappers).toHaveLength(8)
      wrappers.forEach((wrapper) => expect(wrapper).toHaveClass(HIDDEN))
    })

    it('título, frase, terminal, enlace y mapa van cada uno solo en su envoltorio', async () => {
      const { blocks } = await renderAbout()

      Object.values(blocks).forEach((block) => {
        const wrapper = block.parentElement

        expect(wrapper).toHaveClass(REVEAL)
        expect([...(wrapper?.children ?? [])]).toEqual([block])
      })
    })

    // Decisión del autor: el <li> revela; la caja y el hover van dentro.
    it('cada tarjeta es el elemento que revela y lleva dentro una sola caja', async () => {
      const { cards } = await renderAbout()

      expect(cards).toHaveLength(3)
      cards.forEach((card) => {
        expect(card).toHaveClass(REVEAL)
        expect(card.children).toHaveLength(1)
        expect(card.firstElementChild).toHaveClass(STAT)
      })
    })

    it('los envoltorios son exactamente esos ocho, en el orden del documento', async () => {
      const { region, blocks, cards } = await renderAbout()
      const { heading, phrase, terminal, cta, map } = blocks

      expect(wrappersIn(region)).toEqual([
        heading.parentElement,
        phrase.parentElement,
        cta.parentElement,
        terminal.parentElement,
        map.parentElement,
        ...cards,
      ])
    })

    // Solo la biografía se escribe; no aparece con el resto.
    it('la biografía no va dentro de ningún envoltorio', async () => {
      const { region } = await renderAbout()

      about.bio.forEach((paragraph) => {
        expect(within(region).getByText(paragraph).closest(`.${REVEAL}`)).toBeNull()
      })
    })
  })

  // Condición de PLAN.md: Reveal no anima el elemento que escala. Son
  // elementos distintos: el que escala va dentro del que revela.
  describe('lo que revela no es lo que escala', () => {
    it('el panel de la terminal no es un envoltorio, ni lo contiene', async () => {
      const { blocks } = await renderAbout()
      const panel = blocks.terminal

      expect(panel).toHaveClass(PANEL)
      expect(panel).not.toHaveClass(REVEAL)
      expect(panel.querySelector(`.${REVEAL}`)).toBeNull()
    })

    it('la caja de cada tarjeta no es un envoltorio, ni lo contiene', async () => {
      const { region } = await renderAbout()
      const boxes = [...region.querySelectorAll(`.${STAT}`)]

      expect(boxes).toHaveLength(3)
      boxes.forEach((box) => {
        expect(box).not.toHaveClass(REVEAL)
        expect(box.querySelector(`.${REVEAL}`)).toBeNull()
      })
    })

    it('ningún envoltorio lleva la clase de un elemento que escala', async () => {
      const { region } = await renderAbout()

      expect(wrappersIn(region)).toHaveLength(8)
      wrappersIn(region).forEach((wrapper) => {
        expect(wrapper).not.toHaveClass(STAT)
        expect(wrapper).not.toHaveClass(PANEL)
      })
    })
  })

  describe('escalonado', () => {
    // Título 0, frase 1, terminal 2, enlace 2, mapa 3; tarjetas 0, 1 y 2.
    it('cada envoltorio lleva el puesto de la tabla, y solo ese', async () => {
      const { blocks, cards } = await renderAbout()
      const expected: [Element | null, number][] = [
        [blocks.heading.parentElement, 0],
        [blocks.phrase.parentElement, 1],
        [blocks.terminal.parentElement, 2],
        [blocks.cta.parentElement, 2],
        [blocks.map.parentElement, 3],
        [cards[0] ?? null, 0],
        [cards[1] ?? null, 1],
        [cards[2] ?? null, 2],
      ]

      expected.forEach(([wrapper, order]) => {
        ORDER_CLASSES.forEach((orderClass, index) => {
          if (index === order) expect(wrapper).toHaveClass(orderClass)
          else expect(wrapper).not.toHaveClass(orderClass)
        })
      })
    })
  })

  describe('cada uno a su tiempo', () => {
    it('cada envoltorio se revela solo con su propio aviso', async () => {
      const { region } = await renderAbout()
      const wrappers = wrappersIn(region)

      expect(wrappers).toHaveLength(8)
      wrappers.forEach((wrapper, index) => {
        enter(wrapper)

        wrappers.forEach((other, otherIndex) => {
          if (otherIndex <= index) expect(other).not.toHaveClass(HIDDEN)
          else expect(other).toHaveClass(HIDDEN)
        })
      })
    })

    // Una clave repetida haría que, al volver, apareciera también el otro.
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      'si solo se reveló el envoltorio %i, al volver a montar solo ese aparece visible',
      async (revealedIndex) => {
        const { region, Section, unmount } = await renderAbout()
        const target = wrappersIn(region)[revealedIndex]
        expect(target).toBeDefined()
        enter(target as Element)
        unmount()

        render(<Section />)
        const again = wrappersIn(screen.getByRole('region', { name: about.heading }))

        expect(again).toHaveLength(8)
        again.forEach((wrapper, index) => {
          if (index === revealedIndex) expect(wrapper).not.toHaveClass(HIDDEN)
          else expect(wrapper).toHaveClass(HIDDEN)
        })
      },
    )

    // La descripción tiene su propio aviso: «todo» la incluye.
    it('desmontar y volver a montar lo deja todo visible y sin observadores nuevos', async () => {
      const { region, Section, unmount } = await renderAbout()
      const bio = within(region).getByText(about.bio[0] ?? '').parentElement
      if (!bio) throw new Error('La descripción no tiene contenedor')
      wrappersIn(region).forEach(enter)
      enter(bio)
      unmount()
      const observersBefore = io.instances.length

      render(<Section />)
      const again = wrappersIn(screen.getByRole('region', { name: about.heading }))

      expect(again).toHaveLength(8)
      again.forEach((wrapper) => expect(wrapper).not.toHaveClass(HIDDEN))
      expect(io.instances).toHaveLength(observersBefore)
    })
  })

  it('con movimiento reducido todo se ve desde el principio, sin observadores', async () => {
    mockMatchMedia(true)
    const { region } = await renderAbout()

    expect(wrappersIn(region)).toHaveLength(8)
    wrappersIn(region).forEach((wrapper) => expect(wrapper).not.toHaveClass(HIDDEN))
    expect(io.instances).toHaveLength(0)
  })
})
