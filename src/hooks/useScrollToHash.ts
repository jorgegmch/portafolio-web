import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Lleva la vista al elemento del ancla de la URL. React Router cambia la URL
 * pero no hace scroll, así que hay que hacerlo aquí. Que el movimiento sea
 * suave o instantáneo lo decide scroll-behavior en global.css.
 */
export function useScrollToHash(): void {
  // key cambia en cada navegación, también al repetir el mismo ancla.
  const { hash, key } = useLocation()

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash, key])
}
