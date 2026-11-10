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
  const escaped = selector.replace(/\./g, '\\.')
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

const EXIT_TOKEN = '--dur-intro-exit'

describe('LoadingIntro: estilos', () => {
  describe('capa', () => {
    it('cubre toda la ventana y no se mueve con el scroll', () => {
      expect(rule(introCss, '.intro')).toMatchObject({ position: 'fixed', inset: '0' })
    })

    it('va en su propia capa, por encima del skip link', () => {
      expect(rule(introCss, '.intro')).toMatchObject({ 'z-index': 'var(--z-intro)' })
      expect(Number(token('--z-intro'))).toBeGreaterThan(Number(token('--z-skip-link')))
    })

    // Lo que tapa son las barras: si la capa tuviera fondo, al abrirse no
    // dejarían ver el Hero.
    it('no tiene fondo propio', () => {
      expect(rule(introCss, '.intro')).not.toHaveProperty('background-color')
      expect(rule(introCss, '.intro')).not.toHaveProperty('background')
    })
  })

  describe('barras de cine', () => {
    it('cada una tapa media ventana con el Void', () => {
      expect(rule(introCss, '.bar')).toMatchObject({
        position: 'absolute',
        height: '50%',
        'background-color': 'var(--color-void)',
      })
      expect(rule(introCss, '.barTop')).toMatchObject({ top: '0' })
      expect(rule(introCss, '.barBottom')).toMatchObject({ bottom: '0' })
    })

    it('llevan la franja Ink del encuadre en su borde exterior', () => {
      expect(rule(introCss, '.barTop')).toMatchObject({
        'border-top': 'var(--intro-letterbox) solid var(--color-ink)',
      })
      expect(rule(introCss, '.barBottom')).toMatchObject({
        'border-bottom': 'var(--intro-letterbox) solid var(--color-ink)',
      })
    })

    it('solo transicionan el transform, con la duración del token', () => {
      expect(rule(introCss, '.bar')).toMatchObject({
        transition: `transform var(${EXIT_TOKEN}) var(--ease-cine)`,
      })
    })

    it('en la salida se abren: la de arriba sube y la de abajo baja', () => {
      expect(rule(introCss, '.leaving .barTop')).toMatchObject({ transform: 'translateY(-100%)' })
      expect(rule(introCss, '.leaving .barBottom')).toMatchObject({
        transform: 'translateY(100%)',
      })
    })

    it('en la salida el texto se desvanece', () => {
      expect(rule(introCss, '.leaving .content')).toMatchObject({ opacity: '0' })
    })

    // El respaldo en JS repite, con margen, una duración que vive en CSS: si
    // alguien alarga el token, este test avisa de que el respaldo se quedó corto.
    it('el respaldo de JS es mayor que la apertura de las barras', () => {
      const exitMs = Number.parseFloat(token(EXIT_TOKEN))

      expect(token(EXIT_TOKEN)).toMatch(/^\d+ms$/)
      expect(INTRO_TIMING.exitFallbackMs).toBeGreaterThan(exitMs)
    })
  })

  describe('texto animado', () => {
    const SIZE_TOKEN = '--font-size-intro'

    it('la frase y el código usan el token de tamaño de la intro', () => {
      expect(rule(introCss, '.natural')).toMatchObject({ 'font-size': `var(${SIZE_TOKEN})` })
      expect(rule(introCss, '.code')).toMatchObject({ 'font-size': `var(${SIZE_TOKEN})` })
    })

    // Su alto es el del texto: si usara otro token, quedaría más bajo que las letras.
    it('el cursor mide lo mismo que el texto', () => {
      expect(rule(introCss, '.cursor')).toMatchObject({ height: `var(${SIZE_TOKEN})` })
    })

    it('el token existe y es fluido: 16 px en pantallas estrechas y 24 px en anchas', () => {
      expect(token(SIZE_TOKEN)).toBe('clamp(1rem, 2.2vw, 1.5rem)')
    })

    it('el código va en Signal y en la tipografía mono', () => {
      expect(rule(introCss, '.code')).toMatchObject({
        color: 'var(--color-signal)',
        'font-family': 'var(--font-mono)',
      })
    })

  })

  // Tachar a lápiz (spec §4.1): un trazo de ida, de izquierda a derecha, y
  // otro de vuelta, más corto y apenas más abajo. Cada trazo es una franja
  // inclinada que recorta su tinta: la tinta entra con translateX, así los
  // extremos quedan redondos durante todo el trazo (scaleX los aplastaría).
  describe('tachado a lápiz', () => {
    const ms = (name: string) => Number.parseFloat(token(name))

    it('los trazos duran ~450 y ~300 ms, y la intro espera a que acaben', () => {
      expect(token('--dur-strike-first')).toBe('450ms')
      expect(token('--dur-strike-second')).toBe('300ms')
      expect(INTRO_TIMING.strikeHoldMs).toBeGreaterThanOrEqual(
        ms('--dur-strike-first') + ms('--dur-strike-second'),
      )
    })

    it('cada trazo es una franja inclinada, que recorta su tinta, con extremos redondos', () => {
      expect(rule(introCss, '.stroke')).toMatchObject({
        position: 'absolute',
        height: 'var(--intro-strike-width)',
        overflow: 'hidden',
        'border-radius': 'var(--radius-pill)',
        transform: 'rotate(var(--intro-strike-tilt))',
      })
      expect(rule(introCss, '.ink')).toMatchObject({ 'border-radius': 'var(--radius-pill)' })
    })

    it('el grosor es de ~0,09 em y la inclinación de ~−1,5°', () => {
      expect(token('--intro-strike-width')).toBe('0.09em')
      expect(token('--intro-strike-tilt')).toBe('-1.5deg')
    })

    it('el de ida sobresale un poco por los dos extremos', () => {
      expect(rule(introCss, '.strokeFirst')).toMatchObject({
        right: 'calc(-1 * var(--intro-strike-overshoot))',
        left: 'calc(-1 * var(--intro-strike-overshoot))',
      })
    })

    it('el de ida entra de izquierda a derecha, con ease-in-out', () => {
      expect(rule(introCss, '.strokeFirst .ink')).toMatchObject({ transform: 'translateX(-101%)' })
      expect(rule(introCss, '.struck .strokeFirst .ink')).toMatchObject({
        animation: 'stroke-draw var(--dur-strike-first) ease-in-out both',
      })
    })

    it('el de vuelta, más corto y apenas más abajo, entra de derecha a izquierda al acabar el de ida', () => {
      expect(rule(introCss, '.strokeSecond')).toMatchObject({
        top: 'calc(50% + var(--intro-strike-drop))',
        left: 'var(--intro-strike-return-start)',
      })
      expect(rule(introCss, '.strokeSecond .ink')).toMatchObject({ transform: 'translateX(101%)' })
      expect(rule(introCss, '.struck .strokeSecond .ink')).toMatchObject({
        animation: 'stroke-draw var(--dur-strike-second) ease-in-out var(--dur-strike-first) both',
      })
    })

    // La frase se apaga mientras se tacha, desde la mitad del trazo de ida.
    it('la frase se apaga mientras se tacha, empezando a mitad del trazo de ida', () => {
      expect(rule(introCss, '.struck .phrase')).toMatchObject({
        animation:
          'phrase-dim calc(var(--dur-strike-first) / 2 + var(--dur-strike-second)) ease-in-out calc(var(--dur-strike-first) / 2) both',
      })
      expect(introCss).toMatch(/@keyframes phrase-dim\s*\{\s*to\s*\{\s*opacity:\s*var\(--intro-struck-opacity\);\s*\}\s*\}/)
    })

    it('los trazos no se apagan con la frase: van fuera de ella', () => {
      expect(rule(introCss, '.struck .stroke')).not.toHaveProperty('opacity')
      expect(introCss).not.toContain('text-decoration')
    })
  })

  describe('descripción para lectores de pantalla', () => {
    it('cómo saltarla no se ve, pero se lee', () => {
      expect(rule(introCss, '.hint')).toMatchObject({
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        'clip-path': 'inset(50%)',
        'white-space': 'nowrap',
      })
    })
  })

  describe('reglas de estilos', () => {
    it('ninguna transición ni animación toca algo distinto de transform y opacity', () => {
      const transitions = [...introCss.matchAll(/transition:\s*([^;]+);/g)].map((match) => match[1])
      const keyframes = [...introCss.matchAll(/@keyframes[^{]*\{((?:[^{}]*\{[^}]*\})*)\s*\}/g)]
      const animated = keyframes.flatMap((match) =>
        [...(match[1] ?? '').matchAll(/([a-z-]+)\s*:/g)].map((property) => property[1]),
      )

      expect(transitions.length).toBeGreaterThan(0)
      transitions.forEach((value) => expect(value).toMatch(/^(?:opacity|transform)\b[^,]*$/))
      expect(animated.length).toBeGreaterThan(0)
      expect(new Set(animated)).toEqual(new Set(['opacity', 'transform']))
    })

    it('con movimiento reducido el cursor no parpadea', () => {
      const reduced =
        /@media \(prefers-reduced-motion: reduce\)\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/.exec(
          introCss,
        )?.[1] ?? ''

      expect(rule(reduced, '.cursor')).toMatchObject({ animation: 'none' })
    })

    // Excepción aceptada a «nunca outline: none»: la capa recibe el foco al
    // montar, pero no es un control, y no tiene ninguno dentro.
    // El selector importa: el anillo global es :focus-visible y se carga
    // después, así que un .intro a secas empataría en especificidad y perdería
    // (visto en Chrome). Con .intro:focus-visible gana.
    it('la capa no muestra anillo de foco, con un selector que gana al anillo global', () => {
      expect(rule(introCss, '.intro:focus-visible')).toMatchObject({ outline: 'none' })
      expect(rule(introCss, '.intro')).not.toHaveProperty('outline')
    })

    it('la capa es lo único que quita el anillo', () => {
      expect(introCss.match(/outline:\s*(?:none|0)\b/g)).toHaveLength(1)
    })

    it('no hay colores escritos a mano', () => {
      expect(introCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i)
    })
  })

})
