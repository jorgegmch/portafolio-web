import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContactForm } from '@/components/ui/ContactForm'
import { contactNeeds } from '@/data/contactNeeds'
import { dictionaries } from '@/i18n/index'
import { type SendContactMessage, type SendResult, sendContactMessage } from '@/lib/sendContactMessage'

// Formulario de contacto a la vista, en el panel derecho de la escena (spec
// v2.1 §3.5). Campos, validación, estados y errores son los del modal que
// sustituye; cambia que está siempre a la vista, sin autofocus al cargar.
const { es } = dictionaries
const text = es.contact.form
const COPY = {
  copyEmail: es.contact.copyEmail,
  emailCopied: es.contact.emailCopied,
  copyFailed: es.contact.copyFailed,
}

afterEach(() => {
  vi.restoreAllMocks()
})

const renderForm = (send: SendContactMessage = vi.fn<SendContactMessage>()) => {
  const result = render(<ContactForm text={text} copy={COPY} send={send} />)
  return { ...result, send }
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

const panel = () => screen.getByRole('region', { name: text.title })
const field = (label: string) => within(panel()).getByLabelText(new RegExp(`^${label}`))
const submitButton = () =>
  within(panel()).getByRole('button', { name: new RegExp(`${text.submit}|${text.sending}`) })

/** Rellena los obligatorios con valores que valen. */
const fillValid = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(field(text.name.label), '  Ana  ')
  await user.type(field(text.email.label), 'ana@empresa.co ')
  await user.type(field(text.message.label), ' Necesito una API para mi tienda. ')
}

