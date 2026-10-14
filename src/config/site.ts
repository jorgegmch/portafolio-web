import type { YearMonth } from '@/data/types'

const GITHUB_USER = 'jorgegmch'

export const BIRTH_DATE_OFFSET = 11

export const site = {
  /** Nombre completo y nombre corto, con tilde. Archivos y URLs van en ASCII. */
  legalName: 'Jorge Alberto Gómez Chaparro',
  shortName: 'Jorge Gómez',
  /** Alias público, el del logo. Es el mismo usuario de GitHub. */
  handle: GITHUB_USER,
  role: 'Full-Stack Developer',
  /** Título del documento. index.html lo repite a mano; un test los compara. */
  title: 'Jorge Gómez | Full-Stack Developer',
  /** Año de primera publicación del sitio; es el del aviso de derechos. */
  publishedYear: 2026,
  location: 'Piedecuesta, Santander, Colombia',
  /** Ciudad y código del país, para la terminal de «Sobre mí»; no se traduce. */
  locationShort: 'Piedecuesta, CO',
  /**
   * Punto de la ciudad en el mapa de «Sobre mí», con un decimal como máximo:
   * nivel de ciudad. Es la cabecera municipal de Piedecuesta en DIVIPOLA del
   * DANE (código 68547000), redondeada.
   */
  coordinates: { lat: 7.0, lon: -73.1 },
  /** Mes en que empezó a programar; de él sale el tiempo programando. */
  codingSince: '2025-08' satisfies YearMonth,
  /**
   * Fecha de nacimiento (AAAA-MM-DD) como códigos de carácter desplazados;
   * la reconstruye lib/birthDate. Es ofuscación contra scrapers simples, no
   * protección real. Para cambiarla, genera sus códigos con:
   *   [...'AAAA-MM-DD'].map((c) => c.charCodeAt(0) + BIRTH_DATE_OFFSET)
   */
  birthDateCodes: [60, 68, 68, 68, 56, 59, 64, 56, 60, 61],
  /** URL pública sin slash final; se usa para canonical y Open Graph. */
  url: import.meta.env.VITE_SITE_URL ?? '',
  githubUser: GITHUB_USER,
  social: {
    github: `https://github.com/${GITHUB_USER}`,
    linkedin: 'https://www.linkedin.com/in/jorgegmch',
  },
} as const

/** Redes en el orden en que se muestran. Los nombres son marcas: no se traducen. */
export const socialLinks = [
  { id: 'github', label: 'GitHub', url: site.social.github },
  { id: 'linkedin', label: 'LinkedIn', url: site.social.linkedin },
] as const
