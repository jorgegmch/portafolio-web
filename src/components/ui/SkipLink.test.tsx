import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { SkipLink } from '@/components/ui/SkipLink'
import { MAIN_CONTENT_ID } from '@/config/routes'

const LABEL = 'Saltar al contenido'

// Activar el enlace deja el ancla en la URL: se quita para el siguiente test.
afterEach(() => {
  window.history.replaceState(null, '', window.location.pathname)
})

describe('SkipLink', () => {
  it('es un enlace con el nombre recibido que apunta al contenido principal', () => {
    render(<SkipLink targetId={MAIN_CONTENT_ID} label={LABEL} />)

    expect(screen.getByRole('link', { name: LABEL })).toHaveAttribute(
      'href',
      `#${MAIN_CONTENT_ID}`,
    )
  })

  it('apunta al id que recibe, sin fijarlo', () => {
    render(<SkipLink targetId="otro-destino" label={LABEL} />)

    expect(screen.getByRole('link', { name: LABEL })).toHaveAttribute('href', '#otro-destino')
  })

  it('es lo primero que recibe el foco al tabular', async () => {
    const user = userEvent.setup()
    render(
      <>
        <SkipLink targetId={MAIN_CONTENT_ID} label={LABEL} />
        <button type="button">Otro control</button>
      </>,
    )

    await user.tab()

    expect(screen.getByRole('link', { name: LABEL })).toHaveFocus()
  })

  it('se activa con Enter y lleva al destino', async () => {
    const user = userEvent.setup()
    render(
      <>
        <SkipLink targetId={MAIN_CONTENT_ID} label={LABEL} />
        <main id={MAIN_CONTENT_ID} tabIndex={-1} />
      </>,
    )

    await user.tab()
    await user.keyboard('{Enter}')

    expect(window.location.hash).toBe(`#${MAIN_CONTENT_ID}`)
  })
})
