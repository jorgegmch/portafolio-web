import { CONTACT_OFFSET, encodedContact } from '@/config/contact'

/**
 * Reconstruye el email y el WhatsApp a partir de los códigos de
 * config/contact. Estas funciones deben llamarse bajo demanda (al hacer
 * clic), nunca al renderizar: así el dato no existe en el DOM al cargar.
 *
 * Es ofuscación contra scrapers simples, no protección real.
 */

export const encodeText = (text: string, offset: number = CONTACT_OFFSET): number[] =>
  [...text].map((char) => char.charCodeAt(0) + offset)

export const decodeText = (codes: readonly number[], offset: number = CONTACT_OFFSET): string =>
  String.fromCharCode(...codes.map((code) => code - offset))

export const getEmail = (): string => decodeText(encodedContact.email)

export const getEmailUrl = (): string => `mailto:${getEmail()}`

export const getWhatsappUrl = (): string => `https://wa.me/${decodeText(encodedContact.whatsapp)}`
