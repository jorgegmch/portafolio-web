import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

const VIEW_PROJECTS = { es: 'Ver proyectos', en: 'View projects' } as const

const AVAILABILITY = {
  es: 'Disponible para proyectos freelance',
  en: 'Available for freelance',
} as const

// Los dos salen literales de la spec del rediseño v2.1 (§3.1), escrita por
// el autor, que fija también el inglés. Cambiarlos exige su visto bueno y
// actualizar también estas dos constantes.
const INTRO = {
  es: 'Combino desarrollo de software, comunicación y pensamiento estratégico para crear soluciones que respondan a necesidades reales y tengan sentido para quienes las usan.',
  en: 'I combine software development, communication and strategic thinking to build solutions that meet real needs and make sense to the people who use them.',
} as const

// Línea en mono bajo el rol y lema al pie de la foto (spec v2.1 §3.1). El
// lema se guarda con mayúscula inicial: las mayúsculas sostenidas las pone
// el CSS, y el lector de pantalla lo lee como una frase.
const STACK_LINE = {
  es: 'Java · Spring Boot · IA y automatización',
  en: 'Java · Spring Boot · AI & automation',
} as const

const MOTTO = {
  es: { first: 'El código resuelve.', second: 'El criterio marca la diferencia.' },
  en: { first: 'Code solves.', second: 'Judgment makes the difference.' },
} as const

describe('textos del hero', () => {
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

  it.each(LANGS)('en %s, la línea de stack es la de la spec v2.1', (lang) => {
    expect(dictionaries[lang].hero.stackLine).toBe(STACK_LINE[lang])
  })

  it.each(LANGS)('en %s, el lema es el de la spec v2.1, en dos frases', (lang) => {
    expect(dictionaries[lang].hero.motto).toEqual(MOTTO[lang])
  })

  it.each(LANGS)('en %s, el lema no se guarda en mayúsculas sostenidas', (lang) => {
    const { first, second } = dictionaries[lang].hero.motto

    expect(first).not.toBe(first.toUpperCase())
    expect(second).not.toBe(second.toUpperCase())
  })

  it.each(LANGS)('en %s, la presentación no lleva datos de contacto', (lang) => {
    const { intro } = dictionaries[lang].hero

    expect(intro).not.toContain('@')
    expect(intro).not.toMatch(/\d/)
  })
})
