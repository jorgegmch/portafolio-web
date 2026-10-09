import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects } from '@/data/projects'
import { primaryStack, technologies } from '@/data/technologies'

// Los logos se buscan en disco, desde la raíz del repo: lo que se comprueba es
// que el catálogo no nombra ningún archivo que no se publique.
const DIR = 'public/tech'

const byId = (id: string) => technologies.find((technology) => technology.id === id)
const catalogLogos = technologies.flatMap((technology) => technology.logos)

describe('catálogo de tecnologías', () => {
  it('tiene 14 tecnologías', () => {
    expect(technologies).toHaveLength(14)
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

    // Su marca no admite mostrar el elefante junto a otras: va solo con texto.
    it('PostgreSQL no tiene logo', () => {
      expect(byId('postgresql')?.logos).toEqual([])
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

  it('el stack principal es Java, Spring Boot y PostgreSQL', () => {
    expect(primaryStack.map((technology) => technology.id)).toEqual([
      'java',
      'spring-boot',
      'postgresql',
    ])
  })
})
