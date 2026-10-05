import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { ContactButton } from '@/components/ui/ContactButton'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

// El valor esperado se obtiene de assembleContact, nunca se escribe aquí.
const whatsappDigits = () => getWhatsappUrl().replace('https://wa.me/', '')

const renderBoth = () =>
  render(
    <>
      <ContactButton kind="email" label="Correo" />
      <ContactButton kind="whatsapp" label="WhatsApp" />
    </>,
  )

let open: MockInstance<typeof window.open>

beforeEach(() => {
  open = vi.spyOn(window, 'open').mockImplementation(() => null)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ContactButton', () => {
  describe('antes de interactuar', () => {
    it('ni el correo ni el número existen en el DOM', () => {
      renderBoth()
      const html = document.documentElement.outerHTML

      expect(html).not.toContain(getEmail())
      expect(html).not.toContain(getEmail().split('@')[0])
      expect(html).not.toContain(whatsappDigits())
      expect(html).not.toContain('@')
      expect(html).not.toContain('mailto:')
      expect(html).not.toContain('wa.me')
    })

    it('no abre ningún enlace', () => {
      renderBoth()
      expect(open).not.toHaveBeenCalled()
    })
  })

  describe('al hacer clic', () => {
    it('el de email abre mailto: y muestra el correo como texto', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.click(screen.getByRole('button', { name: 'Correo' }))

      expect(open).toHaveBeenCalledExactlyOnceWith(getEmailUrl(), '_self')
      expect(screen.getByRole('status')).toHaveTextContent(getEmail())
    })

    it('el de WhatsApp abre wa.me en pestaña nueva con noopener,noreferrer', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.click(screen.getByRole('button', { name: 'WhatsApp' }))

      expect(open).toHaveBeenCalledExactlyOnceWith(
        getWhatsappUrl(),
        '_blank',
        'noopener,noreferrer',
      )
    })

    it('el de WhatsApp no deja el número en el DOM', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.click(screen.getByRole('button', { name: 'WhatsApp' }))

      expect(document.documentElement.outerHTML).not.toContain(whatsappDigits())
    })
  })

  describe('teclado', () => {
    it('ambos botones se alcanzan con Tab, en orden', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.tab()
      expect(screen.getByRole('button', { name: 'Correo' })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole('button', { name: 'WhatsApp' })).toHaveFocus()
    })

    it('enfocar el botón no arma ni muestra el dato', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.tab()

      expect(open).not.toHaveBeenCalled()
      expect(document.documentElement.outerHTML).not.toContain(getEmail())
    })

    it.each(['{Enter}', ' '])('se activa con la tecla "%s"', async (key) => {
      const user = userEvent.setup()
      renderBoth()

      await user.tab()
      await user.keyboard(key)

      expect(open).toHaveBeenCalledExactlyOnceWith(getEmailUrl(), '_self')
    })
  })
})
