import type { ReactNode } from 'react'
import styles from '@/components/ui/Reveal.module.css'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'

/** Puesto en el escalonado de los bloques que entran a la vez. */
export type RevealOrder = 0 | 1 | 2 | 3

const ORDER_CLASS: Record<RevealOrder, string | undefined> = {
  0: styles.order0,
  1: styles.order1,
  2: styles.order2,
  3: styles.order3,
}

interface RevealProps {
  /** Identifica el bloque en el registro de lo revelado: única en la página. */
  revealKey: string
  /** Cuántos pasos del escalonado espera; sin él, ninguno. */
  order?: RevealOrder
  /** Etiqueta del envoltorio: div, o li si va dentro de una lista. */
  as?: 'div' | 'li'
  /** Clase de quien lo usa, sumada a las suyas. */
  className?: string
  children: ReactNode
}

/**
 * Hace aparecer su contenido la primera vez que entra en pantalla en esta
 * carga de la página: sube un poco mientras pasa de transparente a visible.
 * Con movimiento reducido, sin IntersectionObserver o si ya se reveló, se ve
 * desde el inicio.
 *
 * Oculto, sigue ocupando su sitio y su contenido sigue al alcance del lector
 * de pantalla y del teclado: solo cambia lo que se ve.
 *
 * Anima su propio elemento, que no debe ser el que escala bajo el puntero:
 * las dos transformaciones se pisarían. Quien necesite las dos pone el
 * hover en un elemento de dentro.
 */
export function Reveal({ revealKey, order = 0, as: Tag = 'div', className, children }: RevealProps) {
  // El tipo que aceptan las dos etiquetas posibles a la vez.
  const { ref, visible } = useRevealOnScroll<HTMLDivElement & HTMLLIElement>(revealKey)
  const classes = [styles.reveal, ORDER_CLASS[order], visible ? undefined : styles.hidden, className]

  return (
    <Tag ref={ref} className={classes.filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
