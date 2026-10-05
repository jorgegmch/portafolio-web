/**
 * Formas de los datos del portafolio. Aquí solo va lo que no se traduce
 * (ids, fechas, nombres propios); los textos traducibles viven en i18n/,
 * indexados por id.
 */

/** Año y mes en formato ISO, p. ej. "2023-03". No se registra el día. */
export type YearMonth = `${number}-${number}`

export type CertificationCategory = 'formal' | 'soft-skills' | 'technical-ai'

export interface Certification {
  id: string
  /** Entidad que certifica; nombre propio, no se traduce. */
  entity: string
  date: YearMonth
  /** Duración en horas, solo si el certificado la indica. */
  hours?: number
  category: CertificationCategory
}

export type TechnologyGroup = 'backend' | 'databases' | 'languages' | 'frontend' | 'tools' | 'ai'

export interface Technology {
  id: string
  name: string
  group: TechnologyGroup
  /** Archivos de logo dentro de public/tech; puede haber más de uno. */
  logos: readonly string[]
  /** Parte del stack principal (tarjeta de estadísticas e iconos del Hero). */
  primary?: boolean
}

export interface Project {
  /** Nombre exacto del repositorio en GitHub; de él se deriva la URL. */
  id: string
  title: string
  /** Etiquetas de stack en texto libre, tomadas de la descripción del repo. */
  stack: readonly string[]
  featured?: boolean
}
