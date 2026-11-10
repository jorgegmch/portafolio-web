import type { Technology } from '@/data/types'

// Sin porcentajes ni niveles: solo qué tecnologías y a qué grupo pertenecen.
// Los nombres de los grupos (traducibles) viven en i18n/.
const technologyList = [
  { id: 'java', name: 'Java', group: 'backend' },
  { id: 'spring-boot', name: 'Spring Boot', group: 'backend' },
  { id: 'spring-security', name: 'Spring Security', group: 'backend' },
  { id: 'postgresql', name: 'PostgreSQL', group: 'databases' },
  { id: 'mysql', name: 'MySQL', group: 'databases' },
  { id: 'python', name: 'Python', group: 'languages' },
  { id: 'javascript', name: 'JavaScript', group: 'languages' },
  { id: 'typescript', name: 'TypeScript', group: 'languages' },
  { id: 'html', name: 'HTML', group: 'frontend' },
  { id: 'css', name: 'CSS', group: 'frontend' },
  // Respaldada por la descripción de crm-registro-campers en GitHub (regla de
  // contenido veraz): «React, TypeScript and JSON Server».
  { id: 'react', name: 'React', group: 'frontend' },
  { id: 'git-github', name: 'Git/GitHub', group: 'tools' },
  { id: 'docker', name: 'Docker', group: 'tools' },
  { id: 'n8n', name: 'n8n', group: 'tools' },
  // Respaldada por dos proyectos (regla de contenido veraz): n8n-daily-news-agent,
  // un agente de IA con Gemini en n8n, y logitrack-iq, un flujo de n8n con un
  // agente de IA que propone órdenes de compra a través de un servidor MCP.
  { id: 'ai-agents', name: 'AI Agents', group: 'ai' },
] as const satisfies readonly Technology[]

export type TechnologyId = (typeof technologyList)[number]['id']

export const technologies: readonly Technology<TechnologyId>[] = technologyList

/** Nombre propio de una tecnología del catálogo; no se traduce. */
export const technologyName = (id: TechnologyId): string =>
  // El tipo ya garantiza que el id existe; sin esta salida, TypeScript no lo sabe.
  technologies.find((technology) => technology.id === id)?.name ?? id
