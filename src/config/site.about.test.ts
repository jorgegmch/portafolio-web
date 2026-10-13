import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'

// Datos de la sección «Sobre mí» que se escriben una sola vez: de la fecha de
// inicio sale el tiempo programando, y la ubicación corta es la de la terminal.
describe('datos de «Sobre mí»', () => {
  describe('inicio como programador', () => {
    it('es agosto de 2025', () => {
      expect(site.codingSince).toBe('2025-08')
    })

    // Solo año y mes: el día no se registra.
    it('va como año y mes, con el mes de 01 a 12', () => {
      expect(site.codingSince).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
    })

    it('no es posterior al año de publicación del sitio', () => {
      expect(Number(site.codingSince.split('-')[0])).toBeLessThanOrEqual(site.publishedYear)
    })
  })

  describe('ubicación corta', () => {
    it('es la ciudad y el código del país', () => {
      expect(site.locationShort).toBe('Piedecuesta, CO')
    })

    // Nivel de ciudad, nunca más detalle: la misma ciudad de la ubicación completa.
    it('nombra la misma ciudad que la ubicación completa', () => {
      const [city] = site.location.split(', ')

      expect(site.locationShort.split(', ')[0]).toBe(city)
    })
  })
})
