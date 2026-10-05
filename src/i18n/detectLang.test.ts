import { describe, expect, it } from 'vitest'
import { detectLang, type LangSources } from '@/i18n/detectLang'

const detect = (sources: Partial<LangSources> = {}) =>
  detectLang({ search: '', stored: null, browserLangs: [], ...sources })

describe('detectLang', () => {
  describe('prioridad entre fuentes', () => {
    it('?lang= gana sobre localStorage y navegador', () => {
      expect(detect({ search: '?lang=en', stored: 'es', browserLangs: ['es'] })).toBe('en')
    })

    it('sin ?lang=, localStorage gana sobre el navegador', () => {
      expect(detect({ stored: 'en', browserLangs: ['es'] })).toBe('en')
    })

    it('sin ?lang= ni localStorage, usa el navegador', () => {
      expect(detect({ browserLangs: ['en'] })).toBe('en')
    })

    it('sin ninguna fuente, devuelve es', () => {
      expect(detect()).toBe('es')
    })
  })

  describe('parámetro ?lang=', () => {
    it.each([
      ['?lang=es', 'es'],
      ['?lang=en', 'en'],
    ])('acepta %s', (search, expected) => {
      // El navegador apunta al idioma contrario para probar que manda la URL.
      const browserLangs = [expected === 'es' ? 'en' : 'es']
      expect(detect({ search, browserLangs })).toBe(expected)
    })

    it('ignora mayúsculas', () => {
      expect(detect({ search: '?lang=EN' })).toBe('en')
    })

    it('descarta un valor no soportado y pasa a la siguiente fuente', () => {
      expect(detect({ search: '?lang=fr', stored: 'en' })).toBe('en')
    })

    it('descarta un valor vacío y pasa a la siguiente fuente', () => {
      expect(detect({ search: '?lang=', stored: 'en' })).toBe('en')
    })

    it('funciona junto a otros parámetros', () => {
      expect(detect({ search: '?utm=x&lang=en' })).toBe('en')
    })

    it('acepta la query sin "?" inicial', () => {
      expect(detect({ search: 'lang=en' })).toBe('en')
    })

    it('si el parámetro se repite, toma el primero', () => {
      expect(detect({ search: '?lang=en&lang=es' })).toBe('en')
    })
  })

  describe('localStorage', () => {
    it.each(['fr', '', 'null'])('descarta el valor inválido "%s" y pasa al navegador', (stored) => {
      expect(detect({ stored, browserLangs: ['en'] })).toBe('en')
    })
  })

  describe('navegador', () => {
    it.each([
      ['es-CO', 'en-US', 'es'],
      ['en-US', 'es-CO', 'en'],
    ])('reconoce la variante regional %s (seguida de %s) como %s', (tag, next, expected) => {
      // Detrás va el otro idioma: si la variante no se reconociera, el
      // resultado sería el contrario y no el valor por defecto.
      expect(detect({ browserLangs: [tag, next] })).toBe(expected)
    })

    it('recorre la lista en orden y toma el primer idioma soportado', () => {
      expect(detect({ browserLangs: ['pt-BR', 'en-US', 'es'] })).toBe('en')
    })

    it('si ningún idioma está soportado, devuelve es', () => {
      expect(detect({ browserLangs: ['fr-FR', 'de'] })).toBe('es')
    })

    it('con la lista vacía, devuelve es', () => {
      expect(detect({ browserLangs: [] })).toBe('es')
    })
  })
})
