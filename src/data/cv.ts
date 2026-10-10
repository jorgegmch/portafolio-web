import type { Lang } from '@/i18n/types'

/** Versiones del CV, en el orden en que se ofrecen. */
export const CV_VERSIONS = ['designed', 'ats'] as const

export type CvVersion = (typeof CV_VERSIONS)[number]

/** Un PDF del CV: su idioma, su versión y su archivo dentro de public/cv. */
export interface CvFile {
  lang: Lang
  version: CvVersion
  file: string
}

/**
 * Registro de los PDFs del CV: único sitio que conoce sus archivos. Solo se
 * registra un archivo que exista en public/cv; sin entradas para un idioma,
 * el botón de descarga no se muestra. El nombre de cada versión sale de los
 * diccionarios.
 */
export const cvFiles = [
  { lang: 'es', version: 'designed', file: 'jorge-gomez-cv-designed-es.pdf' },
  { lang: 'es', version: 'ats', file: 'jorge-gomez-cv-ats-es.pdf' },
  { lang: 'en', version: 'designed', file: 'jorge-gomez-cv-designed-en.pdf' },
  { lang: 'en', version: 'ats', file: 'jorge-gomez-cv-ats-en.pdf' },
] as const satisfies readonly CvFile[]

/** Archivos de un idioma, en el orden de CV_VERSIONS; vacío si no tiene ninguno. */
export const cvFilesFor = (lang: Lang, files: readonly CvFile[] = cvFiles): readonly CvFile[] =>
  CV_VERSIONS.flatMap((version) =>
    files.filter((entry) => entry.lang === lang && entry.version === version),
  )

/** URL pública de un PDF del CV. */
export const cvUrl = ({ file }: Pick<CvFile, 'file'>) => `${import.meta.env.BASE_URL}cv/${file}`
