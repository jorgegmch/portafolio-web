import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Hero } from '@/components/sections/Hero'
import styles from '@/components/sections/Hero.module.css'
import { ROLE_ROTATION } from '@/config/heroRoles'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { dictionaries } from '@/i18n/index'
import { LangProvider } from '@/i18n/LangProvider'
import { LANGS, type Lang } from '@/i18n/types'
import { mockMatchMedia } from '@/test/mockMatchMedia'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const BROWSER_LANGS = { es: ['es-CO'], en: ['en-US'] } as const

// Cada texto se ve entero y después cambia: su turno incluye el cambio.
const TURN = ROLE_ROTATION.visibleMs + ROLE_ROTATION.transitionMs

// Si una clase no existiera, las comprobaciones pasarían en vacío.
const CURRENT = styles.roleCurrent ?? ''
const LEAVING = styles.roleLeaving ?? ''
const HIDDEN = styles.visuallyHidden ?? ''
if (!CURRENT || !LEAVING || !HIDDEN) throw new Error('Hero.module.css no define las clases del rol')

const tree = (introPlaying: boolean) => (
  <MemoryRouter>
    <LangProvider>
      <IntroPlayingContext value={introPlaying}>
        <Hero />
      </IntroPlayingContext>
    </LangProvider>
  </MemoryRouter>
)

const renderHero = ({ lang = 'es', introPlaying = false }: { lang?: Lang; introPlaying?: boolean } = {}) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(BROWSER_LANGS[lang])
  return render(tree(introPlaying))
}

const rolesOf = (lang: Lang = 'es') => dictionaries[lang].hero.roles
const phrase = (lang: Lang = 'es') => screen.getByText(rolesOf(lang).join(', '))
const role = (lang: Lang = 'es') => {
  const paragraph = phrase(lang).parentElement
  if (!paragraph) throw new Error('La frase del rol no tiene párrafo')
  return paragraph
}
const stack = (lang: Lang = 'es') => {
  const layer = role(lang).querySelector('[aria-hidden="true"]')
  if (!layer) throw new Error('El rol no tiene capa decorativa')
  return layer
}
/** Texto de cada elemento de la capa que lleva esa clase, sin su cursor. */
const textsWith = (className: string, lang: Lang = 'es') =>
  [...stack(lang).children]
    .filter((item) => item.classList.contains(className))
    .map((item) => item.firstChild?.textContent)

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

const setTabHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  Reflect.deleteProperty(document, 'hidden')
  document.documentElement.removeAttribute('lang')
})

