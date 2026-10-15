import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects } from '@/data/projects'
import {
  primaryStack,
  STACK_GENERIC_ICONS,
  stackIconUrl,
  technologies,
} from '@/data/technologies'
import { en } from '@/i18n/en'

// Los logos se buscan en disco, desde la raíz del repo: lo que se comprueba es
// que el catálogo no nombra ningún archivo que no se publique.
const DIR = 'public/tech'

const byId = (id: string) => technologies.find((technology) => technology.id === id)
const catalogLogos = technologies.flatMap((technology) => technology.logos)

describe('catálogo de tecnologías', () => {
  it('tiene 15 tecnologías', () => {
    expect(technologies).toHaveLength(15)
  })

  it('no repite ningún id', () => {
    const ids = technologies.map((technology) => technology.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('JavaScript y TypeScript', () => {
    it('son dos tecnologías, no una entrada combinada', () => {
      expect(byId('javascript-typescript')).toBeUndefined()
      expect(byId('javascript')?.name).toBe('JavaScript')
      expect(byId('typescript')?.name).toBe('TypeScript')
    })

    it('las dos son lenguajes', () => {
      expect(byId('javascript')?.group).toBe('languages')
      expect(byId('typescript')?.group).toBe('languages')
    })

    it('cada una lleva solo su logo', () => {
      expect(byId('javascript')?.logos).toEqual(['javascript.svg'])
      expect(byId('typescript')?.logos).toEqual(['typescript.svg'])
    })

    it('van seguidas, en el lugar de la entrada que sustituyen', () => {
      const ids = technologies.map((technology) => technology.id)

      expect(ids.slice(ids.indexOf('python'), ids.indexOf('html'))).toEqual([
        'python',
        'javascript',
        'typescript',
      ])
    })
  })

  describe('logos', () => {
    // La taza de Java es marca de Oracle; Duke es la imagen que recomienda.
    it('el de Java es Duke', () => {
      expect(byId('java')?.logos).toEqual(['duke.svg'])
    })

    // Logo oficial aunque su política no lo admita: decisión del autor
    // (2026-10-15, en docs/LOGOS.md). La pastilla del Hero sigue con su icono
    // genérico hasta la Ronda 2.
    it('PostgreSQL lleva su logo oficial', () => {
      expect(byId('postgresql')?.logos).toEqual(['postgresql.svg'])
    })

    it('Spring Boot, Spring Security y Docker llevan su logo oficial', () => {
      expect(byId('spring-boot')?.logos).toEqual(['spring-boot.svg'])
      expect(byId('spring-security')?.logos).toEqual(['spring-security.svg'])
      expect(byId('docker')?.logos).toEqual(['docker.svg'])
    })

    it('todas las tecnologías llevan logo, salvo AI Agents, que no es una marca', () => {
      expect(technologies.filter(({ logos }) => logos.length === 0).map(({ id }) => id)).toEqual([
        'ai-agents',
      ])
    })

    // Sin archivo oficial con fondo transparente confirmado: el glifo de
    // Simple Icons (decisión del autor, 2026-10-15).
    it('MySQL, n8n y CSS llevan su glifo de Simple Icons', () => {
      expect(byId('mysql')?.logos).toEqual(['mysql.svg'])
      expect(byId('n8n')?.logos).toEqual(['n8n.svg'])
      expect(byId('css')?.logos).toEqual(['css.svg'])
    })

    it('ningún logo se repite entre tecnologías', () => {
      expect(new Set(catalogLogos).size).toBe(catalogLogos.length)
    })

    it('el catálogo nombra algún logo', () => {
      expect(catalogLogos.length).toBeGreaterThan(0)
    })

    it.each(technologies.map(({ id, logos }) => [id, logos] as const))(
      'todo logo de %s existe en public/tech',
      (_, logos) => {
        logos.forEach((file) => expect(existsSync(`${DIR}/${file}`), file).toBe(true))
      },
    )
  })

  describe('agentes de IA', () => {
    it('la entrada se llama «AI Agents», en el grupo de IA y sin logo', () => {
      expect(byId('ai-agents')).toEqual({ id: 'ai-agents', name: 'AI Agents', group: 'ai', logos: [] })
    })

    it('sustituye a la entrada anterior, no se suma a ella', () => {
      expect(byId('ai-development')).toBeUndefined()
      expect(technologies.filter((technology) => technology.group === 'ai')).toHaveLength(1)
    })

    // Regla de contenido veraz: una etiqueta se justifica citando de dónde
    // sale. La entrada lleva al lado los proyectos que la respaldan.
    it('cita junto a la entrada los proyectos que la respaldan, y existen', () => {
      const SOURCES = ['n8n-daily-news-agent', 'logitrack-iq']
      const source = readFileSync('src/data/technologies.ts', 'utf8')
      const entry = source.indexOf("id: 'ai-agents'")
      // El comentario va justo encima: las líneas que empiezan por // hasta la entrada.
      const comment = /((?:^ *\/\/.*\n)+) *\{ $/m.exec(source.slice(0, entry))?.[1] ?? ''

      expect(entry).toBeGreaterThan(-1)
      SOURCES.forEach((id) => {
        expect(comment).toContain(id)
        expect(projects.map((project) => project.id)).toContain(id)
      })
    })
  })

  describe('React', () => {
    it('es una tecnología de frontend, con el glifo de Simple Icons', () => {
      expect(byId('react')).toEqual({
        id: 'react',
        name: 'React',
        group: 'frontend',
        logos: ['react.svg'],
      })
    })

    // Regla de contenido veraz: la etiqueta sale de la descripción de un repo
    // en GitHub. La entrada cita ese repo, y su descripción nombra React.
    it('cita junto a la entrada el proyecto que la respalda, y su descripción la nombra', () => {
      const SOURCE = 'crm-registro-campers'
      const source = readFileSync('src/data/technologies.ts', 'utf8')
      const entry = source.indexOf("id: 'react'")
      const comment = /((?:^ *\/\/.*\n)+) *\{ $/m.exec(source.slice(0, entry))?.[1] ?? ''

      expect(entry).toBeGreaterThan(-1)
      expect(comment).toContain(SOURCE)
      expect(projects.map((project) => project.id)).toContain(SOURCE)
      expect(en.projects.items[SOURCE].description).toContain('React')
    })
  })

  // Decisión del autor (2026-10-15): SQLite no entra en el catálogo.
  it('SQLite no está en el catálogo', () => {
    expect(technologies.some((technology) => /sqlite/i.test(technology.id))).toBe(false)
  })

  describe('icono de la ficha de «Mi stack tecnológico»', () => {
    it('con logo de marca, es su primer logo, de public/tech', () => {
      technologies
        .filter(({ logos }) => logos.length > 0)
        .forEach((technology) => {
          expect(stackIconUrl(technology)).toBe(`/tech/${technology.logos[0] ?? ''}`)
        })
    })

    // AI Agents no es una marca: va con el chip de PrimeIcons, en blanco.
    it('AI Agents lleva el chip blanco de public/icons', () => {
      const aiAgents = byId('ai-agents')

      expect(aiAgents && stackIconUrl(aiAgents)).toBe('/icons/ai-agents-white.svg')
    })

    it('el icono genérico solo cubre tecnologías sin logo, y existe', () => {
      Object.entries(STACK_GENERIC_ICONS).forEach(([id, file]) => {
        expect(byId(id)?.logos).toEqual([])
        expect(existsSync(`public/icons/${file ?? ''}`)).toBe(true)
      })
    })

    it('toda tecnología tiene icono', () => {
      technologies.forEach((technology) => {
        expect(stackIconUrl(technology), technology.id).toMatch(/^\/(tech|icons)\/.+\.svg$/)
      })
    })
  })

  it('el stack principal es Java, Spring Boot y PostgreSQL', () => {
    expect(primaryStack.map((technology) => technology.id)).toEqual([
      'java',
      'spring-boot',
      'postgresql',
    ])
  })
})
