import { useContext } from 'react'
import { LangContext, type LangContextValue } from '@/i18n/LangContext'

/** Idioma activo, sus textos y la función para cambiarlo. */
export function useLang(): LangContextValue {
  const context = useContext(LangContext)
  if (!context) throw new Error('useLang debe usarse dentro de <LangProvider>')
  return context
}
