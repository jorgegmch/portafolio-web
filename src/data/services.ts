import type { ProjectId } from '@/data/projects'
import type { Service } from '@/data/types'

/**
 * Tarjetas de la sección «Servicios», en orden. Aquí solo va lo que no se
 * traduce; el título y la descripción de cada una viven en i18n/, por su id.
 *
 * `project` es el repo que respalda el servicio (regla de contenido veraz) y
 * al que enlaza la tarjeta. Comunicación estratégica no enlaza: la respalda
 * el diplomado de data/certifications.ts, no un repo.
 */
const serviceList = [
  { id: 'backend', icon: 'server', project: 'logitrack-api' },
  { id: 'frontend', icon: 'window', project: 'portafolio-web' },
  { id: 'fullstack', icon: 'layers', project: 'logitrack-iq' },
  { id: 'databases', icon: 'database', project: 'gaseosas-del-valle-db' },
  { id: 'automation', icon: 'agent', project: 'n8n-daily-news-agent' },
  { id: 'communication', icon: 'chat', project: null },
] as const satisfies readonly Service<string, ProjectId>[]

export type ServiceId = (typeof serviceList)[number]['id']

export const services: readonly Service<ServiceId, ProjectId>[] = serviceList
