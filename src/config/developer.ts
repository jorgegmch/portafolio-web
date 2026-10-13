import { site } from '@/config/site'

/**
 * Lo que muestra la terminal de «Sobre mí»: la salida de `java Developer`, el
 * mismo programa de examples/java/Developer.java. No se traduce: es idéntica
 * en los dos idiomas.
 *
 * La edad es un campo, pero no tiene valor aquí: es en vivo y la pone la
 * sección. El ejemplo de Java la lleva como literal.
 */
export const developer = {
  command: 'java Developer',
  /** Campos en el orden en que salen. */
  fields: ['name', 'age', 'location', 'role', 'passion'],
  values: {
    name: site.legalName,
    location: site.locationShort,
    role: site.role,
    passion: 'Coding the future',
  },
} as const

export type DeveloperField = (typeof developer.fields)[number]
