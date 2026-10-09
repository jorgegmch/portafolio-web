import { describe, expect, it } from 'vitest'
import { AVAILABLE_FOR_FREELANCE } from '@/config/availability'
import { site } from '@/config/site'

describe('disponibilidad', () => {
  it('el interruptor es un booleano', () => {
    expect(typeof AVAILABLE_FOR_FREELANCE).toBe('boolean')
  })

  // El estado se decide en un solo sitio: site ya no lleva su propia lista.
  it('site no guarda otro estado', () => {
    expect(site).not.toHaveProperty('status')
  })
})
