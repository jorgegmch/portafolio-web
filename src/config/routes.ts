export const routes = {
  home: '/',
} as const

/** Ids de las secciones de la home, usados como anclas en la navegación. */
export const sections = {
  hero: 'hero',
  about: 'about',
  services: 'services',
  projects: 'projects',
  contact: 'contact',
} as const

export type SectionId = (typeof sections)[keyof typeof sections]

/** Id del contenido principal; es el destino del skip-link. */
export const MAIN_CONTENT_ID = 'main'

/** Id de lo primero de la página, el skip-link: adonde va el foco con «Volver arriba». */
export const PAGE_START_ID = 'top'
