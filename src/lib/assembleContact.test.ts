import { describe, expect, it } from 'vitest'
import { encodedContact } from '@/config/contact'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

// Estos tests comprueban la forma del resultado, nunca el valor: el repo es
// público y escribir aquí el correo o el número anularía la ofuscación.
describe('assembleContact', () => {
  it('el email decodificado tiene forma de correo, con una sola @', () => {
    const email = getEmail()
    expect(email).toMatch(/^[a-z0-9._-]+@[a-z0-9-]+(\.[a-z]{2,})+$/)
    expect(email.split('@')).toHaveLength(2)
  })

  it('la URL de email es un mailto: con ese correo', () => {
    expect(getEmailUrl()).toBe(`mailto:${getEmail()}`)
  })

  it('la URL de WhatsApp es wa.me con solo dígitos e indicativo de Colombia', () => {
    expect(getWhatsappUrl()).toMatch(/^https:\/\/wa\.me\/57\d{10}$/)
  })

  it('los códigos guardados no son el texto en claro', () => {
    expect(String.fromCharCode(...encodedContact.email)).not.toContain('@')
    expect(String.fromCharCode(...encodedContact.whatsapp)).not.toMatch(/^\d+$/)
  })
})
