import type { Certification } from '@/data/types'

/**
 * Registro de certificaciones. La página que las listaba se retiró con el
 * rediseño v2; el registro se conserva porque respalda textos del sitio
 * (regla de contenido veraz). Por ejemplo, el diplomado respalda el servicio
 * «Comunicación estratégica» y el título de la universidad, la formación en
 * Comunicación Social.
 *
 * El título es el oficial, en su idioma original: no se traduce. Ninguna
 * vista lo muestra hoy.
 */
const certificationList = [
  {
    id: 'comunicador-social-periodista',
    title: 'Comunicador Social y Periodista',
    entity: 'Universidad Sergio Arboleda',
    date: '2023-03',
    category: 'formal',
  },
  {
    id: 'diplomado-comunicacion-digital',
    title: 'Diplomado en Comunicación Digital Estratégica',
    entity: 'Universidad Sergio Arboleda',
    date: '2022-04',
    hours: 88,
    category: 'formal',
  },
  {
    id: 'bachiller-academico-sistemas',
    title: 'Bachiller Académico con Énfasis en Sistemas',
    entity: 'Colegio Miguel Antonio Caro',
    date: '2016-11',
    category: 'formal',
  },
  {
    id: 'servicio-al-cliente',
    title: 'Servicio al Cliente: Un Reto Personal',
    entity: 'SENA',
    date: '2022-06',
    hours: 40,
    category: 'soft-skills',
  },
  {
    id: 'taller-desempeno-laboral',
    title: 'Taller Fortalecimiento de Competencias para el Mejor Desempeño Laboral',
    entity: 'Comfenalco Santander',
    date: '2025-04',
    hours: 40,
    category: 'soft-skills',
  },
  {
    id: 'taller-competencias-vida',
    title: 'Taller Fortalecimiento de Competencias para la Vida',
    entity: 'Comfenalco Santander',
    date: '2025-05',
    hours: 40,
    category: 'soft-skills',
  },
  {
    id: 'congreso-comunicacion-afacom',
    title: 'III Congreso de Comunicación "Retos de la Comunicación en la Sociedad del Conocimiento"',
    entity: 'AFACOM',
    date: '2021-03',
    category: 'formal',
  },
  {
    id: 'bootcamp-programacion-basico',
    title: 'Bootcamp de Programación Nivel Básico',
    entity: 'MinTIC/Talento Tech/ANDES',
    date: '2026-03',
    hours: 159,
    category: 'technical',
  },
  {
    id: 'curso-desarrollo-ia',
    title: 'Curso de Desarrollo con IA',
    entity: 'mouredev/BIG school',
    date: '2026-10',
    hours: 4,
    category: 'technical',
  },
] as const satisfies readonly Certification[]

export type CertificationId = (typeof certificationList)[number]['id']

export const certifications: readonly Certification<CertificationId>[] = certificationList
