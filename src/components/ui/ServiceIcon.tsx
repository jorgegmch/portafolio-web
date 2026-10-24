import type { ReactNode } from 'react'
import styles from '@/components/ui/ServiceIcon.module.css'
import type { ServiceIconName } from '@/data/types'

/**
 * Dibujos de trazo en un cuadro de 64, los del tablero del rediseño (spec
 * §3.3). Lo que lleva styles.pulse es una «luz»: late solo en opacidad. El
 * cursor de la ventana parpadea, también en opacidad. Las partes en segundo
 * plano van con styles.dim.
 */
const DRAWINGS: Record<ServiceIconName, ReactNode> = {
  // Tres módulos de servidor; la luz del primero late.
  server: (
    <>
      <rect x="10" y="8" width="44" height="13" rx="3" />
      <rect x="10" y="25" width="44" height="13" rx="3" />
      <rect x="10" y="42" width="44" height="13" rx="3" />
      <circle className={`${styles.light} ${styles.pulse}`} cx="46" cy="14.5" r="2" />
      <circle className={`${styles.light} ${styles.faint}`} cx="46" cy="31.5" r="2" />
      <circle className={`${styles.light} ${styles.faint}`} cx="46" cy="48.5" r="2" />
      <path className={styles.dim} d="M17 14.5h14M17 31.5h14M17 48.5h14" />
    </>
  ),
  // Una ventana con líneas de texto que laten y un cursor que parpadea.
  window: (
    <>
      <rect x="6" y="10" width="52" height="44" rx="4" />
      <path d="M6 20h52" />
      <path className={styles.pulse} d="M14 30h20M18 37h26M18 44h14" />
      <path className={styles.caret} d="M38 41v7" />
    </>
  ),
  // Tres capas: interfaz, API y datos; la del medio late.
  layers: (
    <>
      <path d="M32 8 56 20 32 32 8 20Z" />
      <path className={styles.pulse} d="M8 32l24 12 24-12" />
      <path className={styles.dim} d="M8 44l24 12 24-12" />
    </>
  ),
  // Un cilindro de tres niveles; el segundo late.
  database: (
    <>
      <ellipse cx="32" cy="14" rx="20" ry="7" />
      <path d="M12 14v36c0 4 9 7 20 7s20-3 20-7V14" />
      <path className={styles.pulse} d="M12 26c0 4 9 7 20 7s20-3 20-7" />
      <path className={styles.dim} d="M12 38c0 4 9 7 20 7s20-3 20-7" />
    </>
  ),
  // La cabeza de un robot; la luz de la antena late.
  agent: (
    <>
      <rect x="12" y="20" width="40" height="32" rx="8" />
      <path d="M32 20v-8" />
      <circle className={`${styles.light} ${styles.pulse}`} cx="32" cy="9" r="3" />
      <circle className={styles.light} cx="24" cy="35" r="3" />
      <circle className={styles.light} cx="40" cy="35" r="3" />
      <path d="M25 44h14" />
    </>
  ),
  // Dos globos de diálogo; el primer punto del de delante late.
  chat: (
    <>
      <path d="M10 14h34a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H26l-10 8v-8h-6a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" />
      <circle className={`${styles.light} ${styles.pulse}`} cx="18" cy="27" r="2.5" />
      <circle className={styles.light} cx="27" cy="27" r="2.5" />
      <circle className={`${styles.light} ${styles.faint}`} cx="36" cy="27" r="2.5" />
      <path className={styles.dim} d="M52 24h2a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4h-2v8l-8-8" />
    </>
  ),
}

interface ServiceIconProps {
  name: ServiceIconName
  /** Clase de quien lo usa; el color lo hereda con currentColor. */
  className?: string
}

/**
 * Icono decorativo de un servicio. Va oculto al lector de pantalla y sin
 * foco: el título de la fila ya dice lo que significa. Sus luces se paran
 * con la pausa global y quedan quietas con movimiento reducido.
 */
export function ServiceIcon({ name, className }: ServiceIconProps) {
  return (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {DRAWINGS[name]}
    </svg>
  )
}
