import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useScrollToHash } from '@/hooks/useScrollToHash'

// Geometría de mentira: jsdom no maqueta. Cada panel dice su alto en
// data-height y dónde lo pinta el navegador (relativo a la ventana) en
// data-rendered-top. Un panel fijado (sticky) se pinta donde está fijado,
// no donde le toca en el flujo: es lo que confundía a scrollIntoView.
const PAD = 12
const GAP = 12
const MARGIN = 88
const HEIGHTS = { hero: 900, about: 1400, projects: 1600 }

function Page() {
  useScrollToHash()
  const navigate = useNavigate()
  return (
    <>
      <Link to="#about">Sobre mí</Link>
      <Link to="#projects">Proyectos</Link>
      <Link to="#title">Título</Link>
      <Link to="#no-existe">Roto</Link>
      <Link to="/">Sin ancla</Link>
      <button type="button" onClick={() => void navigate(-1)}>
        Atrás
      </button>
      <button type="button" onClick={() => void navigate(1)}>
        Adelante
      </button>
      <main
        data-rendered-top="0"
        style={{ display: 'flex', flexDirection: 'column', rowGap: `${GAP}px`, paddingTop: `${PAD}px` }}
      >
        <section
          id="hero"
          aria-label="Hero"
          data-height={HEIGHTS.hero}
          style={{ position: 'sticky', scrollMarginTop: `${MARGIN}px` }}
        />
        <section
          id="about"
          aria-label="Sobre mí"
          data-height={HEIGHTS.about}
          style={{ position: 'sticky', scrollMarginTop: `${MARGIN}px` }}
        >
          <h2 id="title" data-offset="104" style={{ scrollMarginTop: '0px' }}>
            Título
          </h2>
        </section>
        <section
          id="projects"
          aria-label="Proyectos"
          data-height={HEIGHTS.projects}
          style={{ position: 'sticky', scrollMarginTop: `${MARGIN}px` }}
        />
      </main>
    </>
  )
}

const ABOUT_TOP = PAD + HEIGHTS.hero + GAP
const PROJECTS_TOP = ABOUT_TOP + HEIGHTS.about + GAP

const renderAt = (url: string) => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[url]}>
      <Page />
    </MemoryRouter>,
  )
  return {
    goTo: (name: string) => user.click(screen.getByRole('link', { name })),
    back: () => user.click(screen.getByRole('button', { name: 'Atrás' })),
    forward: () => user.click(screen.getByRole('button', { name: 'Adelante' })),
  }
}

/**
 * Pinta los paneles como los pintaría el navegador con la página bajada:
 * todos los que no se indican están en su sitio del flujo y los fijados,
 * arriba del todo, donde los deja la cortina.
 */
const paint = ({ scrollY, pinned = [] }: { scrollY: number; pinned?: string[] }) => {
  vi.stubGlobal('scrollY', scrollY)
  const flow: Record<string, number> = { hero: PAD, about: ABOUT_TOP, projects: PROJECTS_TOP }
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const panel = this.closest('section')
    const id = panel?.id ?? ''
    const panelTop = pinned.includes(id) ? 0 : (flow[id] ?? 0) - scrollY
    const offset = this === panel ? 0 : Number((this as HTMLElement).dataset.offset ?? 0)
    const top = this.tagName === 'MAIN' ? -scrollY : panelTop + offset
    return DOMRect.fromRect({ x: 0, y: top, width: 0, height: 0 })
  })
}

let scrollTo: Mock

beforeEach(() => {
  scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return Number(this.dataset.height ?? 0)
  })
  paint({ scrollY: 0 })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** Último destino pedido a scrollTo, en px desde el inicio del documento. */
const lastTop = () => (scrollTo.mock.lastCall?.[0] as ScrollToOptions | undefined)?.top

