import { type RefObject, useLayoutEffect, useState } from 'react'

/**
 * Dónde se abre la lista de un menú respecto a su botón: encima o debajo
 * (`block`), y alineada a su borde derecho o al izquierdo (`inline`).
 */
export interface MenuPlacement {
  block: 'above' | 'below'
  inline: 'end' | 'start'
}

const DEFAULT_PLACEMENT: MenuPlacement = { block: 'above', inline: 'end' }

/** Bordes visibles: los de la ventana o los del ancestro que recorta. */
const visibleBox = (element: HTMLElement) => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent)
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
      const box = parent.getBoundingClientRect()
      return { top: Math.max(0, box.top), left: Math.max(0, box.left) }
    }
  }
  return { top: 0, left: 0 }
}

/**
 * Colocación de una lista desplegable que se abre, por defecto, encima del
 * botón y alineada a su borde derecho. Al abrirse se comprueba, con el
 * tamaño real de la lista, si cabe así hasta el borde de la ventana o del
 * panel que la recorta: si arriba no cabe, se abre debajo; si a la derecha
 * se saldría por la izquierda, se alinea a la izquierda. Se decide cada vez
 * que se abre; cerrada no hay nada que medir.
 *
 * La lista debe ser hija del elemento contra el que se coloca (su ancla).
 */
export function useMenuPlacement(listRef: RefObject<HTMLElement | null>, open: boolean): MenuPlacement {
  const [placement, setPlacement] = useState<MenuPlacement>(DEFAULT_PLACEMENT)

  useLayoutEffect(() => {
    const list = listRef.current
    const anchor = list?.parentElement
    if (!open || !list || !anchor) return
    const listBox = list.getBoundingClientRect()
    const anchorBox = anchor.getBoundingClientRect()
    const visible = visibleBox(anchor)
    // El hueco entre la lista y el botón, sea cual sea el lado donde está.
    const gap = Math.max(0, anchorBox.top - listBox.bottom, listBox.top - anchorBox.bottom)
    setPlacement({
      block: anchorBox.top - visible.top >= listBox.height + gap ? 'above' : 'below',
      inline: anchorBox.right - listBox.width >= visible.left ? 'end' : 'start',
    })
  }, [open, listRef])

  return placement
}
