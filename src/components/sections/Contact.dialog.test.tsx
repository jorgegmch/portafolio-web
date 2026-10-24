import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Contact } from '@/components/sections/Contact'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { mockDialog } from '@/test/mockDialog'

const { es } = dictionaries

let restoreDialog: () => void

beforeEach(() => {
  restoreDialog = mockDialog()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
})

afterEach(() => {
  restoreDialog()
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

const renderContact = () =>
  render(
    <LangProvider>
      <Contact />
    </LangProvider>,
  )

const writeMe = () => screen.getByRole('button', { name: es.contact.writeMe })
const formDialog = () => screen.getByRole('dialog', { name: es.contact.form.title })
const isOpen = () => document.querySelector('dialog')?.open ?? false

describe('Contact: «Escríbeme» y el formulario', () => {
  it('«Escríbeme» avisa de que abre un diálogo, y al pulsarlo lo abre con el foco en el nombre', async () => {
    const user = userEvent.setup()
    renderContact()

    expect(writeMe()).toHaveAttribute('aria-haspopup', 'dialog')
    expect(isOpen()).toBe(false)

    await user.click(writeMe())

    expect(isOpen()).toBe(true)
    expect(within(formDialog()).getByLabelText(new RegExp(`^${es.contact.form.name.label}`))).toHaveFocus()
  })

  it.each([
    ['Esc', async (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}')],
    [
      'la X',
      async (user: ReturnType<typeof userEvent.setup>) =>
        user.click(within(formDialog()).getByRole('button', { name: es.contact.form.close })),
    ],
  ])('al cerrar con %s, el foco vuelve a «Escríbeme»', async (_, close) => {
    const user = userEvent.setup()
    renderContact()
    await user.click(writeMe())

    await close(user)

    expect(isOpen()).toBe(false)
    expect(writeMe()).toHaveFocus()
  })

  it('se abre también con el teclado', async () => {
    const user = userEvent.setup()
    renderContact()

    writeMe().focus()
    await user.keyboard('{Enter}')

    expect(isOpen()).toBe(true)
  })

  // Spec §5: la escena queda detrás, más pequeña, mientras el diálogo está abierto.
  it('mientras está abierto, la escena se marca para quedar detrás', async () => {
    const user = userEvent.setup()
    renderContact()
    const scene = screen.getByRole('region', { name: es.contact.label })

    expect(scene).not.toHaveAttribute('data-form-open')
    await user.click(writeMe())
    expect(scene).toHaveAttribute('data-form-open')
    await user.keyboard('{Escape}')
    expect(scene).not.toHaveAttribute('data-form-open')
  })

  it('lo escrito se conserva al cerrar y volver a abrir', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.click(writeMe())
    await user.type(within(formDialog()).getByLabelText(new RegExp(`^${es.contact.form.message.label}`)), 'Hola')

    await user.keyboard('{Escape}')
    await user.click(writeMe())

    expect(within(formDialog()).getByLabelText(new RegExp(`^${es.contact.form.message.label}`))).toHaveValue('Hola')
  })
})
