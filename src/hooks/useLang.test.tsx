import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storageKeys } from '@/config/storage'
import { useLang } from '@/hooks/useLang'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'

const LANG_KEY = storageKeys.local.lang

const setUrl = (path: string) => window.history.replaceState(null, '', path)
const setBrowserLangs = (langs: string[]) =>
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(langs)

const renderUseLang = () => renderHook(() => useLang(), { wrapper: LangProvider })

beforeEach(() => {
  setUrl('/')
  setBrowserLangs(['es-CO'])
})

afterEach(() => {
  vi.restoreAllMocks()
  setUrl('/')
  document.documentElement.removeAttribute('lang')
})

describe('useLang', () => {
  describe('idioma inicial', () => {
    it('sin ninguna señal usa español, con sus textos y <html lang>', () => {
      setBrowserLangs([])
      const { result } = renderUseLang()

      expect(result.current.lang).toBe('es')
      expect(result.current.t).toBe(dictionaries.es)
      expect(document.documentElement.lang).toBe('es')
    })

    it('toma el idioma del navegador', () => {
      setBrowserLangs(['en-US'])
      const { result } = renderUseLang()

      expect(result.current.lang).toBe('en')
      expect(result.current.t).toBe(dictionaries.en)
      expect(document.documentElement.lang).toBe('en')
    })

    it('la elección guardada gana sobre el navegador', () => {
      localStorage.setItem(LANG_KEY, 'en')
      expect(renderUseLang().result.current.lang).toBe('en')
    })

    it('?lang= gana sobre la elección guardada', () => {
      localStorage.setItem(LANG_KEY, 'es')
      setUrl('/?lang=en')
      expect(renderUseLang().result.current.lang).toBe('en')
    })

    it('?lang= no se guarda en localStorage ni se quita de la URL', () => {
      setUrl('/?lang=en')
      renderUseLang()

      expect(localStorage.getItem(LANG_KEY)).toBeNull()
      expect(window.location.search).toBe('?lang=en')
    })
  })

  describe('al elegir un idioma', () => {
    it('cambia los textos y <html lang>', () => {
      const { result } = renderUseLang()

      act(() => result.current.setLang('en'))

      expect(result.current.lang).toBe('en')
      expect(result.current.t).toBe(dictionaries.en)
      expect(document.documentElement.lang).toBe('en')
    })

    it('guarda la elección en localStorage', () => {
      const { result } = renderUseLang()

      act(() => result.current.setLang('en'))

      expect(localStorage.getItem(LANG_KEY)).toBe('en')
    })

    it('quita ?lang= de la URL y conserva el resto', () => {
      setUrl('/certificaciones?utm=x&lang=en#top')
      const { result } = renderUseLang()

      act(() => result.current.setLang('es'))

      expect(window.location.pathname).toBe('/certificaciones')
      expect(window.location.search).toBe('?utm=x')
      expect(window.location.hash).toBe('#top')
    })

    it('la elección sobrevive a una recarga aunque la URL traía ?lang=', () => {
      setUrl('/?lang=en')
      const first = renderUseLang()
      act(() => first.result.current.setLang('es'))
      first.unmount()

      expect(renderUseLang().result.current.lang).toBe('es')
    })

    it('funciona con localStorage bloqueado', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('bloqueado', 'SecurityError')
      })
      const { result } = renderUseLang()

      act(() => result.current.setLang('en'))

      expect(result.current.lang).toBe('en')
      expect(document.documentElement.lang).toBe('en')
    })
  })

  it('lanza un error claro si se usa fuera de LangProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useLang())).toThrow('useLang debe usarse dentro de <LangProvider>')
  })
})
