import { type RefObject, useEffect } from 'react'

/** Lo que le falta a una tarjeta para medir lo que la última, en px. */
export const CARD_SLACK_PROPERTY = '--card-slack'
/** Lo mismo, de la tarjeta anterior: la siguiente lo compensa en el flujo. */
export const PREVIOUS_SLACK_PROPERTY = '--previous-slack'

/**
 * Apoyo en JavaScript de la pila de tarjetas, que hace el CSS
 * (Projects.module.css). Al final de la pila, el borde del contenedor empuja
 * hacia arriba a las tarjetas fijadas; el margen inferior de cada una decide
 * dónde se queda. Para que cada tarjeta quede un paso por encima de la
 * siguiente, ese margen tiene que contar también la diferencia de alto con la
 * última: si no, una tarjeta más alta que la anterior taparía su franja.
 *
 * Aquí se mide esa diferencia (alto de la última menos alto de cada una) y
 * se publica en px en --card-slack de cada tarjeta, y la de la anterior en
 * --previous-slack. Se recalcula si cambia el alto de alguna (idioma,
 * fuentes, ancho de la ventana). Sin ResizeObserver no publica nada: el CSS
 * cae en 0, que vale para tarjetas de igual alto.
 */
export function useCardStack(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const cards = () =>
      [...container.children].filter((child): child is HTMLElement => child instanceof HTMLElement)
    // offsetHeight es el alto de maquetación: ni la escala de la pila ni los
    // márgenes que se ponen aquí lo cambian, así que no hay bucle.
    const update = () => {
      const list = cards()
      const lastHeight = list.at(-1)?.offsetHeight ?? 0
      let previousSlack = 0
      for (const card of list) {
        const slack = lastHeight - card.offsetHeight
        card.style.setProperty(CARD_SLACK_PROPERTY, `${slack}px`)
        card.style.setProperty(PREVIOUS_SLACK_PROPERTY, `${previousSlack}px`)
        previousSlack = slack
      }
    }

    const observer = new ResizeObserver(update)
    for (const card of cards()) observer.observe(card)
    update()

    return () => observer.disconnect()
  }, [containerRef])
}
