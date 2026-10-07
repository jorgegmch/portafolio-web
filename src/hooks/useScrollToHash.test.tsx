import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useScrollToHash } from '@/hooks/useScrollToHash'

function Page() {
  useScrollToHash()
  return (
    <>
      <Link to="#about">Sobre mí</Link>
      <Link to="#projects">Proyectos</Link>
      <Link to="#no-existe">Roto</Link>
      <Link to="/">Sin ancla</Link>
      <section id="about" aria-label="Sobre mí" />
      <section id="projects" aria-label="Proyectos" />
    </>
  )
}

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Page />
    </MemoryRouter>,
  )

const section = (name: string) => screen.getByRole('region', { name })

// jsdom no implementa scrollIntoView.
let scrollIntoView: Mock<Element['scrollIntoView']>

beforeEach(() => {
  scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.restoreAllMocks()
})

describe('useScrollToHash', () => {
  it('al llegar con un ancla en la URL hace scroll a su elemento', () => {
    renderAt('/#projects')

    expect(scrollIntoView.mock.contexts).toEqual([section('Proyectos')])
  })

  it('al cambiar el ancla hace scroll al nuevo elemento', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Sobre mí' }))
    await user.click(screen.getByRole('link', { name: 'Proyectos' }))

    expect(scrollIntoView.mock.contexts).toEqual([section('Sobre mí'), section('Proyectos')])
  })

  // Quien ya subió a mano y vuelve a pulsar el mismo enlace espera volver.
  it('pulsar otra vez el mismo ancla repite el scroll', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Proyectos' }))
    await user.click(screen.getByRole('link', { name: 'Proyectos' }))

    expect(scrollIntoView.mock.contexts).toEqual([section('Proyectos'), section('Proyectos')])
  })

  it('sin ancla no hace scroll', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Sin ancla' }))

    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('un ancla que no existe no rompe ni hace scroll', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('link', { name: 'Roto' }))

    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Roto' })).toBeInTheDocument()
  })

  it.each(['/#', '/#%', '/#%E0%A4%A'])('un ancla mal formada (%s) no rompe', (url) => {
    expect(() => renderAt(url)).not.toThrow()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('no añade listeners que haya que limpiar', async () => {
    const onWindow = vi.spyOn(window, 'addEventListener')
    const onDocument = vi.spyOn(document, 'addEventListener')
    const user = userEvent.setup()
    // user-event añade los suyos al preparar el documento: se descartan.
    onWindow.mockClear()
    onDocument.mockClear()

    const { unmount } = renderAt('/#about')
    await user.click(screen.getByRole('link', { name: 'Proyectos' }))
    unmount()

    expect(onWindow).not.toHaveBeenCalled()
    expect(onDocument).not.toHaveBeenCalled()
  })
})
