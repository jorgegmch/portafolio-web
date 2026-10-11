import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

const ROLES = {
  es: [
    'Desarrollador Full-Stack',
    'Backend con Java y Spring Boot',
    'Automatización con agentes de IA',
  ],
  en: ['Full-Stack Developer', 'Backend with Java and Spring Boot', 'Automation with AI agents'],
} as const

// Textos del tag que rota bajo el nombre, en el orden en que se muestran.
describe('roles del hero', () => {
  it.each(LANGS)('en %s, son los aprobados y en ese orden', (lang) => {
    expect(dictionaries[lang].hero.roles).toEqual(ROLES[lang])
  })

  it('los dos idiomas tienen los mismos, uno por uno', () => {
    expect(dictionaries.en.hero.roles).toHaveLength(dictionaries.es.hero.roles.length)
  })

  it.each(LANGS)('en %s, ninguno queda vacío, repetido ni con espacios de más', (lang) => {
    const { roles } = dictionaries[lang].hero

    expect(roles.length).toBeGreaterThan(0)
    expect(new Set(roles).size).toBe(roles.length)
    for (const role of roles) {
      expect(role).not.toBe('')
      expect(role).toBe(role.trim())
    }
  })

  // El rol del título y de la descripción se escribe una vez, en config.
  it('en inglés, el primero es el rol de config, sin escribirlo dos veces', () => {
    expect(dictionaries.en.hero.roles.at(0)).toBe(site.role)
    // El valor solo no distingue una copia: se mira cómo está escrito.
    expect(readFileSync('src/i18n/en.ts', 'utf8')).toContain('roles: [site.role,')
  })

  it.each(LANGS)('en %s, «Full-Stack» va con guion, como en el título', (lang) => {
    const first = dictionaries[lang].hero.roles.at(0) ?? ''

    expect(first).toContain('Full-Stack')
    expect(dictionaries[lang].hero.roles.join(' ')).not.toMatch(/full\s+stack/i)
  })

  it.each(LANGS)('en %s, ninguno lleva datos de contacto', (lang) => {
    for (const role of dictionaries[lang].hero.roles) {
      expect(role).not.toContain('@')
      expect(role).not.toMatch(/\d/)
    }
  })
})
