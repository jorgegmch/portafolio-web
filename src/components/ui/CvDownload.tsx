import { useId } from 'react'
import styles from '@/components/ui/CvDownload.module.css'
import { useDismissibleMenu } from '@/hooks/useDismissibleMenu'

interface CvDownloadProps {
  /** Nombre del control, ya traducido (por ejemplo, "Descargar CV"). */
  label: string
  /** Texto corto para pantallas estrechas; el nombre accesible sigue siendo `label`. */
  shortLabel?: string
  /** Un archivo por versión, con su nombre ya traducido y su URL. */
  options: readonly { label: string; href: string }[]
}

// Trazo de la flecha del botón: un galón que apunta abajo.
const ICON_CARET = 'M6 9l6 6 6-6'

/**
 * Descarga del CV. Con varias versiones es un botón que despliega un enlace
 * por cada una; con una sola, un enlace directo; sin ninguna, no se muestra.
 * La flecha del botón es decorativa y gira al abrir. Con texto corto van los
 * dos y el CSS deja ver uno según el ancho.
 * El menú se abre con Enter o Espacio (es un botón nativo) y se cierra con
 * Escape, al elegir, al hacer clic fuera o al salir con Tab.
 */
export function CvDownload({ label, shortLabel, options }: CvDownloadProps) {
  const { open, setOpen, toggleRef, areaRef } = useDismissibleMenu<HTMLDivElement>()
  const listId = useId()
  const [only] = options

  if (!only) return null

  const text = shortLabel ? (
    <>
      <span className={styles.labelLong}>{label}</span>
      <span className={styles.labelShort}>{shortLabel}</span>
    </>
  ) : (
    label
  )
  // Con dos textos, el nombre lo fija aria-label: no depende del que se vea.
  const name = shortLabel ? label : undefined

  if (options.length === 1) {
    return (
      <a className={styles.toggle} href={only.href} download aria-label={name}>
        {text}
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
        aria-label={name}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {text}
        <svg className={styles.caret} viewBox="0 0 24 24" aria-hidden="true">
          <path d={ICON_CARET} />
        </svg>
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
