import type { Technology } from '@/data/types'

// Sin porcentajes ni niveles: solo qué tecnologías y a qué grupo pertenecen.
// Los nombres de los grupos (traducibles) viven en i18n/. Cada logo es un
// archivo de public/ registrado en docs/LOGOS.md.
const technologyList = [
  { id: 'java', name: 'Java', group: 'backend', logo: 'tech/duke.svg' },
  { id: 'spring-boot', name: 'Spring Boot', group: 'backend', logo: 'tech/spring-boot.svg' },
  {
    id: 'spring-security',
    name: 'Spring Security',
    group: 'backend',
    logo: 'tech/spring-security.svg',
  },
  { id: 'postgresql', name: 'PostgreSQL', group: 'databases', logo: 'tech/postgresql.svg' },
  { id: 'mysql', name: 'MySQL', group: 'databases', logo: 'tech/mysql.svg' },
  { id: 'python', name: 'Python', group: 'languages', logo: 'tech/python.svg' },
  { id: 'javascript', name: 'JavaScript', group: 'languages', logo: 'tech/javascript.svg' },
  { id: 'typescript', name: 'TypeScript', group: 'languages', logo: 'tech/typescript.svg' },
  { id: 'html', name: 'HTML', group: 'frontend', logo: 'tech/html.svg' },
  { id: 'css', name: 'CSS', group: 'frontend', logo: 'tech/css.svg' },
  // Respaldada por la descripción de crm-registro-campers en GitHub (regla de
  // contenido veraz): «React, TypeScript and JSON Server».
  { id: 'react', name: 'React', group: 'frontend', logo: 'tech/react.svg' },
  { id: 'git-github', name: 'Git/GitHub', group: 'tools', logo: 'tech/git.svg' },
  { id: 'docker', name: 'Docker', group: 'tools', logo: 'tech/docker.svg' },
  { id: 'n8n', name: 'n8n', group: 'tools', logo: 'tech/n8n.svg' },
  // Respaldada por dos proyectos (regla de contenido veraz): n8n-daily-news-agent,
  // un agente de IA con Gemini en n8n, y logitrack-iq, un flujo de n8n con un
  // agente de IA que propone órdenes de compra a través de un servidor MCP.
  { id: 'ai-agents', name: 'AI Agents', group: 'ai', logo: 'icons/ai-agents-white.svg' },
] as const satisfies readonly Technology[]

export type TechnologyId = (typeof technologyList)[number]['id']

export const technologies: readonly Technology<TechnologyId>[] = technologyList

/** Nombre propio de una tecnología del catálogo; no se traduce. */
export const technologyName = (id: TechnologyId): string =>
  // El tipo ya garantiza que el id existe; sin esta salida, TypeScript no lo sabe.
  technologies.find((technology) => technology.id === id)?.name ?? id

/** URL pública del logo de una tecnología. */
export const technologyLogoUrl = ({ logo }: Pick<Technology, 'logo'>) =>
  `${import.meta.env.BASE_URL}${logo}`
