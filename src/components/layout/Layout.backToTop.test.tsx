import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Layout } from '@/components/layout/Layout'
import { sections } from '@/config/routes'
import { storageKeys } from '@/config/storage'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { mockMatchMedia } from '@/test/mockMatchMedia'

// «Volver arriba» (pie): lleva al inicio de la página, no al Hero. Con la
// cortina el Hero está fijo, y saltar a su ancla solo subía hasta él tal
// como estaba fijado (medido: desde el pie quedaba en Contacto). El foco va
// al principio de la página, al skip link, como al cargarla.

const { es } = dictionaries
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

let scrollTo: MockInstance<typeof window.scrollTo>

const renderLayout = () =>
  render(
    <MemoryRouter>
      <LangProvider>
        <Layout>
          <p>contenido</p>
        </Layout>
      </LangProvider>
    </MemoryRouter>,
  )

const backToTop = () =>
  within(screen.getByRole('contentinfo')).getByRole('link', { name: new RegExp(es.footer.backToTop) })

beforeEach(() => {
  sessionStorage.setItem(storageKeys.session.introSeen, '1')
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('lang')
})

describe('«Volver arriba»', () => {
  it('sube al inicio de la página, con desplazamiento suave', async () => {
    mockMatchMedia({ [REDUCED_MOTION]: false })
    const user = userEvent.setup()
    renderLayout()

    await user.click(backToTop())

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' })
  })

  it('con movimiento reducido sube de golpe', async () => {
    mockMatchMedia({ [REDUCED_MOTION]: true })
    const user = userEvent.setup()
    renderLayout()

    await user.click(backToTop())

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('lleva el foco al principio de la página: el skip link', async () => {
    mockMatchMedia({ [REDUCED_MOTION]: false })
    const user = userEvent.setup()
    renderLayout()

    await user.click(backToTop())

    expect(screen.getByRole('link', { name: es.nav.skipToContent })).toHaveFocus()
  })

  it('con el teclado hace lo mismo', async () => {
    mockMatchMedia({ [REDUCED_MOTION]: false })
    const user = userEvent.setup()
    renderLayout()

    backToTop().focus()
    await user.keyboard('{Enter}')

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' })
    expect(screen.getByRole('link', { name: es.nav.skipToContent })).toHaveFocus()
  })

  // Sin JavaScript sigue llevando al Hero; con él, el salto al ancla se anula.
  it('anula el salto al ancla del Hero, que con la cortina se queda corto', () => {
    mockMatchMedia({ [REDUCED_MOTION]: false })
    renderLayout()

    const notPrevented = fireEvent.click(backToTop())

    expect(backToTop()).toHaveAttribute('href', `#${sections.hero}`)
    expect(notPrevented).toBe(false)
  })
})
