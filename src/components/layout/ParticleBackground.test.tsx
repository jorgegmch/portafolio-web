import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ParticleBackground } from '@/components/layout/ParticleBackground'
import styles from '@/components/layout/ParticleBackground.module.css'
import { useParticleCanvas } from '@/hooks/useParticleCanvas'

vi.mock('@/hooks/useParticleCanvas', () => ({ useParticleCanvas: vi.fn() }))

// Vitest no procesa el CSS (css: false) y jsdom no lo aplica: las reglas se
// comprueban leyendo el archivo tal como está en disco, desde la raíz del repo.
const CSS_PATH = 'src/components/layout/ParticleBackground.module.css'
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const css = readFileSync(CSS_PATH, 'utf8').replace(CSS_COMMENT, '')

const renderBackground = () => {
  const view = render(<ParticleBackground />)
  return { ...view, canvas: view.container.querySelector('canvas') }
}

/** Declaraciones de la regla `.canvas`, como pares propiedad-valor. */
const canvasRule = () => {
  const body = /\.canvas\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

afterEach(() => {
  vi.mocked(useParticleCanvas).mockClear()
})

describe('ParticleBackground', () => {
  it('renderiza un solo canvas, oculto a los lectores de pantalla', () => {
    const { container, canvas } = renderBackground()

    expect(container.querySelectorAll('canvas')).toHaveLength(1)
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('el canvas no entra en el orden de tabulación ni lleva texto', () => {
    const { canvas } = renderBackground()

    expect(canvas).not.toHaveAttribute('tabindex')
    expect(canvas).toBeEmptyDOMElement()
  })

  it('pasa al hook una referencia que apunta a su canvas', () => {
    const { canvas } = renderBackground()

    expect(useParticleCanvas).toHaveBeenCalled()
    const ref = vi.mocked(useParticleCanvas).mock.lastCall?.[0]
    expect(canvas).not.toBeNull()
    expect(ref?.current).toBe(canvas)
  })

  it('al desmontar, la referencia deja de apuntar al canvas', () => {
    const { unmount, canvas } = renderBackground()
    const ref = vi.mocked(useParticleCanvas).mock.lastCall?.[0]
    expect(ref?.current).toBe(canvas)

    unmount()

    expect(ref?.current).toBeNull()
  })

  describe('estilos', () => {
    it('el canvas lleva la clase del módulo', () => {
      const { canvas } = renderBackground()

      expect(styles.canvas).toBeTruthy()
      expect(canvas).toHaveClass(styles.canvas ?? '')
    })

    it('la regla lo fija a toda la ventana', () => {
      expect(canvasRule()).toMatchObject({
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
      })
    })

    it('la regla lo deja detrás del contenido, con el token de capa', () => {
      expect(canvasRule()).toMatchObject({ 'z-index': 'var(--z-background)' })
    })

    it('la regla lo hace transparente a los clics', () => {
      expect(canvasRule()).toMatchObject({ 'pointer-events': 'none' })
    })
  })
})
