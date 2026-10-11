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
  // Respaldada por dos proyectos (regla de contenido veraz): n8n-daily-news-agent,
  // un agente de IA con Gemini en n8n, y logitrack-iq, un flujo de n8n con un
  // agente de IA que propone órdenes de compra a través de un servidor MCP.
  { id: 'ai-agents', name: 'AI Agents', group: 'ai', logos: [] },
] as const satisfies readonly Technology[]

export type TechnologyId = (typeof technologyList)[number]['id']

export const technologies: readonly Technology<TechnologyId>[] = technologyList

export const primaryStack = technologies.filter((tech) => tech.primary)

/** Nombre propio de una tecnología del catálogo; no se traduce. */
export const technologyName = (id: TechnologyId): string =>
  // El tipo ya garantiza que el id existe; sin esta salida, TypeScript no lo sabe.
  technologies.find((technology) => technology.id === id)?.name ?? id

/** URL pública de un logo de public/tech. */
export const techLogoUrl = (file: string) => `${import.meta.env.BASE_URL}tech/${file}`

/**
 * Pastillas que flotan junto al retrato del Hero, en orden. El nombre visible
 * es el de la tecnología en el catálogo. `brand` distingue el logo de marca,
 * que va sin alterar, del icono genérico que se usa cuando no hay logo que
 * mostrar: propio (base de datos) o de un conjunto de licencia abierta (el
 * chip de AI Agents, de PrimeIcons).
 */
export const heroBadges = [
  { technology: 'python', icon: 'python.svg', brand: true },
  { technology: 'java', icon: 'duke.svg', brand: true },
  { technology: 'typescript', icon: 'typescript.svg', brand: true },
  { technology: 'postgresql', icon: 'database.svg', brand: false },
  { technology: 'ai-agents', icon: 'ai-agents.svg', brand: false },
] as const satisfies readonly HeroBadge<TechnologyId>[]

/** URL pública del icono de una pastilla: public/tech si es de marca, public/icons si no. */
export const heroBadgeIconUrl = ({ icon, brand }: HeroBadge) =>
  brand ? techLogoUrl(icon) : `${import.meta.env.BASE_URL}icons/${icon}`
