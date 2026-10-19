import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Vitest no procesa el CSS (css: false) y jsdom no lo aplica: se comprueba el
// texto de los archivos tal como está en disco, desde la raíz del repo.
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const read = (path: string) => readFileSync(path, 'utf8').replace(CSS_COMMENT, '')

const navbarCss = read('src/components/layout/Navbar.module.css')
const tokensCss = read('src/styles/tokens.css')
const fontsCss = read('src/styles/fonts.css')

const LOGO_WEIGHT_TOKEN = '--font-weight-semibold'

/** Pesos de JetBrains Mono que declara fonts.css con @font-face. */
const monoWeights = [...fontsCss.matchAll(/@font-face\s*\{([^}]*)\}/g)]
  .map(([, body = '']) => body)
  .filter((body) => body.includes("font-family: 'JetBrains Mono'"))
  .map((body) => /font-weight:\s*(\d+);/.exec(body)?.[1])

/** Declaraciones de la regla que tiene exactamente ese selector. */
const rule = (css: string, selector: string) => {
  const escaped = selector.replace('.', '\\.')
  const body = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
  return Object.fromEntries(
    body
      .split(';')
      .map((declaration) => declaration.split(':').map((part) => part.trim()))
      .filter(([property, value]) => property && value),
  )
}

describe('Navbar: peso del logo', () => {
  // La spec pide el logo en mono 600.
  it('el logo usa el token de peso 600', () => {
    expect(rule(navbarCss, '.brand')).toMatchObject({
      'font-weight': `var(${LOGO_WEIGHT_TOKEN})`,
    })
  })

  it('el token existe y vale 600', () => {
    expect(tokensCss).toMatch(new RegExp(`${LOGO_WEIGHT_TOKEN}:\\s*600;`))
  })

  // Sin el archivo del peso 600, el navegador engordaría el 400 por su cuenta.
  it('la fuente mono se carga también en peso 600', () => {
    expect(monoWeights).toContain('600')
  })

  it('el tamaño del logo sale de su token', () => {
    expect(rule(navbarCss, '.brand')).toMatchObject({ 'font-size': 'var(--font-size-brand)' })
  })

  it('los enlaces de la barra no cambian de peso', () => {
    expect(rule(navbarCss, '.link')).not.toHaveProperty('font-weight')
  })
})
