import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

// Barra que acompaña (spec v2.1 §3.0 y tablero navbar-states): píldora fija
// centrada arriba, fondo Ink al 90 %, borde --line-14 y sombra de dos capas.
// Entra con translateY(-16px) + opacity en 400 ms con --ease-cine; con
// movimiento reducido aparece sin animar. Ninguna sección queda bajo ella al
// saltar a un ancla: scroll-margin-top deja su alto más 16 px.
const navbarCss = readCss('src/components/layout/Navbar.module.css')
const tokensCss = readCss('src/styles/tokens.css')
const STUCK = '.header[data-stuck]'

describe('Navbar fija: estilos', () => {
  it('es una píldora fija, centrada arriba', () => {
    expect(cssRule(navbarCss, STUCK)).toMatchObject({
      position: 'fixed',
      top: 'var(--nav-fixed-top)',
      right: '0',
      left: '0',
      width: 'fit-content',
      height: 'var(--nav-pill-height)',
      'margin-inline': 'auto',
      border: '1px solid var(--line-14)',
      'border-radius': 'var(--radius-pill)',
      'background-color': 'var(--color-nav-glass)',
      'box-shadow': 'var(--shadow-nav)',
    })
  })

  it('el fondo es Ink al 90 % y la sombra tiene dos capas', () => {
    expect(cssToken(tokensCss, '--color-nav-glass')).toBe('rgba(17, 17, 19, 0.9)')
    expect(cssToken(tokensCss, '--shadow-nav').split(/,(?![^(]*\))/)).toHaveLength(2)
  })

  it('entra subiendo 16 px y apareciendo, en 400 ms con --ease-cine', () => {
    expect(cssRule(navbarCss, STUCK).animation).toBe(
      'nav-enter var(--dur-nav-enter) var(--ease-cine) both',
    )
    expect(cssToken(tokensCss, '--dur-nav-enter')).toBe('400ms')
    expect(cssToken(tokensCss, '--nav-enter-shift')).toBe('-1rem')
    expect(navbarCss).toMatch(
      /@keyframes nav-enter\s*\{\s*from\s*\{\s*opacity: 0;\s*transform: translateY\(var\(--nav-enter-shift\)\);\s*\}\s*\}/,
    )
  })

  it('con movimiento reducido aparece sin animar', () => {
    expect(cssRule(cssMedia(navbarCss, '(prefers-reduced-motion: reduce)'), STUCK)).toMatchObject({
      animation: 'none',
    })
  })

  it('fija, sus enlaces llegan a 44 px y no llevan número', () => {
    expect(cssRule(navbarCss, `${STUCK} .link`)).toMatchObject({
      'min-height': 'var(--touch-target)',
    })
    expect(cssRule(navbarCss, `${STUCK} .number`)).toMatchObject({ display: 'none' })
  })

  it('la escena actual va en Bone con texto tinta', () => {
    expect(cssRule(navbarCss, ".link[aria-current='true']")).toMatchObject({
      'background-color': 'var(--color-bone)',
      color: 'var(--color-ink-text)',
    })
  })

  it('la marca que decide si se fijó ocupa el sitio de la barra y no se ve ni recibe clics', () => {
    expect(cssRule(navbarCss, '.sentinel')).toMatchObject({
      position: 'absolute',
      top: 'var(--panel-gap)',
      height: 'var(--nav-height)',
      visibility: 'hidden',
      'pointer-events': 'none',
    })
  })
})

describe('scroll-margin-top de las escenas', () => {
  it('deja el sitio de la barra fija más 16 px', () => {
    expect(cssToken(tokensCss, '--scroll-offset')).toBe(
      'calc(var(--nav-fixed-top) + var(--nav-pill-height) + var(--space-4))',
    )
  })

  it.each([
    ['Hero', 'src/components/sections/Hero.module.css', '.hero'],
    ['Perfil', 'src/components/sections/About.module.css', '.about'],
    ['Servicios', 'src/components/sections/Services.module.css', '.services'],
    ['Proyectos', 'src/components/sections/Projects.module.css', '.projects'],
    ['Contacto', 'src/components/sections/Contact.module.css', '.contact'],
  ])('%s', (_name, path, selector) => {
    expect(cssRule(readCss(path), selector)).toMatchObject({
      'scroll-margin-top': 'var(--scroll-offset)',
    })
  })
})
