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

  describe('texto animado', () => {
    const SIZE_TOKEN = '--font-size-intro'
    const PREVIOUS_TOKEN = '--font-size-lead'

    /** Mínimo y máximo, en rem, de un token escrito como clamp(mín, fluido, máx). */
    const clampBounds = (name: string) => {
      const [, min = '', max = ''] =
        /^clamp\(\s*([\d.]+)rem\s*,[^,]+,\s*([\d.]+)rem\s*\)$/.exec(token(name)) ?? []
      return { min: Number.parseFloat(min), max: Number.parseFloat(max) }
    }

    it('la línea usa el token de tamaño de la intro', () => {
      expect(rule(introCss, '.line')).toMatchObject({ 'font-size': `var(${SIZE_TOKEN})` })
    })

    // Su alto es el del texto: si usara otro token, quedaría más bajo que las letras.
    it('el cursor mide lo mismo que el texto', () => {
      expect(rule(introCss, '.cursor')).toMatchObject({ height: `var(${SIZE_TOKEN})` })
    })

    it('el token existe y es fluido: 16 px en pantallas estrechas y 24 px en anchas', () => {
      expect(token(SIZE_TOKEN)).toBe('clamp(1rem, 2.2vw, 1.5rem)')
    })

    it('es mayor que el tamaño anterior en los dos extremos', () => {
      const size = clampBounds(SIZE_TOKEN)
      const previous = clampBounds(PREVIOUS_TOKEN)

      expect(size.min).toBeGreaterThan(previous.min)
      expect(size.max).toBeGreaterThan(previous.max)
    })

    it('la intro ya no usa el tamaño anterior', () => {
      expect(introCss).not.toContain(PREVIOUS_TOKEN)
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

  describe('botón de saltar', () => {
    const BACKGROUND = '--color-bg'
    const BORDER = '--color-accent'
    const TEXT = '--color-text-muted'
    const TEXT_ACTIVE = '--color-accent'
    const AA_TEXT = 4.5
    const AA_NON_TEXT = 3

    /** Declaraciones de la regla que agrupa el puntero encima y el foco con teclado. */
    const hoverAndFocus = () => {
      const body =
        /\.skip:hover,\s*\.skip:focus-visible\s*\{([^}]*)\}/.exec(introCss)?.[1] ?? ''
      return Object.fromEntries(
        body
          .split(';')
          .map((declaration) => declaration.split(':').map((part) => part.trim()))
          .filter(([property, value]) => property && value),
      )
    }

    /** Luminancia relativa de un color #rrggbb, según WCAG 2. */
    const luminance = (hex: string) => {
      const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
      if (!channels) throw new Error(`Color no hexadecimal: «${hex}»`)
      const [red = 0, green = 0, blue = 0] = channels.slice(1).map((channel) => {
        const value = Number.parseInt(channel, 16) / 255
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }

    /** Contraste WCAG entre dos tokens de color de tokens.css. */
    const contrast = (foreground: string, background: string) => {
      const [lighter = 0, darker = 0] = [luminance(token(foreground)), luminance(token(background))]
        .sort((a, b) => b - a)
      return (lighter + 0.05) / (darker + 0.05)
    }

    describe('en reposo', () => {
      it('el borde es del azul de la paleta', () => {
        expect(rule(introCss, '.skip')).toMatchObject({ border: `1px solid var(${BORDER})` })
      })

      it('el texto es gris claro', () => {
        expect(rule(introCss, '.skip')).toMatchObject({ color: `var(${TEXT})` })
      })
    })

    describe('con el puntero encima o con el foco del teclado', () => {
      it('el texto pasa al azul', () => {
        expect(hoverAndFocus()).toMatchObject({ color: `var(${TEXT_ACTIVE})` })
      })

      it('el borde no cambia: ya es azul', () => {
        expect(hoverAndFocus()).not.toHaveProperty('border-color')
        expect(hoverAndFocus()).not.toHaveProperty('border')
      })

      // :focus a secas se activaría también con el clic del ratón.
      it('el foco solo cuenta si llega con el teclado', () => {
        expect(introCss).not.toMatch(/\.skip:focus(?!-visible)/)
      })
    })

    describe('anillo de foco', () => {
      it('se separa del borde con un token de espaciado', () => {
        expect(rule(introCss, '.skip:focus-visible')).toMatchObject({
          'outline-offset': 'var(--space-1)',
        })
      })

      // El anillo y el borde son del mismo azul: se distinguen por el hueco.
      it('queda más separado que el anillo global', () => {
        const offset = Number.parseFloat(token('--space-1'))
        const globalOffset = Number.parseFloat(token('--focus-ring-offset'))

        expect(token('--space-1')).toMatch(/rem$/)
        expect(token('--focus-ring-offset')).toMatch(/rem$/)
        expect(offset).toBeGreaterThan(globalOffset)
      })

      it('conserva el anillo global: ni lo quita ni lo redefine', () => {
        expect(rule(introCss, '.skip:focus-visible')).not.toHaveProperty('outline')
        expect(rule(introCss, '.skip')).not.toHaveProperty('outline')
      })
    })

    describe('contraste sobre el fondo de la capa', () => {
      it('el fondo de la capa es el token contra el que se mide', () => {
        expect(rule(introCss, '.intro')).toMatchObject({
          'background-color': `var(${BACKGROUND})`,
        })
      })

      it('el texto en reposo cumple AA', () => {
        expect(contrast(TEXT, BACKGROUND)).toBeGreaterThanOrEqual(AA_TEXT)
      })

      it('el texto con el puntero o el foco cumple AA', () => {
        expect(contrast(TEXT_ACTIVE, BACKGROUND)).toBeGreaterThanOrEqual(AA_TEXT)
      })

      it('el borde cumple el mínimo de los elementos no textuales', () => {
        expect(contrast(BORDER, BACKGROUND)).toBeGreaterThanOrEqual(AA_NON_TEXT)
      })

      it('el anillo de foco, que usa el color de foco global, también', () => {
        expect(token('--color-focus')).toBe(`var(${BORDER})`)
        expect(contrast(BORDER, BACKGROUND)).toBeGreaterThanOrEqual(AA_NON_TEXT)
      })
    })
  })
})
