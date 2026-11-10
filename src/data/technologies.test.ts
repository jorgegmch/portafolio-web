import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects } from '@/data/projects'
import { technologies } from '@/data/technologies'
import { en } from '@/i18n/en'

const byId = (id: string) => technologies.find((technology) => technology.id === id)

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

    it('van seguidas, en el lugar de la entrada que sustituyen', () => {
      const ids = technologies.map((technology) => technology.id)

      expect(ids.slice(ids.indexOf('python'), ids.indexOf('html'))).toEqual([
        'python',
        'javascript',
        'typescript',
      ])
    })
  })

  describe('agentes de IA', () => {
    it('la entrada se llama «AI Agents», en el grupo de IA', () => {
      expect(byId('ai-agents')).toEqual({ id: 'ai-agents', name: 'AI Agents', group: 'ai' })
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
    it('es una tecnología de frontend', () => {
      expect(byId('react')).toEqual({ id: 'react', name: 'React', group: 'frontend' })
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
})
