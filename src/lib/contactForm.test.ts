import { describe, expect, it } from 'vitest'
import {
  type ContactFormValues,
  EMPTY_CONTACT_FORM,
  firstInvalidField,
  MESSAGE_MIN_LENGTH,
  validateContactForm,
} from '@/lib/contactForm'

/** Un formulario que vale, con lo que se le cambie encima. */
const form = (changes: Partial<ContactFormValues> = {}): ContactFormValues => ({
  name: 'Ana',
  email: 'ana@empresa.co',
  company: '',
  needs: [],
  message: 'Necesito una API para mi tienda.',
  ...changes,
})

describe('validateContactForm', () => {
  it('un formulario completo no tiene errores', () => {
    expect(validateContactForm(form())).toEqual({})
  })

  it('el formulario vacío marca los tres obligatorios', () => {
    expect(validateContactForm(EMPTY_CONTACT_FORM)).toEqual({ name: true, email: true, message: true })
  })

  describe('nombre', () => {
    it.each(['', '   ', '\t\n'])('vacío o solo espacios (%j) es un error', (name) => {
      expect(validateContactForm(form({ name }))).toEqual({ name: true })
    })

    it('una letra basta', () => {
      expect(validateContactForm(form({ name: 'J' }))).toEqual({})
    })
  })

  describe('correo', () => {
    it.each(['ana@empresa.co', 'a.b+c@sub.dominio.com', '  ana@empresa.co  '])('%j vale', (email) => {
      expect(validateContactForm(form({ email }))).toEqual({})
    })

    it.each(['', 'ana', 'ana@', 'ana@empresa', '@empresa.co', 'ana @empresa.co', 'ana@empresa .co', 'ana@@empresa.co'])(
      '%j no vale',
      (email) => {
        expect(validateContactForm(form({ email }))).toEqual({ email: true })
      },
    )
  })

  describe('mensaje', () => {
    it(`con ${MESSAGE_MIN_LENGTH} caracteres vale`, () => {
      expect(validateContactForm(form({ message: 'x'.repeat(MESSAGE_MIN_LENGTH) }))).toEqual({})
    })

    it(`con ${MESSAGE_MIN_LENGTH - 1} es un error`, () => {
      expect(validateContactForm(form({ message: 'x'.repeat(MESSAGE_MIN_LENGTH - 1) }))).toEqual({
        message: true,
      })
    })

    it('los espacios de los extremos no cuentan', () => {
      const padded = `   ${'x'.repeat(MESSAGE_MIN_LENGTH - 1)}   `

      expect(padded.length).toBeGreaterThan(MESSAGE_MIN_LENGTH)
      expect(validateContactForm(form({ message: padded }))).toEqual({ message: true })
    })
  })

  it('empresa y «¿Qué necesitas?» son opcionales', () => {
    expect(validateContactForm(form({ company: '', needs: [] }))).toEqual({})
    expect(validateContactForm(form({ company: 'Gaseosas del Valle', needs: ['backend'] }))).toEqual({})
  })
})

describe('firstInvalidField', () => {
  it('es el primero en el orden del formulario: nombre, correo y mensaje', () => {
    expect(firstInvalidField({ name: true, email: true, message: true })).toBe('name')
    expect(firstInvalidField({ email: true, message: true })).toBe('email')
    expect(firstInvalidField({ message: true })).toBe('message')
  })

  it('sin errores es null', () => {
    expect(firstInvalidField({})).toBeNull()
  })
})
