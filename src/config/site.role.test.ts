import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

// El rol se escribe una sola vez: el Hero, el título y la descripción lo
// toman de aquí, así que no puede haber dos grafías.
describe('rol', () => {
  it('se escribe con guion', () => {
    expect(site.role).toBe('Full-Stack Developer')
  })

  it('el título del documento usa la misma grafía', () => {
    expect(site.title).toContain(site.role)
  })

  it.each(LANGS)('en %s, la descripción del sitio usa la misma grafía', (lang) => {
    expect(dictionaries[lang].meta.description).toContain(site.role)
  })
})
