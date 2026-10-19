import { type RefObject, useEffect } from 'react'

/** Variable CSS en la que cada panel recibe su desplazamiento de sticky. */
export const CURTAIN_TOP_PROPERTY = '--curtain-top'

/**
 * Intentos de colocar el foco. El panel que tapa también puede estar fijo, y
 * no baja hasta que la página sube lo bastante para soltarlo: cada intento
 * vuelve a medir, y en pocos pasos el elemento queda a la vista.
 */
const MAX_REVEAL_STEPS = 6
/** Fotogramas seguidos sin moverse para dar por terminado el desplazamiento. */
const SETTLED_FRAMES = 3
/** Tope de espera, en fotogramas (unos 3 s): no se pelea con el visitante. */
const MAX_WAIT_FRAMES = 180

/** El hijo directo del contenedor que contiene al elemento: su panel. */
const panelOf = (container: HTMLElement, element: Element): Element | null => {
  let current: Element | null = element
  while (current && current.parentElement !== container) current = current.parentElement
  return current
}

/**
 * Apoyo en JavaScript de la cortina entre escenas, que hace el CSS:
 *
 * - Punto de fijado: un panel más alto que la ventana se queda fijo cuando su
 *   borde inferior llega al de la ventana, no el superior. Así todo su
 *   contenido pasa por la vista antes de que el siguiente suba encima. Uno
 *   más bajo se queda fijo arriba. El valor (cero o negativo, en px) va en
 *   --curtain-top de cada hijo del contenedor, y se recalcula si cambia el
 *   alto de un panel (idioma, fuentes) o el de la ventana.
 * - Foco visible (WCAG 2.4.11): si el foco cae en un panel fijo que el
 *   siguiente ya tapa, el navegador cree que está a la vista. Aquí, cuando
 *   termina el desplazamiento del navegador hacia el foco (es suave: si se
 *   corrigiera antes, lo pisaría), se sube la página lo justo para
 *   destaparlo, sin cambiar capas.
 *
 * Sin ResizeObserver no fija nada: el CSS cae en 0.
 */
export function useCurtain(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return

    const panels = () =>
      [...container.children].filter((child): child is HTMLElement => child instanceof HTMLElement)
    const update = () => {
      for (const panel of panels()) {
        const offset = Math.min(0, window.innerHeight - panel.offsetHeight)
        panel.style.setProperty(CURTAIN_TOP_PROPERTY, `${offset}px`)
      }
    }

    // Un paso de colocación. Si el panel siguiente tapa al elemento (se deja
    // libre además el hueco entre paneles, para que el anillo se vea entero),
    // la página sube hasta que ese panel baja al borde inferior de la
    // ventana: el del foco queda destapado del todo, sin atenuar. Si el
    // elemento queda entonces por encima de la ventana, se sube lo que falte.
    // Devuelve si desplazó.
    const step = (target: Element, next: Element) => {
      const margin = Number.parseFloat(getComputedStyle(container).rowGap) || 0
      const box = target.getBoundingClientRect()
      const nextTop = next.getBoundingClientRect().top
      const covered = box.bottom + margin > Math.min(window.innerHeight, nextTop)
      const shift = covered ? window.innerHeight - nextTop : margin - box.top
      if (shift <= 0) return false
      window.scrollBy({ top: -shift, behavior: 'instant' })
      return true
    }

    // Se mide solo con la página quieta: el desplazamiento al enfocar es
    // suave, y la escala de la cortina se actualiza un fotograma después del
    // scroll. Tras cada paso se vuelve a esperar.
    let waiting = 0
    const stopWaiting = () => cancelAnimationFrame(waiting)
    const reveal = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return
      const target = event.target
      const next = panelOf(container, target)?.nextElementSibling
      if (!next) return

      stopWaiting()
      let last = window.scrollY
      let still = 0
      let frames = 0
      let steps = 0
      const tick = () => {
        frames += 1
        still = window.scrollY === last ? still + 1 : 0
        last = window.scrollY
        if (still >= SETTLED_FRAMES) {
          if (steps >= MAX_REVEAL_STEPS || !step(target, next)) return
          steps += 1
          still = 0
          last = window.scrollY
        }
        if (frames < MAX_WAIT_FRAMES) waiting = requestAnimationFrame(tick)
      }
      waiting = requestAnimationFrame(tick)
    }

    const observer = new ResizeObserver(update)
    for (const panel of panels()) observer.observe(panel)
    window.addEventListener('resize', update)
    container.addEventListener('focusin', reveal)
    update()

    return () => {
      observer.disconnect()
      stopWaiting()
      window.removeEventListener('resize', update)
      container.removeEventListener('focusin', reveal)
    }
  }, [containerRef])
}
