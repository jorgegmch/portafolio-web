import { describe, expect, it } from 'vitest'
import { projects, projectUrl } from '@/data/projects'
import { services } from '@/data/services'

const byId = (id: string) => services.find((service) => service.id === id)

describe('servicios', () => {
  it('son estos cinco, en este orden', () => {
    expect(services.map((service) => service.id)).toEqual([
      'backend',
      'frontend',
      'databases',
      'automation',
      'communication',
    ])
  })

  it('no repiten ningún id', () => {
    const ids = services.map((service) => service.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada uno lleva su propio dibujo', () => {
    const icons = services.map((service) => service.icon)

    expect(icons).toEqual(['server', 'window', 'database', 'agent', 'chat'])
    expect(new Set(icons).size).toBe(icons.length)
  })

  describe('enlaces', () => {
    // Regla de contenido veraz: cada tarjeta enlaza al repo que la respalda.
    it('cada enlace es un proyecto de data/projects', () => {
      const ids = projects.map((project) => project.id)

      services.forEach(({ project }) => {
        if (project) expect(ids).toContain(project)
      })
    })

    // El id del proyecto es el nombre exacto del repo en GitHub (comprobado
    // con la API de GitHub el 2026-10-15): de él sale la URL.
    it('las cuatro URL son exactamente estas', () => {
      expect(
        services.flatMap(({ project }) => (project ? [projectUrl(project)] : [])),
      ).toEqual([
        'https://github.com/jorgegmch/logitrack-api',
        'https://github.com/jorgegmch/portafolio-web',
        'https://github.com/jorgegmch/gaseosas-del-valle-db',
        'https://github.com/jorgegmch/n8n-daily-news-agent',
      ])
    })

    // La respalda un certificado, no un repo: no enlaza a nada.
    it('comunicación estratégica no enlaza', () => {
      expect(byId('communication')?.project).toBeNull()
    })
  })
})
