import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { splitName } from '@/lib/splitName'

describe('splitName', () => {
  it('separa un nombre de dos palabras', () => {
    expect(splitName('Ana Rojas')).toEqual({ first: 'Ana', last: 'Rojas' })
  })

  it('con varias palabras, solo la última es el apellido', () => {
    expect(splitName('Ana María Rojas')).toEqual({ first: 'Ana María', last: 'Rojas' })
  })

  it('con una sola palabra no hay apellido', () => {
    expect(splitName('Ana')).toEqual({ first: 'Ana', last: '' })
  })

  it('ignora los espacios de los extremos', () => {
    expect(splitName('  Ana Rojas  ')).toEqual({ first: 'Ana', last: 'Rojas' })
  })

  it('reduce los espacios repetidos a uno', () => {
    expect(splitName('Ana   María    Rojas')).toEqual({ first: 'Ana María', last: 'Rojas' })
  })

  it.each(['', '   '])('con el texto vacío "%s" devuelve las dos partes vacías', (name) => {
    expect(splitName(name)).toEqual({ first: '', last: '' })
  })

  // Las dos partes, unidas con un espacio, deben devolver el dato de config.
  it('no pierde nada del nombre corto de config', () => {
    const { first, last } = splitName(site.shortName)

    expect(first).not.toBe('')
    expect(last).not.toBe('')
    expect(`${first} ${last}`).toBe(site.shortName)
  })
})
