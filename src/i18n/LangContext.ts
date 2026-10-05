import { createContext } from 'react'
import type { Dictionary, Lang } from '@/i18n/types'

export interface LangContextValue {
  lang: Lang
  /** Textos del idioma activo. */
  t: Dictionary
  /** Cambia el idioma por elección explícita del visitante y la recuerda. */
  setLang: (lang: Lang) => void
}

export const LangContext = createContext<LangContextValue | null>(null)
