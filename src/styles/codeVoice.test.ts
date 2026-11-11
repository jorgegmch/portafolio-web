import { describe, expect, it } from 'vitest'
import { cssRule, cssToken, readCss } from '@/test/cssRules'
import { contrastRatio } from '@/test/contrast'

// Voz de código (spec v2.1 §1 y §2): JetBrains Mono con Code (teal) para la
// sintaxis y los detalles de programador; Signal se queda como única voz de
// acción. Code no va en botones, fondos, bordes de acción ni títulos.
const tokensCss = readCss('src/styles/tokens.css')

const css = (path: string) => readCss(`src/components/${path}`)

describe('voz de código: tokens', () => {
  it('Code y Code Deep tienen los valores de la spec', () => {
    expect(cssToken(tokensCss, '--color-code')).toBe('#45d9c8')
    expect(cssToken(tokensCss, '--color-code-deep')).toBe('#0a5f54')
  })

  // Contrastes de la tabla de la spec: 10,8:1 sobre Ink y 6,1:1 sobre Paper.
  it('Code se lee sobre los paneles oscuros y Code Deep sobre Paper (AA)', () => {
    const code = cssToken(tokensCss, '--color-code')
    const codeDeep = cssToken(tokensCss, '--color-code-deep')

    expect(contrastRatio(code, cssToken(tokensCss, '--color-ink'))).toBeCloseTo(10.8, 1)
    expect(contrastRatio(code, cssToken(tokensCss, '--color-graphite'))).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(code, cssToken(tokensCss, '--color-console-code'))).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(codeDeep, cssToken(tokensCss, '--color-paper'))).toBeCloseTo(6.1, 1)
  })

  it('las líneas que faltaban existen: borde de la barra fija, de los campos y tinta al 60 %', () => {
    expect(cssToken(tokensCss, '--line-14')).toBe('rgba(242, 238, 230, 0.14)')
    expect(cssToken(tokensCss, '--line-45')).toBe('rgba(242, 238, 230, 0.45)')
    expect(cssToken(tokensCss, '--line-ink-60')).toBe('rgba(10, 10, 11, 0.6)')
  })
})

describe('voz de código: dónde va', () => {
  it('el guion bajo del logo', () => {
    expect(cssRule(css('layout/Navbar.module.css'), '.cursor')).toMatchObject({
      color: 'var(--color-code)',
    })
  })

  it('el punto de «Disponible» del Hero y las «//» de su línea de stack', () => {
    const hero = css('sections/Hero.module.css')

    expect(cssRule(hero, '.statusDot')).toMatchObject({ 'background-color': 'var(--color-code)' })
    expect(cssRule(hero, '.comment')).toMatchObject({ color: 'var(--color-code)' })
  })

  it('la sintaxis del Traductor; los comentarios siguen en su gris', () => {
    const translator = css('ui/Translator.module.css')

    expect(cssRule(translator, '.keyword')).toMatchObject({ color: 'var(--color-code)' })
    expect(cssRule(translator, '.comment')).toMatchObject({ color: 'var(--color-code-comment)' })
  })

  it('los separadores «/» de la cinta de código de Servicios', () => {
    expect(cssRule(css('ui/CrossedRibbons.module.css'), '.code')).toMatchObject({
      '--ribbon-separator-color': 'var(--color-code)',
    })
  })

  it('los rótulos tipo funcion(): Code sobre oscuro y Code Deep sobre Paper', () => {
    expect(cssRule(css('sections/About.module.css'), '.tag')).toMatchObject({
      color: 'var(--color-code)',
    })
    expect(cssRule(css('sections/Services.module.css'), '.tag')).toMatchObject({
      color: 'var(--color-code-deep)',
    })
  })

  it('el código de la intro y su cursor (spec §4.1)', () => {
    const intro = css('layout/LoadingIntro.module.css')

    expect(cssRule(intro, '.code')).toMatchObject({ color: 'var(--color-code)' })
    expect(cssRule(intro, '.cursor')).toMatchObject({ 'background-color': 'var(--color-code)' })
  })

  // Signal sigue siendo la voz de acción: lo que se pulsa no cambia de color.
  it('los botones siguen en Signal: el CTA de la barra y las pestañas activas del Traductor', () => {
    expect(cssRule(css('layout/Navbar.module.css'), '.cta')).toMatchObject({
      'background-color': 'var(--color-signal)',
    })
    expect(css('ui/Translator.module.css')).toMatch(/background-color: var\(--color-signal\)/)
  })
})
