import type { HeroBadge, Technology } from '@/data/types'

// Sin porcentajes ni niveles: solo qué tecnologías y a qué grupo pertenecen.
// Los nombres de los grupos (traducibles) viven en i18n/.
// `logos` solo nombra archivos que existen en public/tech: una tecnología sin
// logo utilizable se muestra con su nombre.
const technologyList = [
  { id: 'java', name: 'Java', group: 'backend', logos: ['duke.svg'], primary: true },
  { id: 'spring-boot', name: 'Spring Boot', group: 'backend', logos: [], primary: true },
  { id: 'spring-security', name: 'Spring Security', group: 'backend', logos: [] },
  { id: 'postgresql', name: 'PostgreSQL', group: 'databases', logos: [], primary: true },
  { id: 'mysql', name: 'MySQL', group: 'databases', logos: [] },
  { id: 'python', name: 'Python', group: 'languages', logos: ['python.svg'] },
  { id: 'javascript', name: 'JavaScript', group: 'languages', logos: ['javascript.svg'] },
  { id: 'typescript', name: 'TypeScript', group: 'languages', logos: ['typescript.svg'] },
  { id: 'html', name: 'HTML', group: 'frontend', logos: ['html.svg'] },
  { id: 'css', name: 'CSS', group: 'frontend', logos: [] },
  { id: 'git-github', name: 'Git/GitHub', group: 'tools', logos: ['git.svg'] },
  { id: 'docker', name: 'Docker', group: 'tools', logos: [] },
  { id: 'n8n', name: 'n8n', group: 'tools', logos: [] },
  { id: 'ai-development', name: 'AI-assisted/orchestrated development', group: 'ai', logos: [] },
] as const satisfies readonly Technology[]

export type TechnologyId = (typeof technologyList)[number]['id']

export const technologies: readonly Technology<TechnologyId>[] = technologyList

export const primaryStack = technologies.filter((tech) => tech.primary)

/**
 * Logos que flotan junto al retrato del Hero, en orden. Solo entran los que su
 * marca permite mostrar sin permiso; cada uno pertenece a una tecnología del
 * catálogo de arriba.
 */
export const heroLogos = [
  'python.svg',
  'javascript.svg',
  'typescript.svg',
  'git.svg',
  'html.svg',
] as const

/** URL pública de un logo de public/tech. */
export const techLogoUrl = (file: string) => `${import.meta.env.BASE_URL}tech/${file}`

/**
 * Pastillas que flotan junto al retrato del Hero, en orden. El nombre visible
 * es el de la tecnología en el catálogo. `brand` distingue el logo de marca,
 * que va sin alterar, del icono propio que se usa cuando la marca no deja
 * mostrar el suyo.
 */
export const heroBadges = [
  { technology: 'python', icon: 'python.svg', brand: true },
  { technology: 'java', icon: 'duke.svg', brand: true },
  { technology: 'typescript', icon: 'typescript.svg', brand: true },
  { technology: 'postgresql', icon: 'database.svg', brand: false },
] as const satisfies readonly HeroBadge<TechnologyId>[]

/** URL pública del icono de una pastilla: public/tech si es de marca, public/icons si no. */
export const heroBadgeIconUrl = ({ icon, brand }: HeroBadge) =>
  brand ? techLogoUrl(icon) : `${import.meta.env.BASE_URL}icons/${icon}`
