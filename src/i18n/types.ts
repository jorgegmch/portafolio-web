import type { CertificationId } from '@/data/certifications'
import type { ProjectId } from '@/data/projects'
import type { CertificationCategory, TechnologyGroup } from '@/data/types'

export const LANGS = ['es', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'es'

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
  }
  intro: {
    /** Frases en lenguaje natural que se transforman en código. */
    phrases: readonly { natural: string; code: string }[]
    skip: string
  }
  hero: {
    tagline: string
    viewProjects: string
    downloadCv: string
    cvDesigned: string
    cvAts: string
    photoAlt: string
  }
  about: {
    heading: string
    /** Un elemento por párrafo. */
    bio: readonly string[]
    viewCertifications: string
    stats: {
      repos: { label: string }
      certifications: { label: string }
      stack: { label: string }
      languages: { label: string; value: string }
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
    builtBy: string
  }
}
