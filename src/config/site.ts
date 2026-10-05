const GITHUB_USER = 'jorgegmch'

export const site = {
  /** Nombre legal, tal como aparece en la cédula (sin tilde en Gomez). */
  legalName: 'Jorge Alberto Gomez Chaparro',
  shortName: 'Jorge Gomez',
  role: 'Full Stack Developer',
  location: 'Piedecuesta, Santander, Colombia',
  status: ['open_to_work', 'freelance_disponible'],
  /** Fecha de ejemplo. El mes va de 1 a 12. */
  birthDate: { year: 2000, month: 3, day: 15 },
  /** URL pública sin slash final; se usa para canonical y Open Graph. */
  url: import.meta.env.VITE_SITE_URL ?? '',
  githubUser: GITHUB_USER,
  social: {
    github: `https://github.com/${GITHUB_USER}`,
    linkedin: 'https://www.linkedin.com/in/jorgegmch',
  },
} as const
