/**
 * Lo que se puede marcar en «¿Qué necesitas?» del formulario de contacto
 * (spec §5), en el orden en que se ofrece. Los nombres viven en i18n/.
 */
export const contactNeeds = [
  'backend',
  'frontend',
  'full-stack',
  'databases',
  'automation-ai',
  'other',
] as const

export type ContactNeedId = (typeof contactNeeds)[number]
