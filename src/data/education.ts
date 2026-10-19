import type { CertificationId } from '@/data/certifications'

/**
 * Formación que muestra la escena Perfil, en orden: cada fila es una
 * certificación del registro, con su título oficial y su entidad. Lo que no
 * esté aquí no aparece en la escena.
 */
export const education = [
  'tecnico-laboral-programacion',
  'comunicador-social-periodista',
] as const satisfies readonly CertificationId[]

export type EducationId = (typeof education)[number]
