import { useEffect, useState } from 'react'

/**
 * Línea de la ventana que decide la escena actual: una franja del 1 % de
 * alto a un 40 % de arriba, bajo la barra fija y donde se lee la página.
 */
export const ACTIVE_LINE_MARGIN = '-40% 0px -59% 0px'

/**
 * Id de la escena que se ve, de entre `ids` (en su orden en la página), o
 * null si ninguna cruza la línea. Con la cortina, el panel de abajo sigue
 * fijado, cruzando la línea, mientras el siguiente sube encima: por eso,
 * entre las que cruzan, gana la que va después.
 *
 * `ids` debe ser estable (una constante): si cambia, vuelve a observar.
 * Sin IntersectionObserver devuelve siempre null.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    const crossing = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) crossing.add(target)
          else crossing.delete(target)
        }
        const top = elements.findLast((element) => crossing.has(element))
        setActive(top?.id ?? null)
      },
      { rootMargin: ACTIVE_LINE_MARGIN },
    )
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [ids])

  return active
}
