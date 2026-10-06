import { BIRTH_DATE_OFFSET, site } from '@/config/site'
import type { DateParts } from '@/lib/calculateAge'
import { decodeText } from '@/lib/textCodes'

/**
 * Reconstruye la fecha de nacimiento a partir de los códigos de config/site.
 * A diferencia del contacto, se decodifica al renderizar, porque la edad se
 * muestra; al DOM solo debe llegar la edad, nunca la fecha.
 *
 * Es ofuscación contra scrapers simples, no protección real.
 */

/** Los códigos representan la cadena AAAA-MM-DD. */
export const parseBirthDate = (codes: readonly number[], offset: number): DateParts => {
  const [year = NaN, month = NaN, day = NaN] = decodeText(codes, offset).split('-').map(Number)
  return { year, month, day }
}

export const getBirthDate = (): DateParts => parseBirthDate(site.birthDateCodes, BIRTH_DATE_OFFSET)
