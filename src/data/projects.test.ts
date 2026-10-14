import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { builtProjects, featuredProjects, projects, projectUrl } from '@/data/projects'
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
      'portafolio-web',
      'inventory-guardian',
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

  // Criterio en contenido-veraz.md: proyecto de desarrollo completo y funcional.
  // Marcar o desmarcar uno lo decide el autor, y obliga a actualizar esta lista.
  describe('construidos', () => {
    const BUILT = [
      'portafolio-web',
      'colombia-population-stats',
      'rebelwear-ui',
      'logitrack-iq',
      'logitrack-api',
      'tecnostore-pos',
      'n8n-daily-news-agent',
      'n8n-telegram-helpdesk-bot',
      'crm-registro-campers',
      'cultuvivo-events-system',
      'inventory-guardian',
      'pocketflow-code-validator',
      'patitas-felices-web',
      'campuslands-erp-cli',
    ]

    // Repos de solo scripts de base de datos: el criterio los excluye.
    const DATABASE_SCRIPTS = ['medisistema-hospital-db', 'gaseosas-del-valle-db', 'vehicle-dealership-db']

    const ids = (list: readonly { id: string }[]) => list.map((project) => project.id).sort()

    it('cada proyecto dice si cuenta o no', () => {
      projects.forEach((project) => {
        expect(typeof project.built, project.id).toBe('boolean')
      })
    })

    it('son exactamente estos catorce', () => {
      expect(BUILT).toHaveLength(14)
      expect(ids(builtProjects)).toEqual([...BUILT].sort())
    })

    it.each(DATABASE_SCRIPTS)('%s es de scripts de BD: sigue en data/, pero no cuenta', (id) => {
      expect(byId(id)).toHaveLength(1)
      expect(byId(id)[0]?.built).toBe(false)
    })

    it('solo quedan fuera los tres repos de scripts de BD', () => {
      expect(ids(projects.filter((project) => !project.built))).toEqual([...DATABASE_SCRIPTS].sort())
    })

    it('entre los que cuentan y los de BD están todos los proyectos', () => {
      expect([...BUILT, ...DATABASE_SCRIPTS].sort()).toEqual(ids(projects))
    })

    // El fork y el ejercicio de aprendizaje no cuentan: ni siquiera están en data/.
    it('ni FastCat ni learning-path-fundamentals están en data/', () => {
      expect(projects.filter((project) => /fastcat|learning-path/i.test(project.id))).toEqual([])
    })

    it('la lista sale de la marca de cada proyecto, en el orden del archivo', () => {
      expect(builtProjects).toEqual(projects.filter((project) => project.built))
    })

    // Si las tres listas midieran lo mismo, confundir una con otra pasaría por buena.
    it('no coincide en tamaño ni con todos los proyectos ni con los destacados', () => {
      expect(builtProjects.length).not.toBe(projects.length)
      expect(builtProjects.length).not.toBe(featuredProjects.length)
    })

    it('todo proyecto destacado está construido', () => {
      const built = ids(builtProjects)

      expect(featuredProjects.length).toBeGreaterThan(0)
      featuredProjects.forEach((project) => {
        expect(built, project.id).toContain(project.id)
      })
    })
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
