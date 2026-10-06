import { describe, expect, it } from 'vitest'
import { decodeText, encodeText } from '@/lib/textCodes'

const OFFSET = 3

describe('textCodes', () => {
  it('codifica y decodifica un texto de ida y vuelta', () => {
    const text = 'persona@example.com'
    expect(decodeText(encodeText(text, OFFSET), OFFSET)).toBe(text)
  })

  it('el texto codificado no coincide con el original', () => {
    const codes = encodeText('persona@example.com', OFFSET)
    expect(String.fromCharCode(...codes)).not.toContain('@')
    expect(codes[0]).toBe('p'.charCodeAt(0) + OFFSET)
  })
})
