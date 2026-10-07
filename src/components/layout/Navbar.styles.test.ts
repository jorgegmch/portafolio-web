import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Vitest no procesa el CSS (css: false) y jsdom no lo aplica: se comprueba el
// texto de los archivos tal como está en disco, desde la raíz del repo.
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const read = (path: string) => readFileSync(path, 'utf8').replace(CSS_COMMENT, '')

const navbarCss = read('src/components/layout/Navbar.module.css')
const tokensCss = read('src/styles/tokens.css')
const fontsCss = read('src/styles/fonts.css')

const MEDIUM_WEIGHT_TOKEN = '--font-weight-medium'
const MEDIUM_WEIGHT_FONT = '@fontsource/jetbrains-mono/latin-500.css'

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
  it('el logo usa el token de peso medio', () => {
    expect(rule(navbarCss, '.brand')).toMatchObject({
      'font-weight': `var(${MEDIUM_WEIGHT_TOKEN})`,
    })
  })

  it('el token existe y vale 500', () => {
    expect(tokensCss).toMatch(new RegExp(`${MEDIUM_WEIGHT_TOKEN}:\\s*500;`))
  })

  // Sin el archivo del peso 500, el navegador engordaría el 400 por su cuenta.
  it('la fuente mono se carga también en peso 500', () => {
    expect(fontsCss).toContain(`@import '${MEDIUM_WEIGHT_FONT}';`)
  })

  it('el tamaño del logo sigue saliendo del mismo token', () => {
    expect(rule(navbarCss, '.brand')).toMatchObject({ 'font-size': 'var(--font-size-sm)' })
  })

  it('los enlaces de la barra no cambian de peso', () => {
    expect(rule(navbarCss, '.link')).not.toHaveProperty('font-weight')
  })
})
