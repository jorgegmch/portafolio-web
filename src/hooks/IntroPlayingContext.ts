import { createContext } from 'react'

/**
 * Si la animación de carga está tapando la página. Lo publica el armazón, que
 * es quien la monta. Sin proveedor vale `false`: no hay intro encima.
 */
export const IntroPlayingContext = createContext(false)
