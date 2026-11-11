import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '@/test/contrast'
import { cssToken, readCss } from '@/test/cssRules'
import { parseSvg, SVG_NAMESPACE, svgIssues } from '@/test/svgSafety'

// Los logos se leen de disco, desde la raíz del repo: lo que se comprueba es
// el archivo que se publica.
const DIR = 'public/social'
const GITHUB = 'github.svg'
const LINKEDIN = 'linkedin.png'
const WHATSAPP = 'whatsapp.svg'
// Variantes negras, para las píldoras de canales sobre el panel Signal de
// Contacto (spec v2.1 §3.5): las oficiales de un solo color, sin recolorear.
const GITHUB_BLACK = 'github-black.svg'
const LINKEDIN_BLACK = 'linkedin-black.png'
const WHATSAPP_BLACK = 'whatsapp-black.svg'
const EXPECTED = [GITHUB, LINKEDIN, WHATSAPP, GITHUB_BLACK, LINKEDIN_BLACK, WHATSAPP_BLACK]
const SVGS = [GITHUB, WHATSAPP, GITHUB_BLACK, WHATSAPP_BLACK]
const PNGS = [LINKEDIN, LINKEDIN_BLACK]

/**
 * SHA-256 de cada archivo oficial, calculado sobre los bytes de su paquete de
 * marca. Todos van idénticos byte a byte: sus políticas prohíben modificar
 * el logo, así que aquí no se añade ni el comentario de atribución.
 */
const OFFICIAL_SHA256: Record<string, string> = {
  // https://brand.github.com -> GitHub_Logos.zip -> SVG/GitHub_Invertocat_White.svg
  [GITHUB]: 'ccd84c89b1056345608fc3489357f8acc7397e49a3cdc2d418b6c8016911d47b',
  // https://brand.linkedin.com/downloads -> in-logo.zip -> InBug-White.png
  [LINKEDIN]: 'ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791',
  // Centro de recursos de marca de WhatsApp ->
  // 01_Glyph/01_Digital RGB/03_SVG/Digital_Glyph_White_RGB_2026.svg
  [WHATSAPP]: '7fb054c0f4bea644b4a4a014d6d8581aad7e6dcb639049d17a578dc44f8e6fd4',
  // Los mismos paquetes, descargados de nuevo el 2026-11-11:
  // SVG/GitHub_Invertocat_Black.svg
  [GITHUB_BLACK]: '693d7abe6f899646cc2e96856723b45e95f71885a54910b2749f6decdf7e1ee1',
  // InBug-Black.png (el paquete de LinkedIn no trae SVG)
  [LINKEDIN_BLACK]: 'b80ab65537aad1b5013da98fe82d1c36c1bb4ca896fe7829a880cc5f307693ca',
  // 01_Glyph/01_Digital RGB/03_SVG/Digital_Glyph_Black_RGB_2026.svg
  [WHATSAPP_BLACK]: 'dea0d50de5d2e53320246d7172a2b8e84a999caa7798cd91681e63831cba6ed9',
}

/**
 * Los glifos oficiales de WhatsApp traen un <style> interno y no se pueden
 * editar. Se admite solo en esos dos archivos y solo mientras su hash sea el
 * oficial; se cargan con <img>, que los aísla del CSS de la página.
 */
const STYLE_ISSUE = 'lleva un elemento style'
const STYLE_ALLOWED_FOR_SHA256: Record<string, string | undefined> = {
  [WHATSAPP]: OFFICIAL_SHA256[WHATSAPP],
  [WHATSAPP_BLACK]: OFFICIAL_SHA256[WHATSAPP_BLACK],
}
const WHATSAPP_STYLE = '.cls-1{fill:#fff;}'
const WHATSAPP_BLACK_STYLE = '.cls-1{fill:#111b21;}'

const path = (file: string) => `${DIR}/${file}`
const bytes = (file: string) => Uint8Array.from(readFileSync(path(file)))
const text = (file: string) => readFileSync(path(file), 'utf8')
const root = (file: string) => parseSvg(text(file)).documentElement
const elements = (file: string) => [root(file), ...root(file).querySelectorAll('*')]