describe('ContactForm', () => {
  describe('a la vista', () => {
    it('es una región con su título (h3) y su rótulo en código', () => {
      renderForm()

      expect(within(panel()).getByRole('heading', { level: 3, name: text.title })).toBeInTheDocument()
      expect(within(panel()).getByText(text.tag)).toBeInTheDocument()
    })

    it('no es un diálogo ni lleva botón de cerrar', () => {
      renderForm()

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(within(panel()).queryByRole('button', { name: /cerrar/i })).not.toBeInTheDocument()
    })

    it('sin autofocus: al cargar, el foco no entra en el formulario', () => {
      renderForm()

      expect(panel().contains(document.activeElement)).toBe(false)
    })
  })

  describe('validación', () => {
    it('enviar vacío marca los tres obligatorios, cada uno con su error asociado, y no envía', async () => {
      const user = userEvent.setup()
      const { send } = renderForm()

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
      renderForm()
      await user.type(field(text.name.label), 'Ana')

      await user.click(submitButton())

      expect(field(text.email.label)).toHaveFocus()
    })

    it('tras el primer intento, el error se va al corregir el campo', async () => {
      const user = userEvent.setup()
      renderForm()
      await user.click(submitButton())

      await user.type(field(text.name.label), 'Ana')

      expect(field(text.name.label)).toHaveAttribute('aria-invalid', 'false')
      expect(field(text.name.label)).not.toHaveAttribute('aria-describedby')
      expect(within(panel()).queryByText(text.name.error)).not.toBeInTheDocument()
    })

    it('antes de intentar enviar no marca nada, aunque lo escrito no valga', async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(field(text.email.label), 'ana')
      await user.tab()

      expect(field(text.email.label)).toHaveAttribute('aria-invalid', 'false')
      expect(within(panel()).queryByText(text.email.error)).not.toBeInTheDocument()
    })

    it('cada campo tiene su etiqueta, su autocompletado y los obligatorios lo dicen', () => {
      renderForm()

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

  // Mejoras de la auditoría de Vercel que pide la spec v2.1 (§3.5).
  describe('campos según la auditoría', () => {
    it('cada campo lleva su name, para el autocompletado y los gestores', () => {
      renderForm()

      expect(field(text.name.label)).toHaveAttribute('name', 'name')
      expect(field(text.email.label)).toHaveAttribute('name', 'email')
      expect(field(text.company.label)).toHaveAttribute('name', 'company')
      expect(field(text.message.label)).toHaveAttribute('name', 'message')
    })

    it('el correo no pasa por el corrector ortográfico', () => {
      renderForm()

      expect(field(text.email.label)).toHaveAttribute('spellcheck', 'false')
      expect(field(text.name.label)).not.toHaveAttribute('spellcheck')
    })

    it('los placeholders son un ejemplo, acabado en «…»', () => {
      renderForm()

      for (const label of [text.name.label, text.email.label, text.company.label, text.message.label]) {
        expect(field(label).getAttribute('placeholder')).toMatch(/…$/)
      }
    })

    it('⌘ o Ctrl + Enter en el mensaje envía', async () => {
      const user = userEvent.setup()
      const { send } = renderForm(vi.fn<SendContactMessage>().mockResolvedValue({ ok: true }))
      await user.type(field(text.name.label), 'Ana')
      await user.type(field(text.email.label), 'ana@empresa.co')
      await user.type(field(text.message.label), 'Necesito una API.')

      await user.keyboard('{Control>}{Enter}{/Control}')

      expect(send).toHaveBeenCalledOnce()
      expect(await within(panel()).findByText(text.sent.title)).toBeInTheDocument()
    })

    it('con ⌘ también', async () => {
      const user = userEvent.setup()
      const { send } = renderForm(vi.fn<SendContactMessage>().mockResolvedValue({ ok: true }))
      await user.type(field(text.name.label), 'Ana')
      await user.type(field(text.email.label), 'ana@empresa.co')
      await user.type(field(text.message.label), 'Necesito una API.')

      await user.keyboard('{Meta>}{Enter}{/Meta}')

      expect(send).toHaveBeenCalledOnce()
    })

    it('Enter solo, en el mensaje, sigue siendo un salto de línea', async () => {
      const user = userEvent.setup()
      const { send } = renderForm()
      await user.type(field(text.message.label), 'Hola{Enter}mundo')

      expect(field(text.message.label)).toHaveValue('Hola\nmundo')
      expect(send).not.toHaveBeenCalled()
    })

    it('⌘/Ctrl + Enter con campos vacíos valida y lleva el foco al primer error', async () => {
      const user = userEvent.setup()
      const { send } = renderForm()
      await user.click(field(text.message.label))

      await user.keyboard('{Control>}{Enter}{/Control}')

      expect(send).not.toHaveBeenCalled()
      expect(field(text.name.label)).toHaveFocus()
    })
  })

  describe('¿Qué necesitas?', () => {
    it('es un grupo con sus opciones, que se marcan y desmarcan con aria-pressed', async () => {
      const user = userEvent.setup()
      renderForm()
      const group = within(panel()).getByRole('group', {
        name: new RegExp(text.needs.legend.replace('?', '\\?')),
      })
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
      const { send } = renderForm(vi.fn<SendContactMessage>().mockResolvedValue({ ok: true }))
      await fillValid(user)
      await user.type(field(text.company.label), ' Gaseosas ')
      await user.click(within(panel()).getByRole('button', { name: text.needs.options.databases }))
      await user.click(within(panel()).getByRole('button', { name: text.needs.options.backend }))

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
      renderForm(send)
      await fillValid(user)

      await user.click(submitButton())

      expect(submitButton()).toHaveAttribute('aria-disabled', 'true')
      expect(submitButton()).toHaveTextContent(text.sending)
      expect(submitButton().querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

      await user.click(submitButton())
      expect(send).toHaveBeenCalledOnce()
    })

    it('recibido: el panel lo anuncia, con el correo de quien escribe, y lleva ahí el foco', async () => {
      const user = userEvent.setup()
      const { send, finish } = pendingSend()
      renderForm(send)
      await fillValid(user)
      await user.click(submitButton())

      finish({ ok: true })

      const title = await within(panel()).findByText(text.sent.title)
      const status = title.closest('[role="status"]')
      expect(status).toHaveTextContent(`${text.sent.reply} ana@empresa.co`)
      expect(title).toHaveFocus()
      expect(within(panel()).queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('«Enviar otro» vuelve al formulario vacío, con el foco en el nombre', async () => {
      const user = userEvent.setup()
      renderForm(vi.fn<SendContactMessage>().mockResolvedValue({ ok: true }))
      await fillValid(user)
      await user.click(submitButton())

      await user.click(await within(panel()).findByRole('button', { name: text.sent.again }))

      expect(field(text.name.label)).toHaveValue('')
      expect(field(text.message.label)).toHaveValue('')
      expect(field(text.name.label)).toHaveAttribute('aria-invalid', 'false')
      expect(field(text.name.label)).toHaveFocus()
    })

    it('error: avisa con role="alert", conserva lo escrito y ofrece «Copiar correo»', async () => {
      const user = userEvent.setup()
      renderForm(vi.fn<SendContactMessage>().mockResolvedValue({ ok: false, reason: 'failed' }))
      await fillValid(user)

      await user.click(submitButton())

      expect(await within(panel()).findByRole('alert')).toHaveTextContent(text.failed)
      expect(field(text.name.label)).toHaveValue('  Ana  ')
      expect(field(text.message.label)).toHaveValue(' Necesito una API para mi tienda. ')
      expect(within(panel()).getByRole('button', { name: COPY.copyEmail })).toBeInTheDocument()
      expect(submitButton()).toHaveAttribute('aria-disabled', 'false')
    })

    it('«Copiar correo» solo aparece con el error: los canales ya están en el otro panel', () => {
      renderForm()

      expect(within(panel()).queryByRole('button', { name: COPY.copyEmail })).not.toBeInTheDocument()
    })

    it('tras un error se puede volver a intentar', async () => {
      const user = userEvent.setup()
      const send = vi
        .fn<SendContactMessage>()
        .mockResolvedValueOnce({ ok: false, reason: 'failed' })
        .mockResolvedValueOnce({ ok: true })
      renderForm(send)
      await fillValid(user)
      await user.click(submitButton())
      await within(panel()).findByRole('alert')

      await user.click(submitButton())

      expect((await within(panel()).findByText(text.sent.title)).closest('[role="status"]')).not.toBeNull()
      expect(send).toHaveBeenCalledTimes(2)
    })

    it('con el adaptador de hoy, sin backend, acaba en el aviso de error', async () => {
      const user = userEvent.setup()
      renderForm(sendContactMessage)
      await fillValid(user)

      await user.click(submitButton())

      expect(await within(panel()).findByRole('alert')).toHaveTextContent(text.failed)
    })
  })
})
