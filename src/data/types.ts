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
  /** Título oficial, en su idioma original; no se traduce. */
  title: string
  /** Entidad que certifica; nombre propio, no se traduce. */
  entity: string
  date: YearMonth
  /** Duración en horas, solo si el certificado la indica. */
  hours?: number
  category: CertificationCategory
}

/** Columnas de «Mi stack» (spec v2.1 §3.2); su orden está en data/technologies. */
export type TechnologyGroup = 'languages' | 'backend' | 'data' | 'frontend' | 'ai-tools'

export interface Technology<Id extends string = string> {
  id: Id
  name: string
  group: TechnologyGroup
  /**
   * Logo, como ruta dentro de public/: los de marca en tech/ y el icono
   * genérico de lo que no es una marca en icons/. Procedencia en docs/LOGOS.md.
   */
  logo: string
}

export interface Project<Id extends string = string> {
  /** Nombre exacto del repositorio en GitHub; de él se deriva la URL. */
  id: Id
  title: string
  /** Etiquetas de stack en texto libre, tomadas de la descripción del repo. */
  stack: readonly string[]
  /** Tiene tarjeta en la sección de proyectos, en el orden de data/projects.ts. */
  featured: boolean
  /** Cuenta en la tarjeta «Proyectos construidos»; el criterio está en contenido-veraz.md. */
  built: boolean
}

/** Dibujo de la tarjeta de un servicio: obra propia, de trazo. */
export type ServiceIconName = 'server' | 'window' | 'layers' | 'database' | 'agent' | 'chat'

export interface Service<Id extends string = string, ProjectIdT extends string = string> {
  id: Id
  icon: ServiceIconName
  /** Repo que respalda el servicio y al que enlaza su tarjeta; null si no enlaza. */
  project: ProjectIdT | null
}
