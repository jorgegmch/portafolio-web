// Sin imports: scripts/generate-world-map.ts usa este módulo tal cual con Node.

/** Recorte del mapa, en grados: sin la Antártida ni el Ártico extremo. */
export const MAP_BOUNDS = { north: 84, south: -60, west: -180, east: 180 } as const

/**
 * Cuadro del mapa, en unidades del viewBox. 360° de ancho y 144° de alto
 * dan la misma escala en los dos ejes: 1000 / 360 = 400 / 144.
 */
export const MAP_SIZE = { width: 1000, height: 400 } as const

export interface Coordinates {
  lat: number
  lon: number
}

export interface MapPoint {
  x: number
  y: number
}

/**
 * Proyección equirectangular: la longitud va lineal al eje X y la latitud al
 * eje Y, con el norte arriba. Un punto fuera del recorte lanza RangeError.
 */
export function project({ lat, lon }: Coordinates): MapPoint {
  const { north, south, west, east } = MAP_BOUNDS
  const inside = lat >= south && lat <= north && lon >= west && lon <= east
  if (!inside) {
    throw new RangeError(`Punto fuera del mapa: ${lat}, ${lon}`)
  }

  return {
    x: ((lon - west) / (east - west)) * MAP_SIZE.width,
    y: ((north - lat) / (north - south)) * MAP_SIZE.height,
  }
}