const sha256 = async (content: Uint8Array<ArrayBuffer>) => {
  const digest = await crypto.subtle.digest('SHA-256', content)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]
const uint32 = (data: Uint8Array, offset: number) =>
  new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(offset)

/** Tipos de los bloques de un PNG, en orden. */
const pngChunks = (data: Uint8Array) => {
  const kinds: string[] = []
  for (let offset = PNG_SIGNATURE.length; offset + 8 <= data.length;) {
    kinds.push(String.fromCharCode(...data.slice(offset + 4, offset + 8)))
    offset += 12 + uint32(data, offset)
  }
  return kinds
}

describe('logos de redes con archivo oficial', () => {
  it('todos tienen su hash oficial registrado', () => {
    expect(Object.keys(OFFICIAL_SHA256).sort()).toEqual([...EXPECTED].sort())
  })

  describe.each(EXPECTED)('%s', (file) => {
    it('existe en public/social', () => {
      expect(existsSync(path(file))).toBe(true)
    })

    // Sin alterar: ni el dibujo, ni el color, ni un comentario añadido.
    it('coincide byte a byte con el archivo oficial', async () => {
      expect(await sha256(bytes(file))).toBe(OFFICIAL_SHA256[file])
    })
  })

  describe.each(SVGS)('%s', (file) => {
    it('es un SVG seguro como icono estático, salvo el <style> admitido por hash', async () => {
      const allowed =
        (await sha256(bytes(file))) === STYLE_ALLOWED_FOR_SHA256[file] ? [STYLE_ISSUE] : []

      expect(svgIssues(text(file))).toEqual(allowed)
    })

    it('su raíz es un svg con viewBox', () => {
      expect(root(file).localName).toBe('svg')
      expect(root(file).namespaceURI).toBe(SVG_NAMESPACE)
      expect(root(file).hasAttribute('viewBox')).toBe(true)
    })

    // El color es el del archivo oficial: nada lo atenúa ni lo tiñe por dentro.
    it('no lleva filtros, máscaras, degradados ni opacidad', () => {
      const names = elements(file).map((element) => element.localName)
      const attributes = elements(file).flatMap((element) => [...element.attributes])

      expect(names.length).toBeGreaterThan(0)
      ;['filter', 'mask', 'linearGradient', 'radialGradient'].forEach((name) =>
        expect(names).not.toContain(name),
      )
      attributes.forEach(({ name, value }) => {
        expect(name).not.toMatch(/opacity|filter|mask/i)
        expect(value).not.toMatch(/opacity|filter\s*:/i)
      })
    })

    it('no lleva nada añadido al principio', () => {
      expect(text(file)).not.toContain('<!--')
    })
  })

  // El rect del clipPath es la forma del recorte, no pinta: su fill no cuenta.
  const paintedFills = (file: string) =>
    elements(file)
      .filter((element) => !element.closest('clipPath'))
      .map((element) => element.getAttribute('fill'))
      .filter((fill) => fill !== null && fill !== 'none')

  describe.each([
    [GITHUB, 'blanco', 'white'],
    [GITHUB_BLACK, 'negro', 'black'],
  ])('GitHub: Invertocat %s', (file, _, color) => {
    it('conserva el lienzo oficial', () => {
      expect(root(file).getAttribute('viewBox')).toBe('0 0 98 96')
    })

    it(`todo lo que pinta es ${color}`, () => {
      const fills = paintedFills(file)

      expect(fills.length).toBeGreaterThan(0)
      fills.forEach((fill) => expect(fill).toBe(color))
      elements(file).forEach((element) => expect(element.hasAttribute('stroke')).toBe(false))
    })
  })

  describe.each([
    [WHATSAPP, 'blanco', WHATSAPP_STYLE],
    [WHATSAPP_BLACK, 'negro', WHATSAPP_BLACK_STYLE],
  ])('WhatsApp: glifo %s', (file, color, style) => {
    it('conserva el lienzo oficial, cuadrado', () => {
      expect(root(file).getAttribute('viewBox')).toBe('0 0 720 720')
    })

    it(`su único <style> solo pinta de ${color}`, () => {
      const styles = [...root(file).querySelectorAll('style')]

      expect(styles).toHaveLength(1)
      expect(styles[0]?.textContent.replace(/\s/g, '')).toBe(style)
    })

    it('todos sus trazos usan esa clase y ningún otro color', () => {
      const paths = [...root(file).querySelectorAll('path')]

      expect(paths.length).toBeGreaterThan(0)
      paths.forEach((path) => {
        expect(path.getAttribute('class')).toBe('cls-1')
        expect(path.hasAttribute('fill')).toBe(false)
        expect(path.hasAttribute('stroke')).toBe(false)
      })
    })
  })

  describe.each(PNGS)('LinkedIn: %s', (file) => {
    it('es un PNG', () => {
      expect([...bytes(file).slice(0, PNG_SIGNATURE.length)]).toEqual(PNG_SIGNATURE)
    })

    // 840 x 779: no es cuadrado; quien lo muestre conserva la proporción.
    it('conserva el tamaño oficial', () => {
      expect(uint32(bytes(file), 16)).toBe(840)
      expect(uint32(bytes(file), 20)).toBe(779)
    })

    // Ni EXIF ni texto: solo cabecera, densidad e imagen.
    it('no lleva bloques de metadatos', () => {
      const kinds = pngChunks(bytes(file))

      expect(kinds[0]).toBe('IHDR')
      expect(kinds.at(-1)).toBe('IEND')
      expect(new Set(kinds)).toEqual(new Set(['IHDR', 'pHYs', 'IDAT', 'IEND']))
    })
  })
})

