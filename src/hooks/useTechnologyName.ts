import { useCallback } from 'react'
import { type TechnologyId, technologyName } from '@/data/technologies'
import { useLang } from '@/hooks/useLang'

/**
 * Nombre visible de una tecnología en el idioma del sitio: el que da el
 * diccionario si lo da (los agentes de IA) y, si no, su nombre propio del
 * catálogo, que no se traduce.
 */
export function useTechnologyName(): (id: TechnologyId) => string {
  const { t } = useLang()
  const names = t.technologyNames
  return useCallback((id: TechnologyId) => names[id] ?? technologyName(id), [names])
}
