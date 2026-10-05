import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storageKeys } from '@/config/storage'
import { detectLang, LANG_PARAM } from '@/i18n/detectLang'
import { dictionaries } from '@/i18n/index'
import { LangContext, type LangContextValue } from '@/i18n/LangContext'
import type { Lang } from '@/i18n/types'
import { safeStorage } from '@/lib/safeStorage'

const readInitialLang = (): Lang =>
  detectLang({
    search: window.location.search,
    stored: safeStorage.get('local', storageKeys.local.lang),
    browserLangs: navigator.languages,
  })

// Si ?lang= siguiera en la URL, al recargar ganaría sobre la elección guardada.
const removeLangParam = () => {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(LANG_PARAM)) return
  url.searchParams.delete(LANG_PARAM)
  window.history.replaceState(window.history.state, '', url)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Solo la elección hecha con el selector se guarda. Un idioma recibido por
  // ?lang= vale para la visita, pero no cambia la preferencia del visitante.
  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    safeStorage.set('local', storageKeys.local.lang, next)
    removeLangParam()
  }, [])

  const value = useMemo<LangContextValue>(
    () => ({ lang, t: dictionaries[lang], setLang }),
    [lang, setLang],
  )

  return <LangContext value={value}>{children}</LangContext>
}
