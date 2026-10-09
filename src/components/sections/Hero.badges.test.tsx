import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import { heroBadgeIconUrl, heroBadges, technologyName } from '@/data/technologies'
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

// Las pastillas son decorativas y están fuera del árbol de accesibilidad, así
// que no se pueden buscar por rol: se buscan por su marca de decoración.
const decoration = () => {
  const layer = screen.getByRole('region').querySelector('[aria-hidden="true"]')
  if (!layer) throw new Error('No hay capa decorativa en el Hero')
  return layer
}
const icons = () => [...decoration().querySelectorAll('img')]
/** Un envoltorio por pastilla: los hijos directos de la capa. */
const wrappers = () => [...decoration().children]

/** Reglas `.float:nth-child(n)` de un CSS: la posición, el desfase y el tamaño de cada pastilla. */
const placementsOf = (css: string) =>
  [...css.matchAll(/\.float:nth-child\((\d+)\)\s*\{([^}]*)\}/g)].map(
    ([, index = '', body = '']) => ({ index: Number(index), body }),
  )
const placements = placementsOf(heroCss.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/g, ''))
const valueOf = (body: string, property: string) =>
  new RegExp(`(?:^|[;\\s])${property}:\\s*([^;]+);`).exec(body)?.[1]?.trim()

/** Propiedades animadas dentro de los @keyframes con ese nombre. */
const keyframeProperties = (name: string) => {
  const body =
    new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^}]*\\})*)\\s*\\}`).exec(heroCss)?.[1] ?? ''
  return [...body.matchAll(/([a-z-]+)\s*:/g)].map(([, property]) => property)
}

/** Reglas de la pastilla y de todo lo que la contiene: lo que les pase, le pasa al logo. */
const BADGE_RULES = ['.badges', '.float', '.badge', '.plate', '.badgeIcon']
/** Propiedades que alterarían un logo de marca. */
const ALTERING = ['filter', 'opacity', 'box-shadow', 'mix-blend-mode', 'backdrop-filter', 'mask-image']

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero: pastillas de tecnología', () => {
  describe('qué se muestra', () => {
    it('hay una pastilla por cada entrada de heroBadges, en su orden', () => {
      renderHero()

      expect(heroBadges).toHaveLength(4)
      expect(wrappers()).toHaveLength(heroBadges.length)
      expect(icons().map((icon) => icon.getAttribute('src'))).toEqual(
        heroBadges.map(heroBadgeIconUrl),
      )
    })

    // El texto no se escribe en el componente: es el nombre de la tecnología.
    it('cada pastilla muestra el nombre de su tecnología en el catálogo', () => {
      renderHero()

      expect(wrappers().map((wrapper) => wrapper.textContent)).toEqual(
        heroBadges.map((badge) => technologyName(badge.technology)),
      )
    })

    it('los nombres son los del catálogo', () => {
      expect(heroBadges.map((badge) => technologyName(badge.technology))).toEqual([
        'Python',
        'Java',
        'TypeScript',
        'PostgreSQL',
      ])
    })
  })

  describe('son decorativas', () => {
    // La sección de tecnologías ya las nombra: aquí repetirlas sería ruido.
    it('quedan fuera del árbol de accesibilidad', () => {
      renderHero()

      expect(decoration()).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getAllByRole('img')).toHaveLength(1)
    })

    it('todos los iconos llevan el texto alternativo vacío', () => {
      renderHero()

      expect(icons()).toHaveLength(heroBadges.length)
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
    // Dos elementos por pastilla: el de fuera flota y el de dentro escala. Con
    // uno solo, las dos transformaciones se pisarían.
    it('cada pastilla va dentro de su propio envoltorio, que solo la contiene a ella', () => {
      renderHero()

      wrappers().forEach((wrapper) => {
        expect(wrapper.children).toHaveLength(1)
        expect(wrapper.querySelectorAll('img')).toHaveLength(1)
      })
    })

    // La placa es un fondo bajo el logo: lo contiene a él y a nada más.
    it('cada icono va solo dentro de su placa, antes del nombre', () => {
      renderHero()

      icons().forEach((icon) => {
        const plate = icon.parentElement
        const badge = plate?.parentElement

        expect(plate?.children).toHaveLength(1)
        expect(plate?.textContent).toBe('')
        expect(badge?.firstElementChild).toBe(plate)
        expect(badge?.children).toHaveLength(2)
        expect(decoration().children).toContain(badge?.parentElement)
      })
    })

    it('la capa va después del retrato, en su misma columna', () => {
      renderHero()

      const portrait = screen.getByRole('img')
      const glow = portrait.parentElement

      // Hermana del envoltorio del halo, no hija: dentro, las pastillas llevarían halo.
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
    describe('posición', () => {
      // Las de la derecha se anclan por la derecha: así ninguna se sale del
      // retrato hacia fuera de la página.
      it('cada envoltorio se coloca con sus variables, por la izquierda o por la derecha', () => {
        expect(cssRule(heroCss, '.float')).toMatchObject({
          position: 'absolute',
          top: 'var(--badge-y)',
          left: 'var(--badge-left, auto)',
          right: 'var(--badge-right, auto)',
        })
      })

      it('hay una posición por cada pastilla', () => {
        expect(placements.map(({ index }) => index)).toEqual(heroBadges.map((_, i) => i + 1))
      })

      it.each(placements)('la pastilla $index define su altura, un lado y su desfase', ({ body }) => {
        const sides = ['--badge-left', '--badge-right'].filter((side) => valueOf(body, side))

        expect(valueOf(body, '--badge-y')).toMatch(/^-?[\d.]+%$/)
        expect(sides).toHaveLength(1)
        expect(valueOf(body, sides[0] ?? '')).toMatch(/^-?[\d.]+%$/)
        expect(valueOf(body, '--float-phase')).toMatch(/^-?[\d.]+$/)
      })

      it('las posiciones son irregulares: ni alturas ni desfases repetidos', () => {
        const heights = placements.map(({ body }) => valueOf(body, '--badge-y'))
        const phases = placements.map(({ body }) => valueOf(body, '--float-phase'))

        expect(new Set(heights).size).toBe(placements.length)
        expect(new Set(phases).size).toBe(placements.length)
      })

      it('hay pastillas a los dos lados del retrato', () => {
        const left = placements.filter(({ body }) => valueOf(body, '--badge-left'))
        const right = placements.filter(({ body }) => valueOf(body, '--badge-right'))

        expect(left.length).toBeGreaterThan(0)
        expect(right.length).toBeGreaterThan(0)
      })

      // Posicionado en los dos diseños: anclado en dos columnas, en el flujo apilado.
      it('el retrato es la referencia de las posiciones', () => {
        const stacked = cssMedia(heroCss, '(max-width: 768px)')

        expect(cssRule(heroCss, '.portrait')).toMatchObject({ position: 'absolute' })
        expect(cssRule(stacked, '.portrait')).toMatchObject({ position: 'relative' })
      })

      // Las de la izquierda van bajo el párrafo. Con el párrafo en más
      // líneas, tienen que bajar para no pisarlo.
      it('desde 1280 px las pastillas de la izquierda bajan', () => {
        const compact = placementsOf(cssMedia(heroCss, '(max-width: 1280px)'))
        const left = placements.filter(({ body }) => valueOf(body, '--badge-left'))

        expect(left.length).toBeGreaterThan(0)
        left.forEach(({ index, body }) => {
          const override = compact.find((placement) => placement.index === index)

          expect(parseFloat(valueOf(override?.body ?? '', '--badge-y') ?? '')).toBeGreaterThan(
            parseFloat(valueOf(body, '--badge-y') ?? ''),
          )
        })
      })

      // El apilado conserva las posiciones y los tamaños que tenía.
      it('hasta 768 px cada pastilla tiene su posición y su tamaño propios', () => {
        const stacked = placementsOf(cssMedia(heroCss, '(max-width: 768px)'))

        expect(stacked.map(({ index }) => index)).toEqual(heroBadges.map((_, i) => i + 1))
        stacked.forEach(({ body }) => {
          expect(valueOf(body, '--badge-y')).toMatch(/^-?[\d.]+%$/)
          expect(valueOf(body, 'font-size')).toMatch(/^var\(--font-size-(sm|md|base)\)$/)
        })
      })

      // Ninguna asoma por la izquierda: ahí está el texto.
      it('ninguna pastilla de la izquierda se sale del retrato', () => {
        placements
          .filter(({ body }) => valueOf(body, '--badge-left'))
          .forEach(({ body }) => expect(valueOf(body, '--badge-left')).toMatch(/^[\d.]+%$/))
      })
    })

    describe('tamaño', () => {
      it.each(placements)('la pastilla $index toma su tamaño de un token de texto', ({ body }) => {
        expect(valueOf(body, 'font-size')).toMatch(/^var\(--font-size-(md|base|lg)\)$/)
      })

      it('no todas miden lo mismo', () => {
        const sizes = placements.map(({ body }) => valueOf(body, 'font-size'))

        expect(new Set(sizes).size).toBeGreaterThan(1)
      })

      // Las medidas de la pastilla van en em: crecen con su tamaño de texto.
      it.each([
        '--badge-padding',
        '--badge-padding-end',
        '--badge-gap',
        '--badge-radius',
        '--badge-plate-size',
        '--badge-plate-radius',
        '--badge-icon-size',
      ])('%s existe como token, en em', (token) => {
        expect(cssToken(tokensCss, token)).toMatch(/^[\d.]+em$/)
      })

      // Duke es alto y estrecho: con un icono menor apenas se distingue.
      it('la placa mide 2.1em y el icono 1.65em', () => {
        expect(cssToken(tokensCss, '--badge-plate-size')).toBe('2.1em')
        expect(cssToken(tokensCss, '--badge-icon-size')).toBe('1.65em')
      })

      it('el icono cabe dentro de la placa', () => {
        const icon = parseFloat(cssToken(tokensCss, '--badge-icon-size'))
        const plate = parseFloat(cssToken(tokensCss, '--badge-plate-size'))

        expect(icon).toBeLessThan(plate)
        expect(cssRule(heroCss, '.badgeIcon')).toMatchObject({
          width: 'var(--badge-icon-size)',
          height: 'var(--badge-icon-size)',
          'object-fit': 'contain',
        })
        expect(cssRule(heroCss, '.plate')).toMatchObject({
          width: 'var(--badge-plate-size)',
          height: 'var(--badge-plate-size)',
        })
      })

      it('el nombre no se parte en dos líneas', () => {
        expect(cssRule(heroCss, '.badge')).toMatchObject({ 'white-space': 'nowrap' })
      })
    })

    describe('colores', () => {
      it('la pastilla lleva fondo, borde y texto de tokens', () => {
        expect(cssRule(heroCss, '.badge')).toMatchObject({
          background: 'var(--color-badge-bg)',
          border: '1px solid var(--color-badge-border)',
          color: 'var(--color-text)',
        })
        expect(cssToken(tokensCss, '--color-badge-bg')).toMatch(/^rgba\(/)
        expect(cssToken(tokensCss, '--color-badge-border')).toMatch(/^rgba\(/)
      })

      // La misma placa clara en las cuatro: una sola regla, sin variantes.
      it('la placa es clara y es la misma para todas', () => {
        expect(cssRule(heroCss, '.plate')).toMatchObject({ background: 'var(--color-plate)' })
        expect(cssToken(tokensCss, '--color-plate')).toBe('var(--color-text)')
        expect(heroCss.match(/\.plate\b[^{]*\{/g)).toHaveLength(1)
      })
    })

    // La placa es un fondo, no un efecto: el logo de marca va sin alterar.
    // Lo que se aplique a un contenedor también alteraría el logo.
    describe('los logos de marca no se alteran', () => {
      it.each(BADGE_RULES)('%s no lleva filtro, opacidad, sombra ni mezcla', (selector) => {
        expect(Object.keys(cssRule(heroCss, selector)).length).toBeGreaterThan(0)
        ALTERING.forEach((property) =>
          expect(cssRule(heroCss, selector)).not.toHaveProperty(property),
        )
      })

      it('ninguna regla de posición lleva esas propiedades', () => {
        placements.forEach(({ body }) =>
          ALTERING.forEach((property) => expect(valueOf(body, property)).toBeUndefined()),
        )
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
      it('la pastilla se amplía un poco al pasar el puntero', () => {
        expect(cssRule(heroCss, '.badge:hover')).toMatchObject({
          transform: 'scale(var(--hero-badge-scale))',
        })
        expect(Number(cssToken(tokensCss, '--hero-badge-scale'))).toBeGreaterThan(1)
        expect(Number(cssToken(tokensCss, '--hero-badge-scale'))).toBeLessThanOrEqual(1.25)
      })

      it('la ampliación es una transición de transform, con tokens', () => {
        expect(cssRule(heroCss, '.badge')).toMatchObject({
          transition: 'transform var(--duration-fast) var(--ease-standard)',
        })
      })

      // Si flotara y escalara el mismo elemento, una transformación anularía a la otra.
      it('el envoltorio no escala y la pastilla no flota', () => {
        expect(cssRule(heroCss, '.badge')).not.toHaveProperty('animation')
        expect(cssRule(heroCss, '.float')).not.toHaveProperty('transition')
        expect(heroCss).not.toMatch(/\.float:hover/)
      })
    })
  })
})
