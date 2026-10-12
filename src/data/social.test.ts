import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { site, socialLinks } from '@/config/site'
import * as data from '@/data/index'
import { HERO_SOCIAL_LIMIT, heroSocial, heroSocialIconUrl, heroSocialUrl } from '@/data/social'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'
import { getEmail, getWhatsappUrl } from '@/lib/assembleContact'
import { cssToken, readCss } from '@/test/cssRules'
import { parseSvg, svgIssues } from '@/test/svgSafety'

// Los iconos se buscan en disco, desde la raíz del repo.
const BRAND_DIR = 'public/social'
const GENERIC_DIR = 'public/icons'
const ENVELOPE = `${GENERIC_DIR}/envelope.svg`
const DATABASE = `${GENERIC_DIR}/database.svg`
/** Logos oficiales que publica public/social (ver socialLogos.test.ts). */
const PUBLISHED_LOGOS = ['github.svg', 'linkedin.png', 'whatsapp.svg']

const tokensCss = readCss('src/styles/tokens.css')
const read = (path: string) => readFileSync(path, 'utf8')
const file = (entry: (typeof heroSocial)[number]) =>
  `${entry.brand ? BRAND_DIR : GENERIC_DIR}/${entry.icon}`
const links = heroSocial.filter((entry) => entry.kind === 'link')

