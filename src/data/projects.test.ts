import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { featuredProjects, projects, projectUrl } from '@/data/projects'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

const byId = (id: string) => projects.filter((project) => project.id === id)

describe('proyectos', () => {
  it('ningún id se repite', () => {
    const ids = projects.map((project) => project.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  // Regla de arquitectura: una entrada en data/ y una en cada diccionario.
  it.each(LANGS)('en %s, cada proyecto tiene su descripción, y no sobra ninguna', (lang) => {
    const { items } = dictionaries[lang].projects

    expect(Object.keys(items).sort()).toEqual(projects.map((project) => project.id).sort())
    projects.forEach((project) => {
      expect(items[project.id].description.trim()).not.toBe('')
    })
  })

  // El orden es el de la sección: el primero es el protagonista. Cambiar el
  // conjunto o el orden exige el visto bueno del autor y actualizar esta lista.
  describe('destacados', () => {
    const FEATURED = [
      'logitrack-iq',
      'logitrack-api',
      'inventory-guardian',
      'portafolio-web',
      'rebelwear-ui',
    ]

    it('son exactamente estos cinco, en este orden', () => {
      expect(featuredProjects.map((project) => project.id)).toEqual(FEATURED)
    })

    it('el protagonista es LogiTrack IQ', () => {
      expect(featuredProjects[0]?.id).toBe('logitrack-iq')
    })

    it('la lista sale de la marca de cada proyecto, en el orden del archivo', () => {
      expect(featuredProjects).toEqual(projects.filter((project) => project.featured))
    })

    it.each(['crm-registro-campers', 'n8n-daily-news-agent'])(
      '%s sigue en data/, pero ya no es destacado',
      (id) => {
        expect(byId(id)).toHaveLength(1)
        expect(byId(id)[0]?.featured).toBe(false)
      },
    )
  })

  describe('este portafolio', () => {
    const ID = 'portafolio-web'

    // Provisional: es la descripción de la rama main en GitHub, sin retocar. Se
    // reescribe, junto con el README, antes de llevar la reconstrucción a main.
    const DESCRIPTION = {
      es: 'Portafolio personal hecho con HTML, CSS y JavaScript puro. Estética tecnológica oscura, animaciones de scroll suaves y diseño responsive. Muestra los proyectos, las habilidades y la trayectoria de un desarrollador de software y comunicador social. | jorge.dev',
      en: 'Personal portfolio built with HTML, CSS & Vanilla JS. Dark tech aesthetic, smooth scroll animations and responsive design. Showcases projects, skills and background of a Software Developer & Social Communicator. | jorge.dev',
    } as const

    it('está en la lista, una sola vez', () => {
      expect(byId(ID)).toHaveLength(1)
    })

    it('lleva su título y las etiquetas que salen de su descripción en GitHub', () => {
      expect(byId(ID)[0]).toMatchObject({
        title: 'Portafolio Web',
        stack: ['HTML', 'CSS', 'JavaScript'],
      })
    })

    it('es un proyecto destacado', () => {
      expect(byId(ID)[0]?.featured).toBe(true)
      expect(featuredProjects.map((project) => project.id)).toContain(ID)
    })

    it('su enlace lleva a su repositorio', () => {
      const [project] = byId(ID)

      expect(project && projectUrl(project.id)).toBe(`${site.social.github}/${ID}`)
    })

    it.each(LANGS)('en %s, tiene una descripción que no está vacía', (lang) => {
      const items: Record<string, { description: string } | undefined> =
        dictionaries[lang].projects.items

      expect(items[ID]?.description.trim() ?? '').not.toBe('')
    })

    it.each(LANGS)('en %s, la descripción es la aprobada, palabra por palabra', (lang) => {
      const items: Record<string, { description: string } | undefined> =
        dictionaries[lang].projects.items

      expect(items[ID]?.description).toBe(DESCRIPTION[lang])
    })
  })
})
