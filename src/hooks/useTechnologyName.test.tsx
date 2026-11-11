import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTechnologyName } from '@/hooks/useTechnologyName'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

// Los nombres de tecnología son nombres propios y no se traducen, salvo los
// que el diccionario del idioma da aparte (decisión del autor, 2026-11-11):
// «Agentes de IA» en español y «AI Agents» en inglés.
const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

const nameIn = (lang: keyof typeof BROWSER_LANGS) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  const wrapper = ({ children }: { children: ReactNode }) => <LangProvider>{children}</LangProvider>
  return renderHook(() => useTechnologyName(), { wrapper }).result.current
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('lang')
})

describe('useTechnologyName', () => {
  it('los agentes de IA se llaman en el idioma del sitio', () => {
    expect(nameIn('es')('ai-agents')).toBe('Agentes de IA')
    expect(nameIn('en')('ai-agents')).toBe('AI Agents')
  })

  it('el resto conserva su nombre propio en los dos idiomas', () => {
    for (const lang of ['es', 'en'] as const) {
      const name = nameIn(lang)
      expect(name('java')).toBe('Java')
      expect(name('git-github')).toBe('Git / GitHub')
    }
  })

  it('los diccionarios solo traducen los agentes de IA', () => {
    expect(Object.keys(dictionaries.es.technologyNames)).toEqual(['ai-agents'])
    expect(Object.keys(dictionaries.en.technologyNames)).toEqual(['ai-agents'])
  })
})
