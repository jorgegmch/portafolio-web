import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TerminalPanel } from '@/components/ui/TerminalPanel'

// Datos ficticios: el panel no sabe de dónde salen los suyos.
const LABEL = 'Salida de un programa de prueba'
const COMMAND = 'java Sample'
const LINES = [
  { name: 'name', value: 'Ada Lovelace Byron King' },
  { name: 'age', value: '36' },
  { name: 'location', value: 'Londres, UK' },
] as const

const setup = (lines: readonly { name: string; value: string }[] = LINES) => {
  const view = render(<TerminalPanel label={LABEL} command={COMMAND} lines={lines} />)
  const panel = screen.getByRole('figure', { name: LABEL })
  return { panel, ...view }
}

describe('TerminalPanel', () => {
  it('es una figura con el nombre accesible que recibe', () => {
    const { panel } = setup()

    expect(panel).toBeInTheDocument()
  })

  it('muestra el comando', () => {
    const { panel } = setup()

    expect(within(panel).getByText(COMMAND)).toBeInTheDocument()
  })

  it('muestra cada campo con su valor, en el orden recibido', () => {
    const { panel } = setup()

    expect(within(panel).getAllByRole('term').map((term) => term.textContent)).toEqual(
      LINES.map((line) => line.name),
    )
    expect(
      within(panel)
        .getAllByRole('definition')
        .map((definition) => definition.textContent),
    ).toEqual(LINES.map((line) => line.value))
  })

  // Cada valor va junto a su campo: un lector de pantalla los lee emparejados.
  it('cada valor es el hermano siguiente de su campo', () => {
    const { panel } = setup()

    within(panel)
      .getAllByRole('term')
      .forEach((term, index) => {
        expect(term.nextElementSibling).toHaveTextContent(LINES[index]?.value ?? '')
        expect(term.parentElement?.children).toHaveLength(2)
      })
  })

  it('el comando va antes que la salida', () => {
    const { panel } = setup()
    const command = within(panel).getByText(COMMAND)
    const [firstTerm] = within(panel).getAllByRole('term')

    expect(
      command.compareDocumentPosition(firstTerm as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  describe('decoración', () => {
    // El «$» y los dos puntos los pinta el CSS: el texto del panel es solo el
    // comando y los datos.
    it('el texto del panel es el comando y los datos, sin símbolos', () => {
      const { panel } = setup()

      expect(panel.textContent).toBe(
        COMMAND + LINES.map((line) => line.name + line.value).join(''),
      )
    })

    it('la barra superior y el prompt no existen para un lector de pantalla', () => {
      const { panel } = setup()
      const hidden = [...panel.querySelectorAll('[aria-hidden="true"]')]

      expect(hidden).toHaveLength(2)
      hidden.forEach((element) => expect(element).toHaveTextContent(''))
    })

    it('no lleva nada que reciba el foco ni otro título', () => {
      const { panel } = setup()

      expect(panel.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0)
      expect(within(panel).queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('sin líneas', () => {
    it('muestra el comando y ninguna lista vacía', () => {
      const { panel } = setup([])

      expect(within(panel).getByText(COMMAND)).toBeInTheDocument()
      expect(panel.querySelector('dl')).not.toBeInTheDocument()
    })
  })

  // Quien lo usa puede añadirle efectos propios sin tocar los del panel.
  describe('clase', () => {
    it('suma la clase que recibe a la suya', () => {
      render(<TerminalPanel label={LABEL} command={COMMAND} lines={LINES} className="extra" />)
      const classes = screen.getByRole('figure', { name: LABEL }).getAttribute('class')?.split(' ')

      expect(classes).toHaveLength(2)
      expect(classes).toContain('extra')
    })

    it('sin clase, lleva solo la suya', () => {
      const { panel } = setup()

      expect(panel.getAttribute('class')?.split(' ')).toHaveLength(1)
    })
  })

  it('con otros datos muestra esos datos: nada viene escrito dentro', () => {
    const { panel } = setup([{ name: 'role', value: 'Tester' }])

    expect(within(panel).getByRole('term')).toHaveTextContent('role')
    expect(within(panel).getByRole('definition')).toHaveTextContent('Tester')
  })

  // Presentacional: los textos y los datos le llegan por props.
  describe('dependencias', () => {
    const source = readFileSync('src/components/ui/TerminalPanel.tsx', 'utf8')
    const imports = [...source.matchAll(/from '([^']+)'/g)].map((match) => match[1])

    it('solo importa su hoja de estilos', () => {
      expect(imports).toEqual(['@/components/ui/TerminalPanel.module.css'])
    })

    it('no llama a useLang', () => {
      expect(source).not.toContain('useLang')
    })
  })
})
