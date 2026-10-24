import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendContactMessage } from '@/lib/sendContactMessage'

const PAYLOAD = {
  name: 'Ana',
  email: 'ana@empresa.co',
  company: '',
  needs: ['backend'] as const,
  message: 'Necesito una API para mi tienda.',
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// Spec §5: el envío está pendiente de decisión del autor. El adaptador de hoy
// no envía nada y devuelve un error controlado.
describe('sendContactMessage (adaptador sin backend)', () => {
  it('devuelve un error controlado: todavía no hay a dónde enviar', async () => {
    await expect(sendContactMessage(PAYLOAD)).resolves.toEqual({ ok: false, reason: 'not-configured' })
  })

  it('no hace ninguna petición de red', async () => {
    const fetch = vi.fn()
    const sendBeacon = vi.fn()
    vi.stubGlobal('fetch', fetch)
    vi.stubGlobal('navigator', { ...navigator, sendBeacon })
    const open = vi.spyOn(XMLHttpRequest.prototype, 'open')

    await sendContactMessage(PAYLOAD)

    expect(fetch).not.toHaveBeenCalled()
    expect(sendBeacon).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
  })

  // Ninguna clave ni dirección en el código del cliente.
  it('su código no lleva URLs, claves ni llamadas de red', () => {
    const source = readFileSync('src/lib/sendContactMessage.ts', 'utf8')

    expect(source).not.toMatch(/https?:\/\/|fetch\(|XMLHttpRequest|sendBeacon|import\.meta\.env|api[_-]?key|token/i)
  })
})
