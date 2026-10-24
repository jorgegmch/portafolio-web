import { type RefObject, useLayoutEffect, useState } from 'react'

/** Hacia dónde se abre la lista de un menú respecto a su botón. */
export type MenuPlacement = 'above' | 'below'

/** Borde superior visible: el de la ventana o el del ancestro que recorta. */
const visibleTop = (element: HTMLElement): number => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (getComputedStyle(parent).overflowY !== 'visible') {
      return Math.max(0, parent.getBoundingClientRect().top)
    }
  }
  return 0
}

/**
 * Dirección de una lista desplegable que se abre hacia arriba por defecto:
 * al abrirse, si encima del botón no cabe (hasta el borde de la ventana o
 * del panel que la recorta), pasa a abrirse hacia abajo. Se decide cada vez
 * que se abre, con el alto real de la lista; no hay nada que medir cerrada.
 *
 * La lista debe ser hija del elemento contra el que se coloca (su ancla).
 */
export function useMenuPlacement(listRef: RefObject<HTMLElement | null>, open: boolean): MenuPlacement {
  const [placement, setPlacement] = useState<MenuPlacement>('above')

  useLayoutEffect(() => {
    const list = listRef.current
    const anchor = list?.parentElement
    if (!open || !list || !anchor) return
    const listBox = list.getBoundingClientRect()
    const anchorBox = anchor.getBoundingClientRect()
    // El hueco entre la lista y el botón, sea cual sea el lado donde está.
    const gap = Math.max(0, anchorBox.top - listBox.bottom, listBox.top - anchorBox.bottom)
    const room = anchorBox.top - visibleTop(anchor)
    setPlacement(room >= listBox.height + gap ? 'above' : 'below')
  }, [open, listRef])

  return placement
}
