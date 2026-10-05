export const routes = {
  home: '/',
  certifications: '/certificaciones',
} as const

/** Ids de las secciones de la home, usados como anclas en la navegación. */
export const sections = {
  hero: 'hero',
  about: 'about',
  technologies: 'technologies',
  projects: 'projects',
  contact: 'contact',
} as const

export type SectionId = (typeof sections)[keyof typeof sections]
