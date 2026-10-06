/**
 * Convierte un texto en códigos de carácter desplazados y viceversa, para
 * que un dato no quede como texto literal ni en el repo ni en el bundle.
 *
 * Es ofuscación contra scrapers simples, no protección real.
 */

export const encodeText = (text: string, offset: number): number[] =>
  [...text].map((char) => char.charCodeAt(0) + offset)

export const decodeText = (codes: readonly number[], offset: number): string =>
  String.fromCharCode(...codes.map((code) => code - offset))
