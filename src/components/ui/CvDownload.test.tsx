import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CvDownload } from '@/components/ui/CvDownload'

const LABEL = 'Descargar CV'
const INFOGRAPHIC = { label: 'Versión infográfica (PDF)', href: '/cv/sample-infographic-es.pdf' }
const ATS = { label: 'Versión ATS (PDF)', href: '/cv/sample-ats-es.pdf' }

const setup = (options: readonly { label: string; href: string }[] = [INFOGRAPHIC, ATS]) => {
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
  describe('con texto corto', () => {
    const SHORT = 'CV'
    const renderShort = (options: readonly { label: string; href: string }[]) =>
      render(<CvDownload label={LABEL} shortLabel={SHORT} options={options} />)
    const texts = (control: HTMLElement) =>
      [...control.querySelectorAll('span')].map((span) => span.textContent)

    // El CSS deja ver uno según el ancho; jsdom no lo aplica y ve los dos.
    it('el botón lleva los dos textos, el largo primero', () => {
      renderShort([INFOGRAPHIC, ATS])

      expect(texts(screen.getByRole('button'))).toEqual([LABEL, SHORT])
    })

    it('el botón sigue llamándose como el texto largo', () => {
      renderShort([INFOGRAPHIC, ATS])

      expect(screen.getByRole('button')).toHaveAccessibleName(LABEL)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', LABEL)
    })

    it('el enlace directo también lleva los dos textos y el mismo nombre', () => {
      renderShort([ATS])

      expect(texts(screen.getByRole('link'))).toEqual([LABEL, SHORT])
      expect(screen.getByRole('link')).toHaveAccessibleName(LABEL)
    })

    it('la flecha sigue siendo una, después de los textos', () => {
      renderShort([INFOGRAPHIC, ATS])

      const button = screen.getByRole('button')

      expect(button.querySelectorAll('svg')).toHaveLength(1)
      expect(button.lastElementChild?.tagName.toLowerCase()).toBe('svg')
    })
  })

  describe('sin texto corto', () => {
    it('el botón lleva solo su texto, sin aria-label', () => {
      const { toggle } = setup()

      expect(toggle().querySelectorAll('span')).toHaveLength(0)
      expect(toggle()).not.toHaveAttribute('aria-label')
      expect(toggle()).toHaveTextContent(LABEL)
    })
  })

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

    // La flecha anuncia un menú: sin menú, no va.
    it('no lleva flecha', () => {
      const { link } = setup([ATS])

      expect(link(LABEL).querySelector('svg')).toBeNull()
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

    it('lleva una flecha decorativa, que no entra en su nombre', () => {
      const { toggle } = setup()

      const arrows = toggle().querySelectorAll('svg')

      expect(arrows).toHaveLength(1)
      expect(arrows[0]).toHaveAttribute('aria-hidden', 'true')
      expect(arrows[0]).not.toHaveAttribute('fill')
      expect(arrows[0]).not.toHaveAttribute('stroke')
      expect(toggle()).toHaveAccessibleName(LABEL)
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
      expect(names).toEqual([INFOGRAPHIC.label, ATS.label])
    })

    it('cada enlace descarga su archivo, sin abrir otra pestaña', async () => {
      const { user, toggle, link } = setup()

      await user.click(toggle())

      for (const option of [INFOGRAPHIC, ATS]) {
        expect(link(option.label)).toHaveAttribute('href', option.href)
        expect(link(option.label)).toHaveAttribute('download')
        expect(link(option.label)).not.toHaveAttribute('target')
      }
    })

    it('los enlaces se alcanzan con Tab, en orden', async () => {
      const { user, toggle, link } = setup()
      await user.click(toggle())

      await user.tab()
      expect(link(INFOGRAPHIC.label)).toHaveFocus()
      await user.tab()
      expect(link(ATS.label)).toHaveFocus()
    })
  })

  describe('cerrar', () => {
    it('Escape cierra y devuelve el foco al botón', async () => {
      const { user, toggle, link } = setup()
      await user.click(toggle())
      await user.tab()
      expect(link(INFOGRAPHIC.label)).toHaveFocus()

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
