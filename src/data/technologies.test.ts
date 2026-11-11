import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects } from '@/data/projects'
import { technologies, technologyGroups, technologyLogoUrl } from '@/data/technologies'
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

      expect(ids.slice(ids.indexOf('python'), ids.indexOf('react'))).toEqual([
        'python',
        'javascript',
        'typescript',
      ])
    })
  })

  // Spec v2.1 §3.2 y decisión del autor (2026-11-11): «Mi stack» agrupa el
  // catálogo en cinco columnas, y el catálogo se reagrupa igual. Dentro de
  // cada grupo, el orden del catálogo es el de la columna.
  describe('grupos de «Mi stack»', () => {
    it('son cinco, en el orden de las columnas', () => {
      expect(technologyGroups).toEqual(['languages', 'backend', 'data', 'frontend', 'ai-tools'])
    })

    it('cada grupo tiene sus tecnologías, en su orden', () => {
      const members = (group: string) =>
        technologies.filter((technology) => technology.group === group).map(({ id }) => id)

      expect(members('languages')).toEqual(['java', 'python', 'javascript', 'typescript'])
      expect(members('backend')).toEqual(['spring-boot', 'spring-security'])
      expect(members('data')).toEqual(['postgresql', 'mysql'])
      expect(members('frontend')).toEqual(['react', 'html', 'css'])
      expect(members('ai-tools')).toEqual(['ai-agents', 'n8n', 'docker', 'git-github'])
    })

    it('ninguna tecnología se queda fuera de un grupo', () => {
      technologies.forEach(({ id, group }) => expect(technologyGroups, id).toContain(group))
    })

    // La cinta del Hero sigue el orden del catálogo: el reagrupado solo mueve
    // React delante de HTML y CSS, e invierte las cuatro últimas.
    it('el orden del catálogo, el de la cinta, apenas cambia', () => {
      expect(technologies.map(({ id }) => id)).toEqual([
        'java',
        'spring-boot',
        'spring-security',
        'postgresql',
        'mysql',
        'python',
        'javascript',
        'typescript',
        'react',
        'html',
        'css',
        'ai-agents',
        'n8n',
        'docker',
        'git-github',
      ])
    })
  })

  it('Git y GitHub van en una sola entrada, con espacios alrededor de la barra', () => {
    expect(byId('git-github')?.name).toBe('Git / GitHub')
  })

  describe('agentes de IA', () => {
    it('la entrada se llama «AI Agents», en el grupo de IA y herramientas', () => {
      expect(byId('ai-agents')).toMatchObject({ id: 'ai-agents', name: 'AI Agents', group: 'ai-tools' })
    })

    it('sustituye a la entrada anterior, no se suma a ella', () => {
      expect(byId('ai-development')).toBeUndefined()
      expect(technologies.filter((technology) => technology.id.startsWith('ai'))).toHaveLength(1)
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
      expect(byId('react')).toMatchObject({ id: 'react', name: 'React', group: 'frontend' })
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

  // Spec v2.1: los logos de tecnología van solo en «Mi stack» y en las fichas
  // del Hero. Cada tecnología nombra su archivo de public/; los de marca, en
  // public/tech, y el icono genérico de lo que no es marca, en public/icons.
  describe('logos', () => {
    it('cada tecnología tiene un logo, y el archivo existe en public/', () => {
      technologies.forEach(({ id, logo }) => {
        expect(logo, id).toMatch(/^(tech|icons)\/[a-z0-9-]+\.svg$/)
        expect(existsSync(`public/${logo}`), id).toBe(true)
      })
    })

    it('ningún logo se repite', () => {
      const logos = technologies.map(({ logo }) => logo)

      expect(new Set(logos).size).toBe(logos.length)
    })

    // Una sola fuente: no se publica un logo que el catálogo no asigne.
    it('cada archivo de public/tech es el logo de una tecnología del catálogo', () => {
      // Vite resuelve el patrón al transformar el test: la lista es la del disco.
      const files = Object.keys(import.meta.glob('/public/tech/*')).map((path) =>
        path.replace('/public/', ''),
      )

      expect(files.length).toBeGreaterThan(0)
      expect(files.sort()).toEqual(
        technologies.map(({ logo }) => logo).filter((logo) => logo.startsWith('tech/')).sort(),
      )
    })

    it('Java lleva a Duke; Git/GitHub, el logo de Git; los agentes de IA, el chip genérico en blanco', () => {
      expect(byId('java')?.logo).toBe('tech/duke.svg')
      expect(byId('git-github')?.logo).toBe('tech/git.svg')
      expect(byId('ai-agents')?.logo).toBe('icons/ai-agents-white.svg')
    })

    it('la URL pública del logo cuelga de la base del sitio', () => {
      const java = byId('java')

      expect(java && technologyLogoUrl(java)).toBe(`${import.meta.env.BASE_URL}tech/duke.svg`)
    })
  })

  // Decisión del autor (2026-10-15): SQLite no entra en el catálogo.
  it('SQLite no está en el catálogo', () => {
    expect(technologies.some((technology) => /sqlite/i.test(technology.id))).toBe(false)
  })
})
