import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import App from '@/App'
import { MAIN_CONTENT_ID, routes } from '@/config/routes'
import { site } from '@/config/site'
import { storageKeys } from '@/config/storage'
import { useIntroGate } from '@/hooks/useIntroGate'
import { dictionaries } from '@/i18n/index'
import { buildIntroFrames, INTRO_TIMING } from '@/lib/introFrames'
import { mockMatchMedia } from '@/test/mockMatchMedia'

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

/** Deja la sesión como si la animación de carga ya se hubiera visto. */
const markIntroSeen = () => {
  const { result, unmount } = renderHook(() => useIntroGate())
  act(() => result.current[1]())
  unmount()
}
const pageTitle = (name: string) => within(main()).getByRole('heading', { level: 1, name })

let scrollTo: Mock

beforeEach(() => {
  scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  // Estos tests describen la aplicación sin la animación de carga encima; los
  // de la intro están en su propio bloque, que vuelve a dejar la sesión limpia.
  markIntroSeen()
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

      expect(pageTitle(site.shortName)).toBeInTheDocument()
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

  describe('animación de carga', () => {
    const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
    const INTRO_SEEN = storageKeys.session.introSeen

    const skipIntro = () => screen.getByRole('button', { name: es.intro.skip })
    const querySkipIntro = () => screen.queryByRole('button', { name: es.intro.skip })
    const skipLink = () => screen.getByRole('link', { name: es.nav.skipToContent })
    /** El envoltorio de la página, si está inerte. */
    const inertPage = () => main().closest('[inert]')

    /** Salta la intro y da por terminado su desvanecimiento. */
    const skipAndFadeOut = () => {
      const layer = skipIntro().parentElement
      fireEvent.click(skipIntro())
      if (layer) fireEvent.transitionEnd(layer)
    }

    beforeEach(() => {
      sessionStorage.clear()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('en la primera visita', () => {
      it('aparece, con el foco en el botón de saltar', () => {
        renderAt(routes.home)

        expect(skipIntro()).toHaveFocus()
      })

      it('aparece también al entrar por otra ruta', () => {
        renderAt(routes.certifications)

        expect(skipIntro()).toBeInTheDocument()
      })

      it('la página ya está montada debajo, con un solo h1', () => {
        renderAt(routes.home)

        expect(skipIntro()).toBeInTheDocument()
        expect(pageTitle(es.hero.heading)).toBeInTheDocument()
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      })

      it('el resto de la página queda inerte: skip link, fondo, barra, contenido y pie', () => {
        const { container } = renderAt(routes.home)
        const page = inertPage()

        expect(page).not.toBeNull()
        expect(page).toContainElement(skipLink())
        expect(page).toContainElement(container.querySelector('canvas'))
        expect(page).toContainElement(screen.getByRole('banner'))
        expect(page).toContainElement(screen.getByRole('contentinfo'))
      })

      it('la intro queda fuera de lo inerte: su botón se puede usar', () => {
        renderAt(routes.home)

        expect(skipIntro().closest('[inert]')).toBeNull()
      })
    })

    describe('al saltarla', () => {
      it('desaparece y la página deja de estar inerte', () => {
        renderAt(routes.home)
        expect(inertPage()).not.toBeNull()

        skipAndFadeOut()

        expect(querySkipIntro()).not.toBeInTheDocument()
        expect(inertPage()).toBeNull()
      })

      it('mientras se desvanece la página sigue inerte', () => {
        renderAt(routes.home)

        fireEvent.click(skipIntro())

        expect(skipIntro()).toBeInTheDocument()
        expect(inertPage()).not.toBeNull()
      })

      it('la página sigue con un solo h1 y las mismas zonas', () => {
        renderAt(routes.home)

        skipAndFadeOut()

        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
        expect(screen.getAllByRole('banner')).toHaveLength(1)
        expect(screen.getAllByRole('main')).toHaveLength(1)
        expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
      })

      it('el siguiente Tab cae en el skip link', async () => {
        const { user } = renderAt(routes.home)
        skipAndFadeOut()
        expect(document.body).toHaveFocus()

        await user.tab()

        expect(skipLink()).toHaveFocus()
      })

      it('queda marcada como vista en la sesión', () => {
        renderAt(routes.home)
        expect(sessionStorage.getItem(INTRO_SEEN)).toBeNull()

        skipAndFadeOut()

        expect(sessionStorage.getItem(INTRO_SEEN)).not.toBeNull()
      })
    })

    describe('si se deja terminar sola', () => {
      const frames = () => {
        const phrase = es.intro.phrases[0]
        if (!phrase) throw new Error('El diccionario no tiene ninguna frase para la intro')
        return buildIntroFrames(phrase.natural, phrase.code)
      }
      const advance = (ms: number) => {
        act(() => {
          vi.advanceTimersByTime(ms)
        })
      }
      const playToEnd = () => frames().forEach((frame) => advance(frame.holdMs))

      beforeEach(() => {
        vi.useFakeTimers()
      })

      it('sigue en pantalla hasta que acaba la secuencia', () => {
        renderAt(routes.home)

        playToEnd()

        expect(skipIntro()).toBeInTheDocument()
        expect(inertPage()).not.toBeNull()
      })

      // jsdom no dispara transitionend: aquí solo actúa el respaldo, que es
      // justo lo que impide que la página se quede inerte.
      it('aunque la transición no termine, desaparece y la página deja de estar inerte', () => {
        renderAt(routes.home)
        playToEnd()
        expect(inertPage()).not.toBeNull()

        advance(INTRO_TIMING.exitFallbackMs)

        expect(querySkipIntro()).not.toBeInTheDocument()
        expect(inertPage()).toBeNull()
      })

      it('queda marcada como vista en la sesión', () => {
        renderAt(routes.home)
        playToEnd()
        expect(sessionStorage.getItem(INTRO_SEEN)).toBeNull()

        advance(INTRO_TIMING.exitFallbackMs)

        expect(sessionStorage.getItem(INTRO_SEEN)).not.toBeNull()
      })
    })

    describe('no aparece', () => {
      it('en la segunda visita de la sesión', () => {
        const first = renderAt(routes.home)
        skipAndFadeOut()
        first.unmount()

        renderAt(routes.home)

        expect(querySkipIntro()).not.toBeInTheDocument()
        expect(inertPage()).toBeNull()
      })

      it('si el visitante pidió reducir el movimiento', () => {
        mockMatchMedia({ [REDUCED_MOTION]: true })

        renderAt(routes.home)

        expect(querySkipIntro()).not.toBeInTheDocument()
        expect(inertPage()).toBeNull()
        expect(pageTitle(es.hero.heading)).toBeInTheDocument()
      })

      it('al navegar entre páginas después de haberla visto', async () => {
        const { user } = renderAt(routes.home)
        skipAndFadeOut()

        await user.click(screen.getByRole('link', { name: es.nav.certifications }))

        expect(pageTitle(es.certifications.heading)).toBeInTheDocument()
        expect(querySkipIntro()).not.toBeInTheDocument()
      })
    })
  })
})
