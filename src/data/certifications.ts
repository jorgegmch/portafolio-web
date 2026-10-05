import type { Certification } from '@/data/types'

// Los títulos (traducibles) viven en i18n/, indexados por id.
// Para añadir una certificación: agrega su entrada aquí y su título en cada
// diccionario; el orden del arreglo no importa, la página ordena por fecha.
const certificationList = [
  {
    id: 'comunicador-social-periodista',
    entity: 'Universidad Sergio Arboleda',
    date: '2023-03',
    category: 'formal',
  },
  {
    id: 'diplomado-comunicacion-digital',
    entity: 'Universidad Sergio Arboleda',
    date: '2022-04',
    hours: 88,
    category: 'formal',
  },
  {
    id: 'bachiller-academico-sistemas',
    entity: 'Colegio Miguel Antonio Caro',
    date: '2016-11',
    category: 'formal',
  },
  {
    id: 'servicio-al-cliente',
    entity: 'SENA',
    date: '2022-06',
    hours: 40,
    category: 'soft-skills',
  },
  {
    id: 'taller-desempeno-laboral',
    entity: 'Comfenalco Santander',
    date: '2025-04',
    hours: 40,
    category: 'soft-skills',
  },
  {
    id: 'taller-competencias-vida',
    entity: 'Comfenalco Santander',
    date: '2025-05',
    hours: 40,
    category: 'soft-skills',
  },
  {
    id: 'congreso-comunicacion-afacom',
    entity: 'AFACOM',
    date: '2021-03',
    category: 'formal',
  },
  {
    id: 'bootcamp-programacion-basico',
    entity: 'MinTIC/Talento Tech/ANDES',
    date: '2026-03',
    hours: 159,
    category: 'technical',
  },
  {
    id: 'curso-desarrollo-ia',
    entity: 'mouredev/BIG school',
    date: '2026-10',
    hours: 4,
    category: 'technical',
  },
] as const satisfies readonly Certification[]

export type CertificationId = (typeof certificationList)[number]['id']

export const certifications: readonly Certification<CertificationId>[] = certificationList
