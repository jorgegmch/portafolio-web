import { useContext } from 'react'
import { type MotionPause, MotionPauseContext } from '@/hooks/MotionPauseContext'

/** Estado de la pausa global de animaciones y la acción que la alterna. */
export function useMotionPause(): MotionPause {
  return useContext(MotionPauseContext)
}
