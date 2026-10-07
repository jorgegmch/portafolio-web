import { useRef } from 'react'
import styles from '@/components/layout/ParticleBackground.module.css'
import { useParticleCanvas } from '@/hooks/useParticleCanvas'

/**
 * Fondo de partículas de la página. Es decorativo: queda fuera del árbol de
 * accesibilidad, y la animación la lleva useParticleCanvas.
 */
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef)

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