describe('useScrollToHash', () => {
  it('al llegar con un ancla en la URL va a su sección, dejando sitio a la barra fija', () => {
    renderAt('/#projects')

    expect(lastTop()).toBe(PROJECTS_TOP - MARGIN)
  })

  it('al cambiar el ancla va a la nueva sección', async () => {
    const { goTo } = renderAt('/')

    await goTo('Sobre mí')
    expect(lastTop()).toBe(ABOUT_TOP - MARGIN)

    await goTo('Proyectos')
    expect(lastTop()).toBe(PROJECTS_TOP - MARGIN)
  })

  // La animación la decide scroll-behavior en global.css (suave, salvo con
  // movimiento reducido): aquí no se fuerza.
  it('no fuerza el tipo de desplazamiento: lo decide el CSS', async () => {
    const { goTo } = renderAt('/')

    await goTo('Sobre mí')

    expect(scrollTo.mock.lastCall?.[0]).toEqual({ top: ABOUT_TOP - MARGIN, left: 0 })
  })

  // El fallo de la auditoría: con la cortina, el panel de destino puede estar
  // fijado arriba, pintado lejos de su sitio en el flujo.
  it('con el panel de destino fijado, va a su sitio en el flujo, no adonde está pintado', async () => {
    const { goTo } = renderAt('/')
    paint({ scrollY: 2400, pinned: ['about'] })

    await goTo('Proyectos')

    expect(lastTop()).toBe(PROJECTS_TOP - MARGIN)
  })

  it('un ancla dentro de un panel fijado suma su distancia al borde del panel', async () => {
    const { goTo } = renderAt('/')
    paint({ scrollY: 3000, pinned: ['about'] })

    await goTo('Título')

    expect(lastTop()).toBe(ABOUT_TOP + 104)
  })

  // Con la restauración automática, al volver con Atrás el navegador pone la
  // posición que guardó para esa entrada, y pisa la de la sección (medido en
  // Chrome: acababa en 0). Las entradas con ancla las coloca el hook; las
  // demás las sigue restaurando el navegador, también al recargar.
  describe('restauración del navegador', () => {
    afterEach(() => {
      history.scrollRestoration = 'auto'
    })

    it('en una entrada con ancla la desactiva', async () => {
      const { goTo } = renderAt('/')

      await goTo('Sobre mí')

      expect(history.scrollRestoration).toBe('manual')
    })

    it('al llegar con ancla en la URL también', () => {
      renderAt('/#projects')

      expect(history.scrollRestoration).toBe('manual')
    })

    it('en una entrada sin ancla la deja al navegador', async () => {
      const { goTo } = renderAt('/')
      await goTo('Sobre mí')

      await goTo('Sin ancla')

      expect(history.scrollRestoration).toBe('auto')
    })
  })

  describe('Atrás y Adelante', () => {
    it('al volver atrás a un ancla, va a esa sección y no a donde la pinta la cortina', async () => {
      const { goTo, back } = renderAt('/')
      await goTo('Sobre mí')
      await goTo('Proyectos')
      paint({ scrollY: PROJECTS_TOP, pinned: ['about'] })

      await back()

      expect(lastTop()).toBe(ABOUT_TOP - MARGIN)
    })

    it('al ir adelante a un ancla, también', async () => {
      const { goTo, back, forward } = renderAt('/')
      await goTo('Sobre mí')
      await goTo('Proyectos')
      await back()
      paint({ scrollY: ABOUT_TOP, pinned: ['hero'] })

      await forward()

      expect(lastTop()).toBe(PROJECTS_TOP - MARGIN)
    })
  })

  // Quien ya subió a mano y vuelve a pulsar el mismo enlace espera volver.
  it('pulsar otra vez el mismo ancla repite el desplazamiento', async () => {
    const { goTo } = renderAt('/')

    await goTo('Proyectos')
    await goTo('Proyectos')

    expect(scrollTo).toHaveBeenCalledTimes(2)
  })

  it('sin ancla, al montar, no se mueve', () => {
    renderAt('/')

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('un ancla que no existe no rompe ni se mueve', async () => {
    const { goTo } = renderAt('/')

    await goTo('Roto')

    expect(scrollTo).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Roto' })).toBeInTheDocument()
  })

  it.each(['/#', '/#%', '/#%E0%A4%A'])('un ancla mal formada (%s) no rompe', (url) => {
    expect(() => renderAt(url)).not.toThrow()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('no añade listeners que haya que limpiar', async () => {
    const onWindow = vi.spyOn(window, 'addEventListener')
    const onDocument = vi.spyOn(document, 'addEventListener')
    const user = userEvent.setup()
    // user-event añade los suyos al preparar el documento: se descartan.
    onWindow.mockClear()
    onDocument.mockClear()

    const { unmount } = render(
      <MemoryRouter initialEntries={['/#about']}>
        <Page />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('link', { name: 'Proyectos' }))
    unmount()

    expect(onWindow).not.toHaveBeenCalled()
    expect(onDocument).not.toHaveBeenCalled()
  })
})
