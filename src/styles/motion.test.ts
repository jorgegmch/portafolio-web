import { describe, expect, it } from 'vitest'
import { cssMedia, cssRule, readCss } from '@/test/cssRules'

// Reglas de movimiento que se cumplen en el CSS (spec §4 y regla de estilos):
// solo se animan transform y opacity, todo respeta prefers-reduced-motion y
// la pausa global detiene lo que se mueve solo. Se lee el texto de los
// archivos; lo que depende de la cascada se comprueba en el navegador.

const REDUCE = '(prefers-reduced-motion: reduce)'
const NO_PREFERENCE = '(prefers-reduced-motion: no-preference)'

/**
 * Todos los CSS de src/. Vite resuelve el patrón al transformar el test: la
 * lista es la del disco, y cada archivo se lee sin importarlo.
 */
const cssFiles = Object.keys(import.meta.glob('/src/**/*.css')).map((key) => key.replace(/^\//, ''))
const sources = cssFiles.map((path) => ({ path, css: readCss(path) }))

/** Propiedades que cambia cada @keyframes de un CSS. */
const keyframeProperties = (css: string) =>
  [...css.matchAll(/@keyframes\s+[\w-]+\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/g)].flatMap(([, body = '']) =>
    [...body.matchAll(/([a-z-]+)\s*:/g)].map(([, property]) => property),
  )

/** Propiedades que nombra cada declaración transition de un CSS. */
const transitionProperties = (css: string) =>
  [...css.matchAll(/(?:^|[;{\s])transition\s*:\s*([^;]+);/g)].flatMap(([, value = '']) =>
    value.split(',').map((part) => part.trim().split(/\s+/)[0]),
  )

describe('movimiento en el CSS', () => {
  // Control positivo: si el patrón dejara de encontrar archivos, el resto
  // pasaría sin comprobar nada.
  it('encuentra los CSS de la página, con sus animaciones', () => {
    expect(cssFiles).toContain('src/styles/global.css')
    expect(cssFiles).toContain('src/components/ui/Ribbon.module.css')
    expect(sources.flatMap(({ css }) => keyframeProperties(css)).length).toBeGreaterThan(5)
    expect(sources.flatMap(({ css }) => transitionProperties(css)).length).toBeGreaterThan(3)
  })

  describe('solo se animan transform y opacity', () => {
    it.each(sources.map(({ path }) => path))('%s: sus @keyframes', (path) => {
      const css = sources.find((source) => source.path === path)?.css ?? ''

      keyframeProperties(css).forEach((property) => expect(['transform', 'opacity']).toContain(property))
    })

    it.each(sources.map(({ path }) => path))('%s: sus transiciones', (path) => {
      const css = sources.find((source) => source.path === path)?.css ?? ''

      transitionProperties(css).forEach((property) => expect(['transform', 'opacity']).toContain(property))
    })
  })

  describe('movimiento reducido', () => {
    // Lo que se repite sin fin se queda quieto con movimiento reducido: o
    // solo se declara sin preferencia, o el bloque reduce lo apaga.
    it.each(sources.filter(({ css }) => /\binfinite\b/.test(css)).map(({ path }) => path))(
      '%s: lo que se repite sin fin respeta la preferencia',
      (path) => {
        const css = sources.find((source) => source.path === path)?.css ?? ''

        expect(css).toMatch(/prefers-reduced-motion/)
      },
    )

    it('las cintas solo se mueven sin preferencia de movimiento', () => {
      const css = readCss('src/components/ui/Ribbon.module.css')

      expect(cssRule(css, '.track')).not.toHaveProperty('animation')
      expect(cssMedia(css, NO_PREFERENCE)).toMatch(/\.track\s*\{[^}]*animation:\s*ribbon-slide/)
    })

    it('las luces de los iconos de Servicios, el pulso del Hero y el Traductor también', () => {
      ;[
        'src/components/ui/ServiceIcon.module.css',
        'src/components/sections/Hero.module.css',
        'src/components/ui/Translator.module.css',
      ].forEach((path) => expect(cssMedia(readCss(path), NO_PREFERENCE), path).toMatch(/animation:/))
    })

    it('el giro de «Enviando» del formulario se para', () => {
      const css = readCss('src/components/ui/ContactForm.module.css')

      expect(cssMedia(css, REDUCE)).toMatch(/\.spinner\s*\{\s*animation:\s*none/)
    })

    it('el botón de pausa se oculta: no hay nada que pausar', () => {
      const css = readCss('src/components/ui/PauseToggle.module.css')

      expect(cssMedia(css, REDUCE)).toMatch(/\.toggle\s*\{\s*display:\s*none/)
    })

    it('las duraciones de los tokens bajan a casi cero', () => {
      const reduced = cssMedia(readCss('src/styles/tokens.css'), REDUCE)

      ;['--duration-fast', '--duration-base', '--duration-slow', '--dur-reveal'].forEach((token) =>
        expect(reduced).toMatch(new RegExp(`${token}:\\s*0\\.01ms`)),
      )
    })

    it('la cortina y la pila de proyectos solo existen sin preferencia de movimiento', () => {
      ;['src/components/layout/Layout.module.css', 'src/components/sections/Projects.module.css'].forEach(
        (path) => {
          const css = readCss(path)
          const guarded = /@media \(prefers-reduced-motion: no-preference\)[^{]*\{[\s\S]*animation-timeline/

          expect(css, path).toMatch(guarded)
        },
      )
    })
  })

  describe('pausa global', () => {
    it('con data-motion="paused", toda animación de la página se detiene', () => {
      const css = readCss('src/styles/global.css')

      expect(css).toMatch(
        /\[data-motion='paused'\] \*,\s*\[data-motion='paused'\] \*::before,\s*\[data-motion='paused'\] \*::after\s*\{\s*animation-play-state:\s*paused !important;/,
      )
    })

    // Lo que mueve el scroll del visitante, o una entrada de una vez, no se
    // congela a medias.
    it('la cortina, la pila y la entrada de la barra fija siguen en marcha', () => {
      expect(readCss('src/components/layout/Layout.module.css')).toMatch(
        /\.frame\[data-motion\] > \.main > \*[\s\S]*?animation-play-state:\s*running !important/,
      )
      expect(readCss('src/components/sections/Projects.module.css')).toMatch(
        /\[data-motion\] \.stack > \*[\s\S]*?animation-play-state:\s*running !important/,
      )
      expect(readCss('src/components/layout/Navbar.module.css')).toMatch(
        /\[data-motion\] \.header\[data-stuck\]\s*\{\s*animation-play-state:\s*running !important/,
      )
    })
  })
})
