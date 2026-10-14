import styles from '@/components/ui/StatIcon.module.css'

export type StatIconName = 'clock' | 'folder' | 'layers'

/** Dibujos propios, de trazo, en un cuadro de 24. */
const PATHS: Record<StatIconName, string> = {
  clock: 'M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0ZM12 7v5l3 2',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  layers: 'M12 3l9 5-9 5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
}

interface StatIconProps {
  name: StatIconName
  /** Clase de quien lo usa; el color lo hereda con currentColor. */
  className?: string
}

/**
 * Icono decorativo de una tarjeta de cifras. Va oculto al lector de pantalla
 * y sin foco: el texto de la tarjeta ya dice lo que significa.
 */
export function StatIcon({ name, className }: StatIconProps) {
  return (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
