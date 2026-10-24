import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactDialog } from '@/components/ui/ContactDialog'
import { contactNeeds } from '@/data/contactNeeds'
import { dictionaries } from '@/i18n/index'
import { type SendContactMessage, type SendResult, sendContactMessage } from '@/lib/sendContactMessage'
import { mockDialog } from '@/test/mockDialog'

const { es } = dictionaries
const text = es.contact.form
const DIRECT = {
  copyEmail: es.contact.copyEmail,
  emailCopied: es.contact.emailCopied,
  copyFailed: es.contact.copyFailed,
  whatsapp: es.contact.whatsapp,
  whatsappName: `${es.contact.whatsapp} (${es.common.opensInNewTab})`,
}

let restoreDialog: () => void

beforeEach(() => {
  restoreDialog = mockDialog()
})

afterEach(() => {
  restoreDialog()
  vi.restoreAllMocks()
})

interface RenderOptions {
  send?: SendContactMessage
  open?: boolean
}

const renderDialog = ({ send = vi.fn<SendContactMessage>(), open = true }: RenderOptions = {}) => {
  const onClose = vi.fn()
  const result = render(<ContactDialog open={open} onClose={onClose} text={text} direct={DIRECT} send={send} />)
  return { ...result, onClose, send }
}

/** Envío que no termina hasta que el test lo resuelve. */
const pendingSend = () => {
  let finish: (result: SendResult) => void = () => {}
  const send = vi.fn<SendContactMessage>(
    () =>
      new Promise<SendResult>((resolve) => {
        finish = resolve
      }),
  )
  return { send, finish: (result: SendResult) => finish(result) }
}

const dialog = () => screen.getByRole('dialog', { name: text.title })
const field = (label: string) => within(dialog()).getByLabelText(new RegExp(`^${label}`))
const submitButton = () => within(dialog()).getByRole('button', { name: new RegExp(`${text.submit}|${text.sending}`) })

/** Rellena los obligatorios con valores que valen. */
const fillValid = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(field(text.name.label), '  Ana  ')
  await user.type(field(text.email.label), 'ana@empresa.co ')
  await user.type(field(text.message.label), ' Necesito una API para mi tienda. ')
}

