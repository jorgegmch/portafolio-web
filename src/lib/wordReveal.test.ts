import { describe, expect, it } from 'vitest'
import { PARAGRAPH_PAUSE_MS, WORD_STEP_MS } from '@/config/aboutMotion'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'
import { wordRevealSchedule, type WordRevealSchedule } from '@/lib/wordReveal'

const TIMING = { stepMs: WORD_STEP_MS, pauseMs: PARAGRAPH_PAUSE_MS }

/** Solo los retrasos, párrafo a párrafo. */
const delaysOf = (schedule: WordRevealSchedule) =>
  schedule.paragraphs.map((words) => words.map(({ delayMs }) => delayMs))

/** Solo los textos, párrafo a párrafo. */
const textsOf = (schedule: WordRevealSchedule) =>
  schedule.paragraphs.map((words) => words.map(({ text }) => text))

describe('wordRevealSchedule', () => {
  it('el ritmo de la bio es de 30 ms por palabra y 200 ms de pausa entre párrafos', () => {
    expect(WORD_STEP_MS).toBe(30)
    expect(PARAGRAPH_PAUSE_MS).toBe(200)
  })

  it('la primera palabra empieza a los 0 ms', () => {
    const [first] = wordRevealSchedule(['uno dos tres'], TIMING).paragraphs[0] ?? []

    expect(first).toEqual({ text: 'uno', delayMs: 0 })
  })

  it('las palabras de un mismo párrafo avanzan de 30 en 30 ms', () => {
    expect(delaysOf(wordRevealSchedule(['uno dos tres cuatro'], TIMING))).toEqual([[0, 30, 60, 90]])
  })

  // La cuenta de palabras sigue de un párrafo al siguiente, y cada párrafo
  // nuevo suma una pausa más.
  it('al cambiar de párrafo se suma la pausa, sin volver a empezar la cuenta', () => {
    expect(delaysOf(wordRevealSchedule(['uno dos', 'tres cuatro', 'cinco'], TIMING))).toEqual([
      [0, 30],
      [60 + 200, 90 + 200],
      [120 + 400],
    ])
  })

  it('el primer párrafo no lleva pausa', () => {
    expect(delaysOf(wordRevealSchedule(['uno', 'dos'], TIMING))).toEqual([[0], [30 + 200]])
  })

  describe('párrafos vacíos', () => {
    it('no aportan palabras ni pausa', () => {
      expect(delaysOf(wordRevealSchedule(['uno dos', '', 'tres'], TIMING))).toEqual([
        [0, 30],
        [],
        [60 + 200],
      ])
    })

    it('uno vacío al principio no adelanta la pausa del primero con palabras', () => {
      expect(delaysOf(wordRevealSchedule(['', '   ', 'uno dos'], TIMING))).toEqual([[], [], [0, 30]])
    })
  })

  it('devuelve un párrafo por cada texto, en el mismo orden', () => {
    expect(textsOf(wordRevealSchedule(['a b', 'c', 'd e f'], TIMING))).toEqual([
      ['a', 'b'],
      ['c'],
      ['d', 'e', 'f'],
    ])
  })

  it('la puntuación va pegada a su palabra', () => {
    expect(textsOf(wordRevealSchedule(['Hola, (mundo). ¿Sí?'], TIMING))).toEqual([
      ['Hola,', '(mundo).', '¿Sí?'],
    ])
  })

  // Un texto de prueba con espacios dobles, tabulador, salto de línea y
  // espacios en los bordes: ninguna «palabra» vacía, y el ritmo no se alarga.
  it('con espacios dobles, tabuladores o saltos de línea no salen palabras vacías', () => {
    const schedule = wordRevealSchedule(['  uno  dos\ttres \n cuatro  '], TIMING)

    expect(textsOf(schedule)).toEqual([['uno', 'dos', 'tres', 'cuatro']])
    expect(delaysOf(schedule)).toEqual([[0, 30, 60, 90]])
  })

  describe('retraso de la última palabra', () => {
    it('es el de la última palabra del último párrafo con palabras', () => {
      expect(wordRevealSchedule(['uno dos', 'tres cuatro', 'cinco', ''], TIMING).lastDelayMs).toBe(520)
    })

    it('sin ninguna palabra es 0', () => {
      expect(wordRevealSchedule([], TIMING).lastDelayMs).toBe(0)
      expect(wordRevealSchedule(['', '  '], TIMING).lastDelayMs).toBe(0)
    })
  })

  it('usa el ritmo que recibe', () => {
    const schedule = wordRevealSchedule(['a b', 'c'], { stepMs: 10, pauseMs: 5 })

    expect(delaysOf(schedule)).toEqual([[0, 10], [25]])
    expect(schedule.lastDelayMs).toBe(25)
  })

  describe('con la bio de los diccionarios', () => {
    it.each(LANGS)('en %s, unir las palabras de cada párrafo con un espacio da el párrafo exacto', (lang) => {
      const { bio } = dictionaries[lang].about
      const schedule = wordRevealSchedule(bio, TIMING)

      expect(schedule.paragraphs).toHaveLength(bio.length)
      schedule.paragraphs.forEach((words, index) => {
        expect(words.map(({ text }) => text).join(' ')).toBe(bio[index])
      })
    })

    // Guarda: si la bio crece o el ritmo cambia, la escritura no debe
    // alargarse sin que nadie lo note.
    it.each(LANGS)('en %s, la última palabra empieza entre los 5 y los 7 s', (lang) => {
      const { lastDelayMs } = wordRevealSchedule(dictionaries[lang].about.bio, TIMING)

      expect(lastDelayMs).toBeGreaterThanOrEqual(5000)
      expect(lastDelayMs).toBeLessThanOrEqual(7000)
    })
  })
})
