import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { developer } from '@/config/developer'
import { site } from '@/config/site'
import { getEmail } from '@/lib/assembleContact'

// El ejemplo de Java imprime lo mismo que la terminal de «Sobre mí». Se lee
// como texto: el test no compila ni ejecuta Java.
const bytes = readFileSync('examples/java/Developer.java')
const source = new TextDecoder().decode(bytes)

/** Si `needle` aparece tal cual, byte a byte, dentro de `haystack`. */
const containsBytes = (haystack: Uint8Array, needle: readonly number[]) =>
  haystack.some((_, start) => needle.every((byte, offset) => haystack[start + offset] === byte))

/** Nombre del record y sus componentes, como pares [tipo, nombre]. */
const header = source.match(/public record (\w+)\(([^)]*)\)/)
const recordName = header?.[1]
const components = (header?.[2] ?? '')
  .split(',')
  .map((component) => component.trim().split(/\s+/))

/** Argumentos de `new Developer(...)`, en orden: literales de texto y números. */
const call = source.match(/new Developer\(([^;]*)\);/)?.[1] ?? ''
const args = call.match(/"[^"]*"|\d+/g) ?? []
const ageLiteral = args[developer.fields.indexOf('age')]

/** Cada línea que imprime, como pares [etiqueta, componente]. */
const prints = [
  ...source.matchAll(/System\.out\.println\("([^"]*): " \+ developer\.(\w+)\(\)\);/g),
].map(([, label, accessor]) => [label, accessor])

describe('ejemplo de Java', () => {
  describe('codificación', () => {
    it('es UTF-8 válido', () => {
      expect(() => new TextDecoder('utf-8', { fatal: true }).decode(bytes)).not.toThrow()
    })

    // Guardado en windows-1252, la «ó» sería un solo byte, F3.
    it('la «ó» de «Gómez» ocupa los bytes C3 B3', () => {
      const gomez = [0x47, 0xc3, 0xb3, 0x6d, 0x65, 0x7a]

      expect(containsBytes(bytes, gomez)).toBe(true)
    })

    it('la tilde va escrita, sin escapes \\u', () => {
      expect(source).not.toMatch(/\\u[0-9a-fA-F]{4}/)
    })

    // javac no acepta la marca de orden de bytes al principio del archivo.
    it('no empieza con BOM', () => {
      expect([...bytes.subarray(0, 3)]).not.toEqual([0xef, 0xbb, 0xbf])
    })
  })

  describe('el record', () => {
    it('es la clase que ejecuta el comando de la terminal', () => {
      expect(recordName).toBe('Developer')
      expect(developer.command).toBe(`java ${recordName}`)
    })

    it('sus componentes son los campos de config, en el mismo orden', () => {
      expect(components.map(([, name]) => name)).toEqual([...developer.fields])
    })

    it('la edad es un int; los demás campos, String', () => {
      expect(components).toEqual(
        developer.fields.map((field) => [field === 'age' ? 'int' : 'String', field]),
      )
    })
  })

  describe('valores', () => {
    // De la edad solo se comprueba la forma: es un literal y no cambia solo.
    it('cada argumento es el valor de config de su campo; la edad, un entero', () => {
      expect(args).toEqual(
        developer.fields.map((field) =>
          field === 'age'
            ? expect.stringMatching(/^\d{1,3}$/)
            : JSON.stringify(developer.values[field]),
        ),
      )
    })

    it('el nombre, la ubicación y el rol son los de site, tal cual', () => {
      expect(source).toContain(`"${site.legalName}"`)
      expect(source).toContain(`"${site.locationShort}"`)
      expect(source).toContain(`"${site.role}"`)
    })
  })

  describe('salida', () => {
    it('imprime una línea por campo, con la etiqueta de config, en orden', () => {
      expect(prints).toEqual(developer.fields.map((field) => [developer.labels[field], field]))
    })
  })

  describe('datos personales', () => {
    it('no lleva arrobas, ni el correo ni su parte local', () => {
      const email = getEmail()
      const [localPart = ''] = email.split('@')

      expect(localPart).not.toBe('')
      expect(source).not.toContain('@')
      expect(source).not.toContain(email)
      expect(source).not.toContain(localPart)
    })

    // Así no caben una fecha de nacimiento ni un teléfono.
    it('el único número del archivo es la edad', () => {
      expect(ageLiteral).toMatch(/^\d{1,3}$/)
      expect(source.match(/\d+/g)).toEqual([ageLiteral])
    })

    it('nada tiene forma de fecha', () => {
      expect(source).not.toMatch(/\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/)
    })
  })
})