describe('ContactDialog', () => {
  describe('abrir y cerrar', () => {
    it('cerrado no está abierto; abierto es un diálogo modal con su título', () => {
      const { rerender, onClose, send } = renderDialog({ open: false })
      const element = document.querySelector('dialog')

      expect(element?.open).toBe(false)

      rerender(<ContactDialog open onClose={onClose} text={text} direct={DIRECT} send={send} />)

      expect(element?.open).toBe(true)
      expect(dialog()).toHaveAttribute('aria-modal', 'true')
    })

    it('al abrir, el foco va al primer campo, no a la X', () => {
      renderDialog()

      expect(field(text.name.label)).toHaveFocus()
    })

    it('Esc lo cierra y avisa a quien lo abrió', async () => {
      const user = userEvent.setup()
      const { onClose } = renderDialog()

      await user.keyboard('{Escape}')

      expect(document.querySelector('dialog')?.open).toBe(false)
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('la X lo cierra', async () => {
      const user = userEvent.setup()
      const { onClose } = renderDialog()

      await user.click(within(dialog()).getByRole('button', { name: text.close }))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('un clic en el fondo lo cierra; uno dentro de la hoja, no', () => {
      const { onClose } = renderDialog()
      const element = dialog()

      fireEvent.pointerDown(within(element).getByRole('heading', { name: text.title }))
      fireEvent.click(within(element).getByRole('heading', { name: text.title }))
      expect(onClose).not.toHaveBeenCalled()

      fireEvent.pointerDown(element)
      fireEvent.click(element)
      expect(onClose).toHaveBeenCalledOnce()
    })

    // Quien selecciona texto en un campo y suelta fuera no pierde el formulario.
    it('si el clic empieza dentro de la hoja y acaba en el fondo, no se cierra', () => {
      const { onClose } = renderDialog()

      fireEvent.pointerDown(field(text.message.label))
      fireEvent.click(dialog())

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('validación', () => {
    it('enviar vacío marca los tres obligatorios, cada uno con su error asociado, y no envía', async () => {
      const user = userEvent.setup()
      const { send } = renderDialog()

      await user.click(submitButton())

      ;[
        [text.name.label, text.name.error],
        [text.email.label, text.email.error],
        [text.message.label, text.message.error],
      ].forEach(([label = '', error = '']) => {
        expect(field(label)).toHaveAttribute('aria-invalid', 'true')
        expect(field(label)).toHaveAccessibleDescription(error)
      })
      expect(field(text.company.label)).not.toHaveAttribute('aria-invalid', 'true')
      expect(send).not.toHaveBeenCalled()
    })

    it('el foco va al primer campo con error', async () => {
      const user = userEvent.setup()
      renderDialog()
      await user.type(field(text.name.label), 'Ana')

      await user.click(submitButton())

      expect(field(text.email.label)).toHaveFocus()
    })

    it('tras el primer intento, el error se va al corregir el campo', async () => {
      const user = userEvent.setup()
      renderDialog()
      await user.click(submitButton())

      await user.type(field(text.name.label), 'Ana')

      expect(field(text.name.label)).toHaveAttribute('aria-invalid', 'false')
      expect(field(text.name.label)).not.toHaveAttribute('aria-describedby')
      expect(within(dialog()).queryByText(text.name.error)).not.toBeInTheDocument()
    })

    it('antes de intentar enviar no marca nada, aunque lo escrito no valga', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(field(text.email.label), 'ana')
      await user.tab()

      expect(field(text.email.label)).toHaveAttribute('aria-invalid', 'false')
      expect(within(dialog()).queryByText(text.email.error)).not.toBeInTheDocument()
    })

    it('cada campo tiene su etiqueta, su autocompletado y los obligatorios lo dicen', () => {
      renderDialog()

      expect(field(text.name.label)).toHaveAttribute('autocomplete', 'name')
      expect(field(text.email.label)).toHaveAttribute('autocomplete', 'email')
      expect(field(text.email.label)).toHaveAttribute('type', 'email')
      expect(field(text.company.label)).toHaveAttribute('autocomplete', 'organization')
      expect(field(text.message.label)).toHaveAttribute('autocomplete', 'off')
      ;[text.name.label, text.email.label, text.message.label].forEach((label) =>
        expect(field(label)).toBeRequired(),
      )
      expect(field(text.company.label)).not.toBeRequired()
    })
  })

  describe('¿Qué necesitas?', () => {
    it('es un grupo con sus seis opciones, que se marcan y desmarcan con aria-pressed', async () => {
      const user = userEvent.setup()
      renderDialog()
      const group = within(dialog()).getByRole('group', { name: new RegExp(text.needs.legend.replace('?', '\\?')) })
      const chips = within(group).getAllByRole('button')

      expect(chips.map((chip) => chip.textContent)).toEqual(contactNeeds.map((id) => text.needs.options[id]))
      chips.forEach((chip) => expect(chip).toHaveAttribute('aria-pressed', 'false'))

      const [backend] = chips
      if (!backend) throw new Error('Falta la primera opción')
      await user.click(backend)
      expect(backend).toHaveAttribute('aria-pressed', 'true')
      await user.click(backend)
      expect(backend).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('envío', () => {
    it('envía lo escrito sin los espacios de los extremos, con lo marcado', async () => {
      const user = userEvent.setup()
      const { send } = renderDialog({ send: vi.fn<SendContactMessage>().mockResolvedValue({ ok: true }) })
      await fillValid(user)
      await user.type(field(text.company.label), ' Gaseosas ')
      await user.click(within(dialog()).getByRole('button', { name: text.needs.options.databases }))
      await user.click(within(dialog()).getByRole('button', { name: text.needs.options.backend }))

      await user.click(submitButton())

      expect(send).toHaveBeenCalledExactlyOnceWith({
        name: 'Ana',
        email: 'ana@empresa.co',
        company: 'Gaseosas',
        needs: ['databases', 'backend'],
        message: 'Necesito una API para mi tienda.',
      })
    })

    it('mientras envía, el botón queda deshabilitado con su giro y no envía dos veces', async () => {
      const user = userEvent.setup()
      const { send } = pendingSend()
      renderDialog({ send })
      await fillValid(user)

      await user.click(submitButton())

      expect(submitButton()).toHaveAttribute('aria-disabled', 'true')
      expect(submitButton()).toHaveTextContent(text.sending)
      expect(submitButton().querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

      await user.click(submitButton())
      expect(send).toHaveBeenCalledOnce()
    })

    it('recibido: lo anuncia, con el correo de quien escribe, y lleva ahí el foco', async () => {
      const user = userEvent.setup()
      const { send, finish } = pendingSend()
      renderDialog({ send })
      await fillValid(user)
      await user.click(submitButton())

      finish({ ok: true })

      const title = await within(dialog()).findByText(text.sent.title)
      const status = title.closest('[role="status"]')
      expect(status).toHaveTextContent(`${text.sent.reply} ana@empresa.co`)
      expect(title).toHaveFocus()
      expect(within(dialog()).queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('«Enviar otro» vuelve al formulario vacío', async () => {
      const user = userEvent.setup()
      renderDialog({ send: vi.fn<SendContactMessage>().mockResolvedValue({ ok: true }) })
      await fillValid(user)
      await user.click(submitButton())

      await user.click(await within(dialog()).findByRole('button', { name: text.sent.again }))

      expect(field(text.name.label)).toHaveValue('')
      expect(field(text.message.label)).toHaveValue('')
      expect(field(text.name.label)).toHaveAttribute('aria-invalid', 'false')
    })

    it('«Volver al portafolio» cierra el diálogo, y al volver a abrirlo está vacío', async () => {
      const user = userEvent.setup()
      const send = vi.fn<SendContactMessage>().mockResolvedValue({ ok: true })
      const { onClose, rerender } = renderDialog({ send })
      await fillValid(user)
      await user.click(submitButton())

      await user.click(await within(dialog()).findByRole('button', { name: text.sent.back }))
      expect(onClose).toHaveBeenCalledOnce()

      rerender(<ContactDialog open={false} onClose={onClose} text={text} direct={DIRECT} send={send} />)
      rerender(<ContactDialog open onClose={onClose} text={text} direct={DIRECT} send={send} />)
      expect(field(text.name.label)).toHaveValue('')
    })

    it('error: avisa con role="alert", conserva lo escrito y ofrece «Copiar correo»', async () => {
      const user = userEvent.setup()
      renderDialog({ send: vi.fn<SendContactMessage>().mockResolvedValue({ ok: false, reason: 'failed' }) })
      await fillValid(user)

      await user.click(submitButton())

      expect(await within(dialog()).findByRole('alert')).toHaveTextContent(text.failed)
      expect(field(text.name.label)).toHaveValue('  Ana  ')
      expect(field(text.message.label)).toHaveValue(' Necesito una API para mi tienda. ')
      expect(within(dialog()).getByRole('button', { name: DIRECT.copyEmail })).toBeInTheDocument()
      expect(submitButton()).toHaveAttribute('aria-disabled', 'false')
    })

    it('tras un error se puede volver a intentar', async () => {
      const user = userEvent.setup()
      const send = vi
        .fn<SendContactMessage>()
        .mockResolvedValueOnce({ ok: false, reason: 'failed' })
        .mockResolvedValueOnce({ ok: true })
      renderDialog({ send })
      await fillValid(user)
      await user.click(submitButton())
      await within(dialog()).findByRole('alert')

      await user.click(submitButton())

      expect((await within(dialog()).findByText(text.sent.title)).closest('[role="status"]')).not.toBeNull()
      expect(send).toHaveBeenCalledTimes(2)
    })

    it('con el adaptador de hoy, sin backend, acaba en el aviso de error', async () => {
      const user = userEvent.setup()
      renderDialog({ send: sendContactMessage })
      await fillValid(user)

      await user.click(submitButton())

      expect(await within(dialog()).findByRole('alert')).toHaveTextContent(text.failed)
    })
  })

  it('«¿Prefieres directo?» está a la vista con «Copiar correo» y WhatsApp', () => {
    renderDialog()

    expect(within(dialog()).getByText(text.direct)).toBeInTheDocument()
    expect(within(dialog()).getByRole('button', { name: DIRECT.copyEmail })).toBeInTheDocument()
    expect(within(dialog()).getByRole('button', { name: DIRECT.whatsappName })).toBeInTheDocument()
  })
})
