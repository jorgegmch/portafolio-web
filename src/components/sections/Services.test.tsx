import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Services } from '@/components/sections/Services'
import styles from '@/components/sections/Services.module.css'
import revealStyles from '@/components/ui/Reveal.module.css'
import { sections } from '@/config/routes'
import { projectUrl } from '@/data/projects'
import { services } from '@/data/services'
import { stackIconUrl, technologies, technologyName } from '@/data/technologies'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'
import { getEmail } from '@/lib/assembleContact'
import { cssToken, readCss } from '@/test/cssRules'

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

/** Nombre real de una clase de un módulo; falla si el módulo no la tiene. */
const classOf = (module: CSSModuleClasses, name: string) => {
  const value = module[name]
  if (!value) throw new Error(`El módulo no tiene la clase .${name}`)
  return value
}

const REVEAL = classOf(revealStyles, 'reveal')
const CARD = classOf(styles, 'card')
const CHIP = classOf(styles, 'chip')

const renderServices = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <LangProvider>
      <Services />
    </LangProvider>,
  )
  const { services: text, common } = dictionaries[lang]
  const region = screen.getByRole('region', { name: text.kicker })
  const [cardList, techList] = within(region).getAllByRole('list')
  if (!cardList || !techList) throw new Error('Faltan las dos listas')
  const cards = within(cardList).getAllByRole('listitem')
  // La tarjeta sin enlace, la de comunicación: la sexta.
  const unlinked = cards[5]
  if (!unlinked) throw new Error('Falta la sexta tarjeta')
  return { region, cardList, techList, cards, unlinked, text, common }
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('Services', () => {
  describe('estructura', () => {
    it.each(LANGS)('en %s, es una sección con el nombre de su etiqueta, con el ancla services', (lang) => {
      const { region } = renderServices(lang)

      expect(region.tagName).toBe('SECTION')
      expect(region).toHaveAttribute('id', sections.services)
    })

    it('la etiqueta es el único h2; las tarjetas y el bloque de tecnologías, h3', () => {
      const { region, text } = renderServices()
      const titles = services.map(({ id }) => text.items[id].title)

      expect(within(region).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
        text.kicker,
      ])
      expect(within(region).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
        ...titles,
        text.stackKicker,
      ])
      expect(within(region).queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it.each(LANGS)('en %s, las dos frases grandes son párrafos, tras su etiqueta', (lang) => {
      const { region, text } = renderServices(lang)
      const phrase = within(region).getByText(text.heading)
      const stackPhrase = within(region).getByText(text.stackHeading)

      expect(phrase.tagName).toBe('P')
      expect(stackPhrase.tagName).toBe('P')
      expect(
        within(region).getByRole('heading', { level: 2 }).compareDocumentPosition(phrase) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
      expect(
        within(region).getByRole('heading', { name: text.stackKicker }).compareDocumentPosition(stackPhrase) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })
  })

  describe('tarjetas', () => {
    it.each(LANGS)('en %s, son las seis de data/, en orden, con su título y su descripción', (lang) => {
      const { cards, text } = renderServices(lang)

      expect(cards).toHaveLength(6)
      cards.forEach((card, index) => {
        const id = services[index]?.id ?? 'backend'

        expect(within(card).getByRole('heading', { level: 3 })).toHaveTextContent(text.items[id].title)
        expect(within(card).getByText(text.items[id].description).tagName).toBe('P')
      })
    })

    it.each(LANGS)('en %s, las cinco con enlace abren su repo en una pestaña nueva, y lo avisan', (lang) => {
      const { cardList, text, common } = renderServices(lang)
      const links = within(cardList).getAllByRole('link')

      expect(links).toHaveLength(5)
      services
        .filter(({ project }) => project)
        .forEach(({ id, project }, index) => {
          const link = links[index]

          expect(link).toHaveAccessibleName(
            `${text.items[id].title}: ${text.relatedProject} (${common.opensInNewTab})`,
          )
          expect(link).toHaveAccessibleDescription(text.items[id].description)
          expect(link).toHaveAttribute('href', project ? projectUrl(project) : '')
          expect(link).toHaveAttribute('target', '_blank')
          expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })
    })

    it('las URL son exactamente las de los cinco repos', () => {
      const { cardList } = renderServices()

      expect(within(cardList).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
        'https://github.com/jorgegmch/logitrack-api',
        'https://github.com/jorgegmch/portafolio-web',
        'https://github.com/jorgegmch/logitrack-iq',
        'https://github.com/jorgegmch/gaseosas-del-valle-db',
        'https://github.com/jorgegmch/n8n-daily-news-agent',
      ])
    })

    it('cada una con enlace lleva el texto «Ver proyecto relacionado», y la sexta no', () => {
      const { cards, unlinked, text } = renderServices()

      cards.slice(0, 5).forEach((card) => expect(within(card).getByText(text.relatedProject)).toBeVisible())
      expect(within(unlinked).queryByText(text.relatedProject)).not.toBeInTheDocument()
    })

    // La respalda un certificado, no un repo.
    it('la sexta, la de comunicación, no es un enlace ni se puede enfocar', () => {
      const { unlinked, text } = renderServices()

      expect(within(unlinked).getByRole('heading', { level: 3 })).toHaveTextContent(
        text.items.communication.title,
      )
      expect(within(unlinked).queryByRole('link')).not.toBeInTheDocument()
      expect(unlinked.querySelectorAll('a, button, [tabindex]')).toHaveLength(0)
      expect(unlinked.querySelector(`.${CARD}`)?.tagName).toBe('DIV')
    })

    // Condición de PLAN.md: lo que escala va dentro de lo que aparece.
    it('el <li> es el que aparece; la caja que escala va dentro y no aparece', () => {
      const { cards } = renderServices()

      cards.forEach((card) => {
        expect(card).toHaveClass(REVEAL)
        expect(card.children).toHaveLength(1)
        expect(card.firstElementChild).toHaveClass(CARD)
        expect(card.firstElementChild).not.toHaveClass(REVEAL)
      })
    })

    // Dos filas de tres en escritorio: cada fila entra en escalonado 0, 1, 2.
    it('cada tarjeta lleva su puesto en el escalonado, y ninguna se queda sin él', () => {
      const { cards } = renderServices()
      const orders = cards.map((card) =>
        [0, 1, 2, 3].find((order) => card.classList.contains(classOf(revealStyles, `order${order}`))),
      )

      expect(orders).toEqual([0, 1, 2, 0, 1, 2])
    })

    it('el icono de cada tarjeta es decorativo', () => {
      const { cards } = renderServices()

      cards.forEach((card) => {
        expect(card.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('tecnologías', () => {
    it('son las del catálogo, en su orden, con el nombre en texto', () => {
      const { techList } = renderServices()
      const items = within(techList).getAllByRole('listitem')

      expect(items).toHaveLength(technologies.length)
      expect(items.map((item) => item.textContent)).toEqual(
        technologies.map(({ id }) => technologyName(id)),
      )
    })

    // El nombre ya va escrito al lado: el logo no se lee dos veces.
    it('cada logo es el de su tecnología, con alt vacío', () => {
      const { techList } = renderServices()
      const images = [...techList.querySelectorAll('img')]

      expect(images).toHaveLength(technologies.length)
      images.forEach((image, index) => {
        const technology = technologies[index]

        expect(image).toHaveAttribute('alt', '')
        expect(image).toHaveAttribute('src', technology ? stackIconUrl(technology) : '')
      })
    })

    // El <img> reserva el mismo sitio que le da el CSS: si se desincronizan,
    // la ficha cambia de alto al cargar el logo.
    it('el width y el height de cada logo son los del token --stack-logo-size', () => {
      const { techList } = renderServices()
      const token = cssToken(readCss('src/styles/tokens.css'), '--stack-logo-size')
      const px = String(parseFloat(token) * 16)

      expect(token).toMatch(/^[\d.]+rem$/)
      techList.querySelectorAll('img').forEach((image) => {
        expect(image).toHaveAttribute('width', px)
        expect(image).toHaveAttribute('height', px)
      })
    })

    it('ninguna ficha enlaza ni se puede enfocar', () => {
      const { techList } = renderServices()

      expect(within(techList).queryAllByRole('link')).toHaveLength(0)
      expect(techList.querySelectorAll('a, button, [tabindex]')).toHaveLength(0)
    })

    it('el <li> es el que aparece; la ficha que escala va dentro', () => {
      const { techList } = renderServices()

      within(techList)
        .getAllByRole('listitem')
        .forEach((item) => {
          expect(item).toHaveClass(REVEAL)
          expect(item.firstElementChild).toHaveClass(CHIP)
          expect(item.firstElementChild).not.toHaveClass(REVEAL)
        })
    })

    // Decisión del autor (2026-10-15): SQLite no entra; sin niveles ni porcentajes.
    it('no hay SQLite, ni cifras ni porcentajes', () => {
      const { techList } = renderServices()

      expect(techList.textContent).not.toMatch(/sqlite/i)
      expect(techList.textContent).not.toMatch(/\b\d+\b|%/)
    })
  })

  it.each(LANGS)('en %s, no lleva el correo ni enlaces de contacto', (lang) => {
    const { region } = renderServices(lang)

    expect(region.textContent).not.toContain('@')
    expect(region.innerHTML).not.toContain(getEmail())
    expect(region.innerHTML).not.toMatch(/mailto:|wa\.me/)
  })
})
