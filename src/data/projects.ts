import { site } from '@/config/site'
import type { Project } from '@/data/types'

// Las descripciones (traducibles) viven en i18n/, indexadas por id.
// El sitio muestra solo los destacados, en el orden en que aparecen aquí;
// el primero es el protagonista.
const projectList = [
  {
    id: 'logitrack-iq',
    title: 'LogiTrack IQ',
    stack: ['Java', 'Spring Boot', 'Node.js', 'MCP', 'PostgreSQL', 'Docker', 'n8n'],
    featured: true,
    built: true,
  },
  {
    id: 'logitrack-api',
    title: 'LogiTrack API',
    stack: ['Java', 'Spring Boot', 'Spring Security', 'JWT', 'PostgreSQL', 'OpenAPI/Swagger'],
    featured: true,
    built: true,
  },
  {
    id: 'portafolio-web',
    title: 'Portafolio Web',
    stack: ['HTML', 'CSS', 'JavaScript'],
    featured: true,
    built: true,
  },
  {
    id: 'inventory-guardian',
    title: 'Inventory Guardian',
    stack: ['Python', 'ttkbootstrap', 'SQLite'],
    featured: true,
    built: true,
  },
  {
    id: 'crm-registro-campers',
    title: 'CRM Registro Campers',
    stack: ['React', 'TypeScript', 'JSON Server'],
    featured: false,
    built: true,
  },
  {
    id: 'n8n-daily-news-agent',
    title: 'n8n Daily News Agent',
    stack: ['n8n', 'Gemini', 'Google Sheets'],
    featured: false,
    built: true,
  },
  {
    id: 'campuslands-erp-cli',
    title: 'Campuslands ERP CLI',
    stack: ['Python', 'JSON', 'CLI'],
    featured: false,
    built: true,
  },
  {
    id: 'patitas-felices-web',
    title: 'Patitas Felices',
    stack: ['HTML5', 'CSS3'],
    featured: false,
    built: true,
  },
  {
    id: 'rebelwear-ui',
    title: 'RebelWear',
    stack: ['HTML', 'CSS', 'JavaScript', 'FakeStore API', 'localStorage'],
    featured: true,
    built: true,
  },
  {
    id: 'colombia-population-stats',
    title: 'Colombia Population Stats',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'API Colombia'],
    featured: false,
    built: true,
  },
  {
    id: 'pocketflow-code-validator',
    title: 'PocketFlow Code Validator',
    stack: ['Python', 'PocketFlow-style', 'Gemini API'],
    featured: false,
    built: true,
  },
  {
    id: 'cultuvivo-events-system',
    title: 'CultuVivo Events System',
    stack: ['Python', 'JSON', 'Scrum'],
    featured: false,
    built: true,
  },
  {
    id: 'n8n-telegram-helpdesk-bot',
    title: 'n8n Telegram Helpdesk Bot',
    stack: ['n8n', 'Telegram', 'Google Sheets'],
    featured: false,
    built: true,
  },
  {
    id: 'medisistema-hospital-db',
    title: 'MediSistema Hospital DB',
    stack: ['MySQL', 'SQL', 'StarUML'],
    featured: false,
    built: false,
  },
  {
    id: 'gaseosas-del-valle-db',
    title: 'Gaseosas del Valle DB',
    stack: ['MySQL', 'StarUML'],
    featured: false,
    built: false,
  },
  {
    id: 'vehicle-dealership-db',
    title: 'Vehicle Dealership DB',
    stack: ['PostgreSQL', 'StarUML'],
    featured: false,
    built: false,
  },
  {
    id: 'tecnostore-pos',
    title: 'TecnoStore POS',
    stack: ['Java', 'JDBC', 'MySQL'],
    featured: false,
    built: true,
  },
] as const satisfies readonly Project[]

export type ProjectId = (typeof projectList)[number]['id']

export const projects: readonly Project<ProjectId>[] = projectList

export const featuredProjects = projects.filter((project) => project.featured)

/** Los que cuentan en la tarjeta «Proyectos construidos». */
export const builtProjects = projects.filter((project) => project.built)

export const projectUrl = (id: ProjectId): string => `${site.social.github}/${id}`

/** Destino del botón "Ver todos en GitHub". */
export const allProjectsUrl = `${site.social.github}?tab=repositories`
