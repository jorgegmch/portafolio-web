import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { developer } from '@/config/developer'
import { site } from '@/config/site'
import { getEmail } from '@/lib/assembleContact'

// Datos de la terminal de «Sobre mí», los mismos de examples/java/Developer.java.
// No se traducen: la salida es idéntica en los dos idiomas.
const source = readFileSync('src/config/developer.ts', 'utf8')

const values = Object.values(developer.values)

describe('terminal del desarrollador', () => {
  it('el comando es el que ejecuta el ejemplo de Java', () => {
    expect(developer.command).toBe('java Developer')
  })

  it('los campos salen en este orden', () => {
    expect(developer.fields).toEqual(['name', 'age', 'location', 'role', 'passion'])
  })

  it('la pasión es la aprobada', () => {
    expect(developer.values.passion).toBe('Coding the future')
  })

  describe('una sola fuente', () => {
    it('el nombre, la ubicación y el rol son los de site', () => {
      expect(developer.values.name).toBe(site.legalName)
      expect(developer.values.location).toBe(site.locationShort)
      expect(developer.values.role).toBe(site.role)
    })

    // Que coincidan no basta: escritos otra vez aquí, se separarían al cambiar site.
    it.each([
      ['el nombre', site.legalName],
      ['la ubicación', site.locationShort],
      ['el rol', site.role],
    ])('%s no se vuelve a escribir en este archivo', (_, value) => {
      expect(source).not.toContain(value)
    })
  })

  describe('la edad', () => {
    // Es en vivo: la pone la sección con useAge.
    it('es un campo, pero no tiene valor aquí', () => {
      expect(developer.fields).toContain('age')
      expect(developer.values).not.toHaveProperty('age')
    })

    it('todos los demás campos tienen su valor, y ninguno de más', () => {
      expect(Object.keys(developer.values)).toEqual(
        developer.fields.filter((field) => field !== 'age'),
      )
      values.forEach((value) => expect(value.trim()).not.toBe(''))
    })
  })

  describe('datos personales', () => {
    // Sin cifras no caben ni una fecha de nacimiento ni un teléfono.
    it('ningún valor lleva cifras', () => {
      values.forEach((value) => expect(value).not.toMatch(/\d/))
    })

    it('ningún valor lleva el correo ni una arroba', () => {
      const email = getEmail()
      const [localPart = ''] = email.split('@')

      expect(localPart).not.toBe('')
      values.forEach((value) => {
        expect(value).not.toContain('@')
        expect(value).not.toContain(email)
        expect(value).not.toContain(localPart)
      })
    })

    it('el archivo no trae cifras ni arrobas, tampoco en comentarios', () => {
      expect(source).not.toMatch(/\d/)
      expect(source.replaceAll("'@/", "'")).not.toContain('@')
    })
  })
})
