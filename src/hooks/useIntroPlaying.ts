import { useContext } from 'react'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'

/**
 * true mientras la animación de carga tapa la página. Sirve para no empezar
 * debajo de ella algo que el visitante todavía no puede ver.
 */
export function useIntroPlaying(): boolean {
  return useContext(IntroPlayingContext)
}
