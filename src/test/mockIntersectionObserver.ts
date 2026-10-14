import { vi } from 'vitest'

/**
 * Instala un IntersectionObserver controlable (jsdom no lo implementa).
 * Cada observador guarda su callback, y el test decide con `trigger` cuándo
 * un elemento entra en pantalla o sale de ella. Solo se avisa a los
 * observadores que observan ese elemento: nunca a uno desconectado ni por un
 * elemento que ya dejaron de observar.
 */
export function mockIntersectionObserver() {
  const instances: FakeIntersectionObserver[] = []

  class FakeIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly scrollMargin = '0px'
    readonly thresholds: readonly number[] = []
    /** Elementos que observa ahora mismo. */
    observed: Element[] = []
    /** Cada elemento que dejó de observar con unobserve, en orden. */
    unobserved: Element[] = []
    disconnected = false
    readonly callback: IntersectionObserverCallback

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
      instances.push(this)
    }

    observe(target: Element) {
      this.observed.push(target)
    }

    unobserve(target: Element) {
      this.observed = this.observed.filter((element) => element !== target)
      this.unobserved.push(target)
    }

    disconnect() {
      this.observed = []
      this.disconnected = true
    }

    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)

  return {
    instances,
    /** El último observador creado; falla si no se creó ninguno. */
    last(): FakeIntersectionObserver {
      const observer = instances.at(-1)
      if (!observer) throw new Error('No se creó ningún IntersectionObserver')
      return observer
    },
    /**
     * Avisa de que `target` entra en pantalla o sale de ella a cada
     * observador que lo observa. Devuelve a cuántos avisó.
     */
    trigger(target: Element, isIntersecting: boolean): number {
      const watchers = instances.filter((observer) => observer.observed.includes(target))
      // jsdom no calcula layout: sus rectángulos miden cero.
      const rect = target.getBoundingClientRect()
      for (const observer of watchers) {
        const entry: IntersectionObserverEntry = {
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
          time: performance.now(),
        }
        observer.callback([entry], observer)
      }
      return watchers.length
    },
  }
}
