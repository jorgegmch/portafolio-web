/**
 * Formas de los datos del portafolio. Aquí solo va lo que no se traduce
 * (ids, fechas, nombres propios); los textos traducibles viven en i18n/,
 * indexados por id.
 */

/** Año y mes en formato ISO, p. ej. "2023-03". No se registra el día. */
export type YearMonth = `${number}-${number}`

export type CertificationCategory = 'formal' | 'soft-skills' | 'technical'

export interface Certification<Id extends string = string> {
  id: Id
  /** Entidad que certifica; nombre propio, no se traduce. */
  entity: string
  date: YearMonth
  /** Duración en horas, solo si el certificado la indica. */
  hours?: number
  category: CertificationCategory
}

export type TechnologyGroup = 'backend' | 'databases' | 'languages' | 'frontend' | 'tools' | 'ai'

export interface Technology<Id extends string = string> {
  id: Id
  name: string
  group: TechnologyGroup
  /** Archivos de logo dentro de public/tech; vacío si se muestra solo el nombre. */
  logos: readonly string[]
  /** Parte del stack principal (tarjeta de estadísticas). */
  primary?: boolean
}

export interface HeroBadge<Id extends string = string> {
  /** Id de la tecnología del catálogo que le da nombre. */
  technology: Id
  /** Archivo del icono: en public/tech si es de marca, en public/icons si no. */
  icon: string
  /** Logo oficial de una marca, que no se altera. */
  brand: boolean
}

export interface Project<Id extends string = string> {
  /** Nombre exacto del repositorio en GitHub; de él se deriva la URL. */
  id: Id
  title: string
  /** Etiquetas de stack en texto libre, tomadas de la descripción del repo. */
  stack: readonly string[]
  /** Tiene tarjeta en la sección de proyectos, en el orden de data/projects.ts. */
  featured: boolean
}
