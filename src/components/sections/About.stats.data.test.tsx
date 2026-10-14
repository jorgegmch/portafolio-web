import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { About } from '@/components/sections/About'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS } from '@/i18n/types'

// Con los datos reales, una cifra escrita a mano que hoy coincida pasaría por
// buena. Aquí cada test decide cuántos proyectos y tecnologías hay en data/.
const data = vi.hoisted(() => ({
  projects: [] as { id: string; featured: boolean; built: boolean }[],
  technologies: [] as { id: string }[],
}))

vi.mock('@/data/projects', () => ({
  get projects() {
    return data.projects
  },
  get featuredProjects() {
    return data.projects.filter((project) => project.featured)
  },
  get builtProjects() {
    return data.projects.filter((project) => project.built)
  },
}))
vi.mock('@/data/technologies', () => ({
  get technologies() {
    return data.technologies
  },
}))

/** Proyectos simulados: de los construidos, los primeros son además destacados. */
const setProjects = ({ built, featured = 0, notBuilt = 0 }: Record<string, number>) => {
  data.projects = [
    ...Array.from({ length: built ?? 0 }, (_, index) => ({
      id: `built-${index}`,
      featured: index < featured,
      built: true,
    })),
    ...Array.from({ length: notBuilt }, (_, index) => ({
      id: `other-${index}`,
      featured: false,
      built: false,
    })),
  ]
}

const setTechnologies = (count: number) => {
  data.technologies = Array.from({ length: count }, (_, index) => ({ id: `tech-${index}` }))
}

const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

/** La caja de una tarjeta: el único hijo de su <li>, que es el que aparece. */
const boxOf = (item: Element) => {
  const [box, ...rest] = item.children
  if (!box || rest.length > 0) throw new Error('Cada tarjeta lleva una sola caja')
  return box
}

/** Lo que se lee de una tarjeta, en orden; lo decorativo (aria-hidden) no cuenta. */
const readable = (item: Element) =>
  [...boxOf(item).children].filter((child) => child.getAttribute('aria-hidden') !== 'true')

const renderCards = (lang: keyof typeof BROWSER_LANGS = 'es') => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  render(
    <MemoryRouter>
      <LangProvider>
        <About />
      </LangProvider>
    </MemoryRouter>,
  )
  const region = screen.getByRole('region', { name: dictionaries[lang].about.heading })
  return within(region)
    .getAllByRole('listitem')
    .map((item) => readable(item).map((child) => child.textContent))
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
  data.projects = []
  data.technologies = []
})

describe('About: tarjetas con otros datos en data/', () => {
  describe('proyectos construidos', () => {
    // Seis proyectos, cuatro construidos y dos destacados: tres cifras distintas.
    it.each(LANGS)('en %s, cuenta los construidos, no el total ni los destacados', (lang) => {
      setProjects({ built: 4, featured: 2, notBuilt: 2 })
      setTechnologies(3)
      const [, projectsCard] = renderCards(lang)

      expect(projectsCard).toEqual(['4', dictionaries[lang].about.stats.projects(4)])
    })

    it('con uno solo, la etiqueta va en singular', () => {
      setProjects({ built: 1, notBuilt: 5 })
      setTechnologies(3)
      const [, projectsCard] = renderCards()

      expect(projectsCard).toEqual(['1', 'Proyecto construido'])
    })

    it('con 20 la cifra sigue exacta y sin «+»', () => {
      setProjects({ built: 20, notBuilt: 3 })
      setTechnologies(3)
      const [, projectsCard] = renderCards()

      expect(projectsCard).toEqual(['20', 'Proyectos construidos'])
    })

    // Por encima de 20 baja a la decena, con el «+» del lado de cada idioma.
    it.each([
      ['es', '+20', 'Proyectos construidos'],
      ['en', '20+', 'Projects built'],
    ] as const)('en %s, con 25 construidos dice «%s»', (lang, value, label) => {
      setProjects({ built: 25, featured: 5, notBuilt: 5 })
      setTechnologies(3)
      const [, projectsCard] = renderCards(lang)

      expect(projectsCard).toEqual([value, label])
    })

    it.each(LANGS)('en %s, con 30 construidos dice 30, sin «+»', (lang) => {
      setProjects({ built: 30, notBuilt: 1 })
      setTechnologies(3)
      const [, projectsCard] = renderCards(lang)

      expect(projectsCard).toEqual(['30', dictionaries[lang].about.stats.projects(30)])
    })

    it('sin ninguno dice 0', () => {
      setProjects({ built: 0, notBuilt: 4 })
      setTechnologies(3)
      const [, projectsCard] = renderCards()

      expect(projectsCard).toEqual(['0', 'Proyectos construidos'])
    })
  })

  describe('tecnologías', () => {
    it.each(LANGS)('en %s, con una sola dice 1 y la etiqueta en singular', (lang) => {
      setProjects({ built: 4 })
      setTechnologies(1)
      const [, , technologiesCard] = renderCards(lang)

      expect(technologiesCard).toEqual(['1', dictionaries[lang].about.stats.technologies(1)])
    })

    it('con una sola, la etiqueta dice «Tecnología»', () => {
      setProjects({ built: 4 })
      setTechnologies(1)
      const [, , technologiesCard] = renderCards()

      expect(technologiesCard?.[1]).toBe('Tecnología')
    })

    // La cuenta de tecnologías es exacta siempre: no se redondea ni lleva «+».
    it.each(LANGS)('en %s, con 25 dice 25: ni se redondea ni lleva «+»', (lang) => {
      setProjects({ built: 4 })
      setTechnologies(25)
      const [, , technologiesCard] = renderCards(lang)

      expect(technologiesCard).toEqual(['25', dictionaries[lang].about.stats.technologies(25)])
    })
  })
})
