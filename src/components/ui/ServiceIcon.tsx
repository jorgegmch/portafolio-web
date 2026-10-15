import styles from '@/components/ui/ServiceIcon.module.css'
import type { ServiceIconName } from '@/data/types'

/** Dibujos propios, de trazo, en un cuadro de 24. */
const PATHS: Record<ServiceIconName, string> = {
  // Dos módulos de servidor.
  server: 'M4 4h16v6H4ZM4 14h16v6H4ZM8 7h.01M8 17h.01M12 7h4M12 17h4',
  // Una ventana con «< >» dentro.
  window: 'M3 5h18v14H3ZM3 9h18M10 12l-2 2.5 2 2.5M14 12l2 2.5-2 2.5',
  // Un cilindro de tres niveles.
  database:
    'M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3ZM4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3',
  // La cabeza de un robot, con antena y orejas.
  agent: 'M5 8h14v11H5ZM12 4v4M9 13h.01M15 13h.01M9.5 16h5M3 12v3M21 12v3',
  // Dos globos de diálogo.
  chat: 'M3 5h11v8H8l-3 3v-3H3ZM17 9h4v8h-2v3l-3-3h-6v-2',
}

interface ServiceIconProps {
  name: ServiceIconName
  /** Clase de quien lo usa; el color lo hereda con currentColor. */
  className?: string
}

/**
 * Icono decorativo de una tarjeta de «Servicios». Va oculto al lector de
 * pantalla y sin foco: el título de la tarjeta ya dice lo que significa.
 */
export function ServiceIcon({ name, className }: ServiceIconProps) {
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
