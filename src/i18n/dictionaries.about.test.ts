import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

/** Nombre de la escena: el de su rótulo y el de la navegación. */
const LABEL = { es: 'Perfil', en: 'Profile' } as const

// Frase y bio de la spec del rediseño v2.1 (§3.2), escritas por el autor,
// que fija también el inglés y lo aprobó el 2026-11-11. El inglés va con el
// apóstrofo tipográfico (’), como pide la auditoría de Vercel. Cambiarlas
// exige su visto bueno y actualizar también estas constantes.
const PHRASE = {
  es: { filled: 'Entender el reto.', outline: 'Construir la respuesta.' },
  en: { filled: 'Understand the challenge.', outline: 'Build the answer.' },
} as const

const BIO = {
  es: [
    'Soy desarrollador Full-Stack con enfoque en Java y Spring Boot. Mi formación en Comunicación Social y Periodismo también influye en cómo abordo la tecnología: me lleva a escuchar, analizar contextos y comprender las necesidades detrás de cada problema.',
    'Me interesa construir software que no solo funcione, sino que tenga sentido para quienes lo utilizan. Por eso busco conectar las decisiones técnicas con los objetivos del negocio, la claridad de la experiencia y el propósito de cada solución.',
  ],
  en: [
    'I’m a Full-Stack developer focused on Java and Spring Boot. My background in Social Communication and Journalism also shapes how I approach technology: it leads me to listen, analyze context and understand the needs behind each problem.',
    'I want to build software that doesn’t just work, but makes sense to the people who use it. That’s why I connect technical decisions with business goals, a clear experience and the purpose of each solution.',
  ],
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

describe('textos de Perfil', () => {
  it.each(LANGS)('en %s, el nombre de la escena es el previsto, y el de la navegación', (lang) => {
    expect(dictionaries[lang].about.label).toBe(LABEL[lang])
    expect(dictionaries[lang].nav.about).toBe(LABEL[lang])
  })

  it.each(LANGS)('en %s, la frase grande son sus dos líneas aprobadas', (lang) => {
    expect(dictionaries[lang].about.phrase).toEqual(PHRASE[lang])
  })

  describe('bio', () => {
    it.each(LANGS)('en %s, son los dos párrafos aprobados, palabra por palabra', (lang) => {
      expect(dictionaries[lang].about.bio).toEqual(BIO[lang])
    })

    it('en inglés, sin apóstrofos rectos', () => {
      expect(dictionaries.en.about.bio.join(' ')).not.toContain("'")
    })

    // La escena no muestra contacto: ni un correo ni un número caben aquí.
    it.each(LANGS)('en %s, no lleva datos de contacto', (lang) => {
      for (const paragraph of dictionaries[lang].about.bio) {
        expect(paragraph).not.toContain('@')
        expect(paragraph).not.toMatch(/\d{5,}/)
      }
    })
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
