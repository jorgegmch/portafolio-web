import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseSvg, svgIssues } from '@/test/svgSafety'

// Las dos fichas de «Mi stack» que no son un logo oficial de archivo: Duke,
// la mascota de Java (la taza no tiene descarga oficial y su política no la
// permite), y el chip genérico de los agentes de IA, que no es una marca.
// Los demás logos los vigila brandLogos.test.ts. Se leen de disco, desde la
// raíz del repo: lo que se comprueba es el archivo que se publica.
const DUKE = 'public/tech/duke.svg'
const AI_AGENTS_WHITE = 'public/icons/ai-agents-white.svg'

const read = (path: string) => readFileSync(path, 'utf8')

/** Comentario que este repo pone al principio del archivo. */
const LEADING_COMMENT = /^<!--[\s\S]*?-->\n/
const comment = (path: string) => LEADING_COMMENT.exec(read(path))?.[0] ?? ''

const sha256 = async (content: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('icono de Java: Duke', () => {
  // https://github.com/openjdk/duke -> vector/Wave.svg. SHA-256 del dibujo
  // oficial (desde el primer <g> hasta el final, con finales de línea LF).
  // La cabecera sí cambia: se ajusta el viewBox al dibujo y se quitan la
  // declaración XML, el DOCTYPE y el comentario del editor.
  const OFFICIAL_DRAWING_SHA256 = '131a5ada4787fb286e0850b4f8820d52d021a5cc87dbf89beb41d5335c31dd37'
  const DRAWING_BOUNDS = '181.5 186 249 422'

  it('existe en public/tech', () => {
    expect(existsSync(DUKE)).toBe(true)
  })

  it('es un SVG seguro como icono estático', () => {
    expect(svgIssues(read(DUKE))).toEqual([])
  })

  // El oficial deja el dibujo en una esquina de un lienzo de 612 x 793: a
  // tamaño de icono no se vería.
  it('el viewBox se ajusta al dibujo', () => {
    const root = parseSvg(read(DUKE)).documentElement

    expect(root.getAttribute('viewBox')).toBe(DRAWING_BOUNDS)
    expect(root.hasAttribute('width')).toBe(false)
    expect(root.hasAttribute('height')).toBe(false)
  })

  it('ningún trazo cambia respecto al archivo oficial', async () => {
    const text = read(DUKE)
    const drawing = text.slice(text.indexOf('<g>'))

    expect(text).toContain('<g>')
    expect(await sha256(drawing)).toBe(OFFICIAL_DRAWING_SHA256)
  })

  describe('comentario de atribución', () => {
    it('el archivo empieza por él', () => {
      expect(read(DUKE)).toMatch(LEADING_COMMENT)
    })

    it('dice de dónde sale', () => {
      expect(comment(DUKE)).toContain('https://github.com/openjdk/duke')
      expect(comment(DUKE)).toContain('vector/Wave.svg')
    })

    it('cita literalmente la frase de dev.java sobre la licencia BSD', () => {
      expect(comment(DUKE)).toContain('https://dev.java/duke/')
      expect(comment(DUKE)).toContain(
        'In 2006, Duke was officially "open sourced" under a BSD license.',
      )
    })

    it('cita literalmente la guía de marca de Java sobre usar y modificar la imagen', () => {
      expect(comment(DUKE)).toContain(
        'https://www.oracle.com/a/ocom/docs/java-licensing-logo-guidelines-1908204.pdf',
      )
      expect(comment(DUKE)).toContain('You do not need permission to use or modify the Duke image.')
    })

    it('avisa de que el repositorio no publica licencia ni aviso de copyright', () => {
      expect(comment(DUKE)).toContain('does not publish the text of a license or a copyright notice')
    })

    // No hay aviso oficial que copiar: inventar uno sería atribuir de más.
    it('no inventa un aviso de copyright', () => {
      expect(comment(DUKE)).not.toMatch(/copyright\s*(\(c\)|©|\d{4})|©/i)
    })

    it('declara qué se cambió del archivo original', () => {
      expect(comment(DUKE)).toContain('viewBox fitted to the drawing')
      expect(comment(DUKE)).toContain('No path was altered')
    })
  })
})

// La ficha va sobre Tile, oscura: el chip negro del original no se vería.
describe('icono genérico de agentes de IA, en blanco', () => {
  // https://github.com/primefaces/primeicons -> raw-svg/microchip-ai.svg, en
  // la versión 7.0.0. SHA-256 del archivo oficial, que ya trae finales de
  // línea LF y el relleno en negro.
  const OFFICIAL_SHA256 = '6d1c4d3c14d6a55d8126f35daa3016e1d54da26a5bb3ece1a66688d9ebd88bf1'

  // El aviso de la licencia MIT, como está en el LICENSE de esa versión.
  const COPYRIGHT_NOTICE = 'Copyright (c) 2018-2021 PrimeTek'
  const PERMISSION_NOTICE = [
    'Permission is hereby granted, free of charge, to any person obtaining a copy',
    'of this software and associated documentation files (the "Software"), to deal',
    'in the Software without restriction, including without limitation the rights',
    'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
    'copies of the Software, and to permit persons to whom the Software is',
    'furnished to do so, subject to the following conditions:',
    '',
    'The above copyright notice and this permission notice shall be included in all',
    'copies or substantial portions of the Software.',
  ]

  const root = () => parseSvg(read(AI_AGENTS_WHITE)).documentElement
  const drawing = () => read(AI_AGENTS_WHITE).replace(LEADING_COMMENT, '')
  /** Líneas del comentario, sin su sangría. */
  const commentLines = () => comment(AI_AGENTS_WHITE).split('\n').map((line) => line.trim())

  it('existe en public/icons, fuera de la carpeta de logos de marca', () => {
    expect(existsSync(AI_AGENTS_WHITE)).toBe(true)
    expect(AI_AGENTS_WHITE).not.toContain('/tech/')
  })

  it('es un SVG seguro como icono estático', () => {
    expect(svgIssues(read(AI_AGENTS_WHITE))).toEqual([])
  })

  it('es cuadrado', () => {
    expect(root().getAttribute('viewBox')).toBe('0 0 24 24')
  })

  it('su único cambio respecto al original es el relleno, de negro a blanco', async () => {
    expect(drawing().match(/fill="(?:black|white)"/g)).toEqual(['fill="white"'])
    expect(await sha256(drawing().replace('fill="white"', 'fill="black"'))).toBe(OFFICIAL_SHA256)
  })

  // Se carga con <img>, donde currentColor no hereda el color de la página:
  // el color va fijo en el archivo.
  it('su color es fijo: no depende de currentColor', () => {
    expect(read(AI_AGENTS_WHITE)).not.toMatch(/currentColor/i)
    expect(root().querySelector('path')?.getAttribute('fill')).toBe('white')
  })

  it('no nombra ninguna empresa ni modelo de IA', () => {
    expect(drawing()).not.toMatch(
      /openai|chatgpt|gpt|anthropic|claude|gemini|google|android|copilot|microsoft|meta\b|llama|mistral|deepseek|grok|perplexity/i,
    )
  })

  describe('comentario de atribución', () => {
    it('dice de dónde sale y qué se cambió', () => {
      expect(comment(AI_AGENTS_WHITE)).toContain('https://github.com/primefaces/primeicons')
      expect(comment(AI_AGENTS_WHITE)).toContain('raw-svg/microchip-ai.svg')
      expect(comment(AI_AGENTS_WHITE)).toContain('version 7.0.0')
      expect(comment(AI_AGENTS_WHITE)).toContain('changed from black to white')
      expect(comment(AI_AGENTS_WHITE)).toContain('Not a brand logo')
    })

    // La licencia MIT pide conservar estos avisos en toda copia.
    it('conserva el aviso de copyright y el de permiso de la licencia MIT', () => {
      expect(commentLines()).toContain('MIT License')
      expect(commentLines()).toContain(COPYRIGHT_NOTICE)
      expect(commentLines().join('\n')).toContain(PERMISSION_NOTICE.join('\n'))
    })

    it('conserva la renuncia de garantía hasta su última línea', () => {
      const lines = commentLines().join('\n')

      expect(lines).toContain('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND')
      expect(lines).toContain(
        'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.',
      )
    })

    // Un aviso de licencia de terceros puede traer correos: este no trae.
    it('no lleva ninguna dirección de correo', () => {
      expect(read(AI_AGENTS_WHITE)).not.toContain('@')
    })
  })
})
