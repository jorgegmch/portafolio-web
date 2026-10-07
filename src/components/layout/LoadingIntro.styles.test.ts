import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { INTRO_TIMING } from '@/lib/introFrames'

// Vitest no procesa el CSS (css: false) y jsdom no lo aplica: se comprueba el
// texto de los archivos tal como está en disco, desde la raíz del repo.
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const read = (path: string) => readFileSync(path, 'utf8').replace(CSS_COMMENT, '')

const introCss = read('src/components/layout/LoadingIntro.module.css')
const tokensCss = read('src/styles/tokens.css')

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

/** Primer valor del token en tokens.css: el de :root, antes de los @media. */
const token = (name: string) => new RegExp(`${name}:\\s*([^;]+);`).exec(tokensCss)?.[1] ?? ''

const FADE_TOKEN = '--duration-slow'

describe('LoadingIntro: estilos', () => {
  describe('capa', () => {
    it('cubre toda la ventana y no se mueve con el scroll', () => {
      expect(rule(introCss, '.intro')).toMatchObject({ position: 'fixed', inset: '0' })
    })

    it('va en su propia capa, por encima del skip link', () => {
      expect(rule(introCss, '.intro')).toMatchObject({ 'z-index': 'var(--z-intro)' })
      expect(Number(token('--z-intro'))).toBeGreaterThan(Number(token('--z-skip-link')))
    })

    it('tapa la página con el color de fondo', () => {
      expect(rule(introCss, '.intro')).toMatchObject({ 'background-color': 'var(--color-bg)' })
    })
  })

  describe('desvanecimiento', () => {
    it('solo transiciona la opacidad, con la duración del token', () => {
      expect(rule(introCss, '.intro')).toMatchObject({
        transition: `opacity var(${FADE_TOKEN}) var(--ease-standard)`,
      })
    })

    it('la salida la lleva a cero', () => {
      expect(rule(introCss, '.leaving')).toMatchObject({ opacity: '0' })
    })

    // El respaldo en JS repite, con margen, una duración que vive en CSS: si
    // alguien alarga el token, este test avisa de que el respaldo se quedó corto.
    it('el respaldo de JS es mayor que la duración del desvanecimiento', () => {
      const fadeMs = Number.parseFloat(token(FADE_TOKEN))

      expect(token(FADE_TOKEN)).toMatch(/^\d+ms$/)
      expect(INTRO_TIMING.exitFallbackMs).toBeGreaterThan(fadeMs)
    })
  })

  describe('reglas de estilos', () => {
    it('ninguna otra transición ni animación toca algo distinto de la opacidad', () => {
      const transitions = [...introCss.matchAll(/transition:\s*([^;]+);/g)].map((match) => match[1])
      const keyframes = [...introCss.matchAll(/@keyframes[^{]*\{((?:[^{}]*\{[^}]*\})*)\s*\}/g)]
      const animated = keyframes.flatMap((match) =>
        [...(match[1] ?? '').matchAll(/([a-z-]+)\s*:/g)].map((property) => property[1]),
      )

      expect(transitions.length).toBeGreaterThan(0)
      transitions.forEach((value) => expect(value).toMatch(/^opacity\b/))
      expect(animated.length).toBeGreaterThan(0)
      expect(new Set(animated)).toEqual(new Set(['opacity']))
    })

    it('con movimiento reducido el cursor no parpadea', () => {
      const reduced =
        /@media \(prefers-reduced-motion: reduce\)\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/.exec(
          introCss,
        )?.[1] ?? ''

      expect(rule(reduced, '.cursor')).toMatchObject({ animation: 'none' })
    })

    // Excepción aceptada a «nunca outline: none»: la capa recibe el foco al
    // montar, pero no es interactiva. El botón conserva su anillo.
    // El selector importa: el anillo global es :focus-visible y se carga
    // después, así que un .intro a secas empataría en especificidad y perdería
    // (visto en Chrome). Con .intro:focus-visible gana.
    it('la capa no muestra anillo de foco, con un selector que gana al anillo global', () => {
      expect(rule(introCss, '.intro:focus-visible')).toMatchObject({ outline: 'none' })
      expect(rule(introCss, '.intro')).not.toHaveProperty('outline')
    })

    it('la capa es lo único que quita el anillo: el botón lo conserva', () => {
      expect(introCss.match(/outline:\s*(?:none|0)\b/g)).toHaveLength(1)
      expect(rule(introCss, '.skip')).not.toHaveProperty('outline')
    })

    it('no hay colores escritos a mano', () => {
      expect(introCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    })
  })
})
