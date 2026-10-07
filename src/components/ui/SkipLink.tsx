import styles from '@/components/ui/SkipLink.module.css'

interface SkipLinkProps {
  /** Id del elemento al que salta, sin la almohadilla. */
  targetId: string
  /** Texto visible del enlace; lo aporta quien lo usa, ya traducido. */
  label: string
}

/**
 * Enlace para saltar la navegación con el teclado. Va primero en la página y
 * solo se ve al recibir el foco.
 */
export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a className={styles.skipLink} href={`#${targetId}`}>
      {label}
    </a>
  )
}