// Las variantes negras van sobre el panel Signal: como gráficos, piden 3:1
// (WCAG 1.4.11). El negro de cada una es el de su archivo oficial; el del PNG
// de LinkedIn se midió sobre sus píxeles opacos (todos #000000).
describe('variantes negras sobre Signal', () => {
  const signal = cssToken(readCss('src/styles/tokens.css'), '--color-signal')

  it.each([
    ['GitHub', '#000000'],
    ['LinkedIn', '#000000'],
    ['WhatsApp', '#111b21'],
  ])('%s se lee sobre Signal (3:1 o más)', (_, color) => {
    expect(contrastRatio(color, signal)).toBeGreaterThanOrEqual(3)
  })
})

// La excepción de WhatsApp no relaja el comprobador para nadie más.
describe('el comprobador de SVG sigue rechazando lo que no es un icono estático', () => {
  const svg = (inner: string) => `<svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 1 1">${inner}</svg>`

  it('acepta un dibujo sin nada más', () => {
    expect(svgIssues(svg('<path d="M0 0h1v1z"/>'))).toEqual([])
  })

  it.each([
    ['un <style>', '<style>.a{fill:#fff}</style>', STYLE_ISSUE],
    ['el <style> de WhatsApp en otro archivo', `<style>${WHATSAPP_STYLE}</style>`, STYLE_ISSUE],
    ['el <style> negro de WhatsApp en otro archivo', `<style>${WHATSAPP_BLACK_STYLE}</style>`, STYLE_ISSUE],
    ['un script', '<script>1</script>', 'lleva un elemento script'],
    ['un enlace', '<a href="#x"><path d="M0 0"/></a>', 'lleva un elemento a'],
    ['una imagen incrustada', '<image href="#x"/>', 'lleva un elemento image'],
  ])('rechaza %s', (_, inner, issue) => {
    expect(svgIssues(svg(inner))).toContain(issue)
  })

  it('rechaza una referencia fuera del archivo', () => {
    expect(svgIssues(svg('<use href="https://example.com/x.svg#a"/>'))).toContain(
      'referencia fuera del archivo en href',
    )
  })

  it('rechaza un manejador de eventos', () => {
    expect(svgIssues(svg('<path d="M0 0" onclick="x()"/>'))).toContain('lleva el manejador onclick')
  })
})

// Los logos se cargan con <img>: el CSS de la página no entra en el archivo,
// y la regla global de las imágenes tampoco les pone efectos.
describe('estilos globales', () => {
  it('no aplican filtros, mezclas ni opacidad a ninguna imagen', () => {
    const css = readCss('src/styles/global.css')

    expect(css).toMatch(/img/)
    expect(css).not.toMatch(/filter|mix-blend-mode|opacity/)
  })
})
