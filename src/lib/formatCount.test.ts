import { describe, expect, it } from 'vitest'
import { formatCount } from '@/lib/formatCount'

describe('formatCount', () => {
  it.each(['prefix', 'suffix'] as const)('una cifra exacta va sola, con «%s»', (position) => {
    expect(formatCount({ value: 7, approximate: false }, position)).toBe('7')
    expect(formatCount({ value: 0, approximate: false }, position)).toBe('0')
    expect(formatCount({ value: 30, approximate: false }, position)).toBe('30')
  })

  it('una cifra aproximada lleva el «+» delante si el idioma lo pone delante', () => {
    expect(formatCount({ value: 1, approximate: true }, 'prefix')).toBe('+1')
    expect(formatCount({ value: 20, approximate: true }, 'prefix')).toBe('+20')
  })

  it('una cifra aproximada lleva el «+» detrás si el idioma lo pone detrás', () => {
    expect(formatCount({ value: 1, approximate: true }, 'suffix')).toBe('1+')
    expect(formatCount({ value: 20, approximate: true }, 'suffix')).toBe('20+')
  })

  it('el «+» va pegado a la cifra, sin espacios', () => {
    expect(formatCount({ value: 20, approximate: true }, 'prefix')).not.toMatch(/\s/)
    expect(formatCount({ value: 20, approximate: true }, 'suffix')).not.toMatch(/\s/)
  })
})
