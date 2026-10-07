import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useScrollToHash } from '@/hooks/useScrollToHash'

const HOME = '/'
const OTHER = '/otra'
const BACK = -1
const TOP_INSTANTLY = { top: 0, left: 0, behavior: 'instant' }

function Page() {
  useScrollToHash()
  const navigate = useNavigate()
  return (
    <>
      <Link to={HOME}>Inicio</Link>
      <Link to={OTHER}>Otra</Link>
      <Link to={`${OTHER}#detail`}>Otra con ancla</Link>
      <button type="button" onClick={() => void navigate(BACK)}>
        Atrás
      </button>
      <section id="detail" aria-label="Detalle" />
    </>
  )
}

const renderAt = (url: string) => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[url]}>
      <Page />
    </MemoryRouter>,
  )
  return {
    goTo: (name: string) => user.click(screen.getByRole('link', { name })),
    goBack: () => user.click(screen.getByRole('button', { name: 'Atrás' })),
  }
}

// jsdom no implementa ni scrollTo ni scrollIntoView.
let scrollTo: Mock
let scrollIntoView: Mock<Element['scrollIntoView']>

beforeEach(() => {
  scrollTo = vi.fn()
  vi.stubGlobal('scrollTo', scrollTo)
  scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useScrollToHash: cambio de ruta', () => {
  it('al navegar a otra ruta sin ancla sube al inicio', async () => {
    const { goTo } = renderAt(HOME)

    await goTo('Otra')

    expect(scrollTo).toHaveBeenCalledTimes(1)
  })

  // scroll-behavior: smooth animaría la subida; al cambiar de página se aparece arriba.
  it('sube de golpe, sin animación', async () => {
    const { goTo } = renderAt(HOME)

    await goTo('Otra')

    expect(scrollTo).toHaveBeenLastCalledWith(TOP_INSTANTLY)
  })

  it('cada navegación nueva sube otra vez', async () => {
    const { goTo } = renderAt(HOME)

    await goTo('Otra')
    await goTo('Inicio')

    expect(scrollTo).toHaveBeenCalledTimes(2)
  })

  // El enlace del logo, pulsado ya en el inicio, debe devolver arriba.
  it('navegar a la ruta en la que ya se está también sube', async () => {
    const { goTo } = renderAt(HOME)

    await goTo('Inicio')

    expect(scrollTo).toHaveBeenCalledTimes(1)
  })

  // Al cargar o recargar, el navegador restaura la posición por su cuenta.
  it('al montar no sube', () => {
    renderAt(OTHER)

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('al volver atrás no sube: el navegador restaura la posición', async () => {
    const { goTo, goBack } = renderAt(HOME)
    await goTo('Otra')
    scrollTo.mockClear()

    await goBack()

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('si la ruta nueva trae ancla, va al ancla y no al inicio', async () => {
    const { goTo } = renderAt(HOME)

    await goTo('Otra con ancla')

    expect(scrollTo).not.toHaveBeenCalled()
    expect(scrollIntoView.mock.contexts).toEqual([screen.getByRole('region', { name: 'Detalle' })])
  })
})
