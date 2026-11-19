import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// index.html y public/ se leen de disco, desde la raíz del repo: un href que
// apunte a un archivo que no existe no rompe el build, solo deja el sitio sin icono.
const PUBLIC_DIR = 'public'
const ICON_RELS = ['icon', 'apple-touch-icon']

const html = readFileSync('index.html', 'utf8')

const attribute = (tag: string, name: string) =>
  new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? ''

const iconLinks = [...html.matchAll(/<link\b[^>]*>/g)]
  .map(([tag]) => ({
    rel: attribute(tag, 'rel'),
    href: attribute(tag, 'href'),
    sizes: attribute(tag, 'sizes'),
    type: attribute(tag, 'type'),
  }))
  .filter(({ rel }) => ICON_RELS.includes(rel))

const hrefsOf = (rel: string) => iconLinks.filter((link) => link.rel === rel).map(({ href }) => href)

describe('iconos del sitio', () => {
  it('index.html declara algún icono', () => {
    expect(iconLinks.length).toBeGreaterThan(0)
  })

  it.each(iconLinks)('$href existe en public/', ({ href }) => {
    expect(href.startsWith('/')).toBe(true)
    expect(existsSync(`${PUBLIC_DIR}${href}`)).toBe(true)
  })

  // El logo solo existe en mapa de bits: no hay SVG, y el .ico es el único
  // icono de pestaña (16, 32 y 48 px).
  it('declara solo el .ico como icono de pestaña', () => {
    expect(hrefsOf('icon')).toEqual(['/favicon.ico'])
  })

  it('el .ico lleva sizes="any"', () => {
    expect(iconLinks.find(({ href }) => href === '/favicon.ico')).toMatchObject({ sizes: 'any' })
  })

  it('declara un apple-touch-icon', () => {
    expect(hrefsOf('apple-touch-icon')).toEqual(['/apple-touch-icon.png'])
  })
})
