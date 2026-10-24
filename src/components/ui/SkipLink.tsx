import styles from '@/components/ui/SkipLink.module.css'

interface SkipLinkProps {
  /** Id del elemento al que salta, sin la almohadilla. */
  targetId: string
  /** Texto visible del enlace; lo aporta quien lo usa, ya traducido. */
  label: string
  /** Id propio, para llevarle el foco desde otro sitio. */
  id?: string
}

/**
 * Enlace para saltar la navegación con el teclado. Va primero en la página y
 * solo se ve con el foco del teclado.
 */
export function SkipLink({ targetId, label, id }: SkipLinkProps) {
  return (
    <a id={id} className={styles.skipLink} href={`#${targetId}`}>
      {label}
    </a>
  )
}
