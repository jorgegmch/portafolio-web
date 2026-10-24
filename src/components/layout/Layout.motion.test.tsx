import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Layout } from '@/components/layout/Layout'
import { storageKeys } from '@/config/storage'
import { useMotionPause } from '@/hooks/useMotionPause'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

const { es } = dictionaries

/** Lo que ve quien anima con JavaScript: el estado de la pausa. */
function Probe() {
  const { paused } = useMotionPause()
  return <p>{paused ? 'pausado' : 'en marcha'}</p>
}

const renderLayout = () =>
  render(
    <MemoryRouter>
      <LangProvider>
        <Layout>
          <Probe />
        </Layout>
      </LangProvider>
    </MemoryRouter>,
  )

/** El armazón que marca el estado para el CSS. */
const frame = () => document.querySelector('[data-motion]')
const pauseButton = () => screen.getByRole('button', { name: es.nav.pauseAnimations })

beforeEach(() => {
  // Sin la intro, que deja la página inerte mientras se ve.
  sessionStorage.setItem(storageKeys.session.introSeen, '1')
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Layout: pausa global de las animaciones (WCAG 2.2.2)', () => {
  it('al cargar nada está pausado', () => {
    renderLayout()

    expect(frame()).toHaveAttribute('data-motion', 'running')
    expect(pauseButton()).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('en marcha')).toBeInTheDocument()
  })

  it('el botón pausa toda la página y la vuelve a poner en marcha', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(pauseButton())
    expect(frame()).toHaveAttribute('data-motion', 'paused')
    expect(pauseButton()).toHaveAttribute('aria-pressed', 'true')

    await user.click(pauseButton())
    expect(frame()).toHaveAttribute('data-motion', 'running')
    expect(pauseButton()).toHaveAttribute('aria-pressed', 'false')
  })

  it('lo que se anima con JavaScript se entera de la pausa', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(pauseButton())

    expect(screen.getByText('pausado')).toBeInTheDocument()
  })

  it.each(['{Enter}', ' '])('se opera con el teclado (%s)', async (key) => {
    const user = userEvent.setup()
    renderLayout()

    pauseButton().focus()
    await user.keyboard(key)

    expect(frame()).toHaveAttribute('data-motion', 'paused')
  })

  // El estado lo dice aria-pressed; un nombre que cambiara confundiría.
  it('su nombre no cambia al pulsarlo', async () => {
    const user = userEvent.setup()
    renderLayout()
    const button = pauseButton()

    await user.click(button)

    expect(button).toHaveAccessibleName(es.nav.pauseAnimations)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
