import type { PlusPosition } from '@/i18n/types'

const PLUS = '+'

/**
 * Texto de una cifra para una tarjeta. Si es aproximada lleva un «+», del
 * lado que pide el idioma: «+20» o «20+». Una cifra exacta va sola.
 */
export function formatCount(
  count: { value: number; approximate: boolean },
  position: PlusPosition,
): string {
  if (!count.approximate) return String(count.value)
  return position === 'prefix' ? `${PLUS}${count.value}` : `${count.value}${PLUS}`
}
