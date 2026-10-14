import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TypedText } from '@/components/ui/TypedText'
import styles from '@/components/ui/TypedText.module.css'
import { PARAGRAPH_PAUSE_MS, WORD_STEP_MS } from '@/config/aboutMotion'
import { wordRevealSchedule } from '@/lib/wordReveal'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

/** Nombre real de una clase del módulo; falla si el módulo no la tiene. */
const classOf = (name: string) => {
  const value = styles[name]
  if (!value) throw new Error(`TypedText.module.css no tiene la clase .${name}`)
  return value
}

const WAITING = classOf('waiting')
const WORD = classOf('word')
const CURSOR = classOf('cursor')

// Textos de prueba, inventados.
const SPANISH = ['Hola mundo bonito.', 'Segundo párrafo, con coma.']
const ENGLISH = ['Hello pretty world.', 'Second paragraph, with comma.']

let io: ReturnType<typeof mockIntersectionObserver>

// El registro de lo revelado dura toda la carga del módulo, también entre
// los tests de este archivo: cada test usa su propia clave.
let testCount = 0
let key = ''

const renderText = (paragraphs: readonly string[] = SPANISH) => {
  const view = render(<TypedText revealKey={key} paragraphs={paragraphs} className="propia" />)
  const root = view.container.firstElementChild
  if (!(root instanceof HTMLElement)) throw new Error('TypedText no pinta un contenedor')
  const paragraphsIn = () => [...root.querySelectorAll('p')]
  const words = () => [...root.querySelectorAll(`.${WORD}`)]
  const cursors = () => [...root.querySelectorAll(`.${CURSOR}`)]
  return { ...view, root, paragraphsIn, words, cursors }
}

// jsdom no tiene AnimationEvent. Sin él, React escucha el nombre con prefijo
// (webkitAnimationEnd), que es el que jsdom anuncia en sus estilos; en el
// navegador escucha animationend. Esa ruta la mide la parada visual.
const ANIMATION_END = 'AnimationEvent' in window ? 'animationend' : 'webkitAnimationEnd'

/** Termina la animación de un elemento; el evento sube, como en el navegador. */
const animationEnd = (element: Element) =>
  fireEvent(element, new Event(ANIMATION_END, { bubbles: true }))

const enter = (element: Element) => {
  act(() => {
    expect(io.trigger(element, true)).toBe(1)
  })
}

