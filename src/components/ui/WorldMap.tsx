import styles from '@/components/ui/WorldMap.module.css'
import { site } from '@/config/site'
import { worldMap } from '@/data/worldMap'
import { project } from '@/lib/mapProjection'

/**
 * Radio del punto, en unidades del viewBox: escala con el mapa. Con 8 mide
 * unos 10 px con el mapa a 600 px de ancho y unos 4,5 px a 280, y no tapa
 * Colombia (unas 33 unidades de ancho).
 */
const CITY_RADIUS = 8

const city = project(site.coordinates)

interface WorldMapProps {
  /** Clase de quien lo usa, para colocarlo. */
  className?: string
}

/**
 * Mapa del mundo con un punto en la ciudad. Es decorativo: va oculto al
 * lector de pantalla y sin foco, porque la ubicación ya se dice en texto.
 */
export function WorldMap({ className }: WorldMapProps) {
  return (
    <svg
      className={className ? `${styles.map} ${className}` : styles.map}
      viewBox={`0 0 ${worldMap.width} ${worldMap.height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.land} d={worldMap.path} />
      <circle className={styles.city} cx={city.x} cy={city.y} r={CITY_RADIUS} />
    </svg>
  )
}
