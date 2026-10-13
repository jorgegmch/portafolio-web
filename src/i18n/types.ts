import type { CertificationId } from '@/data/certifications'
import type { ProjectId } from '@/data/projects'
import type { HeroSocialId } from '@/data/social'
import type { CertificationCategory, TechnologyGroup } from '@/data/types'
import type { CodingTime } from '@/lib/codingTime'

export const LANGS = ['es', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'es'

/** Nombre de cada idioma en su propia lengua; no se traduce. */
export const LANG_NAMES: Record<Lang, string> = {
  es: 'Español',
  en: 'English',
}

/**
 * Forma única de los textos del sitio. Cada idioma debe cumplirla completa:
 * si falta una clave, un proyecto o una certificación, TypeScript falla.
 */
export interface Dictionary {
  meta: {
    title: string
    description: string
  }
  nav: {
    about: string
    technologies: string
    projects: string
    contact: string
    skipToContent: string
    language: string
    certifications: string
    /** Nombre accesible del landmark de navegación. */
    main: string
    /** Nombre accesible del enlace del logo. */
    home: string
    openMenu: string
    closeMenu: string
  }
  intro: {
    /** Frases en lenguaje natural que se transforman en código. */
    phrases: readonly { natural: string; code: string }[]
    skip: string
  }
  hero: {
    /** Título de la página de inicio: el nombre corto, que no se traduce. */
    heading: string
    /** Saludo sobre el nombre; las mayúsculas sostenidas las pone el CSS. */
    greeting: string
    /** Textos del tag que rota bajo el nombre, en orden; el primero es el fijo. */
    roles: readonly string[]
    /** Presentación breve bajo el nombre. */
    intro: string
    tagline: string
    viewProjects: string
    /** Estado junto al punto verde; las mayúsculas las pone el CSS. */
    availability: string
    /**
     * Versión corta del estado, para las pantallas donde `availability` no
     * cabe en una línea. Solo la define el idioma que la necesita.
     */
    availabilityShort?: string
    downloadCv: string
    /** Versión corta de `downloadCv`, para los teléfonos donde no cabe junto a `viewProjects`. */
    downloadCvShort: string
    cvInfographic: string
    cvAts: string
    photoAlt: string
    /** Nombre accesible de la fila de redes y contacto. */
    socialLabel: string
    /** Nombre accesible de cada icono de la fila; los de marca no se traducen. */
    social: Record<HeroSocialId, string>
  }
  about: {
    heading: string
    /** Frase grande, en dos tramos: el segundo es el que puede ir resaltado. */
    phrase: { lead: string; highlight: string }
    /** Un elemento por párrafo. */
    bio: readonly string[]
    viewCertifications: string
    /** Nombre accesible del panel de la terminal. */
    terminalLabel: string
    /** Etiqueta de cada tarjeta según su cifra, que la tarjeta muestra aparte. */
    stats: {
      codingTime: Record<CodingTime['unit'], (count: number) => string>
      projects: (count: number) => string
      technologies: (count: number) => string
    }
  }
  technologies: {
    heading: string
    groups: Record<TechnologyGroup, string>
  }
  projects: {
    heading: string
    viewRepo: string
    viewAll: string
    items: Record<ProjectId, { description: string }>
  }
  certifications: {
    heading: string
    back: string
    hours: (count: number) => string
    categories: Record<CertificationCategory, string>
    items: Record<CertificationId, { title: string }>
  }
  contact: {
    heading: string
    email: string
  }
  footer: {
    /** Aviso de derechos; va tras el año y el nombre. */
    rights: string
    /** Nombre accesible de la lista de redes. */
    social: string
  }
  common: {
    /** Aviso para lectores de pantalla en enlaces con target="_blank". */
    opensInNewTab: string
  }
}
