/**
 * Email y WhatsApp guardados como códigos de carácter desplazados, para que
 * no aparezcan como texto literal ni en el HTML ni en el bundle. Se
 * reconstruyen en runtime (ver lib/assembleContact).
 *
 * OJO: esto es ofuscación contra scrapers simples que buscan patrones de
 * correo o teléfono en el código fuente. NO es protección real: cualquiera
 * que ejecute el JavaScript o lea este archivo puede recuperar los datos.
 * No guardes aquí nada que deba mantenerse en secreto.
 *
 * Para cambiar un dato, genera sus códigos con:
 *   [...'texto'].map((c) => c.charCodeAt(0) + CONTACT_OFFSET)
 */
export const CONTACT_OFFSET = 7

export const encodedContact = {
  email: [
    110, 118, 116, 108, 129, 113, 118, 121, 110, 108, 53, 106, 111, 71, 110, 116, 104, 112, 115,
    53, 106, 118, 116,
  ],
  /** Solo dígitos, con indicativo de país, en el formato que espera wa.me. */
  whatsapp: [60, 62, 58, 56, 55, 62, 59, 58, 60, 59, 55, 56],
} as const
