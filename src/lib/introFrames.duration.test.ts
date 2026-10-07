import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'
import {
  buildIntroFrames,
  INTRO_FRAME_DRIFT_MS,
  INTRO_MAX_TOTAL_MS,
  INTRO_MIN_TOTAL_MS,
} from '@/lib/introFrames'

// El desvanecimiento dura lo que diga el token: se lee de disco, desde la raíz
// del repo, porque Vitest no procesa el CSS (css: false).
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8').replace(CSS_COMMENT, '')
const FADE_TOKEN = '--duration-slow'
/** Primer valor del token: el de :root, antes de los @media. */
const fadeValue = new RegExp(`${FADE_TOKEN}:\\s*([^;]+);`).exec(tokensCss)?.[1] ?? ''
const fadeMs = Number.parseFloat(fadeValue)

// Mayor retraso por fotograma medido en Chrome sobre el build de producción
// (8 pasadas por idioma): entre 5,0 y 6,3 ms. Si se vuelve a medir y sube,
// se actualiza aquí y el margen debe seguir cubriéndolo.
const MEASURED_MAX_DRIFT_MS = 6.3

const framesOf = (lang: (typeof LANGS)[number]) => {
  const phrase = dictionaries[lang].intro.phrases[0]
  if (!phrase) throw new Error(`El diccionario ${lang} no tiene ninguna frase para la intro`)
  return buildIntroFrames(phrase.natural, phrase.code)
}

/** Lo que suman las pausas, sin contar lo que tarda cada temporizador de más. */
const sequenceMs = (lang: (typeof LANGS)[number]) =>
  framesOf(lang).reduce((total, frame) => total + frame.holdMs, 0)

describe('duración de la intro', () => {
  describe('constantes', () => {
    it('el mínimo es de 3 s y el tope de 4 s', () => {
      expect(INTRO_MIN_TOTAL_MS).toBe(3000)
      expect(INTRO_MAX_TOTAL_MS).toBe(4000)
    })

    it('el desvanecimiento se lee del token, en ms', () => {
      expect(fadeValue).toMatch(/^\d+ms$/)
      expect(fadeMs).toBeGreaterThan(0)
    })

    it('el margen por fotograma cubre el mayor retraso medido en Chrome', () => {
      expect(INTRO_FRAME_DRIFT_MS).toBeGreaterThanOrEqual(MEASURED_MAX_DRIFT_MS)
    })
  })

  describe.each(LANGS)('en %s', (lang) => {
    // Cada temporizador encadenado llega algo tarde: se cuenta ese margen.
    it('con el retraso de cada fotograma y el desvanecimiento, no supera el tope', () => {
      const drift = framesOf(lang).length * INTRO_FRAME_DRIFT_MS

      expect(sequenceMs(lang) + drift + fadeMs).toBeLessThanOrEqual(INTRO_MAX_TOTAL_MS)
    })

    // El caso más rápido posible: ningún temporizador se retrasa.
    it('sin ningún retraso, con el desvanecimiento, no baja del mínimo', () => {
      expect(sequenceMs(lang) + fadeMs).toBeGreaterThanOrEqual(INTRO_MIN_TOTAL_MS)
    })
  })
})
