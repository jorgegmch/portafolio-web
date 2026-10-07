import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import App from '@/App'
import { MAIN_CONTENT_ID, routes } from '@/config/routes'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'

// El canvas tiene sus propios tests; aquí solo importa que el fondo esté montado.
vi.mock('@/hooks/useParticleCanvas', () => ({ useParticleCanvas: vi.fn() }))

const { es } = dictionaries
const UNKNOWN_URL = '/no-existe'
const TOP_INSTANTLY = { top: 0, left: 0, behavior: 'instant' }

const setUrl = (path: string) => window.history.replaceState(null, '', path)

const renderAt = (path: string) => {
  setUrl(path)
  const user = userEvent.setup()
  const view = render(<App />)
  return { ...view, user }
}

const main = () => screen.getByRole('main')
const pageTitle = (name: string) => within(main()).getByRole('heading', { level: 1, name })

let scrollTo: Mock

beforeEach(() => {
  scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setUrl(routes.home)
  document.documentElement.removeAttribute('lang')
})

describe('App', () => {
  describe('layout', () => {
    it('monta la barra, el contenido principal y el pie, uno de cada', () => {
      renderAt(routes.home)

      expect(screen.getAllByRole('banner')).toHaveLength(1)
      expect(screen.getAllByRole('main')).toHaveLength(1)
      expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    })

    it('monta el fondo de partículas, fuera del contenido principal', () => {
      const { container } = renderAt(routes.home)

      const canvas = container.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
      expect(main()).not.toContainElement(canvas)
    })

    it('ya no queda el texto de la plantilla', () => {
      const { container } = renderAt(routes.home)

      expect(container).not.toHaveTextContent('portafolio-web')
    })
  })

  describe('rutas', () => {
    it('la raíz monta la página de inicio dentro del contenido principal', () => {
      renderAt(routes.home)

      expect(pageTitle(es.hero.heading)).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })

    it('la ruta de certificaciones monta su página dentro del contenido principal', () => {
      renderAt(routes.certifications)

      expect(pageTitle(es.certifications.heading)).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })

    it('las dos rutas comparten barra y pie', () => {
      renderAt(routes.certifications)

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('una ruta desconocida redirige al inicio', () => {
      renderAt(UNKNOWN_URL)

      expect(pageTitle(site.legalName)).toBeInTheDocument()
      expect(window.location.pathname).toBe(routes.home)
    })

    // Con replace, Atrás no devuelve a la URL rota.
    it('la redirección reemplaza la entrada del historial en vez de añadir otra', () => {
      const entriesBefore = window.history.length

      renderAt(UNKNOWN_URL)

      expect(window.history.length).toBe(entriesBefore)
    })
  })

  describe('skip link', () => {
    it('apunta al contenido principal', () => {
      renderAt(routes.home)

      expect(screen.getByRole('link', { name: es.nav.skipToContent })).toHaveAttribute(
        'href',
        `#${MAIN_CONTENT_ID}`,
      )
      expect(main()).toHaveAttribute('id', MAIN_CONTENT_ID)
    })

    it('el contenido principal puede recibir el foco sin entrar en el orden de tabulación', () => {
      renderAt(routes.home)

      expect(main()).toHaveAttribute('tabindex', '-1')
    })

    it('es lo primero que alcanza el teclado', async () => {
      const { user } = renderAt(routes.home)

      await user.tab()

      expect(screen.getByRole('link', { name: es.nav.skipToContent })).toHaveFocus()
    })
  })

  describe('navegación', () => {
    it('ir a certificaciones cambia la página y sube al inicio de golpe', async () => {
      const { user } = renderAt(routes.home)

      await user.click(screen.getByRole('link', { name: es.nav.certifications }))

      expect(pageTitle(es.certifications.heading)).toBeInTheDocument()
      expect(window.location.pathname).toBe(routes.certifications)
      expect(scrollTo).toHaveBeenLastCalledWith(TOP_INSTANTLY)
    })

    it('al cargar una ruta no sube: el navegador restaura la posición', () => {
      renderAt(routes.certifications)

      expect(scrollTo).not.toHaveBeenCalled()
    })
  })
})
