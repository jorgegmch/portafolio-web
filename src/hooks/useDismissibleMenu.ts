import { useEffect, useRef, useState } from 'react'

/**
 * Estado de un menú desplegable y su cierre: con Escape, que devuelve el foco
 * al botón que lo abre, y al hacer clic o llevar el foco fuera. Cuenta como
 * dentro el botón (`toggleRef`) y la zona del menú (`areaRef`), que puede ser
 * la lista sola o un envoltorio que también contenga el botón.
 */
export function useDismissibleMenu<Area extends HTMLElement>() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const areaRef = useRef<Area>(null)

  // Los listeners solo existen mientras el menú está abierto.
  useEffect(() => {
    if (!open) return

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node &&
      !areaRef.current?.contains(target) &&
      !toggleRef.current?.contains(target)

    const closeIfOutside = (event: Event) => {
      if (isOutside(event.target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return { open, setOpen, toggleRef, areaRef }
}
