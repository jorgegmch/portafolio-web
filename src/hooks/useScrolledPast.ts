import { type RefObject, useEffect, useState } from 'react'

/**
 * Si la página ya dejó atrás el elemento: true en cuanto sale de la ventana.
 * Pensado para una marca arriba del todo, que solo puede salir por arriba.
 * Sin IntersectionObserver devuelve siempre false.
 */
export function useScrolledPast(ref: RefObject<Element | null>): boolean {
  const [past, setPast] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver !== 'function') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setPast(!entry.isIntersecting)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return past
}
