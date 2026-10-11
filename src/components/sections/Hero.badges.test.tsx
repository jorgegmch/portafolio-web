import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
    <MemoryRouter>
      <LangProvider>
        <Hero />
      </LangProvider>
    </MemoryRouter>,
  )
}

// Las pastillas son decorativas y están fuera del árbol de accesibilidad, así
// que no se pueden buscar por rol: se buscan por su marca de decoración. La
// capa es un bloque; el cursor del rol, también decorativo, va en línea.
const decoration = () => {
  const layer = screen.getByRole('region').querySelector('div[aria-hidden="true"]')
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

      expect(heroBadges).toHaveLength(5)
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
        'AI Agents',
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
        const stacked = cssMedia(heroCss, '(max-width: 1023px)')

        expect(cssRule(heroCss, '.portrait')).toMatchObject({ position: 'absolute' })
        expect(cssRule(stacked, '.portrait')).toMatchObject({ position: 'relative' })
      })

      /** Los cuatro tramos del diseño, del más ancho al más estrecho: cada uno hereda del anterior. */
      const TIERS = [
        placements,
        placementsOf(cssMedia(heroCss, '(max-width: 1280px)')),
        placementsOf(cssMedia(heroCss, '(max-width: 1023px)')),
        placementsOf(cssMedia(heroCss, '(max-width: 480px)')),
      ]
      const SIDES = ['--badge-left', '--badge-right'] as const
      /** Valor que tiene una variable de la pastilla en un tramo, con la cascada aplicada. */
      const effective = (index: number, tier: number, property: string) =>
        TIERS.slice(0, tier + 1).reduce<string | undefined>(
          (value, rules) =>
            valueOf(rules.find((placement) => placement.index === index)?.body ?? '', property) ?? value,
          undefined,
        )
      /** Lados por los que queda anclada en ese tramo: `initial` anula el heredado. */
      const sidesAt = (index: number, tier: number) =>
        SIDES.filter((side) => {
          const value = effective(index, tier, side)
          return value !== undefined && value !== 'initial'
        })

      // Una pastilla anclada a la vez por la izquierda y por la derecha se
      // estira de lado a lado. Al cambiar de lado en un tramo hay que anular
      // el que hereda del tramo anterior.
      it.each(heroBadges.map((badge, i) => [badge.technology, i + 1] as const))(
        '%s queda anclada por un solo lado en cada tramo',
        (_, index) => {
          TIERS.forEach((__, tier) => expect(sidesAt(index, tier)).toHaveLength(1))
        },
      )

      // Con el párrafo en más líneas, las que siguen a la izquierda tienen
      // que bajar para no pisarlo.
      it('desde 1280 px las pastillas que siguen a la izquierda bajan', () => {
        const stay = heroBadges
          .map((_, i) => i + 1)
          .filter((index) => sidesAt(index, 0)[0] === '--badge-left')
          .filter((index) => sidesAt(index, 1)[0] === '--badge-left')

        expect(stay.length).toBeGreaterThan(0)
        stay.forEach((index) =>
          expect(parseFloat(effective(index, 1, '--badge-y') ?? '')).toBeGreaterThan(
            parseFloat(effective(index, 0, '--badge-y') ?? ''),
          ),
        )
      })

      // En anillo: una queda abajo, hacia el centro, sobre el pecho. Ni en una
      // columna a un lado ni a la altura de la cara.
      it('una pastilla queda abajo en el centro, lejos de la cara', () => {
        const centred = placements.filter(({ body }) => {
          const right = parseFloat(valueOf(body, '--badge-right') ?? '')
          return right >= 25 && right <= 50
        })

        expect(centred).toHaveLength(1)
        expect(parseFloat(valueOf(centred[0]?.body ?? '', '--badge-y') ?? '')).toBeGreaterThanOrEqual(80)
      })

      // Más abajo, la pastilla más alta se acercaría demasiado al borde
      // inferior del Hero en el retrato más pequeño.
      it('en dos columnas ninguna pastilla pasa del 88 % de alto', () => {
        ;[0, 1].forEach((tier) =>
          heroBadges.forEach((_, i) =>
            expect(parseFloat(effective(i + 1, tier, '--badge-y') ?? '')).toBeLessThanOrEqual(88),
          ),
        )
      })

      // Separadas también en vertical: dos del mismo lado no comparten franja.
      it('en todos los tramos, las del mismo lado distan al menos 20 puntos de alto', () => {
        ;[0, 1, 2, 3].forEach((tier) => {
          const bySide = (side: string) =>
            heroBadges
              .map((_, i) => i + 1)
              .filter((index) => sidesAt(index, tier)[0] === side)
              .filter((index) => {
                const x = parseFloat(effective(index, tier, side) ?? '')
                return x < 25
              })
              .map((index) => parseFloat(effective(index, tier, '--badge-y') ?? ''))
              .sort((a, b) => a - b)

          SIDES.forEach((side) =>
            bySide(side).forEach((y, i, all) => {
              if (i > 0) expect(y - (all[i - 1] ?? 0)).toBeGreaterThanOrEqual(20)
            }),
          )
        })
      })

      describe('teléfono (hasta 480 px)', () => {
        const phone = placementsOf(cssMedia(heroCss, '(max-width: 480px)'))
        const PHONE = 3

        it('cada pastilla tiene su posición propia', () => {
          expect(phone.map(({ index }) => index)).toEqual(heroBadges.map((_, i) => i + 1))
          phone.forEach(({ body }) => expect(valueOf(body, '--badge-y')).toMatch(/^[\d.]+%$/))
        })

        // Con los tamaños de tablet no caben cinco en un retrato de 270 px sin
        // tapar la cara: todas pasan al texto más pequeño.
        it('todas llevan el texto de 13 px', () => {
          expect(phone).toHaveLength(heroBadges.length)
          phone.forEach(({ body }) => expect(valueOf(body, 'font-size')).toBe('var(--font-size-sm)'))
          expect(cssToken(tokensCss, '--font-size-sm')).toBe('0.8125rem')
        })

        // La cara ocupa del 14 % al 45 % del alto. Una pastilla puede ir
        // arriba, junto al pelo, o por debajo: ninguna arranca en esa franja.
        it('ninguna arranca a la altura de la cara', () => {
          heroBadges.forEach((_, i) => {
            const y = parseFloat(effective(i + 1, PHONE, '--badge-y') ?? '')

            expect(y <= 10 || y >= 46, `pastilla ${i + 1} al ${y} %`).toBe(true)
          })
        })

        // La que va arriba, junto al pelo, se pega al borde exterior para no
        // tocar la cara.
        it('la que va arriba queda pegada al borde del retrato', () => {
          const top = heroBadges.map((_, i) => i + 1).filter((index) => parseFloat(effective(index, PHONE, '--badge-y') ?? '') <= 10)

          expect(top).toHaveLength(1)
          top.forEach((index) => {
            const [side] = sidesAt(index, PHONE)

            expect(parseFloat(effective(index, PHONE, side ?? '') ?? '')).toBeLessThanOrEqual(2)
          })
        })

        // El margen de la página en teléfono es estrecho: ninguna asoma fuera
        // del retrato.
        it('ninguna se sale del retrato por los lados', () => {
          heroBadges.forEach((_, i) => {
            const [side] = sidesAt(i + 1, PHONE)

            expect(parseFloat(effective(i + 1, PHONE, side ?? '') ?? '')).toBeGreaterThanOrEqual(0)
          })
        })

        it('hay pastillas a los dos lados', () => {
          const sides = heroBadges.map((_, i) => sidesAt(i + 1, PHONE)[0])

          expect(new Set(sides).size).toBe(2)
        })

        // A 320 px dos pastillas a la misma altura, una a cada lado, quedarían
        // casi tocándose en el centro.
        it('no hay dos a la misma altura', () => {
          const heights = heroBadges.map((_, i) => effective(i + 1, PHONE, '--badge-y'))

          expect(new Set(heights).size).toBe(heroBadges.length)
        })

        it('ninguna pasa del 86 % de alto', () => {
          heroBadges.forEach((_, i) =>
            expect(parseFloat(effective(i + 1, PHONE, '--badge-y') ?? '')).toBeLessThanOrEqual(86),
          )
        })
      })

      // Apilado en tablet, el retrato mide hasta 576 px: las pastillas van en
      // anillo, como en escritorio.
      it('apilado, una pastilla queda abajo hacia el centro y ninguna pasa del 86 % de alto', () => {
        const STACKED = 2
        const centred = heroBadges
          .map((_, i) => i + 1)
          .filter((index) => {
            const [side] = sidesAt(index, STACKED)
            const x = parseFloat(effective(index, STACKED, side ?? '') ?? '')
            return x >= 20 && x <= 50
          })

        expect(centred).toHaveLength(1)
        expect(parseFloat(effective(centred[0] ?? 0, STACKED, '--badge-y') ?? '')).toBeGreaterThanOrEqual(80)
        heroBadges.forEach((_, i) =>
          expect(parseFloat(effective(i + 1, STACKED, '--badge-y') ?? '')).toBeLessThanOrEqual(86),
        )
      })

      // Como en teléfono: la cara ocupa del 14 % al 45 % del alto, y una
      // pastilla va arriba, junto al pelo, o por debajo.
      it('apilado, ninguna arranca a la altura de la cara', () => {
        const STACKED = 2

        heroBadges.forEach((_, i) => {
          const y = parseFloat(effective(i + 1, STACKED, '--badge-y') ?? '')

          expect(y <= 10 || y >= 46, `pastilla ${i + 1} al ${y} %`).toBe(true)
        })
      })

      it('hasta 1023 px cada pastilla tiene su posición propia y la letra del tramo', () => {
        const stacked = placementsOf(cssMedia(heroCss, '(max-width: 1023px)'))

        expect(stacked.map(({ index }) => index)).toEqual(heroBadges.map((_, i) => i + 1))
        stacked.forEach(({ body }) => {
          expect(valueOf(body, '--badge-y')).toMatch(/^-?[\d.]+%$/)
          expect(valueOf(body, 'font-size')).toBe('var(--font-size-md)')
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
        expect(valueOf(body, 'font-size')).toMatch(/^var\(--font-size-(sm|md|base|lg)\)$/)
      })

      // La referencia es TypeScript. Todas las medidas de la pastilla van en
      // em, así que con la misma letra solo cambia el ancho, por el nombre.
      describe('todas miden lo mismo que TypeScript', () => {
        const reference = heroBadges.findIndex((badge) => badge.technology === 'typescript') + 1
        const sizesOf = (css: string) =>
          placementsOf(css).map(({ index, body }) => [index, valueOf(body, 'font-size')] as const)
        const everyBadge = (size: string) => heroBadges.map((_, i) => [i + 1, size] as const)

        it('TypeScript es una de las pastillas', () => {
          expect(reference).toBeGreaterThan(0)
        })

        it.each([
          ['en dos columnas', placements, 'var(--font-size-base)'],
          ['apilado, hasta 1023 px', placementsOf(cssMedia(heroCss, '(max-width: 1023px)')), 'var(--font-size-md)'],
          ['en teléfono, hasta 480 px', placementsOf(cssMedia(heroCss, '(max-width: 480px)')), 'var(--font-size-sm)'],
        ] as const)('%s, las cinco declaran la letra de TypeScript', (_, tier, size) => {
          const sizes = tier.map(({ index, body }) => [index, valueOf(body, 'font-size')] as const)

          expect(sizes.find(([index]) => index === reference)?.[1]).toBe(size)
          expect(sizes).toEqual(everyBadge(size))
        })

        // Un tramo que cambiara la letra de una sola la dejaría distinta.
        it('el tramo de 1280 px no cambia la letra de ninguna', () => {
          const compact = sizesOf(cssMedia(heroCss, '(max-width: 1280px)'))

          compact.forEach(([, size]) => expect(size).toBeUndefined())
        })

        it('ninguna otra regla cambia la letra de una pastilla', () => {
          expect(cssRule(heroCss, '.float')).not.toHaveProperty('font-size')
          expect(cssRule(heroCss, '.badge')).not.toHaveProperty('font-size')
          expect(heroCss.match(/\.float:nth-child\(\d+\)\s*\{/g)).toHaveLength(heroBadges.length * 3 + 3)
        })

        it('los tres tamaños son 16, 14 y 13 px', () => {
          expect(cssToken(tokensCss, '--font-size-base')).toBe('1rem')
          expect(cssToken(tokensCss, '--font-size-md')).toBe('0.875rem')
          expect(cssToken(tokensCss, '--font-size-sm')).toBe('0.8125rem')
        })
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
          width: 'calc(var(--badge-icon-size) * var(--badge-icon-scale, 1))',
          height: 'calc(var(--badge-icon-size) * var(--badge-icon-scale, 1))',
          'object-fit': 'contain',
        })
        expect(cssRule(heroCss, '.plate')).toMatchObject({
          width: 'var(--badge-plate-size)',
          height: 'var(--badge-plate-size)',
        })
      })

      // Un dibujo que deja aire dentro de su cuadro se ve menor que el de
      // TypeScript, que lo llena: su caja crece, sin tocar el archivo.
      describe('compensación por icono', () => {
        const TIER_FONTS = [
          ['dos columnas', '--font-size-base', 16],
          ['apilado', '--font-size-md', 14],
          ['teléfono', '--font-size-sm', 13],
        ] as const
        const scaleTokens: Record<string, string> = {
          postgresql: '--badge-icon-scale-postgresql',
          'ai-agents': '--badge-icon-scale-ai-agents',
        }
        const declared = (index: number) =>
          valueOf(placements.find((placement) => placement.index === index)?.body ?? '', '--badge-icon-scale')
        /** Factor de una pastilla: el de su token, o 1 si no declara ninguno. */
        const scaleOf = (index: number) => {
          const token = /^var\((--[\w-]+)\)$/.exec(declared(index) ?? '')?.[1]
          return token ? Number(cssToken(tokensCss, token)) : 1
        }

        it('PostgreSQL y AI Agents toman su factor de un token; las demás no declaran ninguno', () => {
          heroBadges.forEach((badge, i) => {
            const token = scaleTokens[badge.technology]

            expect(declared(i + 1), badge.technology).toBe(token ? `var(${token})` : undefined)
          })
        })

        it('los factores son 1,16 y 1,25', () => {
          expect(cssToken(tokensCss, '--badge-icon-scale-postgresql')).toBe('1.16')
          expect(cssToken(tokensCss, '--badge-icon-scale-ai-agents')).toBe('1.25')
        })

        // El factor acompaña al icono, no al tramo: ninguno lo redefine.
        it('ningún tramo cambia el factor de una pastilla', () => {
          const tiers = ['(max-width: 1280px)', '(max-width: 1023px)', '(max-width: 480px)']

          tiers.forEach((tier) =>
            placementsOf(cssMedia(heroCss, tier)).forEach(({ body }) =>
              expect(valueOf(body, '--badge-icon-scale')).toBeUndefined(),
            ),
          )
          expect(heroCss.match(/--badge-icon-scale:/g)).toHaveLength(Object.keys(scaleTokens).length)
        })

        // Sin tolerancia: la caja del icono, ya multiplicada, mide menos que
        // la placa. Se comprueba en px con la letra de cada tramo.
        it.each(TIER_FONTS)('en %s, ningún factor saca la caja de la placa', (_, fontToken, px) => {
          const icon = parseFloat(cssToken(tokensCss, '--badge-icon-size'))
          const plate = parseFloat(cssToken(tokensCss, '--badge-plate-size'))

          expect(parseFloat(cssToken(tokensCss, fontToken)) * 16).toBe(px)
          heroBadges.forEach((badge, i) => {
            const box = icon * scaleOf(i + 1) * px

            expect(scaleOf(i + 1), badge.technology).toBeGreaterThanOrEqual(1)
            expect(box, `${badge.technology}: caja de ${box} px`).toBeLessThan(plate * px)
          })
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
