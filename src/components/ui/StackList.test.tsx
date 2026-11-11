import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StackList, type StackGroup } from '@/components/ui/StackList'

// «Mi stack» (spec v2.1 §3.2): rótulo en mono, título, cuenta a la derecha y
// las tecnologías en columnas por grupo, cada una con su logo y su nombre.
const GROUPS: StackGroup[] = [
  {
    id: 'languages',
    label: 'Lenguajes',
    items: [
      { id: 'java', name: 'Java', logoUrl: '/tech/duke.svg' },
      { id: 'python', name: 'Python', logoUrl: '/tech/python.svg' },
    ],
  },
  {
    id: 'ai-tools',
    label: 'IA y herramientas',
    items: [{ id: 'ai-agents', name: 'Agentes de IA', logoUrl: '/icons/ai-agents-white.svg' }],
  },
]

const renderList = () =>
  render(<StackList tag="stack.list()" title="Mi stack" count="3 tecnologías" groups={GROUPS} />)

describe('StackList', () => {
  it('el título es un h3, con el rótulo antes y la cuenta después', () => {
    renderList()

    const title = screen.getByRole('heading', { level: 3, name: 'Mi stack' })
    expect(screen.getByText('stack.list()')).toBeInTheDocument()
    expect(screen.getByText('3 tecnologías')).toBeInTheDocument()
    expect(
      screen.getByText('stack.list()').compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('cada grupo tiene su título (h4) y su lista, en orden', () => {
    renderList()

    expect(screen.getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent)).toEqual([
      'Lenguajes',
      'IA y herramientas',
    ])
    const lists = screen.getAllByRole('list')
    expect(lists).toHaveLength(2)
    expect(within(lists[0] ?? document.body).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Java',
      'Python',
    ])
  })

  it('cada lista se nombra con su grupo', () => {
    renderList()

    expect(screen.getByRole('list', { name: 'Lenguajes' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'IA y herramientas' })).toBeInTheDocument()
  })

  // El nombre va al lado y lleva la información: el logo es apoyo.
  it('cada tecnología lleva su logo como imagen decorativa, con su tamaño reservado', () => {
    const { container } = renderList()

    const images = [...container.querySelectorAll('img')]
    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/tech/duke.svg',
      '/tech/python.svg',
      '/icons/ai-agents-white.svg',
    ])
    images.forEach((image) => {
      expect(image).toHaveAttribute('alt', '')
      expect(image).toHaveAttribute('width')
      expect(image).toHaveAttribute('height')
    })
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })
})
