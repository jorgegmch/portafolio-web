import styles from '@/components/ui/Ribbon.module.css'

interface RibbonProps {
  /** Lo que recorre la cinta, en orden. */
  items: readonly string[]
  /**
   * Nombre accesible de la lista. Con él, el lector de pantalla oye la lista
   * una sola vez; sin él, la cinta entera es decorativa y queda oculta.
   */
  label?: string
  /** Sentido contrario y el otro ritmo, para cruzar dos cintas. */
  reverse?: boolean
  className?: string
}

/**
 * Cinta en movimiento continuo: el contenido va dos veces seguidas y la pista
 * se desplaza la mitad de su ancho, así que el bucle no tiene costura. La
 * primera copia es la lista real; la segunda solo se ve. Se mueve con
 * transform, se para con la pausa global y queda quieta con movimiento
 * reducido. Quien la usa pone el color, el giro y el tamaño de letra.
 */
export function Ribbon({ items, label, reverse = false, className }: RibbonProps) {
  const list = (hidden: boolean) => (
    <ul className={styles.list} aria-label={hidden ? undefined : label} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className={styles.item}>
          {item}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className={className ? `${styles.ribbon} ${className}` : styles.ribbon}
      aria-hidden={label ? undefined : true}
    >
      <div className={reverse ? `${styles.track} ${styles.reverse}` : styles.track}>
        {list(false)}
        {list(true)}
      </div>
    </div>
  )
}
