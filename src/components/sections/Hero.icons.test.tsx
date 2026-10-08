import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { heroLogos, techLogoUrl } from '@/data/technologies'
import { LangProvider } from '@/i18n/LangProvider'
import { cssMedia, cssRule, cssToken, readCss } from '@/test/cssRules'

const heroCss = readCss('src/components/sections/Hero.module.css')
const tokensCss = readCss('src/styles/tokens.css')

const renderHero = () => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CO'])
  return render(
    <LangProvider>
      <Hero />
    </LangProvider>,
  )
}

// Los iconos son decorativos y están fuera del árbol de accesibilidad, así que
// no se pueden buscar por rol: se buscan por su marca de decoración.
const decoration = () => {
  const layer = screen.getByRole('region').querySelector('[aria-hidden="true"]')
  if (!layer) throw new Error('No hay capa decorativa en el Hero')
  return layer
}
const icons = () => [...decoration().querySelectorAll('img')]

/** Reglas `.float:nth-child(n)`, que dan a cada icono su posición y su desfase. */
const placements = [...heroCss.matchAll(/\.float:nth-child\((\d+)\)\s*\{([^}]*)\}/g)].map(
  ([, index = '', body = '']) => ({ index: Number(index), body }),
)

/** Propiedades animadas dentro de los @keyframes con ese nombre. */
const keyframeProperties = (name: string) => {
  const body = new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`).exec(heroCss)?.[1] ?? ''
  return [...body.matchAll(/([a-z-]+)\s*:/g)].map(([, property]) => property)
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero: iconos de tecnología', () => {
  describe('qué se muestra', () => {
    it('hay un icono por cada logo de la lista, en su orden', () => {
      renderHero()

      expect(heroLogos.length).toBeGreaterThan(0)
      expect(icons().map((icon) => icon.getAttribute('src'))).toEqual(heroLogos.map(techLogoUrl))
    })

    it('cada logo sale de public/tech', () => {
      heroLogos.forEach((logo) => expect(techLogoUrl(logo)).toBe(`/tech/${logo}`))
    })
  })

  describe('son decorativos', () => {
    // La sección de tecnologías ya las nombra: aquí repetirlas sería ruido.
    it('quedan fuera del árbol de accesibilidad', () => {
      renderHero()

      expect(decoration()).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getAllByRole('img')).toHaveLength(1)
    })

    it('todos llevan el texto alternativo vacío', () => {
      renderHero()

      expect(icons().length).toBeGreaterThan(0)
      icons().forEach((icon) => expect(icon).toHaveAttribute('alt', ''))
    })

    it('no son enlaces ni botones, ni reciben el foco', () => {
      renderHero()

      expect(decoration().querySelectorAll('a, button, [tabindex], [role]')).toHaveLength(0)
    })

    it('no ocultan el retrato: sigue fuera de la capa decorativa', () => {
      renderHero()

      expect(decoration()).not.toContainElement(screen.getByRole('img'))
    })
  })

  describe('estructura', () => {
    // Dos elementos por icono: el de fuera flota y el de dentro escala. Con
    // uno solo, las dos transformaciones se pisarían.
    it('cada icono va dentro de su propio envoltorio', () => {
      renderHero()

      const wrappers = icons().map((icon) => icon.parentElement)

      expect(new Set(wrappers).size).toBe(icons().length)
      wrappers.forEach((wrapper) => {
        expect(wrapper).not.toBe(decoration())
        expect(wrapper?.parentElement).toBe(decoration())
      })
    })

    it('la capa va después del retrato, en su misma columna', () => {
      renderHero()

      const portrait = screen.getByRole('img')
      const glow = portrait.parentElement

      // Hermana del envoltorio del halo, no hija: dentro, los iconos llevarían halo.
      expect(glow?.parentElement).toContainElement(decoration() as HTMLElement)
      expect(glow).not.toContainElement(decoration() as HTMLElement)
      expect(
        portrait.compareDocumentPosition(decoration()) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })

    it('no hay estilos en línea: todo sale del CSS', () => {
      renderHero()

      expect(decoration().querySelectorAll('[style]')).toHaveLength(0)
      expect(decoration()).not.toHaveAttribute('style')
    })
  })

  describe('estilos', () => {
    describe('posición y tamaño, con variables', () => {
      it('cada envoltorio se coloca con sus variables de posición', () => {
        expect(cssRule(heroCss, '.float')).toMatchObject({
          position: 'absolute',
          left: 'var(--icon-x)',
          top: 'var(--icon-y)',
        })
      })

      it('el tamaño sale de un token', () => {
        expect(cssRule(heroCss, '.float')).toMatchObject({
          width: 'var(--hero-icon-size)',
          height: 'var(--hero-icon-size)',
        })
        expect(cssToken(tokensCss, '--hero-icon-size')).toMatch(/^[\d.]+rem$/)
      })

      it('hay una posición por cada logo de la lista', () => {
        expect(placements.map(({ index }) => index)).toEqual(heroLogos.map((_, i) => i + 1))
      })

      it.each(placements)('el icono $index define su posición y su desfase', ({ body }) => {
        expect(body).toMatch(/--icon-x:\s*-?[\d.]+%;/)
        expect(body).toMatch(/--icon-y:\s*-?[\d.]+%;/)
        expect(body).toMatch(/--float-phase:\s*-?[\d.]+;/)
      })

      it('la columna del retrato es la referencia de las posiciones', () => {
        expect(cssRule(heroCss, '.portrait')).toMatchObject({ position: 'relative' })
      })
    })

    describe('flotación', () => {
      it('el envoltorio flota con la duración y el desfase de sus variables', () => {
        const { animation = '', 'animation-delay': delay = '' } = cssRule(heroCss, '.float')

        expect(animation).toMatch(/^float var\(--duration-float\)/)
        expect(animation).toContain('infinite')
        expect(delay).toBe('calc(var(--duration-float) * var(--float-phase))')
      })

      it('la animación solo mueve con transform, la distancia del token', () => {
        expect(keyframeProperties('float')).not.toHaveLength(0)
        expect(new Set(keyframeProperties('float'))).toEqual(new Set(['transform']))
        expect(heroCss).toMatch(/translateY\(calc\(-1 \* var\(--float-distance\)\)\)/)
      })

      it('la distancia y la duración existen como tokens', () => {
        expect(cssToken(tokensCss, '--float-distance')).toMatch(/^[\d.]+rem$/)
        expect(cssToken(tokensCss, '--duration-float')).toMatch(/^[\d.]+s$/)
      })

      it('con movimiento reducido no flotan', () => {
        const reduced = cssMedia(heroCss, '(prefers-reduced-motion: reduce)')

        expect(cssRule(reduced, '.float')).toMatchObject({ animation: 'none' })
      })
    })

    describe('puntero', () => {
      it('la imagen interior se amplía un poco al pasar el puntero', () => {
        expect(cssRule(heroCss, '.icon:hover')).toMatchObject({
          transform: 'scale(var(--hero-icon-scale))',
        })
        expect(Number(cssToken(tokensCss, '--hero-icon-scale'))).toBeGreaterThan(1)
        expect(Number(cssToken(tokensCss, '--hero-icon-scale'))).toBeLessThanOrEqual(1.25)
      })

      it('la ampliación es una transición de transform, con tokens', () => {
        expect(cssRule(heroCss, '.icon')).toMatchObject({
          transition: 'transform var(--duration-fast) var(--ease-standard)',
        })
      })

      // Si flotara y escalara el mismo elemento, una transformación anularía a la otra.
      it('el envoltorio no escala y la imagen no flota', () => {
        expect(cssRule(heroCss, '.icon')).not.toHaveProperty('animation')
        expect(heroCss).not.toMatch(/\.float:hover/)
      })
    })

    // Decisión del autor: sin halo. El logo de Python debe ir sin alterar y
    // otras guías de marca prohíben sombras.
    it('los iconos no llevan halo ni sombra', () => {
      expect(cssRule(heroCss, '.icon')).not.toHaveProperty('filter')
      expect(cssRule(heroCss, '.float')).not.toHaveProperty('filter')
      expect(cssRule(heroCss, '.icon')).not.toHaveProperty('box-shadow')
    })
  })
})
