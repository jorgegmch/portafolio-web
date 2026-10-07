import { useEffect } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'

/**
 * Coloca la vista tras cada navegación, porque React Router cambia la URL
 * pero no hace scroll:
 * - con ancla, va a su elemento; que el movimiento sea suave o instantáneo lo
 *   decide scroll-behavior en global.css;
 * - sin ancla, sube al inicio de golpe, salvo al cargar la página o al ir
 *   atrás y adelante, donde el navegador restaura la posición por su cuenta.
 */
export function useScrollToHash(): void {
  // key cambia en cada navegación, también al repetir el mismo destino.
  const { hash, key } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    // Pop es la carga inicial y el historial (atrás y adelante).
    if (navigationType === NavigationType.Pop) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [hash, key, navigationType])
}
