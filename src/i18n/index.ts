import { en } from '@/i18n/en'
import { es } from '@/i18n/es'
import type { Dictionary, Lang } from '@/i18n/types'

export const dictionaries: Record<Lang, Dictionary> = { es, en }

export { DEFAULT_LANG, LANGS, type Dictionary, type Lang } from '@/i18n/types'
