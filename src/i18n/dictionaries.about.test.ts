import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

const HEADING = { es: 'Sobre mí', en: 'About me' } as const

const VIEW_CERTIFICATIONS = { es: 'Ver certificaciones', en: 'View certifications' } as const

const PHRASE = {
  es: 'Del negocio al código, y del código a palabras claras',
  en: 'From business to code, and from code to plain language',
} as const

/** El tramo que puede ir resaltado: el final de la frase. */
const HIGHLIGHT = { es: 'palabras claras', en: 'plain language' } as const

// Aprobado por el autor palabra por palabra: cambiarlo exige su visto bueno y
// actualizar también estas dos constantes.
const BIO = {
  es: [
    'Soy desarrollador Full-Stack junior con base en Java y Spring Boot. Diseño APIs REST con autenticación JWT y roles sobre PostgreSQL, y las documento con OpenAPI para que cualquiera pueda entenderlas y usarlas.',
    'Programo apoyado en agentes de IA, pero con método: especificaciones, reglas y skills (AGENTS.md, SDD) para que el agente siga un ciclo claro y yo mantenga el criterio. Esa misma disciplina la llevé a LogiTrack IQ, donde integré n8n y un servidor MCP: un agente detecta productos bajo el punto de reorden y genera órdenes de compra en borrador que un administrador aprueba.',
    'Vengo de la Comunicación Social: aprendí a escuchar antes de hablar y a explicar ideas complejas a públicos distintos. En software, eso significa convertir lo que necesita un cliente en requerimientos técnicos claros y explicar las decisiones del equipo sin tecnicismos innecesarios.',
    'Trabajo con Scrum, aprendo rápido y documento lo que construyo. Si tu equipo busca a alguien que programe, entienda el negocio y sepa explicarlo, hablemos.',
  ],
  en: [
    "I'm a junior Full-Stack developer with a Java and Spring Boot foundation. I design REST APIs with JWT authentication and role-based access on PostgreSQL, and I document them with OpenAPI so anyone can understand and use them.",
    'I code with AI agents, but with method: specs, rules and skills (AGENTS.md, SDD), so the agent follows a clear cycle and the judgment stays mine. I brought that same discipline to LogiTrack IQ, where I integrated n8n and an MCP server: an agent detects products below their reorder point and drafts purchase orders for an administrator to approve.',
    "I come from a communications background: I learned to listen before I speak and to explain complex ideas to different audiences. In software, that means turning what a client needs into clear technical requirements and explaining the team's decisions without unnecessary jargon.",
    "I work with Scrum, learn fast and document what I build. If your team is looking for someone who can code, understands the business and can explain it, let's talk.",
  ],
} as const

const TERMINAL_LABEL = {
  es: 'Salida de java Developer',
  en: 'Output of java Developer',
} as const

/** Etiqueta de cada tarjeta con 0, con 1 y con varios. */
const STATS = {
  es: {
    months: ['Meses programando', 'Mes programando', 'Meses programando'],
    years: ['Años programando', 'Año programando', 'Años programando'],
    projects: ['Proyectos construidos', 'Proyecto construido', 'Proyectos construidos'],
    technologies: ['Tecnologías', 'Tecnología', 'Tecnologías'],
  },
  en: {
    months: ['Months of coding', 'Month of coding', 'Months of coding'],
    years: ['Years of coding', 'Year of coding', 'Years of coding'],
    projects: ['Projects built', 'Project built', 'Projects built'],
    technologies: ['Technologies', 'Technology', 'Technologies'],
  },
} as const

const COUNTS = [0, 1, 14] as const

/** Dónde va el «+» de una cifra aproximada: «+20» en español, «20+» en inglés. */
const PLUS_POSITION = { es: 'prefix', en: 'suffix' } as const

