import { createContext } from 'react'

export interface MotionPause {
  /** true si el visitante pausó las animaciones que se mueven solas. */
  paused: boolean
  togglePaused: () => void
}

/**
 * Pausa global de las animaciones (WCAG 2.2.2). La publica el armazón, que
 * guarda el estado; la leen el botón de pausa y quien anime por JavaScript.
 * Sin proveedor, nada está pausado y el botón no hace nada.
 */
export const MotionPauseContext = createContext<MotionPause>({
  paused: false,
  togglePaused: () => {},
})
