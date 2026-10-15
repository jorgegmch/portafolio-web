import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ServiceCard, type ServiceCardLink } from '@/components/ui/ServiceCard'
import styles from '@/components/ui/ServiceCard.module.css'

/** Nombre real de una clase del módulo; falla si el módulo no la tiene. */
const classOf = (name: string) => {
  const value = styles[name]
  if (!value) throw new Error(`ServiceCard.module.css no tiene la clase .${name}`)
  return value
}

const FRONT = classOf('front')
const BACK = classOf('back')
const FLIPPED = classOf('flipped')

// Textos de prueba, inventados.
const TITLE = 'Servicio de prueba'
const DESCRIPTION = 'Descripción de prueba del servicio.'
const LINK: ServiceCardLink = {
  href: 'https://example.test/repo',
  text: 'Ver proyecto',
  label: 'Servicio de prueba: Ver proyecto (pestaña nueva)',
}

/** Con `null`, la tarjeta va sin enlace. */
const renderCard = (link: ServiceCardLink | null = LINK) => {
  const view = render(
    <ServiceCard icon="server" title={TITLE} description={DESCRIPTION} link={link ?? undefined} />,
  )
  const root = view.container.firstElementChild
  const front = view.container.querySelector(`.${FRONT}`)
  const back = view.container.querySelector(`.${BACK}`)
  if (!(root instanceof HTMLElement) || !(front instanceof HTMLElement) || !(back instanceof HTMLElement)) {
    throw new Error('Faltan la tarjeta o sus caras')
  }
  const frontButton = () => within(front).getByRole('button')
  const backButton = () => within(back).getByRole('button')
  return { ...view, root, front, back, frontButton, backButton, user: userEvent.setup() }
}

