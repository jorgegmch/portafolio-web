import { useId, useRef } from 'react'
import styles from '@/components/ui/CvDownload.module.css'
import { useDismissibleMenu } from '@/hooks/useDismissibleMenu'
import { useMenuPlacement } from '@/hooks/useMenuPlacement'

interface CvDownloadProps {
  /** Nombre del control, ya traducido (por ejemplo, "Descargar CV"). */
  label: string
  /** Texto corto para pantallas estrechas; el nombre accesible sigue siendo `label`. */
  shortLabel?: string
  /** Un archivo por versión, con su nombre ya traducido y su URL. */
  options: readonly { label: string; href: string }[]
  /**
   * Nombre accesible cuando debe decir más que el texto visible; empieza por
   * ese texto. Sin él, el nombre es `label`.
   */
  accessibleLabel?: string
  /** Clase del botón, en lugar del enlace subrayado del Hero. */
  toggleClassName?: string
  /** Clase de la caja del control: su ancho y su sitio los decide quien lo usa. */
  className?: string
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
 *
 * La lista se abre hacia arriba, alineada al borde derecho del botón: abajo
 * la tapaba la cinta del Hero y a la izquierda se salía de su panel. Si
 * arriba no cabe, se abre hacia abajo, y si a la derecha se saldría por la
 * izquierda, se alinea a la izquierda (useMenuPlacement).
 *
 * Lo usan «Descargar CV» del Hero y el botón de CV de Contacto: quien lo usa
 * puede darle otra clase al botón y a su caja.
 */
export function CvDownload({
  label,
  shortLabel,
  options,
  accessibleLabel,
  toggleClassName,
  className,
}: CvDownloadProps) {
  const { open, setOpen, toggleRef, areaRef } = useDismissibleMenu<HTMLDivElement>()
  const listRef = useRef<HTMLUListElement>(null)
  const placement = useMenuPlacement(listRef, open)
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
  const name = accessibleLabel ?? (shortLabel ? label : undefined)
  const toggleClass = toggleClassName ?? styles.toggle

  if (options.length === 1) {
    return (
      <a className={toggleClass} href={only.href} download aria-label={name}>
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
    <div ref={areaRef} className={className ? `${styles.root} ${className}` : styles.root}>
      <button
        ref={toggleRef}
        type="button"
        className={toggleClass}
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
      <ul
        ref={listRef}
        id={listId}
        className={styles.list}
        data-placement={placement.block}
        data-align={placement.inline}
        hidden={!open}
      >
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
