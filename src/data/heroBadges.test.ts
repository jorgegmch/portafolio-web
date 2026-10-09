import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as data from '@/data/index'
import {
  heroBadgeIconUrl,
  heroBadges,
  technologies,
  technologyName,
} from '@/data/technologies'

// Los iconos se buscan en disco, desde la raíz del repo.
const BRAND_DIR = 'public/tech'
const GENERIC_DIR = 'public/icons'

const technology = (id: string) => technologies.find((candidate) => candidate.id === id)
const brandBadges = heroBadges.filter((badge) => badge.brand)
const genericBadges = heroBadges.filter((badge) => !badge.brand)

describe('pastillas del Hero', () => {
  it('son estas cinco, en este orden', () => {
    expect(heroBadges).toEqual([
      { technology: 'python', icon: 'python.svg', brand: true },
      { technology: 'java', icon: 'duke.svg', brand: true },
      { technology: 'typescript', icon: 'typescript.svg', brand: true },
      { technology: 'postgresql', icon: 'database.svg', brand: false },
      { technology: 'ai-agents', icon: 'ai-agents.svg', brand: false },
    ])
  })

  it('no repiten tecnología ni icono', () => {
    expect(new Set(heroBadges.map((badge) => badge.technology)).size).toBe(heroBadges.length)
    expect(new Set(heroBadges.map((badge) => badge.icon)).size).toBe(heroBadges.length)
  })

  // El nombre visible sale del catálogo: una pastilla sin tecnología no tendría texto.
  it.each(heroBadges)('$technology es una tecnología del catálogo, con nombre', (badge) => {
    expect(technology(badge.technology)?.name).toBeTruthy()
  })

  it.each(technologies)('technologyName da el nombre de $id', ({ id, name }) => {
    expect(technologyName(id)).toBe(name)
  })

  // Las pastillas sustituyeron a la lista de logos sueltos.
  it('ya no existe la lista heroLogos', () => {
    expect(data).not.toHaveProperty('heroLogos')
    expect(data).toHaveProperty('heroBadges')
    expect(data).toHaveProperty('technologyName')
  })

  describe('con logo de marca', () => {
    it('hay alguna', () => {
      expect(brandBadges.length).toBeGreaterThan(0)
    })

    // Una sola fuente: el Hero no muestra un logo que el catálogo no asigne a
    // esa tecnología.
    it.each(brandBadges)('$icon es un logo de $technology en el catálogo', (badge) => {
      expect(technology(badge.technology)?.logos).toContain(badge.icon)
    })

    it.each(brandBadges)('$icon existe en public/tech', (badge) => {
      expect(existsSync(`${BRAND_DIR}/${badge.icon}`)).toBe(true)
    })

    it.each(brandBadges)('$icon se sirve desde /tech', (badge) => {
      expect(heroBadgeIconUrl(badge)).toBe(`/tech/${badge.icon}`)
    })
  })

  describe('con icono genérico', () => {
    it('hay alguna', () => {
      expect(genericBadges.length).toBeGreaterThan(0)
    })

    // Solo se usa un icono propio cuando la marca no deja mostrar su logo.
    it.each(genericBadges)('$technology no tiene logo en el catálogo', (badge) => {
      expect(technology(badge.technology)?.logos).toEqual([])
    })

    it.each(genericBadges)('$icon existe en public/icons y no en public/tech', (badge) => {
      expect(existsSync(`${GENERIC_DIR}/${badge.icon}`)).toBe(true)
      expect(existsSync(`${BRAND_DIR}/${badge.icon}`)).toBe(false)
    })

    it.each(genericBadges)('$icon se sirve desde /icons', (badge) => {
      expect(heroBadgeIconUrl(badge)).toBe(`/icons/${badge.icon}`)
    })
  })
})