describe('fila de redes del Hero', () => {
  it('son estas cuatro, en este orden', () => {
    expect(heroSocial).toEqual([
      { id: 'github', kind: 'link', icon: 'github.svg', brand: true },
      { id: 'linkedin', kind: 'link', icon: 'linkedin.png', brand: true },
      { id: 'email', kind: 'email', icon: 'envelope.svg', brand: false },
      { id: 'whatsapp', kind: 'whatsapp', icon: 'whatsapp.svg', brand: true },
    ])
  })

  // Cinco controles miden 268 px: a 360 px de ancho caben en una fila;
  // a 320 px la caja mide 267 y pasan a dos filas.
  it('el tope es de cinco y no se supera', () => {
    expect(HERO_SOCIAL_LIMIT).toBe(5)
    expect(heroSocial.length).toBeGreaterThan(0)
    expect(heroSocial.length).toBeLessThanOrEqual(HERO_SOCIAL_LIMIT)
  })

  it('no repiten id ni icono', () => {
    expect(new Set(heroSocial.map((entry) => entry.id)).size).toBe(heroSocial.length)
    expect(new Set(heroSocial.map((entry) => entry.icon)).size).toBe(heroSocial.length)
  })

  it('se exporta desde data/index', () => {
    expect(data).toHaveProperty('heroSocial', heroSocial)
    expect(data).toHaveProperty('HERO_SOCIAL_LIMIT', HERO_SOCIAL_LIMIT)
  })

  describe.each(heroSocial)('$id', (entry) => {
    it('su icono existe en la carpeta que le toca', () => {
      expect(existsSync(file(entry))).toBe(true)
    })

    it('la URL del icono apunta a esa carpeta', () => {
      const folder = entry.brand ? 'social' : 'icons'

      expect(heroSocialIconUrl(entry)).toBe(`${import.meta.env.BASE_URL}${folder}/${entry.icon}`)
    })

    it.each(LANGS)('tiene nombre accesible en %s', (lang) => {
      expect(dictionaries[lang].hero.social[entry.id].trim()).not.toBe('')
    })

    // Los datos siguen donde viven: el registro solo dice qué se muestra.
    it('no guarda URL ni datos de contacto', () => {
      expect(Object.keys(entry).sort()).toEqual(['brand', 'icon', 'id', 'kind'])
      expect(JSON.stringify(entry)).not.toMatch(/https?:|@|\d{5,}/)
    })
  })

  describe('enlaces', () => {
    it('son GitHub y LinkedIn', () => {
      expect(links.map((entry) => entry.id)).toEqual(['github', 'linkedin'])
    })

    // Misma fuente que el pie de página: config/site.
    it.each(links)('la URL de $id es la de config/site, la misma del pie', (entry) => {
      expect(heroSocialUrl(entry.id)).toBe(site.social[entry.id])
      expect(socialLinks.find((link) => link.id === entry.id)?.url).toBe(heroSocialUrl(entry.id))
      expect(heroSocialUrl(entry.id)).toMatch(/^https:\/\//)
    })
  })

  describe('contacto', () => {
    it('el correo y WhatsApp no son enlaces: solo hay uno de cada tipo', () => {
      expect(heroSocial.filter((entry) => entry.kind === 'email')).toHaveLength(1)
      expect(heroSocial.filter((entry) => entry.kind === 'whatsapp')).toHaveLength(1)
    })

    // El valor esperado sale de assembleContact; nunca se escribe aquí.
    it('ni el módulo ni los diccionarios llevan el correo ni el número', () => {
      const digits = getWhatsappUrl().replace('https://wa.me/', '')
      const sources = [
        read('src/data/social.ts'),
        ...LANGS.map((lang) => JSON.stringify(dictionaries[lang].hero)),
      ]

      expect(digits).toMatch(/^\d+$/)
      sources.forEach((source) => {
        expect(source).not.toContain(getEmail())
        expect(source).not.toContain(digits)
        expect(source).not.toMatch(/mailto:|wa\.me/)
      })
    })
  })

  describe('logos de marca', () => {
    // Una sola fuente: no se publica un logo que la fila no use, ni al revés.
    it('son exactamente los que publica public/social', () => {
      const used = heroSocial.filter((entry) => entry.brand).map((entry) => entry.icon)

      expect([...used].sort()).toEqual([...PUBLISHED_LOGOS].sort())
    })

    it('el correo no usa el logo de ninguna marca', () => {
      const email = heroSocial.find((entry) => entry.kind === 'email')

      expect(email?.brand).toBe(false)
    })
  })
})

describe('icono genérico de sobre', () => {
  const root = () => parseSvg(read(ENVELOPE)).documentElement
  const all = (name: string) => [...root().querySelectorAll(name)]
  const comment = () => /^<!--[\s\S]*?-->\n/.exec(read(ENVELOPE))?.[0] ?? ''

  it('existe en public/icons, fuera de las carpetas de logos de marca', () => {
    expect(existsSync(ENVELOPE)).toBe(true)
  })

  it('es un SVG seguro como icono estático', () => {
    expect(svgIssues(read(ENVELOPE))).toEqual([])
  })

  it('es cuadrado', () => {
    expect(root().getAttribute('viewBox')).toBe('0 0 24 24')
  })

  // Un sobre cerrado: el cuerpo y la solapa. Nada de texto ni de formas que
  // puedan parecer el logo de un servicio de correo.
  it('se dibuja solo con un rectángulo y un trazo', () => {
    expect(all('*').map((element) => element.localName)).toEqual(['rect', 'path'])
  })

  it('la solapa son segmentos rectos', () => {
    expect(all('path')[0]?.getAttribute('d')).toMatch(/^[MmLlHhVv\d\s.,-]+$/)
  })

  it('no nombra ninguna marca', () => {
    expect(read(ENVELOPE)).not.toMatch(/gmail|google|outlook|microsoft|yahoo|apple|proton|meta\b/i)
  })

  // Va junto a logos blancos sobre el fondo oscuro: trazo claro, de un token.
  it('su trazo es el color de texto de la paleta, sin relleno', () => {
    expect(cssToken(tokensCss, '--color-text')).toMatch(/^#[0-9a-f]{6}$/)
    expect(root().getAttribute('stroke')).toBe(cssToken(tokensCss, '--color-text'))
    expect(root().getAttribute('fill')).toBe('none')
  })

  it('no lleva filtros ni opacidad', () => {
    expect(read(ENVELOPE)).not.toMatch(/opacity|filter|mask/i)
  })

  it('usa el mismo grosor y los mismos remates que los otros iconos propios', () => {
    const database = parseSvg(read(DATABASE)).documentElement

    ;['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'viewBox'].forEach((attribute) =>
      expect(root().getAttribute(attribute)).toBe(database.getAttribute(attribute)),
    )
    expect(root().getAttribute('stroke-width')).not.toBeNull()
  })

  it('su comentario dice que es un dibujo propio, no un logo', () => {
    expect(comment()).toContain('Generic envelope icon drawn for this site')
    expect(comment()).toContain('not a brand logo')
  })
})
