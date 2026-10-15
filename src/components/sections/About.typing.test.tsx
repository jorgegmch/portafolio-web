import { act, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import aboutStyles from '@/components/sections/About.module.css'
import revealStyles from '@/components/ui/Reveal.module.css'
import typedStyles from '@/components/ui/TypedText.module.css'
import { PARAGRAPH_PAUSE_MS, WORD_STEP_MS } from '@/config/aboutMotion'
import { dictionaries } from '@/i18n/index'
import type { Lang } from '@/i18n/types'
import { wordRevealSchedule } from '@/lib/wordReveal'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

/** Nombre real de una clase de un módulo; falla si el módulo no la tiene. */
const classOf = (styles: CSSModuleClasses, name: string) => {
  const value = styles[name]
  if (!value) throw new Error(`El módulo no tiene la clase .${name}`)
  return value
}

const BIO = classOf(aboutStyles, 'bio')
const REVEAL = classOf(revealStyles, 'reveal')
const HIDDEN = classOf(revealStyles, 'hidden')
const WAITING = classOf(typedStyles, 'waiting')
const WORD = classOf(typedStyles, 'word')
const CURSOR = classOf(typedStyles, 'cursor')

const { es, en } = dictionaries

// Edades ficticias: la edad de verdad sale de la fecha de config, que aquí
// no se usa. El mock la deja cambiar a mitad de un test, como a medianoche.
const age = vi.hoisted(() => {
  let value = 40
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set: (next: number) => {
      value = next
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
})

vi.mock('@/hooks/useAge', async () => {
  const { useSyncExternalStore } = await import('react')
  return { useAge: () => useSyncExternalStore(age.subscribe, age.get) }
})

let io: ReturnType<typeof mockIntersectionObserver>
let setLang: (lang: Lang) => void = () => {
  throw new Error('La sección no está montada')
}

// El registro de lo revelado vive en el módulo del hook y dura toda la carga.
// Cada test carga About de nuevo, así que empieza con el registro vacío.
const loadAbout = async () => {
  vi.resetModules()
  const [{ About }, { LangProvider }, { useLang }, { IntroPlayingContext }] = await Promise.all([
    import('@/components/sections/About'),
    import('@/i18n/LangProvider'),
    import('@/hooks/useLang'),
    import('@/hooks/IntroPlayingContext'),
  ])
  // Lo que haría el selector de idioma de la barra.
  const LangSwitch = () => {
    setLang = useLang().setLang
    return null
  }
  return ({ introPlaying = false }: { introPlaying?: boolean }) => (
    <MemoryRouter>
      <LangProvider>
        <IntroPlayingContext value={introPlaying}>
          <LangSwitch />
          <About />
        </IntroPlayingContext>
      </LangProvider>
    </MemoryRouter>
  )
}

/** El contenedor de la descripción: el padre de su primer párrafo. */
const bioIn = (region: HTMLElement) => {
  const bio = within(region).getByText(es.about.bio[0] ?? '').parentElement
  if (!bio) throw new Error('La descripción no tiene contenedor')
  return bio
}

const renderAbout = async (introPlaying = false) => {
  const Section = await loadAbout()
  const view = render(<Section introPlaying={introPlaying} />)
  const region = screen.getByRole('region', { name: es.about.heading })
  const bio = bioIn(region)
  const words = () => [...bio.querySelectorAll(`.${WORD}`)]
  const cursors = () => [...bio.querySelectorAll(`.${CURSOR}`)]
  const paragraphs = () => [...bio.querySelectorAll('p')].map((paragraph) => paragraph.textContent)
  return { Section, region, bio, words, cursors, paragraphs, ...view }
}

/** Los envoltorios que revelan, en el orden del documento. */
const wrappersIn = (region: HTMLElement) => [...region.querySelectorAll(`.${REVEAL}`)]

const enter = (element: Element) => {
  act(() => {
    expect(io.trigger(element, true)).toBe(1)
  })
}

/** Cuántas palabras escribe el calendario para estos párrafos. */
const wordCount = (paragraphs: readonly string[]) =>
  wordRevealSchedule(paragraphs, { stepMs: WORD_STEP_MS, pauseMs: PARAGRAPH_PAUSE_MS })
    .paragraphs.flat().length

beforeEach(() => {
  io = mockIntersectionObserver()
  mockMatchMedia(false)
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  age.set(40)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

describe('About: la descripción se escribe', () => {
  it('el contenedor que se escribe es el de la descripción, en todas las fases', async () => {
    const { bio, words, cursors } = await renderAbout()
    expect(bio).toHaveClass(BIO, WAITING)

    enter(bio)
    expect(words().length).toBeGreaterThan(0)
    expect(bio).toHaveClass(BIO)

    act(() => setLang('en'))
    expect(cursors()).toHaveLength(1)
    expect(bio).toHaveClass(BIO)
  })

  describe('cada uno a su tiempo', () => {
    it('el aviso de los envoltorios no empieza la escritura', async () => {
      const { region, bio, words } = await renderAbout()

      wrappersIn(region).forEach(enter)

      expect(bio).toHaveClass(WAITING)
      expect(words()).toHaveLength(0)
    })

    it('empieza con su propio aviso, y no revela nada más', async () => {
      const { region, bio, words, paragraphs } = await renderAbout()

      enter(bio)

      expect(bio).not.toHaveClass(WAITING)
      expect(words()).toHaveLength(wordCount(es.about.bio))
      expect(paragraphs()).toEqual([...es.about.bio])
      expect(wrappersIn(region)).toHaveLength(8)
      wrappersIn(region).forEach((wrapper) => expect(wrapper).toHaveClass(HIDDEN))
    })
  })

  describe('cambio de idioma', () => {
    it('a mitad de la escritura, el texto en inglés aparece completo, con el cursor', async () => {
      const { bio, words, cursors, paragraphs } = await renderAbout()
      enter(bio)

      act(() => setLang('en'))

      expect(words()).toHaveLength(0)
      expect(paragraphs()).toEqual([...en.about.bio])
      en.about.bio.forEach((paragraph) => expect(screen.getByText(paragraph).tagName).toBe('P'))
      expect(cursors()).toHaveLength(1)
      expect([...bio.querySelectorAll('p')].at(-1)?.lastChild).toBe(cursors()[0])
    })

    it('antes de empezar, se escribe en inglés al entrar en pantalla', async () => {
      const { bio, words, cursors, paragraphs } = await renderAbout()

      act(() => setLang('en'))
      expect(bio).toHaveClass(WAITING)
      enter(bio)

      expect(words()).toHaveLength(wordCount(en.about.bio))
      expect(paragraphs()).toEqual([...en.about.bio])
      expect(cursors()).toHaveLength(0)
    })
  })

  // La edad cambia a medianoche y vuelve a pintar la sección: la descripción
  // no debe empezar de nuevo.
  it('si cambia la edad a mitad, las palabras son los mismos nodos', async () => {
    const { region, bio, words } = await renderAbout()
    const terminal = within(region).getByRole('figure')
    enter(bio)
    const before = words()
    expect(before.length).toBeGreaterThan(0)
    expect(terminal.textContent).not.toContain('41')

    act(() => age.set(41))

    expect(terminal.textContent).toContain('41')
    expect(words()).toHaveLength(before.length)
    words().forEach((word, index) => expect(word).toBe(before[index]))
  })

  it('al desmontar y volver a montar, queda escrita, sin volver a escribirse', async () => {
    const { Section, bio, unmount } = await renderAbout()
    enter(bio)
    unmount()

    render(<Section />)
    const again = bioIn(screen.getByRole('region', { name: es.about.heading }))

    expect(again).not.toHaveClass(WAITING)
    expect(again.querySelectorAll(`.${WORD}`)).toHaveLength(0)
    expect(again.querySelectorAll(`.${CURSOR}`)).toHaveLength(1)
    act(() => {
      expect(io.trigger(again, true)).toBe(0)
    })
  })

  it('con la intro en marcha espera, y se escribe al entrar cuando termina', async () => {
    const { Section, bio, words, rerender } = await renderAbout(true)

    act(() => {
      expect(io.trigger(bio, true)).toBe(0)
    })
    expect(bio).toHaveClass(WAITING)
    expect(words()).toHaveLength(0)

    rerender(<Section introPlaying={false} />)
    expect(bio).toHaveClass(WAITING)
    enter(bio)

    expect(words()).toHaveLength(wordCount(es.about.bio))
  })

  it('con movimiento reducido, texto plano y cursor desde el principio, sin observadores', async () => {
    mockMatchMedia(true)
    const { bio, words, cursors, paragraphs } = await renderAbout()

    expect(bio).not.toHaveClass(WAITING)
    expect(words()).toHaveLength(0)
    expect(paragraphs()).toEqual([...es.about.bio])
    expect(cursors()).toHaveLength(1)
    expect(io.instances).toHaveLength(0)
  })
})
