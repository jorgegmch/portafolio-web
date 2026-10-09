import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { portrait } from '@/assets/hero/portrait'
import { Hero } from '@/components/sections/Hero'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const setBrowserLang = (lang: keyof typeof BROWSER_LANGS) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])

const renderHero = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  setBrowserLang(lang)
  return render(
    <LangProvider>
      <Hero />
    </LangProvider>,
  )
}

const [small] = portrait.sources
const image = () => screen.getByRole('img')
const heading = () => screen.getByRole('heading', { level: 1 })

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Hero: retrato', () => {
  // El retrato es una foto. La de hoy es provisional: sustituirla por la
  // definitiva (/update-hero-photo) no cambia nada de este archivo.
  describe('texto alternativo', () => {
    const PHOTO_ALT = {
      es: `Foto de ${site.shortName}`,
      en: `Photo of ${site.shortName}`,
    } as const

    it.each(LANGS)('en %s, dice que es una foto', (lang) => {
      expect(dictionaries[lang].hero.photoAlt).toBe(PHOTO_ALT[lang])
    })

    it.each(LANGS)('en %s, la imagen se llama como dice el diccionario', (lang) => {
      renderHero(lang)

      expect(screen.getByRole('img', { name: dictionaries[lang].hero.photoAlt })).toBeInTheDocument()
    })

    it.each(LANGS)('en %s, nombra al autor con el nombre corto', (lang) => {
      expect(dictionaries[lang].hero.photoAlt).toContain(site.shortName)
    })

    // El nombre legal es un dato personal: solo lo mostrará la terminal del hero.
    it.each(LANGS)('en %s, no lleva el nombre legal', (lang) => {
      expect(site.legalName).not.toBe(site.shortName)
      expect(dictionaries[lang].hero.photoAlt).not.toContain(site.legalName)
    })

    it('cambia con el idioma', () => {
      expect(dictionaries.es.hero.photoAlt).not.toBe(dictionaries.en.hero.photoAlt)
    })
  })

  describe('archivos: salen del módulo del retrato', () => {
    it('carga el tamaño pequeño por defecto', () => {
      renderHero()

      expect(image()).toHaveAttribute('src', small.src)
    })

    // Con el ancho de cada archivo, el navegador elige según lo que mide el
    // retrato en pantalla y la densidad, no solo según la densidad.
    it('ofrece todos los tamaños con su ancho', () => {
      renderHero()

      expect(portrait.sources.length).toBeGreaterThan(2)
      expect(image()).toHaveAttribute(
        'srcset',
        portrait.sources.map(({ src, width }) => `${src} ${width}w`).join(', '),
      )
    })

    describe('sizes: el ancho del retrato en cada diseño', () => {
      const sizes = () => image().getAttribute('sizes') ?? ''
      const entries = () => sizes().split(/,\s*(?=\()|,\s*(?=min\()/)

      it('lo declara, porque srcset lleva anchos', () => {
        renderHero()

        expect(sizes()).not.toBe('')
      })

      it('es exactamente este', () => {
        renderHero()

        expect(sizes()).toBe(
          [
            '(max-width: 768px) min(88vw, 36rem)',
            '(max-width: 1280px) min(43vw, 46rem, calc((100vh - 6.5rem) * 0.9143))',
            'min(54vw, 46rem, calc((100vh - 6.5rem) * 0.9143))',
          ].join(', '),
        )
      })

      it('solo usa breakpoints de tokens.css, con max-width, de menor a mayor', () => {
        renderHero()

        const queries = [...sizes().matchAll(/\(([a-z-]+): (\d+)px\)/g)].map(
          ([, feature = '', value = '']) => ({ feature, value: Number(value) }),
        )

        expect(queries.length).toBeGreaterThan(0)
        queries.forEach(({ feature, value }) => {
          expect(feature).toBe('max-width')
          expect([1280, 1024, 768, 480]).toContain(value)
        })
        expect(queries.map(({ value }) => value)).toEqual(
          [...queries].map(({ value }) => value).sort((a, b) => a - b),
        )
      })

      // La última entrada no lleva condición: es la del diseño base, de escritorio.
      it('termina con el ancho del diseño de escritorio, sin condición', () => {
        renderHero()

        expect(entries().at(-1)).toMatch(/^min\(/)
      })
    })

    // Con el ancho y el alto en el HTML, el navegador reserva el hueco antes
    // de descargar la imagen y la página no salta.
    it('declara el ancho y el alto del tamaño pequeño', () => {
      renderHero()

      expect(image()).toHaveAttribute('width', String(small.width))
      expect(image()).toHaveAttribute('height', String(small.height))
    })

    it('el ancho y el alto declarados guardan la proporción 4:5', () => {
      renderHero()

      const width = Number(image().getAttribute('width'))
      const height = Number(image().getAttribute('height'))

      expect(width * portrait.aspectRatio.height).toBe(height * portrait.aspectRatio.width)
    })
  })

  describe('estructura', () => {
    it('hay una sola imagen, dentro de la sección', () => {
      renderHero()

      expect(screen.getAllByRole('img')).toHaveLength(1)
      expect(screen.getByRole('region')).toContainElement(image())
    })

    // En el documento va después del texto: así se lee primero el nombre y, en
    // pantallas estrechas, la imagen queda debajo.
    it('va después del nombre y de la presentación', () => {
      renderHero()

      const intro = screen.getByText(dictionaries.es.hero.intro)
      const follows = (earlier: Element, later: Element) =>
        Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING)

      expect(follows(heading(), image())).toBe(true)
      expect(follows(intro, image())).toBe(true)
    })

    // El envoltorio lleva el halo: si contuviera algo más, también le daría halo.
    it('va sola dentro de su envoltorio, que es hermano de la capa decorativa', () => {
      renderHero()

      const wrapper = image().parentElement
      const layer = screen.getByRole('region').querySelector('[aria-hidden="true"]')

      expect(wrapper?.children).toHaveLength(1)
      expect(wrapper).not.toHaveAttribute('aria-hidden')
      expect(wrapper).not.toHaveAttribute('role')
      expect(layer).not.toBeNull()
      expect(wrapper?.parentElement).toBe(layer?.parentElement)
      expect(wrapper).not.toBe(layer)
    })

    it('es estática: ni enlace, ni botón, ni estilos en línea', () => {
      renderHero()

      expect(image().closest('a, button')).toBeNull()
      expect(image()).not.toHaveAttribute('style')
      expect(image()).not.toHaveAttribute('tabindex')
    })
  })
})
