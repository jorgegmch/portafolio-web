import { DEFAULT_LANG, LANGS, type Lang } from '@/i18n/types'

/** Parámetro de la URL que fuerza el idioma: ?lang=en */
export const LANG_PARAM = 'lang'

export interface LangSources {
  /** Query de la URL, con o sin "?" inicial. */
  search: string
  /** Valor guardado en localStorage, o null si no hay. */
  stored: string | null
  /** Idiomas del navegador en orden de preferencia (navigator.languages). */
  browserLangs: readonly string[]
}

const toLang = (value: string | null | undefined): Lang | null => {
  const normalized = value?.trim().toLowerCase()
  return LANGS.find((lang) => lang === normalized) ?? null
}

/** "es-CO" -> "es" */
const primarySubtag = (tag: string): string | undefined => tag.split('-')[0]

/**
 * Idioma inicial. Prioridad: ?lang= > localStorage > navegador > por defecto.
 * Un valor inválido en cualquier fuente se descarta y se pasa a la siguiente.
 */
export function detectLang({ search, stored, browserLangs }: LangSources): Lang {
  const fromUrl = toLang(new URLSearchParams(search).get(LANG_PARAM))
  if (fromUrl) return fromUrl

  const fromStorage = toLang(stored)
  if (fromStorage) return fromStorage

  for (const tag of browserLangs) {
    const fromBrowser = toLang(primarySubtag(tag))
    if (fromBrowser) return fromBrowser
  }

  return DEFAULT_LANG
}
