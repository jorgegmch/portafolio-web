import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import type { Lang } from '@/i18n/types'

const OPTIONS = [
  { lang: 'es', name: 'Español' },
  { lang: 'en', name: 'English' },
] as const

const setup = (current: Lang = 'es') => {
  const onSelect = vi.fn()
  const user = userEvent.setup()
  const view = render(
    <>
      <LangSwitcher label="Idioma" current={current} options={OPTIONS} onSelect={onSelect} />
      <button type="button">Fuera</button>
    </>,
  )
  const toggle = () => screen.getByRole('button', { name: /^Idioma/ })
  return { onSelect, user, toggle, ...view }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LangSwitcher', () => {
  describe('cerrado', () => {
    it('el botón nombra el idioma activo y declara que está cerrado', () => {
      const { toggle } = setup('es')

      expect(toggle()).toHaveAccessibleName('Idioma: Español')
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('no expone las opciones', () => {
      setup()

      expect(screen.queryByRole('button', { name: 'English' })).not.toBeInTheDocument()
    })

    it('aria-controls apunta a una lista que existe', () => {
      const { toggle } = setup()
      const listId = toggle().getAttribute('aria-controls')

      expect(listId).toBeTruthy()
      expect(document.getElementById(listId ?? '')).toBeInTheDocument()
    })

    it('Escape no hace nada', async () => {
      const { user, toggle, onSelect } = setup()

      toggle().focus()
      await user.keyboard('{Escape}')

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(toggle()).toHaveFocus()
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('al abrir', () => {
    it.each([
      ['Enter', '{Enter}'],
      ['Espacio', ' '],
    ])('%s abre el menú desde el teclado', async (_name, key) => {
      const { user, toggle } = setup()

      await user.tab()
      await user.keyboard(key)

      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('button', { name: 'English' })).toBeVisible()
    })

    it('lista todos los idiomas y marca el activo', async () => {
      const { user, toggle } = setup('en')

      await user.click(toggle())

      expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
        'aria-current',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Español' })).not.toHaveAttribute('aria-current')
    })

    it('un segundo clic en el botón lo cierra', async () => {
      const { user, toggle } = setup()

      await user.click(toggle())
      await user.click(toggle())

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('al cerrar', () => {
    it('Escape cierra y devuelve el foco al botón', async () => {
      const { user, toggle } = setup()

      await user.click(toggle())
      await user.tab()
      expect(screen.getByRole('button', { name: 'Español' })).toHaveFocus()
      await user.keyboard('{Escape}')

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(toggle()).toHaveFocus()
    })

    it('un clic fuera lo cierra', async () => {
      const { user, toggle } = setup()

      await user.click(toggle())
      await user.click(screen.getByRole('button', { name: 'Fuera' }))

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('salir con Tab lo cierra', async () => {
      const { user, toggle } = setup()

      await user.click(toggle())
      await user.tab()
      await user.tab()
      await user.tab()

      expect(screen.getByRole('button', { name: 'Fuera' })).toHaveFocus()
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('al elegir', () => {
    it('avisa del idioma elegido, cierra y devuelve el foco al botón', async () => {
      const { user, toggle, onSelect } = setup('es')

      await user.click(toggle())
      await user.click(screen.getByRole('button', { name: 'English' }))

      expect(onSelect).toHaveBeenCalledExactlyOnceWith('en')
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(toggle()).toHaveFocus()
    })

    it('se elige con el teclado', async () => {
      const { user, toggle, onSelect } = setup('es')

      await user.tab()
      await user.keyboard('{Enter}')
      await user.tab()
      await user.tab()
      await user.keyboard('{Enter}')

      expect(onSelect).toHaveBeenCalledExactlyOnceWith('en')
      expect(toggle()).toHaveFocus()
    })

    // Elegir el idioma que ya está activo sigue siendo una elección explícita:
    // quien llegó con ?lang= y lo confirma espera que se recuerde.
    it('elegir el idioma ya activo también avisa', async () => {
      const { user, toggle, onSelect } = setup('es')

      await user.click(toggle())
      await user.click(screen.getByRole('button', { name: 'Español' }))

      expect(onSelect).toHaveBeenCalledExactlyOnceWith('es')
    })
  })

  describe('limpieza', () => {
    it('quita del documento todos los listeners que añadió', async () => {
      const added = vi.spyOn(document, 'addEventListener')
      const removed = vi.spyOn(document, 'removeEventListener')
      const { user, toggle, unmount } = setup()

      // user-event añade los suyos al preparar el documento: se descartan.
      added.mockClear()
      await user.click(toggle())
      const whileOpen = added.mock.calls.map(([type, listener]) => ({ type, listener }))
      expect(whileOpen.length).toBeGreaterThan(0)

      unmount()

      for (const { type, listener } of whileOpen) {
        expect(removed).toHaveBeenCalledWith(type, listener)
      }
    })

    it('cerrado no deja listeners en el documento', async () => {
      const added = vi.spyOn(document, 'addEventListener')
      const removed = vi.spyOn(document, 'removeEventListener')
      const { user, toggle } = setup()

      added.mockClear()
      await user.click(toggle())
      const whileOpen = added.mock.calls.map(([type, listener]) => ({ type, listener }))
      await user.keyboard('{Escape}')

      for (const { type, listener } of whileOpen) {
        expect(removed).toHaveBeenCalledWith(type, listener)
      }
    })
  })
})
