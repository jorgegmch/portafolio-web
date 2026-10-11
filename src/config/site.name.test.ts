import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'

// El nombre se escribe una sola vez y con tilde: el h1, el pie, el título y la
// descripción lo toman de aquí. Los nombres de archivo y las URLs no salen de
// estos campos: siguen en ASCII.
describe('nombre', () => {
  it('el completo lleva tilde en el primer apellido', () => {
    expect(site.legalName).toBe('Jorge Alberto Gómez Chaparro')
  })

  it('el corto lleva la misma tilde', () => {
    expect(site.shortName).toBe('Jorge Gómez')
  })

  it('el corto son el primer nombre y el primer apellido del completo', () => {
    const [firstName, , firstSurname] = site.legalName.split(' ')

    expect(site.shortName).toBe(`${firstName} ${firstSurname}`)
  })

  it('el título del documento empieza por el nombre corto', () => {
    expect(site.title.startsWith(`${site.shortName} | `)).toBe(true)
  })

  // Una «o» seguida de un acento suelto se ve igual, pero mide y se busca distinto.
  it.each([
    ['legalName', site.legalName],
    ['shortName', site.shortName],
    ['title', site.title],
  ])('%s lleva la tilde como una sola letra', (_, value) => {
    expect(value).toBe(value.normalize('NFC'))
    expect(value).toContain('ó')
  })
})
