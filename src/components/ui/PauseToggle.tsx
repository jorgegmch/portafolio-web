import styles from '@/components/ui/PauseToggle.module.css'

interface PauseToggleProps {
  /** Nombre fijo del botón, ya traducido: «Pausar animaciones». */
  label: string
  pressed: boolean
  onToggle: () => void
}

// Trazos del icono: dos barras de pausa o el triángulo de reanudar.
const ICON_PAUSE = 'M9 6v12M15 6v12'
const ICON_PLAY = 'M8 5.5v13l11-6.5z'

/**
 * Botón de pausa global de las animaciones. Su nombre no cambia: el estado lo
 * dice aria-pressed, y el icono pasa de pausa a reanudar. Con movimiento
 * reducido no hay nada que pausar y el CSS lo oculta.
 */
export function PauseToggle({ label, pressed, onToggle }: PauseToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onToggle}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={pressed ? ICON_PLAY : ICON_PAUSE} />
      </svg>
    </button>
  )
}
