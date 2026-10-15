import { describe, expect, it } from 'vitest'
import { services } from '@/data/services'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

// Aprobado por el autor palabra por palabra (2026-10-15): cambiarlo exige su
// visto bueno y actualizar también estas constantes. Las etiquetas van en
// minúsculas normales; las mayúsculas las pone el CSS.
const NAV = { es: 'Servicios', en: 'Services' } as const

const HEADINGS = {
  es: {
    kicker: 'Servicios',
    heading: 'Lo que puedo hacer por ti',
    stackKicker: 'Mi stack tecnológico',
    stackHeading: 'Tecnologías con las que trabajo',
    relatedProject: 'Ver proyecto relacionado',
  },
  en: {
    kicker: 'Services',
    heading: 'What I can do for you',
    stackKicker: 'My tech stack',
    stackHeading: 'Technologies I work with',
    relatedProject: 'View related project',
  },
} as const

const ITEMS = {
  es: {
    backend: {
      title: 'Desarrollo Backend',
      description:
        'APIs REST con Java y Spring Boot, con autenticación JWT, roles y permisos, y documentación OpenAPI.',
    },
    frontend: {
      title: 'Desarrollo Frontend',
      description:
        'Interfaces responsivas con HTML, CSS, JavaScript y TypeScript, y React, con apoyo de agentes de IA.',
    },
    fullstack: {
      title: 'Desarrollo Full-Stack',
      description:
        'Construyo aplicaciones completas: API en Java y Spring Boot, base de datos en PostgreSQL e interfaz web con HTML, CSS y JavaScript, de la idea a un sistema que funciona.',
    },
    databases: {
      title: 'Bases de datos',
      // Respaldo: claves foráneas y CHECK en gaseosas-del-valle-db,
      // scripts/gdv_schema.sql (líneas 20-22, 33, 53, 57, 71 y 76).
      description:
        'Modelado relacional y consultas en PostgreSQL y MySQL, con claves foráneas y restricciones que protegen la integridad de los datos.',
    },
    automation: {
      title: 'Automatización y agentes de IA',
      description:
        'Ciclos de trabajo con agentes de IA (AGENTS.md, skills y comandos), conectados a flujos de n8n y servidores MCP, con reglas claras de lo que cada agente puede hacer.',
    },
    communication: {
      title: 'Comunicación estratégica',
      description:
        'Convierto los objetivos del negocio en soluciones tecnológicas. Escucho, los traduzco a requerimientos técnicos claros y los comunico al equipo.',
    },
  },
  en: {
    backend: {
      title: 'Backend Development',
      description:
        'REST APIs with Java and Spring Boot, with JWT authentication, roles and permissions, and OpenAPI documentation.',
    },
    frontend: {
      title: 'Frontend Development',
      description:
        'Responsive interfaces with HTML, CSS, JavaScript and TypeScript, and React, with AI agent support.',
    },
    fullstack: {
      title: 'Full-Stack Development',
      description:
        'I build complete applications: a Java and Spring Boot API, a PostgreSQL database and a web interface with HTML, CSS and JavaScript, from the idea to a working system.',
    },
    databases: {
      title: 'Databases',
      description:
        'Relational modeling and queries in PostgreSQL and MySQL, with foreign keys and constraints that protect data integrity.',
    },
    automation: {
      title: 'Automation and AI agents',
      description:
        'Agentic workflows built on AGENTS.md, skills and commands, connecting AI agents to n8n workflows and MCP servers, with clear rules on what each agent can do.',
    },
    communication: {
      title: 'Strategic communication',
      description:
        'I turn business goals into technology solutions. I listen, translate them into clear technical requirements and communicate them to the team.',
    },
  },
} as const

describe('textos de «Servicios»', () => {
  it.each(LANGS)('en %s, la barra dice «%s»', (lang) => {
    expect(dictionaries[lang].nav.services).toBe(NAV[lang])
  })

  it.each(LANGS)('en %s, las etiquetas, los títulos y el texto del enlace', (lang) => {
    const { items, ...headings } = dictionaries[lang].services

    expect(headings).toEqual(HEADINGS[lang])
    expect(items).toBeDefined()
  })

  it.each(LANGS)('en %s, cada servicio lleva su título y su descripción', (lang) => {
    expect(dictionaries[lang].services.items).toEqual(ITEMS[lang])
  })

  // Record<ServiceId, …> lo exige al compilar; aquí se comprueba también en
  // ejecución, contra los ids de data/.
  it.each(LANGS)('en %s, hay texto para cada servicio de data/ y para nada más', (lang) => {
    expect(Object.keys(dictionaries[lang].services.items).sort()).toEqual(
      services.map((service) => service.id).sort(),
    )
  })

  // Decisiones del autor (2026-10-15), por contenido veraz.
  describe('lo que no se afirma', () => {
    it.each(LANGS)('en %s, ninguna tarjeta nombra SQLite', (lang) => {
      Object.values(dictionaries[lang].services.items).forEach(({ description }) => {
        expect(description).not.toMatch(/sqlite/i)
      })
    })

    it.each(LANGS)('en %s, ninguna tarjeta habla de multiagentes', (lang) => {
      Object.values(dictionaries[lang].services.items).forEach(({ description }) => {
        expect(description).not.toMatch(/multi-?agent/i)
      })
    })

    // Números sueltos: el 8 de «n8n» es parte del nombre, no una cifra.
    it.each(LANGS)('en %s, sin cifras ni porcentajes', (lang) => {
      Object.values(dictionaries[lang].services.items).forEach(({ title, description }) => {
        expect(`${title} ${description}`).not.toMatch(/\b\d+\b|%/)
      })
    })
  })

  // La sección de tecnologías pasó a «Servicios»: su bloque se retiró.
  it.each(LANGS)('en %s, ya no hay bloque de tecnologías ni etiqueta de barra para él', (lang) => {
    expect(Object.keys(dictionaries[lang])).not.toContain('technologies')
    expect(Object.keys(dictionaries[lang].nav)).not.toContain('technologies')
  })
})
