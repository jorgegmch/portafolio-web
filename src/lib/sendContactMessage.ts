import type { ContactNeedId } from '@/data/contactNeeds'

/** Lo que se enviaría al servidor: los campos ya sin espacios en los extremos. */
export interface ContactMessage {
  name: string
  email: string
  company: string
  needs: readonly ContactNeedId[]
  message: string
}

/**
 * Resultado del envío. `not-configured`: todavía no hay a dónde enviar;
 * `failed`: el envío se intentó y no salió.
 */
export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' }

/** Interfaz del envío: el formulario no sabe cómo ni a dónde se manda. */
export type SendContactMessage = (payload: ContactMessage) => Promise<SendResult>

/**
 * Adaptador actual (spec §5): el envío está pendiente de decisión del autor,
 * así que no envía nada. No hace ninguna petición de red ni lleva claves:
 * devuelve un error controlado y el formulario ofrece «Copiar correo».
 *
 * Los requisitos de seguridad del futuro backend están en
 * docs/FORMULARIO-CONTACTO.md.
 */
export const sendContactMessage: SendContactMessage = () =>
  Promise.resolve({ ok: false, reason: 'not-configured' })
