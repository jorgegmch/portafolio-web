import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

const VIEW_PROJECTS = { es: 'Ver proyectos', en: 'View projects' } as const

const AVAILABILITY = {
  es: 'Disponible para proyectos freelance',
  en: 'Available for freelance',
} as const

// El español sale literal de la spec del rediseño v2 (§3.1), escrita por el
// autor; el inglés es su traducción. Cambiarlos exige su visto bueno y
// actualizar también estas dos constantes.
const INTRO = {
  es: 'Traduzco lo que tu negocio necesita en software que funciona, y te lo explico sin tecnicismos.',
  en: 'I translate what your business needs into software that works, and I explain it without jargon.',
} as const

const SOCIAL_LABEL = { es: 'Redes y contacto', en: 'Social and contact' } as const

const SOCIAL = {
  es: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'Enviar un correo',
    whatsapp: 'Escribir por WhatsApp',
  },
  en: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'Send an email',
    whatsapp: 'Message on WhatsApp',
  },
} as const

describe('textos del hero', () => {
  it.each(LANGS)('en %s, la fila de redes se llama como está previsto', (lang) => {
    expect(dictionaries[lang].hero.socialLabel).toBe(SOCIAL_LABEL[lang])
  })

  it.each(LANGS)('en %s, cada red tiene su nombre accesible, y ninguno de más', (lang) => {
    expect(dictionaries[lang].hero.social).toEqual(SOCIAL[lang])
  })

  it.each(LANGS)('en %s, los nombres de la fila no llevan datos de contacto', (lang) => {
    Object.values(dictionaries[lang].hero.social).forEach((name) => {
      expect(name).not.toContain('@')
      expect(name).not.toMatch(/\d/)
    })
  })

  it.each(LANGS)('en %s, el estado de disponibilidad dice el texto aprobado', (lang) => {
    expect(dictionaries[lang].hero.availability).toBe(AVAILABILITY[lang])
  })

  // El largo no cabe en una línea en los teléfonos; el corto es el del
  // tablero móvil del rediseño.
  it('en español hay además un texto corto, el aprobado', () => {
    expect(dictionaries.es.hero.availabilityShort).toBe('Disponible para freelance')
  })

  it('el texto corto es más corto que el largo', () => {
    const { availability, availabilityShort = '' } = dictionaries.es.hero

    expect(availabilityShort.length).toBeGreaterThan(0)
    expect(availabilityShort.length).toBeLessThan(availability.length)
  })

  // En inglés el texto cabe en todos los anchos: no se duplica.
  it('en inglés no hay texto corto', () => {
    expect(dictionaries.en.hero).not.toHaveProperty('availabilityShort')
  })

  it.each(LANGS)('en %s, el botón principal dice el texto aprobado', (lang) => {
    expect(dictionaries[lang].hero.viewProjects).toBe(VIEW_PROJECTS[lang])
  })

  // Las mayúsculas sostenidas las pone el CSS: el texto se guarda normal.
  it.each(LANGS)('en %s, el texto del botón no se guarda en mayúsculas sostenidas', (lang) => {
    const { viewProjects } = dictionaries[lang].hero

    expect(viewProjects).not.toBe(viewProjects.toUpperCase())
  })

  it.each(LANGS)('en %s, la presentación tiene texto', (lang) => {
    expect(dictionaries[lang].hero.intro.trim()).not.toBe('')
  })

  it.each(LANGS)('en %s, la presentación es el texto aprobado por el autor', (lang) => {
    expect(dictionaries[lang].hero.intro).toBe(INTRO[lang])
  })

  it('la presentación cambia con el idioma', () => {
    expect(dictionaries.es.hero.intro).not.toBe(dictionaries.en.hero.intro)
  })

  it.each(LANGS)('en %s, la presentación no lleva datos de contacto', (lang) => {
    const { intro } = dictionaries[lang].hero

    expect(intro).not.toContain('@')
    expect(intro).not.toMatch(/\d/)
  })
})
