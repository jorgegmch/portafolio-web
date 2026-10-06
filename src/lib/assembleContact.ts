import { CONTACT_OFFSET, encodedContact } from '@/config/contact'
import { decodeText } from '@/lib/textCodes'

/**
 * Reconstruye el email y el WhatsApp a partir de los códigos de
 * config/contact. Estas funciones deben llamarse bajo demanda (al hacer
 * clic), nunca al renderizar: así el dato no existe en el DOM al cargar.
 *
 * Es ofuscación contra scrapers simples, no protección real.
 */

export const getEmail = (): string => decodeText(encodedContact.email, CONTACT_OFFSET)

export const getEmailUrl = (): string => `mailto:${getEmail()}`

export const getWhatsappUrl = (): string =>
  `https://wa.me/${decodeText(encodedContact.whatsapp, CONTACT_OFFSET)}`
