import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorldMap } from '@/components/ui/WorldMap'
import { site } from '@/config/site'
import { worldMap } from '@/data/worldMap'
import { project } from '@/lib/mapProjection'

const renderMap = (className?: string) => {
  const { container } = render(<WorldMap className={className} />)
  const svg = container.querySelector('svg')
  return { container, svg, city: svg?.querySelector('circle') }
}

describe('WorldMap', () => {
  it('es un solo svg', () => {
    const { container } = renderMap()

    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('svg')
  })

  // Decorativo: el lector de pantalla lo salta y el teclado no se para en él.
  describe('decorativo', () => {
    it('va oculto al lector de pantalla y sin foco', () => {
      const { svg } = renderMap()

      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).toHaveAttribute('focusable', 'false')
      expect(svg).not.toHaveAttribute('tabindex')
    })

    it('no tiene rol ni nombre accesible', () => {
      const { svg } = renderMap()

      expect(svg).not.toHaveAttribute('role')
      expect(svg).not.toHaveAttribute('aria-label')
      expect(svg).not.toHaveAttribute('aria-labelledby')
    })

    it('no lleva título ni texto', () => {
      const { svg } = renderMap()

      expect(svg?.querySelector('title, desc, text')).toBeNull()
      expect(svg?.textContent).toBe('')
    })
  })

  describe('dibujo', () => {
    it('el cuadro sale de worldMap', () => {
      const { svg } = renderMap()

      expect(svg).toHaveAttribute('viewBox', `0 0 ${worldMap.width} ${worldMap.height}`)
      expect(svg).toHaveAttribute('viewBox', '0 0 1000 400')
    })

    // El tamaño lo pone el CSS: ancho del contenedor y alto por proporción.
    it('no fija ancho ni alto en el marcado', () => {
      const { svg } = renderMap()

      expect(svg).not.toHaveAttribute('width')
      expect(svg).not.toHaveAttribute('height')
    })

    it('la tierra es un solo path, el de worldMap', () => {
      const paths = renderMap().svg?.querySelectorAll('path')

      expect(paths).toHaveLength(1)
      expect(paths?.[0]).toHaveAttribute('d', worldMap.path)
    })

    // El color lo pone el CSS con tokens: el marcado no trae ninguno.
    it('no trae colores, estilos, imágenes ni URLs', () => {
      const markup = renderMap().container.innerHTML

      expect(markup).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i)
      expect(markup).not.toMatch(/\b(?:fill|stroke|style|filter)=/)
      expect(markup).not.toMatch(/href|url\(|<image|<use/i)
    })
  })

  describe('punto de la ciudad', () => {
    it('hay uno solo', () => {
      expect(renderMap().svg?.querySelectorAll('circle')).toHaveLength(1)
    })

    it('va después de la tierra, para quedar encima', () => {
      const { svg } = renderMap()

      expect(svg?.lastElementChild?.tagName.toLowerCase()).toBe('circle')
    })

    // Sale de las coordenadas de config pasadas por la proyección.
    it('está en la posición proyectada de la ciudad', () => {
      const { city } = renderMap()
      const { x, y } = project(site.coordinates)

      expect(Number(city?.getAttribute('cx'))).toBeCloseTo(x, 6)
      expect(Number(city?.getAttribute('cy'))).toBeCloseTo(y, 6)
    })

    it('cae en Sudamérica, al noroeste: no son la latitud y la longitud tal cual', () => {
      const { city } = renderMap()
      const cx = Number(city?.getAttribute('cx'))
      const cy = Number(city?.getAttribute('cy'))

      expect(cx).toBeGreaterThan(250)
      expect(cx).toBeLessThan(350)
      expect(cy).toBeGreaterThan(180)
      expect(cy).toBeLessThan(250)
    })

    it('tiene radio', () => {
      expect(Number(renderMap().city?.getAttribute('r'))).toBeGreaterThan(0)
    })

    // En unidades del viewBox, así que escala con el mapa.
    it('su radio es de 6,4 unidades del viewBox', () => {
      expect(renderMap().city?.getAttribute('r')).toBe('6.4')
    })
  })

  it('suma la clase que recibe a la suya', () => {
    const { svg } = renderMap('extra')

    expect(svg?.getAttribute('class')?.split(' ')).toHaveLength(2)
    expect(svg).toHaveClass('extra')
  })
})
