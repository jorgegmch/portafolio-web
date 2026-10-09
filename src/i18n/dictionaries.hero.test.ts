import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

const GREETINGS = { es: 'Hola, yo soy', en: "Hello, I'm" } as const

const VIEW_PROJECTS = { es: 'Ver proyectos', en: 'View projects' } as const

describe('textos del hero', () => {
  it.each(LANGS)('en %s, el botón principal dice el texto aprobado', (lang) => {
    expect(dictionaries[lang].hero.viewProjects).toBe(VIEW_PROJECTS[lang])
  })

  // Las mayúsculas sostenidas las pone el CSS: el texto se guarda normal.
  it.each(LANGS)('en %s, el texto del botón no se guarda en mayúsculas sostenidas', (lang) => {
    const { viewProjects } = dictionaries[lang].hero

    expect(viewProjects).not.toBe(viewProjects.toUpperCase())
  })

  it.each(LANGS)('en %s, el saludo es el aprobado', (lang) => {
    expect(dictionaries[lang].hero.greeting).toBe(GREETINGS[lang])
  })

  // Las mayúsculas sostenidas las pone el CSS: el texto se guarda normal.
  it.each(LANGS)('en %s, el saludo no se guarda en mayúsculas sostenidas', (lang) => {
    const { greeting } = dictionaries[lang].hero

    expect(greeting).not.toBe(greeting.toUpperCase())
  })

  it.each(LANGS)('en %s, la presentación tiene texto', (lang) => {
    expect(dictionaries[lang].hero.intro.trim()).not.toBe('')
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
