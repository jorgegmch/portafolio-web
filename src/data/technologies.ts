import type { Technology } from '@/data/types'

// Sin porcentajes ni niveles: solo qué tecnologías y a qué grupo pertenecen.
// Los nombres de los grupos (traducibles) viven en i18n/.
const technologyList = [
  { id: 'java', name: 'Java', group: 'backend', logos: ['java.svg'], primary: true },
  {
    id: 'spring-boot',
    name: 'Spring Boot',
    group: 'backend',
    logos: ['spring-boot.svg'],
    primary: true,
  },
  { id: 'spring-security', name: 'Spring Security', group: 'backend', logos: ['spring.svg'] },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    group: 'databases',
    logos: ['postgresql.svg'],
    primary: true,
  },
  { id: 'mysql', name: 'MySQL', group: 'databases', logos: ['mysql.svg'] },
  { id: 'python', name: 'Python', group: 'languages', logos: ['python.svg'] },
  {
    id: 'javascript-typescript',
    name: 'JavaScript/TypeScript',
    group: 'languages',
    logos: ['javascript.svg', 'typescript.svg'],
  },
  { id: 'html', name: 'HTML', group: 'frontend', logos: ['html.svg'] },
  { id: 'css', name: 'CSS', group: 'frontend', logos: ['css.svg'] },
  { id: 'git-github', name: 'Git/GitHub', group: 'tools', logos: ['git.svg', 'github.svg'] },
  { id: 'docker', name: 'Docker', group: 'tools', logos: ['docker.svg'] },
  { id: 'n8n', name: 'n8n', group: 'tools', logos: ['n8n.svg'] },
  {
    id: 'ai-development',
    name: 'AI-assisted/orchestrated development',
    group: 'ai',
    logos: ['ai.svg'],
  },
] as const satisfies readonly Technology[]

export type TechnologyId = (typeof technologyList)[number]['id']

export const technologies: readonly Technology<TechnologyId>[] = technologyList

export const primaryStack = technologies.filter((tech) => tech.primary)
