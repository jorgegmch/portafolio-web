import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CvDownload } from '@/components/ui/CvDownload'

const LABEL = 'Descargar CV'
const DESIGNED = { label: 'Versión diseñada (PDF)', href: '/cv/sample-designed-es.pdf' }
const ATS = { label: 'Versión ATS (PDF)', href: '/cv/sample-ats-es.pdf' }

const setup = (options: readonly { label: string; href: string }[] = [DESIGNED, ATS]) => {
  const user = userEvent.setup()
  const view = render(
    <>
      <CvDownload label={LABEL} options={options} />
      <button type="button">Fuera</button>
    </>,
  )
  const toggle = () => screen.getByRole('button', { name: LABEL })
  const link = (name: string) => screen.getByRole('link', { name })
  return { user, toggle, link, ...view }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CvDownload', () => {
  describe('sin archivos', () => {
    it('no renderiza nada', () => {
      const { container } = render(<CvDownload label={LABEL} options={[]} />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('con una sola versión', () => {
    it('es un enlace directo de descarga, sin menú', () => {
      const { link } = setup([ATS])

      expect(link(LABEL)).toHaveAttribute('href', ATS.href)
      expect(link(LABEL)).toHaveAttribute('download')
      expect(link(LABEL)).not.toHaveAttribute('target')
      expect(screen.queryByRole('button', { name: LABEL })).not.toBeInTheDocument()
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('con varias versiones, cerrado', () => {
    it('es un botón que declara que está cerrado', () => {
      const { toggle } = setup()

      expect(toggle()).toHaveAttribute('type', 'button')
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('no expone los enlaces', () => {
      setup()

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('aria-controls apunta a una lista que existe', () => {
      const { toggle } = setup()
      const listId = toggle().getAttribute('aria-controls')

      expect(listId).toBeTruthy()
      expect(document.getElementById(listId ?? '')?.tagName).toBe('UL')
    })
  })

  describe('abrir', () => {
    it('un clic abre y otro cierra', async () => {
      const { user, toggle } = setup()

      await user.click(toggle())
      expect(toggle()).toHaveAttribute('aria-expanded', 'true')

      await user.click(toggle())
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it.each([
      ['Enter', '{Enter}'],
      ['Espacio', ' '],
    ])('%s abre desde el teclado', async (_name, key) => {
      const { user, toggle } = setup()

      await user.tab()
      expect(toggle()).toHaveFocus()
      await user.keyboard(key)

      expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    })

    it('muestra un enlace por versión, en el orden recibido', async () => {
      const { user, toggle } = setup()

      await user.click(toggle())

      const names = within(screen.getByRole('list'))
        .getAllByRole('link')
        .map((item) => item.textContent)
      expect(names).toEqual([DESIGNED.label, ATS.label])
    })

    it('cada enlace descarga su archivo, sin abrir otra pestaña', async () => {
      const { user, toggle, link } = setup()

      await user.click(toggle())

      for (const option of [DESIGNED, ATS]) {
        expect(link(option.label)).toHaveAttribute('href', option.href)
        expect(link(option.label)).toHaveAttribute('download')
        expect(link(option.label)).not.toHaveAttribute('target')
      }
    })

    it('los enlaces se alcanzan con Tab, en orden', async () => {
      const { user, toggle, link } = setup()
      await user.click(toggle())

      await user.tab()
      expect(link(DESIGNED.label)).toHaveFocus()
      await user.tab()
      expect(link(ATS.label)).toHaveFocus()
    })
  })

  describe('cerrar', () => {
    it('Escape cierra y devuelve el foco al botón', async () => {
      const { user, toggle, link } = setup()
      await user.click(toggle())
      await user.tab()
      expect(link(DESIGNED.label)).toHaveFocus()

      await user.keyboard('{Escape}')

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(toggle()).toHaveFocus()
    })

    it('un clic fuera cierra', async () => {
      const { user, toggle } = setup()
      await user.click(toggle())

      await user.click(screen.getByRole('button', { name: 'Fuera' }))

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('salir con Tab cierra', async () => {
      const { user, toggle } = setup()
      await user.click(toggle())

      await user.tab()
      await user.tab()
      await user.tab()

      expect(screen.getByRole('button', { name: 'Fuera' })).toHaveFocus()
      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    })

    it('elegir una versión cierra y devuelve el foco al botón', async () => {
      const { user, toggle, link } = setup()
      await user.click(toggle())
      // jsdom no navega ni descarga: se cancela para que el clic no avise por consola.
      link(ATS.label).addEventListener('click', (event) => event.preventDefault())

      await user.click(link(ATS.label))

      expect(toggle()).toHaveAttribute('aria-expanded', 'false')
      expect(toggle()).toHaveFocus()
    })
  })
})
