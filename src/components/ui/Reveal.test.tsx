import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal, type RevealOrder } from '@/components/ui/Reveal'
import styles from '@/components/ui/Reveal.module.css'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mockMatchMedia } from '@/test/mockMatchMedia'

/** Nombre real de una clase del módulo; falla si el módulo no la tiene. */
const classOf = (name: string) => {
  const value = styles[name]
  if (!value) throw new Error(`Reveal.module.css no tiene la clase .${name}`)
  return value
}

const REVEAL = classOf('reveal')
const HIDDEN = classOf('hidden')

let io: ReturnType<typeof mockIntersectionObserver>

// El registro de lo revelado dura toda la carga del módulo, también entre
// los tests de este archivo: cada test usa su propia clave.
let testCount = 0
let key = ''

/** El envoltorio de un botón con ese nombre. */
const wrapperOf = (name: string) => {
  const wrapper = screen.getByRole('button', { name }).parentElement
  if (!wrapper) throw new Error(`El botón ${name} no tiene envoltorio`)
  return wrapper
}

const enter = (element: Element) => {
  act(() => {
    expect(io.trigger(element, true)).toBe(1)
  })
}

beforeEach(() => {
  testCount += 1
  key = `reveal-test-${testCount}`
  io = mockIntersectionObserver()
  mockMatchMedia(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Reveal', () => {
  it('envuelve a sus hijos en un div, que es el elemento que observa', () => {
    render(
      <Reveal revealKey={key}>
        <button type="button">Hola</button>
      </Reveal>,
    )
    const wrapper = wrapperOf('Hola')

    expect(wrapper.tagName).toBe('DIV')
    expect(io.last().observed).toEqual([wrapper])
  })

  it('está oculto hasta que su elemento entra en pantalla', () => {
    render(
      <Reveal revealKey={key}>
        <button type="button">Hola</button>
      </Reveal>,
    )
    const wrapper = wrapperOf('Hola')

    expect(wrapper).toHaveClass(REVEAL, HIDDEN)

    enter(wrapper)

    expect(wrapper).toHaveClass(REVEAL)
    expect(wrapper).not.toHaveClass(HIDDEN)
  })

  it('cada uno se revela por su cuenta', () => {
    render(
      <>
        <Reveal revealKey={key}>
          <button type="button">Primero</button>
        </Reveal>
        <Reveal revealKey={`${key}-b`}>
          <button type="button">Segundo</button>
        </Reveal>
      </>,
    )

    enter(wrapperOf('Primero'))

    expect(wrapperOf('Primero')).not.toHaveClass(HIDDEN)
    expect(wrapperOf('Segundo')).toHaveClass(HIDDEN)
  })

  // Las tarjetas: el <li> es el que revela, y la caja va dentro.
  it('con as="li" el envoltorio es el elemento de la lista', () => {
    render(
      <ul>
        <Reveal revealKey={key} as="li">
          <button type="button">Tarjeta</button>
        </Reveal>
      </ul>,
    )
    const item = screen.getByRole('listitem')

    expect(wrapperOf('Tarjeta')).toBe(item)
    expect(item).toHaveClass(REVEAL, HIDDEN)
    expect(io.last().observed).toEqual([item])
  })

  it('suma la clase que recibe a las suyas', () => {
    render(
      <Reveal revealKey={key} className="propia">
        <button type="button">Hola</button>
      </Reveal>,
    )

    expect(wrapperOf('Hola')).toHaveClass(REVEAL, HIDDEN, 'propia')
  })

  describe('escalonado', () => {
    const ORDERS: readonly RevealOrder[] = [0, 1, 2, 3]

    it.each(ORDERS)('con order %i lleva solo su clase de escalonado', (order) => {
      render(
        <Reveal revealKey={key} order={order}>
          <button type="button">Hola</button>
        </Reveal>,
      )
      const wrapper = wrapperOf('Hola')

      ORDERS.forEach((other) => {
        if (other === order) expect(wrapper).toHaveClass(classOf(`order${other}`))
        else expect(wrapper).not.toHaveClass(classOf(`order${other}`))
      })
    })

    it('sin order va el primero', () => {
      render(
        <Reveal revealKey={key}>
          <button type="button">Hola</button>
        </Reveal>,
      )

      expect(wrapperOf('Hola')).toHaveClass(classOf('order0'))
    })

    it('conserva su clase de escalonado al revelarse', () => {
      render(
        <Reveal revealKey={key} order={2}>
          <button type="button">Hola</button>
        </Reveal>,
      )

      enter(wrapperOf('Hola'))

      expect(wrapperOf('Hola')).toHaveClass(REVEAL, classOf('order2'))
    })
  })

  // Oculto solo a la vista: el lector de pantalla y el teclado lo alcanzan.
  describe('mientras está oculto', () => {
    it('sus hijos se encuentran por rol y nombre', () => {
      render(
        <Reveal revealKey={key}>
          <h2>Título</h2>
          <a href="/destino">Enlace</a>
        </Reveal>,
      )

      expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Enlace' })).toBeInTheDocument()
    })

    it('el envoltorio no lleva aria-hidden, hidden ni inert', () => {
      render(
        <Reveal revealKey={key}>
          <button type="button">Hola</button>
        </Reveal>,
      )
      const wrapper = wrapperOf('Hola')

      expect(wrapper).toHaveClass(HIDDEN)
      expect(wrapper).not.toHaveAttribute('aria-hidden')
      expect(wrapper).not.toHaveAttribute('hidden')
      expect(wrapper).not.toHaveAttribute('inert')
    })
  })

  it('con movimiento reducido es visible desde el inicio', () => {
    mockMatchMedia(true)
    render(
      <Reveal revealKey={key}>
        <button type="button">Hola</button>
      </Reveal>,
    )

    expect(wrapperOf('Hola')).toHaveClass(REVEAL)
    expect(wrapperOf('Hola')).not.toHaveClass(HIDDEN)
  })
})
