import { cvFilesFor, cvUrl, type CvVersion } from '@/data/cv'
import { useLang } from '@/hooks/useLang'
import type { Dictionary } from '@/i18n/types'

/** Clave del diccionario con el nombre de cada versión del CV. */
const CV_LABEL_KEYS = {
  infographic: 'cvInfographic',
  ats: 'cvAts',
} as const satisfies Record<CvVersion, keyof Dictionary['hero']>

/**
 * Las versiones del CV del idioma activo del sitio, con su nombre traducido
 * y su URL, en el orden de CV_VERSIONS: lo que muestra un menú de CV. Lo
 * comparten «Descargar CV» del Hero y el botón de CV de Contacto.
 */
export function useCvOptions(): readonly { label: string; href: string }[] {
  const { lang, t } = useLang()
  return cvFilesFor(lang).map((entry) => ({
    label: t.hero[CV_LABEL_KEYS[entry.version]],
    href: cvUrl(entry),
  }))
}