beforeEach(() => {
  testCount += 1
  key = `typed-test-${testCount}`
  io = mockIntersectionObserver()
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TypedText', () => {
  it('el contenedor es el elemento observado y suma la clase que recibe', () => {
    const { root } = renderText()

    expect(io.last().observed).toEqual([root])
    expect(root).toHaveClass('propia')
  })

  describe('antes de entrar en pantalla', () => {
    it('cada párrafo está entero, como texto, en su <p>', () => {
      renderText()

      SPANISH.forEach((paragraph) => {
        expect(screen.getByText(paragraph).tagName).toBe('P')
      })
    })

    it('el contenedor es transparente, pero sigue al alcance del lector de pantalla', () => {
      const { root, paragraphsIn } = renderText()

      expect(root).toHaveClass(WAITING, 'propia')
      ;[root, ...paragraphsIn()].forEach((element) => {
        expect(element).not.toHaveAttribute('aria-hidden')
        expect(element).not.toHaveAttribute('hidden')
        expect(element).not.toHaveAttribute('inert')
      })
    })

    it('no hay palabras sueltas ni cursor', () => {
      const { root } = renderText()

      expect(root.querySelectorAll('span')).toHaveLength(0)
    })
  })

  describe('mientras se escribe', () => {
    it('el contenedor deja de ser transparente', () => {
      const { root } = renderText()
      enter(root)

      expect(root).not.toHaveClass(WAITING)
      expect(root).toHaveClass('propia')
    })

    it('cada párrafo conserva su texto exacto', () => {
      const { root, paragraphsIn } = renderText()
      enter(root)

      expect(paragraphsIn().map((paragraph) => paragraph.textContent)).toEqual(SPANISH)
    })

    it('cada palabra va en su span, con el retraso del calendario', () => {
      const { root, paragraphsIn } = renderText()
      enter(root)
      const schedule = wordRevealSchedule(SPANISH, {
        stepMs: WORD_STEP_MS,
        pauseMs: PARAGRAPH_PAUSE_MS,
      })

      paragraphsIn().forEach((paragraph, index) => {
        const spans = [...paragraph.querySelectorAll('span')]
        const expected = schedule.paragraphs[index] ?? []

        expect(spans).toHaveLength(expected.length)
        spans.forEach((span, wordIndex) => {
          expect(span).toHaveClass(WORD)
          expect(span.textContent).toBe(expected[wordIndex]?.text)
          expect(span.style.animationDelay).toBe(`${expected[wordIndex]?.delayMs}ms`)
        })
      })
    })

    it('no hay cursor', () => {
      const { root, cursors } = renderText()
      enter(root)

      expect(cursors()).toHaveLength(0)
      expect(root.querySelector('[aria-hidden]')).toBeNull()
    })

    it('el fin de la animación de otra palabra no termina la escritura', () => {
      const { root, words } = renderText()
      enter(root)

      animationEnd(words()[0] as Element)
      animationEnd(words().at(-2) as Element)

      expect(words()).toHaveLength(7)
      expect(root.querySelectorAll(`.${CURSOR}`)).toHaveLength(0)
    })

    // Solo cuenta el fin de la animación de la propia palabra, no uno que
    // suba desde algo que tenga dentro.
    it('un fin de animación que sube desde dentro de la última palabra no termina', () => {
      const { root, words } = renderText()
      enter(root)
      const inner = document.createElement('i')
      words().at(-1)?.append(inner)

      animationEnd(inner)

      expect(words()).toHaveLength(7)
    })

    it('el fin de la animación de la última palabra termina', () => {
      const { root, words, cursors } = renderText()
      enter(root)

      animationEnd(words().at(-1) as Element)

      expect(words()).toHaveLength(0)
      expect(cursors()).toHaveLength(1)
    })
  })

  describe('al terminar', () => {
    const finished = () => {
      const view = renderText()
      enter(view.root)
      animationEnd(view.words().at(-1) as Element)
      return view
    }

    it('cada párrafo vuelve a ser texto plano', () => {
      const { paragraphsIn } = finished()

      SPANISH.forEach((paragraph) => {
        expect(screen.getByText(paragraph).tagName).toBe('P')
      })
      expect(paragraphsIn().map((paragraph) => paragraph.textContent)).toEqual(SPANISH)
    })

    it('el cursor va al final del último párrafo, oculto al lector y sin texto', () => {
      const { paragraphsIn, cursors } = finished()
      const [cursor] = cursors()

      expect(cursors()).toHaveLength(1)
      expect(paragraphsIn().at(-1)?.lastChild).toBe(cursor)
      expect(cursor?.tagName).toBe('SPAN')
      expect(cursor).toHaveAttribute('aria-hidden', 'true')
      expect(cursor?.textContent).toBe('')
    })

    it('el cursor es el único span', () => {
      const { root } = finished()

      expect(root.querySelectorAll('span')).toHaveLength(1)
    })
  })

  describe('sin nada que animar', () => {
    it('con movimiento reducido, texto plano y cursor desde el principio', () => {
      mockMatchMedia(true)
      const { root, cursors } = renderText()

      expect(root).not.toHaveClass(WAITING)
      SPANISH.forEach((paragraph) => expect(screen.getByText(paragraph)).toBeInTheDocument())
      expect(cursors()).toHaveLength(1)
    })

    it('sin IntersectionObserver, texto plano y cursor desde el principio', () => {
      vi.stubGlobal('IntersectionObserver', undefined)
      const { root, cursors } = renderText()

      expect(root).not.toHaveClass(WAITING)
      expect(cursors()).toHaveLength(1)
    })
  })

  describe('si cambia el texto', () => {
    // Otro idioma a mitad: aparece completo en el nuevo, sin escribirse.
    it('mientras se escribe, aparece el nuevo completo, en plano y con cursor', () => {
      const { root, rerender, words, cursors } = renderText()
      enter(root)

      rerender(<TypedText revealKey={key} paragraphs={ENGLISH} className="propia" />)

      expect(words()).toHaveLength(0)
      ENGLISH.forEach((paragraph) => expect(screen.getByText(paragraph)).toBeInTheDocument())
      expect(cursors()).toHaveLength(1)
    })

    // Un render nuevo con el mismo texto no reinicia ninguna palabra.
    it('con un arreglo nuevo del mismo texto, las palabras son los mismos nodos', () => {
      const { root, rerender, words } = renderText()
      enter(root)
      const before = words()

      rerender(<TypedText revealKey={key} paragraphs={[...SPANISH]} className="propia" />)

      expect(words()).toHaveLength(before.length)
      words().forEach((word, index) => expect(word).toBe(before[index]))
    })
  })
})
