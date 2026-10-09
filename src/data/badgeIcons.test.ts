import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cssToken, readCss } from '@/test/cssRules'
import { parseSvg, svgIssues } from '@/test/svgSafety'

// Los iconos se leen de disco, desde la raíz del repo: lo que se comprueba es
// el archivo que se publica.
const DUKE = 'public/tech/duke.svg'
const DATABASE = 'public/icons/database.svg'
const AI_AGENTS = 'public/icons/ai-agents.svg'

const tokensCss = readCss('src/styles/tokens.css')
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
      expect(comment(DUKE)).toContain(
        'You do not need permission to use or modify the Duke image.',
      )
    })

    it('avisa de que el repositorio no publica licencia ni aviso de copyright', () => {
      expect(comment(DUKE)).toContain(
        'does not publish the text of a license or a copyright notice',
      )
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

describe('icono genérico de base de datos', () => {
  it('existe en public/icons, fuera de la carpeta de logos de marca', () => {
    expect(existsSync(DATABASE)).toBe(true)
    expect(DATABASE).not.toContain('/tech/')
  })

  it('es un SVG seguro como icono estático', () => {
    expect(svgIssues(read(DATABASE))).toEqual([])
  })

  it('es cuadrado', () => {
    expect(parseSvg(read(DATABASE)).documentElement.getAttribute('viewBox')).toBe('0 0 24 24')
  })

  // Un cilindro apilado: solo elipses y trazos. Nada de texto ni de formas
  // que puedan parecer el logo de una marca.
  it('se dibuja solo con una elipse y trazos', () => {
    const shapes = [...parseSvg(read(DATABASE)).documentElement.querySelectorAll('*')].map(
      (element) => element.localName,
    )

    expect(shapes.length).toBeGreaterThan(0)
    expect(new Set(shapes)).toEqual(new Set(['ellipse', 'path']))
  })

  it('no nombra ninguna marca', () => {
    expect(read(DATABASE)).not.toMatch(/postgres|slonik|elephant|mysql|oracle|mongo/i)
  })

  // Va sobre la placa clara de la pastilla: trazo oscuro, del color de un token.
  it('su trazo es el color de superficie de la paleta, sin relleno', () => {
    const root = parseSvg(read(DATABASE)).documentElement

    expect(cssToken(tokensCss, '--color-surface')).toMatch(/^#[0-9a-f]{6}$/)
    expect(root.getAttribute('stroke')).toBe(cssToken(tokensCss, '--color-surface'))
    expect(root.getAttribute('fill')).toBe('none')
  })

  it('su comentario dice que es un dibujo propio, no un logo', () => {
    expect(comment(DATABASE)).toContain('Generic database icon drawn for this site')
    expect(comment(DATABASE)).toContain('not a brand logo')
  })
})

describe('icono genérico de agentes de IA', () => {
  it('existe en public/icons, fuera de la carpeta de logos de marca', () => {
    expect(existsSync(AI_AGENTS)).toBe(true)
    expect(AI_AGENTS).not.toContain('/tech/')
  })

  it('es un SVG seguro como icono estático', () => {
    expect(svgIssues(read(AI_AGENTS))).toEqual([])
  })

  it('es cuadrado', () => {
    expect(parseSvg(read(AI_AGENTS)).documentElement.getAttribute('viewBox')).toBe('0 0 24 24')
  })

  // Nodos conectados: solo círculos y trazos rectos. Nada de texto, de
  // destellos ni de formas que puedan parecer el logo de una empresa o de un
  // modelo de IA.
  it('se dibuja solo con círculos y trazos', () => {
    const shapes = [...parseSvg(read(AI_AGENTS)).documentElement.querySelectorAll('*')].map(
      (element) => element.localName,
    )

    expect(shapes.length).toBeGreaterThan(0)
    expect(new Set(shapes)).toEqual(new Set(['circle', 'path']))
  })

  it('es un nodo central conectado con tres más', () => {
    const root = parseSvg(read(AI_AGENTS)).documentElement
    const radii = [...root.querySelectorAll('circle')].map((circle) => Number(circle.getAttribute('r')))

    expect(radii).toHaveLength(4)
    expect(radii.filter((radius) => radius === Math.max(...radii))).toHaveLength(1)
  })

  // Los trazos son segmentos rectos: sin curvas no hay espirales, nudos ni estrellas.
  it('los trazos son solo segmentos rectos', () => {
    const paths = [...parseSvg(read(AI_AGENTS)).documentElement.querySelectorAll('path')]

    expect(paths.length).toBeGreaterThan(0)
    paths.forEach((path) => expect(path.getAttribute('d')).toMatch(/^[MmLl\d\s.,-]+$/))
  })

  it('no nombra ninguna empresa ni modelo de IA', () => {
    expect(read(AI_AGENTS)).not.toMatch(
      /openai|chatgpt|gpt|anthropic|claude|gemini|google|copilot|microsoft|meta\b|llama|mistral|deepseek|grok|perplexity/i,
    )
  })

  // Va sobre la placa clara de la pastilla: trazo oscuro, del color de un token.
  it('su trazo es el color de superficie de la paleta, sin relleno', () => {
    const root = parseSvg(read(AI_AGENTS)).documentElement

    expect(root.getAttribute('stroke')).toBe(cssToken(tokensCss, '--color-surface'))
    expect(root.getAttribute('fill')).toBe('none')
  })

  // Los dos iconos propios van juntos en las pastillas: mismo grosor y mismos remates.
  it('usa el mismo trazo que el icono de base de datos', () => {
    const own = parseSvg(read(AI_AGENTS)).documentElement
    const database = parseSvg(read(DATABASE)).documentElement

    ;['stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'viewBox'].forEach((attribute) =>
      expect(own.getAttribute(attribute)).toBe(database.getAttribute(attribute)),
    )
    expect(own.getAttribute('stroke-width')).not.toBeNull()
  })

  it('su comentario dice que es un dibujo propio, no un logo', () => {
    expect(comment(AI_AGENTS)).toContain('Generic AI agents icon drawn for this site')
    expect(comment(AI_AGENTS)).toContain('not a brand logo')
  })
})
