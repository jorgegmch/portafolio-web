import { useEffect } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'

/** El propio elemento o su antepasado más cercano con position: sticky. */
const stickyAncestor = (element: Element): HTMLElement | null => {
  for (let current: Element | null = element; current; current = current.parentElement) {
    if (current instanceof HTMLElement && getComputedStyle(current).position === 'sticky') {
      return current
    }
  }
  return null
}

const px = (value: string) => Number.parseFloat(value) || 0

/**
 * Distancia del borde superior del elemento al inicio del documento, como si
 * nada estuviera fijado. Con la cortina, cada escena es un panel sticky: si
 * está fijado, el navegador lo pinta arriba, lejos de su sitio en el flujo,
 * y scrollIntoView acaba en otro lugar (la auditoría lo midió al volver con
 * Atrás). Aquí el sitio del panel se suma a mano: el borde de su contenedor
 * más el alto de los hermanos de antes y los huecos entre ellos. Lo que haya
 * dentro del panel se mueve con él, así que su distancia al borde del panel
 * sí se puede medir.
 */
const documentTop = (element: Element): number => {
  const panel = stickyAncestor(element)
  const container = panel?.parentElement
  if (!panel || !container) return element.getBoundingClientRect().top + window.scrollY

  const style = getComputedStyle(container)
  const gap = px(style.rowGap)
  let top =
    container.getBoundingClientRect().top +
    window.scrollY +
    px(style.borderTopWidth) +
    px(style.paddingTop)
  for (const sibling of container.children) {
    if (sibling === panel) break
    if (sibling instanceof HTMLElement) top += sibling.offsetHeight + gap
  }
  return top + element.getBoundingClientRect().top - panel.getBoundingClientRect().top
}

/**
 * Coloca la vista tras cada navegación, porque React Router cambia la URL
 * pero no hace scroll:
 * - con ancla, va a su elemento, también al volver con Atrás o Adelante
 *   (para eso esa entrada del historial no la restaura el navegador),
 *   dejando arriba el scroll-margin-top del destino (el sitio de la barra
 *   fija). Que el movimiento sea suave o instantáneo lo decide
 *   scroll-behavior en global.css;
 * - sin ancla, sube al inicio de golpe, salvo al cargar la página o al ir
 *   atrás y adelante, donde el navegador restaura la posición por su cuenta.
 */
export function useScrollToHash(): void {
  // key cambia en cada navegación, también al repetir el mismo destino.
  const { hash, key } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    // Con la restauración automática, al volver con Atrás el navegador pone
    // la posición que guardó para la entrada y pisa la de la sección (en
    // Chrome acababa en 0). El modo es de cada entrada del historial: las que
    // llevan ancla las coloca este hook; las demás las sigue restaurando el
    // navegador, también al recargar.
    history.scrollRestoration = hash ? 'manual' : 'auto'
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (!target) return
      const margin = px(getComputedStyle(target).scrollMarginTop)
      window.scrollTo({ top: documentTop(target) - margin, left: 0 })
      return
    }
    // Pop es la carga inicial y el historial (atrás y adelante).
    if (navigationType === NavigationType.Pop) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [hash, key, navigationType])
}
