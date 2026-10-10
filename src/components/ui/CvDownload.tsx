import { useId } from 'react'
import styles from '@/components/ui/CvDownload.module.css'
import { useDismissibleMenu } from '@/hooks/useDismissibleMenu'

interface CvDownloadProps {
  /** Nombre del control, ya traducido (por ejemplo, "Descargar CV"). */
  label: string
  /** Un archivo por versión, con su nombre ya traducido y su URL. */
  options: readonly { label: string; href: string }[]
}

/**
 * Descarga del CV. Con varias versiones es un botón que despliega un enlace
 * por cada una; con una sola, un enlace directo; sin ninguna, no se muestra.
 * El menú se abre con Enter o Espacio (es un botón nativo) y se cierra con
 * Escape, al elegir, al hacer clic fuera o al salir con Tab.
 */
export function CvDownload({ label, options }: CvDownloadProps) {
  const { open, setOpen, toggleRef, areaRef } = useDismissibleMenu<HTMLDivElement>()
  const listId = useId()
  const [only] = options

  if (!only) return null

  if (options.length === 1) {
    return (
      <a className={styles.toggle} href={only.href} download>
        {label}
      </a>
    )
  }

  // El foco vuelve al botón: el enlace pulsado queda oculto al cerrar.
  const closeAfterChoice = () => {
    setOpen(false)
    toggleRef.current?.focus()
  }

  return (
    <div ref={areaRef} className={styles.root}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {label}
      </button>
      <ul id={listId} className={styles.list} hidden={!open}>
        {options.map((option) => (
          <li key={option.href}>
            <a className={styles.option} href={option.href} download onClick={closeAfterChoice}>
              {option.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
