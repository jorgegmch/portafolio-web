import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatIcon, type StatIconName } from '@/components/ui/StatIcon'

const NAMES = ['clock', 'folder', 'layers'] as const satisfies readonly StatIconName[]

const renderIcon = (name: StatIconName, className?: string) => {
  const { container } = render(<StatIcon name={name} className={className} />)
  return container
}

describe('StatIcon', () => {
  it.each(NAMES)('%s es un solo svg', (name) => {
    const container = renderIcon(name)

    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg')
  })

  // Decorativo: el lector de pantalla lo salta y el teclado no se para en él.
  it.each(NAMES)('%s es decorativo: oculto al lector y sin foco', (name) => {
    const svg = renderIcon(name).querySelector('svg')

    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg).not.toHaveAttribute('role')
    expect(svg).not.toHaveAttribute('aria-label')
  })

  it.each(NAMES)('%s no lleva título ni texto', (name) => {
    const svg = renderIcon(name).querySelector('svg')

    expect(svg?.querySelector('title, desc, text')).toBeNull()
    expect(svg?.textContent).toBe('')
  })

  // El color lo pone el CSS con currentColor: el dibujo no trae ninguno.
  it.each(NAMES)('%s no trae colores, imágenes ni URLs', (name) => {
    const markup = renderIcon(name).innerHTML

    expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
    expect(markup).not.toMatch(/\b(?:fill|stroke)=/)
    expect(markup).not.toMatch(/href|url\(|<image|<use/i)
  })

  it.each(NAMES)('%s se dibuja en un cuadro de 24, con trazos', (name) => {
    const svg = renderIcon(name).querySelector('svg')

    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0)
  })

  it('los tres dibujos son distintos', () => {
    const drawings = NAMES.map((name) => renderIcon(name).querySelector('svg')?.innerHTML)

    expect(drawings.every((drawing) => drawing)).toBe(true)
    expect(new Set(drawings).size).toBe(NAMES.length)
  })

  it('suma la clase que recibe a la suya', () => {
    const svg = renderIcon('clock', 'extra').querySelector('svg')

    expect(svg?.getAttribute('class')?.split(' ')).toContain('extra')
  })
})
