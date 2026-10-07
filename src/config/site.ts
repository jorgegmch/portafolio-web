const GITHUB_USER = 'jorgegmch'

export const BIRTH_DATE_OFFSET = 11

export const site = {
  /** Nombre legal, tal como aparece en la cédula (sin tilde en Gomez). */
  legalName: 'Jorge Alberto Gomez Chaparro',
  shortName: 'Jorge Gomez',
  /** Alias público, el del logo. Es el mismo usuario de GitHub. */
  handle: GITHUB_USER,
  role: 'Full Stack Developer',
  location: 'Piedecuesta, Santander, Colombia',
  status: ['open_to_work', 'freelance_disponible'],
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
