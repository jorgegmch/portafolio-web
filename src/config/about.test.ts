import { describe, expect, it } from 'vitest'
import { HIGHLIGHT_PHRASE } from '@/config/about'

describe('interruptores de «Sobre mí»', () => {
  // Decisión del autor: la frase grande va entera en blanco salvo que se encienda.
  it('el resalte de la frase grande está apagado por defecto', () => {
    expect(HIGHLIGHT_PHRASE).toBe(false)
  })
})
