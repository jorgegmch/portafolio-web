import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

// index.html es estático: su título se escribe a mano y no puede importar la
// config. Se lee de disco, desde la raíz del repo, para que no se desvíe.
const html = readFileSync('index.html', 'utf8')
const titles = [...html.matchAll(/<title>([^<]*)<\/title>/g)].map(([, text]) => text)

describe('título del documento', () => {
  it('index.html tiene un solo <title>', () => {
    expect(titles).toHaveLength(1)
  })

  it('el <title> de index.html es exactamente site.title', () => {
    expect(titles.at(0)).toBe(site.title)
  })

  it.each(LANGS)('en %s, meta.title del diccionario es site.title', (lang) => {
    expect(dictionaries[lang].meta.title).toBe(site.title)
  })

  it('site.title no queda vacío', () => {
    expect(site.title.trim()).toBeTruthy()
  })
})
