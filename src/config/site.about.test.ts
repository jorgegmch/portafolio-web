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

  // El punto del mapa. Fuente: DIVIPOLA del DANE, corte al 30 de diciembre de
  // 2024, conjunto «DIVIPOLA - Códigos cabeceras - Centros poblados» de
  // datos.gov.co (xaxy-8nri), fila 68547000, cabecera municipal de Piedecuesta.
  describe('coordenadas de la ciudad', () => {
    const CABECERA = { lat: 6.997245, lon: -73.054795 }
    /** Cifras tras el punto decimal. */
    const decimals = (value: number) => (String(value).split('.')[1] ?? '').length

    it('son la cabecera municipal del DANE, redondeada a un decimal', () => {
      expect(site.coordinates).toEqual({
        lat: Math.round(CABECERA.lat * 10) / 10,
        lon: Math.round(CABECERA.lon * 10) / 10,
      })
    })

    // Nivel de ciudad: un decimal son unos 11 km.
    it('llevan un decimal como máximo', () => {
      expect(decimals(site.coordinates.lat)).toBeLessThanOrEqual(1)
      expect(decimals(site.coordinates.lon)).toBeLessThanOrEqual(1)
    })

    // Caja que cubre todas las cabeceras municipales del mismo conjunto, de
    // Leticia a Providencia y de San Andrés a Puerto Carreño. Es una caja, no
    // la frontera: el test anterior es el que fija el punto.
    it('caen dentro de Colombia', () => {
      expect(site.coordinates.lat).toBeGreaterThanOrEqual(-4.2)
      expect(site.coordinates.lat).toBeLessThanOrEqual(13.4)
      expect(site.coordinates.lon).toBeGreaterThanOrEqual(-81.8)
      expect(site.coordinates.lon).toBeLessThanOrEqual(-67.4)
    })
  })
})
