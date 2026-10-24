import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CrossedRibbons } from '@/components/ui/CrossedRibbons'
import { Ribbon } from '@/components/ui/Ribbon'

// Cinta accesible (spec §4.4): el contenido va dos veces para que el bucle
// no tenga costura, pero el lector de pantalla oye la lista una sola vez; la
// copia va con aria-hidden.

const ITEMS = ['Java', 'Spring Boot', 'PostgreSQL']
const LABEL = 'Tecnologías'

/** Listas que un lector de pantalla puede encontrar (las ocultas no cuentan). */
const accessibleLists = () => screen.queryAllByRole('list')

describe('Ribbon', () => {
  describe('con nombre', () => {
    it('el lector de pantalla encuentra una sola lista, con ese nombre', () => {
      render(<Ribbon items={ITEMS} label={LABEL} />)

      expect(accessibleLists()).toHaveLength(1)
      expect(screen.getByRole('list', { name: LABEL })).toBeInTheDocument()
    })

    it('cada elemento se oye una vez, en orden y sin el signo que los separa', () => {
      render(<Ribbon items={ITEMS} label={LABEL} />)

      const items = within(screen.getByRole('list', { name: LABEL })).getAllByRole('listitem')

      expect(items.map((item) => item.textContent)).toEqual(ITEMS)
      expect(screen.getAllByRole('listitem')).toHaveLength(ITEMS.length)
    })

    it('la copia que cierra el bucle lleva lo mismo y va con aria-hidden', () => {
      const { container } = render(<Ribbon items={ITEMS} label={LABEL} />)
      const lists = [...container.querySelectorAll('ul')]
      const [real, copy] = lists

      expect(lists).toHaveLength(2)
      expect(real).not.toHaveAttribute('aria-hidden')
      expect(copy).toHaveAttribute('aria-hidden', 'true')
      expect(copy).not.toHaveAttribute('aria-label')
      expect(copy?.textContent).toBe(real?.textContent)
    })
  })

  describe('sin nombre', () => {
    it('es decorativa: toda la cinta queda fuera del árbol accesible', () => {
      const { container } = render(<Ribbon items={ITEMS} />)

      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
      expect(accessibleLists()).toHaveLength(0)
    })
  })
})

describe('CrossedRibbons', () => {
  const CODE = ['@RestController', 'npm test']
  const VERBS = ['Escucho', 'Entrego']

  it('cada cinta es una lista con su nombre, y se oye una vez', () => {
    render(<CrossedRibbons code={CODE} codeLabel="Código" verbs={VERBS} verbsLabel="Cómo trabajo" />)

    expect(accessibleLists()).toHaveLength(2)
    expect(
      within(screen.getByRole('list', { name: 'Código' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(CODE)
    expect(
      within(screen.getByRole('list', { name: 'Cómo trabajo' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(VERBS)
  })
})