describe('Hero: rol que rota', () => {
  describe('rotación', () => {
    it.each(LANGS)('en %s, al llegar se ve el primero y solo ese', (lang) => {
      renderHero({ lang })

      expect(textsWith(CURRENT, lang)).toEqual([rolesOf(lang)[0]])
    })

    it('cada texto se ve sus cuatro segundos enteros y después cambia en medio segundo', () => {
      renderHero()

      advance(TURN - 1)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])

      advance(1)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[1]])
      expect(TURN).toBe(4500)
    })

    it('el que se acaba de ver sale, y los demás esperan sin ninguna de las dos clases', () => {
      renderHero()

      advance(TURN)

      expect(textsWith(LEAVING)).toEqual([rolesOf()[0]])
      expect(textsWith(CURRENT)).toEqual([rolesOf()[1]])
      expect(stack().children[2]?.className).not.toContain(CURRENT)
      expect(stack().children[2]?.className).not.toContain(LEAVING)
    })

    it.each(LANGS)('en %s, recorre los tres en orden y vuelve al primero', (lang) => {
      renderHero({ lang })
      const seen = [textsWith(CURRENT, lang)]

      for (let turn = 0; turn < rolesOf(lang).length; turn += 1) {
        advance(TURN)
        seen.push(textsWith(CURRENT, lang))
      }

      expect(seen.flat()).toEqual([...rolesOf(lang), rolesOf(lang)[0]])
    })

    // Los tres siguen siempre en la celda: así la línea no cambia de alto.
    it('rote lo que rote, los tres textos siguen en la capa y solo uno se ve', () => {
      renderHero()

      for (let turn = 0; turn < 7; turn += 1) {
        expect(stack().children).toHaveLength(rolesOf().length)
        expect(textsWith(CURRENT)).toHaveLength(1)
        expect(textsWith(LEAVING)).toHaveLength(1)
        advance(TURN)
      }
    })
  })

  describe('animación de carga', () => {
    it('mientras tapa la página no rota ni deja temporizador', () => {
      renderHero({ introPlaying: true })

      expect(vi.getTimerCount()).toBe(0)
      advance(TURN * 4)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])
    })

    // El primer texto no se gasta debajo de la intro.
    it('al terminar, el primero se ve su tiempo entero antes de cambiar', () => {
      const { rerender } = renderHero({ introPlaying: true })
      advance(TURN * 4)

      rerender(tree(false))

      advance(TURN - 1)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])
      advance(1)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[1]])
    })
  })

  describe('movimiento reducido', () => {
    it('el texto es el primero, fijo, y no hay ningún temporizador', () => {
      mockMatchMedia({ [REDUCED_MOTION]: true })
      renderHero()

      expect(vi.getTimerCount()).toBe(0)
      advance(TURN * 4)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])
      expect(vi.getTimerCount()).toBe(0)
    })

    it('si se pide con la rotación ya avanzada, vuelve al primero y se detiene', () => {
      const media = mockMatchMedia({ [REDUCED_MOTION]: false })
      renderHero()
      advance(TURN * 2)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[2]])

      act(() => media.setMatches(true, REDUCED_MOTION))

      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])
      expect(vi.getTimerCount()).toBe(0)
      advance(TURN * 4)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])
    })
  })

  describe('pestaña oculta y desmontaje', () => {
    it('con la pestaña oculta no rota ni deja temporizador, y al volver sigue', () => {
      renderHero()

      setTabHidden(true)
      expect(vi.getTimerCount()).toBe(0)
      advance(TURN * 4)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[0]])

      setTabHidden(false)
      advance(TURN)
      expect(textsWith(CURRENT)).toEqual([rolesOf()[1]])
    })

    it('rotando hay un solo temporizador, y al desmontar no queda ninguno', () => {
      const { unmount } = renderHero()
      advance(TURN * 2)
      expect(vi.getTimerCount()).toBe(1)

      unmount()

      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('lectores de pantalla', () => {
    it.each(LANGS)('en %s, los tres textos van en una sola frase, fuera de la capa animada', (lang) => {
      renderHero({ lang })

      expect(phrase(lang).textContent).toBe(rolesOf(lang).join(', '))
      expect(phrase(lang).tagName).toBe('SPAN')
      expect(stack(lang).contains(phrase(lang))).toBe(false)
      expect(role(lang).firstElementChild).toBe(phrase(lang))
    })

    // Ni display: none ni hidden: los quitarían del árbol de accesibilidad.
    it('la frase se oculta solo a la vista, con su clase', () => {
      renderHero()

      expect(phrase()).toHaveClass(HIDDEN)
      expect(phrase()).not.toHaveAttribute('hidden')
      expect(phrase()).not.toHaveAttribute('aria-hidden')
      expect(phrase().closest('[aria-hidden="true"], [hidden]')).toBeNull()
    })

    it('la frase no cambia mientras el rol rota', () => {
      renderHero()
      const node = phrase()
      const text = node.textContent

      advance(TURN * 4)

      expect(phrase()).toBe(node)
      expect(node.textContent).toBe(text)
    })

    it('la capa animada está oculta y nada en el rol anuncia los cambios', () => {
      renderHero()

      expect(stack()).toHaveAttribute('aria-hidden', 'true')
      expect(role().closest('[aria-live]')).toBeNull()
      expect(role().querySelector('[aria-live], [role="status"], [role="alert"], [role="marquee"], [role="timer"]')).toBeNull()

      advance(TURN * 2)

      expect(role().closest('[aria-live]')).toBeNull()
      expect(role().querySelector('[aria-live], [role]')).toBeNull()
    })
  })
})
