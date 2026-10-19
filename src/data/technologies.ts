import type { Technology } from '@/data/types'

// Sin porcentajes ni niveles: solo qué tecnologías y a qué grupo pertenecen.
// Los nombres de los grupos (traducibles) viven en i18n/.
// `logos` solo nombra archivos que existen en public/tech: una tecnología sin
// logo utilizable se muestra con su nombre.
const technologyList = [
  { id: 'java', name: 'Java', group: 'backend', logos: ['duke.svg'], primary: true },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    group: 'backend',
    logos: ['spring-boot.svg'],
    primary: true,
  },
  { id: 'spring-security', name: 'Spring Security', group: 'backend', logos: ['spring-security.svg'] },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    group: 'databases',
    logos: ['postgresql.svg'],
    primary: true,
  },
  { id: 'mysql', name: 'MySQL', group: 'databases', logos: ['mysql.svg'] },
  { id: 'python', name: 'Python', group: 'languages', logos: ['python.svg'] },
  { id: 'javascript', name: 'JavaScript', group: 'languages', logos: ['javascript.svg'] },
  { id: 'typescript', name: 'TypeScript', group: 'languages', logos: ['typescript.svg'] },
  { id: 'html', name: 'HTML', group: 'frontend', logos: ['html.svg'] },
  { id: 'css', name: 'CSS', group: 'frontend', logos: ['css.svg'] },
  // Respaldada por la descripción de crm-registro-campers en GitHub (regla de
  // contenido veraz): «React, TypeScript and JSON Server».
  { id: 'react', name: 'React', group: 'frontend', logos: ['react.svg'] },
  { id: 'git-github', name: 'Git/GitHub', group: 'tools', logos: ['git.svg'] },
  { id: 'docker', name: 'Docker', group: 'tools', logos: ['docker.svg'] },
  { id: 'n8n', name: 'n8n', group: 'tools', logos: ['n8n.svg'] },
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
 * Icono de la ficha de «Mi stack tecnológico» para lo que no es una marca y
 * no tiene logo: un icono genérico de public/icons, en blanco para el fondo
 * oscuro. Solo puede nombrar tecnologías sin `logos`.
 */
export const STACK_GENERIC_ICONS: Partial<Record<TechnologyId, string>> = {
  'ai-agents': 'ai-agents-white.svg',
}

/** URL del icono de la ficha de una tecnología: su primer logo o su icono genérico. */
export const stackIconUrl = (technology: Technology<TechnologyId>): string => {
  const [logo] = technology.logos
  if (logo) return techLogoUrl(logo)
  return `${import.meta.env.BASE_URL}icons/${STACK_GENERIC_ICONS[technology.id] ?? ''}`
}
