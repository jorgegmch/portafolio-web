import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { ContactButton } from '@/components/ui/ContactButton'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

// El valor esperado se obtiene de assembleContact, nunca se escribe aquí. Las
// aserciones comparan con booleanos: si fallan, no imprimen el dato.
const whatsappDigits = () => getWhatsappUrl().replace('https://wa.me/', '')

/** Si el HTML de la página contiene el correo, su parte local o el número. */
const leaks = () => {
  const html = document.documentElement.outerHTML
  const email = getEmail()
  return [email, email.split('@')[0] ?? email, whatsappDigits()].some((secret) => html.includes(secret))
}

const renderBoth = () =>
  render(
    <>
      <ContactButton
        kind="copy-email"
        label="Copiar correo"
        copiedMessage="Correo copiado."
        copyFailedMessage="No se pudo copiar."
      />
      <ContactButton kind="whatsapp" label="WhatsApp" />
    </>,
  )

let open: MockInstance<typeof window.open>

beforeEach(() => {
  open = vi.spyOn(window, 'open').mockImplementation(() => null)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ContactButton', () => {
  describe('antes de interactuar', () => {
    it('ni el correo ni el número existen en el DOM', () => {
      renderBoth()
      const html = document.documentElement.outerHTML

      expect(leaks()).toBe(false)
      expect(html.includes('@')).toBe(false)
      expect(html.includes('mailto:')).toBe(false)
      expect(html.includes('wa.me')).toBe(false)
    })

    it('no abre ningún enlace', () => {
      renderBoth()
      expect(open).not.toHaveBeenCalled()
    })
  })

  describe('al hacer clic', () => {
    it('el de copiar lleva el correo al portapapeles, lo anuncia y no lo escribe en la página', async () => {
      const user = userEvent.setup()
      const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
      renderBoth()
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

      await user.click(screen.getByRole('button', { name: 'Copiar correo' }))

      expect(writeText.mock.calls[0]?.[0] === getEmail()).toBe(true)
      expect(screen.getByRole('status')).toHaveTextContent('Correo copiado.')
      expect(leaks()).toBe(false)
    })

    it('si no se puede copiar, abre el programa de correo y lo dice', async () => {
      const user = userEvent.setup()
      renderBoth()
      vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })

      await user.click(screen.getByRole('button', { name: 'Copiar correo' }))

      expect(open.mock.calls[0]?.[0] === getEmailUrl()).toBe(true)
      expect(open.mock.calls[0]?.[1]).toBe('_self')
      expect(screen.getByRole('status')).toHaveTextContent('No se pudo copiar.')
    })

    it('el de WhatsApp abre wa.me en pestaña nueva con noopener,noreferrer', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.click(screen.getByRole('button', { name: 'WhatsApp' }))

      expect(open).toHaveBeenCalledOnce()
      expect(open.mock.calls[0]?.[0] === getWhatsappUrl()).toBe(true)
      expect(open.mock.calls[0]?.slice(1)).toEqual(['_blank', 'noopener,noreferrer'])
    })

    it('el de WhatsApp no deja el número en el DOM', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.click(screen.getByRole('button', { name: 'WhatsApp' }))

      expect(leaks()).toBe(false)
    })
  })

  describe('con icono', () => {
    const renderIcon = () =>
      render(
        <ContactButton
          kind="whatsapp"
          label="WhatsApp"
          icon={<svg data-testid="whatsapp-icon" aria-hidden="true" />}
          className="social"
        />,
      )

    it('el nombre accesible es la etiqueta y el texto visible desaparece', () => {
      renderIcon()

      const whatsapp = screen.getByRole('button', { name: 'WhatsApp' })

      expect(whatsapp).toHaveAttribute('aria-label', 'WhatsApp')
      expect(whatsapp).toHaveTextContent('')
    })

    it('el icono va dentro del botón, con la clase de quien lo usa', () => {
      renderIcon()

      const whatsapp = screen.getByRole('button', { name: 'WhatsApp' })
      expect(whatsapp).toContainElement(screen.getByTestId('whatsapp-icon'))
      expect(whatsapp).toHaveClass('social')
    })

    it('sigue siendo un botón, sin enlace ni dato en sus atributos', () => {
      renderIcon()
      const html = document.documentElement.outerHTML

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(leaks()).toBe(false)
      expect(html.includes('wa.me')).toBe(false)
      expect(html.includes('href')).toBe(false)
    })
  })

  // Icono o logo delante del texto, que sigue a la vista (spec v2.1 §3.5).
  describe('con icono delante del texto', () => {
    const renderLeading = () =>
      render(
        <ContactButton
          kind="copy-email"
          label="Copiar correo"
          leading={<svg data-testid="sobre" aria-hidden="true" />}
        />,
      )

    it('el icono va primero y el texto sigue a la vista', () => {
      renderLeading()
      const button = screen.getByRole('button', { name: 'Copiar correo' })

      expect(button.firstElementChild).toBe(screen.getByTestId('sobre'))
      expect(button).toHaveTextContent('Copiar correo')
    })

    it('el nombre accesible sigue siendo el texto: no lleva aria-label', () => {
      renderLeading()

      expect(screen.getByRole('button', { name: 'Copiar correo' })).not.toHaveAttribute('aria-label')
    })
  })

  describe('nombre accesible propio', () => {
    it('cuando lo da quien lo usa, empieza por el texto visible', () => {
      render(
        <ContactButton
          kind="whatsapp"
          label="WhatsApp"
          accessibleLabel="WhatsApp (se abre en una pestaña nueva)"
        />,
      )

      const button = screen.getByRole('button', { name: 'WhatsApp (se abre en una pestaña nueva)' })
      expect(button).toHaveTextContent('WhatsApp')
    })
  })

  describe('teclado', () => {
    it('los dos botones se alcanzan con Tab, en orden', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.tab()
      expect(screen.getByRole('button', { name: 'Copiar correo' })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole('button', { name: 'WhatsApp' })).toHaveFocus()
    })

    it('enfocar un botón no arma ni muestra el dato', async () => {
      const user = userEvent.setup()
      renderBoth()

      await user.tab()

      expect(open).not.toHaveBeenCalled()
      expect(leaks()).toBe(false)
    })

    it.each(['{Enter}', ' '])('se activa con la tecla "%s"', async (key) => {
      const user = userEvent.setup()
      renderBoth()

      await user.tab()
      await user.tab()
      await user.keyboard(key)

      expect(open).toHaveBeenCalledOnce()
      expect(open.mock.calls[0]?.[0] === getWhatsappUrl()).toBe(true)
    })
  })
})
