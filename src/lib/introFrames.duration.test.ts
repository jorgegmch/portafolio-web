import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'
import {
  buildIntroFrames,
  INTRO_FRAME_DRIFT_MS,
  INTRO_MAX_TOTAL_MS,
  INTRO_MIN_TOTAL_MS,
  INTRO_TIMING,
} from '@/lib/introFrames'

// Los tokens se leen de disco, desde la raíz del repo, porque Vitest no
// procesa el CSS (css: false).
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8').replace(CSS_COMMENT, '')

/** Primer valor de un token: el de :root, antes de los @media. */
const tokenValue = (token: string) =>
  new RegExp(`${token}:\\s*([^;]+);`).exec(tokensCss)?.[1] ?? ''

/** «550ms» o «2.2s», en ms. */
const toMs = (value: string) =>
  value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000

const exitValue = tokenValue('--dur-intro-exit')
const exitMs = toMs(exitValue)

// Mayor retraso por fotograma medido en Chrome sobre el build de producción
// (8 pasadas por idioma): entre 5,0 y 6,3 ms. Si se vuelve a medir y sube,
// se actualiza aquí y el margen debe seguir cubriéndolo.
const MEASURED_MAX_DRIFT_MS = 6.3

const framesOf = (lang: (typeof LANGS)[number]) => {
  const phrase = dictionaries[lang].intro.phrases[0]
  if (!phrase) throw new Error(`El diccionario ${lang} no tiene ninguna frase para la intro`)
  return buildIntroFrames(phrase.code)
}

/** Lo que suman las pausas, sin contar lo que tarda cada temporizador de más. */
const sequenceMs = (lang: (typeof LANGS)[number]) =>
  framesOf(lang).reduce((total, frame) => total + frame.holdMs, 0)

describe('duración de la intro', () => {
  describe('constantes', () => {
    // La spec fija el tope en --dur-intro: el token y la constante no se separan.
    it('el tope es el --dur-intro de los tokens, 2,2 s', () => {
      expect(toMs(tokenValue('--dur-intro'))).toBe(INTRO_MAX_TOTAL_MS)
      expect(INTRO_MAX_TOTAL_MS).toBe(2200)
    })

    it('el mínimo queda por debajo del tope', () => {
      expect(INTRO_MIN_TOTAL_MS).toBeLessThan(INTRO_MAX_TOTAL_MS)
    })

    it('la apertura de las barras se lee del token, en ms', () => {
      expect(exitValue).toMatch(/^\d+ms$/)
      expect(exitMs).toBeGreaterThan(0)
    })

    it('el respaldo de JS espera más que la apertura de las barras', () => {
      expect(INTRO_TIMING.exitFallbackMs).toBeGreaterThan(exitMs)
    })

    it('el margen por fotograma cubre el mayor retraso medido en Chrome', () => {
      expect(INTRO_FRAME_DRIFT_MS).toBeGreaterThanOrEqual(MEASURED_MAX_DRIFT_MS)
    })
  })

  describe.each(LANGS)('en %s', (lang) => {
    // Cada temporizador encadenado llega algo tarde: se cuenta ese margen.
    it('con el retraso de cada fotograma y la apertura de las barras, no supera el tope', () => {
      const drift = framesOf(lang).length * INTRO_FRAME_DRIFT_MS

      expect(sequenceMs(lang) + drift + exitMs).toBeLessThanOrEqual(INTRO_MAX_TOTAL_MS)
    })

    // El caso más rápido posible: ningún temporizador se retrasa.
    it('sin ningún retraso, con la apertura de las barras, no baja del mínimo', () => {
      expect(sequenceMs(lang) + exitMs).toBeGreaterThanOrEqual(INTRO_MIN_TOTAL_MS)
    })
  })
})