describe('textos de «Sobre mí»', () => {
  it.each(LANGS)('en %s, el título y el botón son los previstos', (lang) => {
    const { about } = dictionaries[lang]

    expect(about.heading).toBe(HEADING[lang])
    expect(about.viewCertifications).toBe(VIEW_CERTIFICATIONS[lang])
  })

  describe('frase grande', () => {
    it.each(LANGS)('en %s, el inicio más el resaltado dan la frase aprobada', (lang) => {
      const { lead, highlight } = dictionaries[lang].about.phrase

      expect(lead + highlight).toBe(PHRASE[lang])
    })

    it.each(LANGS)('en %s, el tramo resaltable es el previsto', (lang) => {
      expect(dictionaries[lang].about.phrase.highlight).toBe(HIGHLIGHT[lang])
    })

    // El espacio va en el inicio: el resaltado se pinta sin espacios sobrantes.
    it.each(LANGS)('en %s, el espacio entre los dos tramos va al final del inicio', (lang) => {
      const { lead, highlight } = dictionaries[lang].about.phrase

      expect(lead.endsWith(' ')).toBe(true)
      expect(highlight).toBe(highlight.trim())
    })
  })

  describe('descripción', () => {
    it.each(LANGS)('en %s, son cuatro párrafos', (lang) => {
      expect(dictionaries[lang].about.bio).toHaveLength(4)
    })

    it.each([0, 1, 2, 3])('en español, el párrafo %i es el aprobado, palabra por palabra', (index) => {
      expect(dictionaries.es.about.bio[index]).toBe(BIO.es[index])
    })

    it.each([0, 1, 2, 3])('en inglés, el párrafo %i es la traducción aprobada', (index) => {
      expect(dictionaries.en.about.bio[index]).toBe(BIO.en[index])
    })

    // La sección no muestra contacto: ni un correo ni un número caben aquí.
    it.each(LANGS)('en %s, ningún párrafo lleva datos de contacto', (lang) => {
      dictionaries[lang].about.bio.forEach((paragraph) => {
        expect(paragraph).not.toContain('@')
        expect(paragraph).not.toMatch(/\d{5,}/)
      })
    })

    // Una palabra partida por un espacio doble o un salto rompería la escritura
    // palabra por palabra.
    it.each(LANGS)('en %s, las palabras van separadas por un solo espacio', (lang) => {
      dictionaries[lang].about.bio.forEach((paragraph) => {
        expect(paragraph).toBe(paragraph.trim())
        expect(paragraph).not.toMatch(/\s{2,}|[\n\t]/)
      })
    })
  })

  it.each(LANGS)('en %s, el panel de la terminal tiene su nombre accesible', (lang) => {
    expect(dictionaries[lang].about.terminalLabel).toBe(TERMINAL_LABEL[lang])
  })

  describe('etiquetas de las tarjetas', () => {
    it.each(LANGS)('en %s, el tiempo en meses, con 0, 1 y varios', (lang) => {
      const { months } = dictionaries[lang].about.stats.codingTime

      expect(COUNTS.map(months)).toEqual(STATS[lang].months)
    })

    it.each(LANGS)('en %s, el tiempo en años, con 0, 1 y varios', (lang) => {
      const { years } = dictionaries[lang].about.stats.codingTime

      expect(COUNTS.map(years)).toEqual(STATS[lang].years)
    })

    it.each(LANGS)('en %s, los proyectos, con 0, 1 y varios', (lang) => {
      expect(COUNTS.map(dictionaries[lang].about.stats.projects)).toEqual(STATS[lang].projects)
    })

    it.each(LANGS)('en %s, las tecnologías, con 0, 1 y varios', (lang) => {
      expect(COUNTS.map(dictionaries[lang].about.stats.technologies)).toEqual(
        STATS[lang].technologies,
      )
    })

    // El número y su «+» los pone la tarjeta, en otro color: la etiqueta no los repite.
    it.each(LANGS)('en %s, ninguna etiqueta lleva el número ni el «+»', (lang) => {
      const { codingTime, projects, technologies } = dictionaries[lang].about.stats

      const labels = [codingTime.months, codingTime.years, projects, technologies]
      labels.forEach((label) => {
        COUNTS.forEach((count) => expect(label(count)).not.toMatch(/[\d+]/))
      })
    })

    it.each(LANGS)('en %s, la etiqueta de proyectos ya no dice «publicados»', (lang) => {
      COUNTS.forEach((count) => {
        expect(dictionaries[lang].about.stats.projects(count)).not.toMatch(/publi/i)
      })
    })

    it.each(LANGS)('en %s, hay tres tarjetas, la posición del «+» y nada más', (lang) => {
      expect(Object.keys(dictionaries[lang].about.stats).sort()).toEqual([
        'codingTime',
        'plusPosition',
        'projects',
        'technologies',
      ])
    })
  })

  // El carácter y el redondeo son de la tarjeta; el diccionario solo dice dónde va.
  describe('posición del «+»', () => {
    it.each(LANGS)('en %s, es la prevista', (lang) => {
      expect(dictionaries[lang].about.stats.plusPosition).toBe(PLUS_POSITION[lang])
    })

    it('en español va delante y en inglés detrás', () => {
      expect(dictionaries.es.about.stats.plusPosition).toBe('prefix')
      expect(dictionaries.en.about.stats.plusPosition).toBe('suffix')
    })

    it.each(LANGS)('en %s, es una posición, no el carácter', (lang) => {
      const position: string = dictionaries[lang].about.stats.plusPosition

      expect(['prefix', 'suffix']).toContain(position)
      expect(position).not.toContain('+')
    })
  })
})
