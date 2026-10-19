import { useId } from 'react'
import styles from '@/components/layout/FilmGrain.module.css'

/** Frecuencia y octavas del ruido (spec §3.7): grano fino, sin manchas. Son
    atributos de SVG, no propiedades CSS: no pueden salir de un token. */
const NOISE_FREQUENCY = 0.9
const NOISE_OCTAVES = 2

/**
 * Grano de película: una textura de ruido fija sobre toda la página. Es
 * decorativa: no se anima, no recibe clics y queda fuera del árbol accesible.
 * La opacidad y la mezcla salen del CSS.
 */
export function FilmGrain() {
  const filterId = useId()

  return (
    <svg className={styles.grain} aria-hidden="true" focusable="false">
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency={NOISE_FREQUENCY}
          numOctaves={NOISE_OCTAVES}
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  )
}