describe('ServiceCard', () => {
  describe('frente', () => {
    // Un <h3> no puede ir dentro de un <button>: el botón va dentro del título.
    it('el título es un h3 con el botón de girar dentro', () => {
      const { front, frontButton } = renderCard()
      const heading = within(front).getByRole('heading', { level: 3 })

      expect(heading).toContainElement(frontButton())
      expect(frontButton()).toHaveTextContent(TITLE)
      expect(frontButton()).toHaveAttribute('type', 'button')
      expect(document.querySelector('button h3, button [role="heading"]')).toBeNull()
    })

    it('el botón dice que el dorso está plegado y cuál es', () => {
      const { back, frontButton } = renderCard()

      expect(frontButton()).toHaveAttribute('aria-expanded', 'false')
      expect(frontButton()).toHaveAttribute('aria-controls', back.id)
    })

    // Sin girar, el lector de pantalla ya oye la descripción.
    it('la descripción llega como descripción accesible del botón', () => {
      const { frontButton } = renderCard()

      expect(frontButton()).toHaveAccessibleDescription(DESCRIPTION)
    })

    // jsdom calcula la descripción aunque su destino sea inerte; Chromium no
    // (medido con CDP). El destino tiene que ser una copia con `hidden`,
    // fuera de todo contenedor inerte.
    it('la descripción sale de una copia oculta con hidden, fuera de lo inerte', () => {
      const { container, frontButton } = renderCard()
      const ids = frontButton().getAttribute('aria-describedby')?.split(' ') ?? []

      expect(ids).toHaveLength(1)
      const target = container.querySelector(`[id="${ids[0] ?? ''}"]`)

      expect(target).toHaveAttribute('hidden')
      expect(target?.textContent).toBe(DESCRIPTION)
      expect(target?.closest('[inert]')).toBeNull()
    })

    it('el icono es decorativo', () => {
      const { front } = renderCard()

      expect(front.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('dorso', () => {
    it('es un grupo con el nombre del título', () => {
      const { back } = renderCard()

      expect(back).toHaveAttribute('role', 'group')
      expect(back).toHaveAccessibleName(TITLE)
    })

    it('lleva la descripción y el enlace al repo, con su destino y su aviso', () => {
      const { back } = renderCard()
      const link = within(back).getByRole('link')

      expect(within(back).getByText(DESCRIPTION).tagName).toBe('P')
      expect(link).toHaveAttribute('href', LINK.href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAccessibleName(LINK.label)
      expect(link).toHaveTextContent(LINK.text)
    })

    it('sin enlace, solo la descripción y el botón de volver', () => {
      const { back } = renderCard(null)

      expect(within(back).queryByRole('link')).not.toBeInTheDocument()
      expect(within(back).getByText(DESCRIPTION)).toBeInTheDocument()
      expect(within(back).getAllByRole('button')).toHaveLength(1)
    })
  })

  describe('al empezar', () => {
    it('se ve el frente: el dorso es inerte y el frente no', () => {
      const { root, front, back } = renderCard()

      expect(root).not.toHaveClass(FLIPPED)
      expect(front).not.toHaveAttribute('inert')
      expect(back).toHaveAttribute('inert')
    })
  })

  describe('girar', () => {
    it('con un clic, se ve el dorso y el foco pasa a su botón', async () => {
      const { root, front, back, frontButton, backButton, user } = renderCard()

      await user.click(frontButton())

      expect(root).toHaveClass(FLIPPED)
      expect(front).toHaveAttribute('inert')
      expect(back).not.toHaveAttribute('inert')
      expect(frontButton()).toHaveAttribute('aria-expanded', 'true')
      expect(backButton()).toHaveAttribute('aria-expanded', 'true')
      expect(backButton()).toHaveFocus()
    })

    it('un segundo clic la devuelve y el foco vuelve al botón del frente', async () => {
      const { root, front, back, frontButton, backButton, user } = renderCard()

      await user.click(frontButton())
      await user.click(backButton())

      expect(root).not.toHaveClass(FLIPPED)
      expect(front).not.toHaveAttribute('inert')
      expect(back).toHaveAttribute('inert')
      expect(frontButton()).toHaveAttribute('aria-expanded', 'false')
      expect(frontButton()).toHaveFocus()
    })

    it.each(['{Enter}', ' '])('con el teclado (%s) gira y vuelve', async (key) => {
      const { root, frontButton, backButton, user } = renderCard()

      frontButton().focus()
      await user.keyboard(key)
      expect(root).toHaveClass(FLIPPED)
      expect(backButton()).toHaveFocus()

      await user.keyboard(key)
      expect(root).not.toHaveClass(FLIPPED)
      expect(frontButton()).toHaveFocus()
    })

    // El botón de volver tiene el nombre del título, como el del frente.
    it('el botón del dorso se llama como la tarjeta', () => {
      const { backButton } = renderCard()

      expect(backButton()).toHaveAccessibleName(TITLE)
      expect(backButton()).toHaveAttribute('type', 'button')
    })

    it('cada tarjeta gira por su cuenta', async () => {
      const user = userEvent.setup()
      render(
        <>
          <ServiceCard icon="server" title="Uno" description="Primera." />
          <ServiceCard icon="chat" title="Dos" description="Segunda." />
        </>,
      )
      const [first, second] = screen
        .getAllByRole('heading', { level: 3 })
        .map((heading) => within(heading).getByRole('button'))

      if (!first || !second) throw new Error('Faltan los botones')
      await user.click(first)

      expect(first).toHaveAttribute('aria-expanded', 'true')
      expect(second).toHaveAttribute('aria-expanded', 'false')
    })

    // El estado no se guarda: al volver a montar, se ve el frente.
    it('al volver a montar, vuelve al frente', async () => {
      const { frontButton, unmount, user } = renderCard()

      await user.click(frontButton())
      unmount()
      const again = renderCard()

      expect(again.root).not.toHaveClass(FLIPPED)
      expect(again.back).toHaveAttribute('inert')
    })
  })
})
