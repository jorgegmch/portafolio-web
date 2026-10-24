import styles from '@/components/ui/CrossedRibbons.module.css'
import { Ribbon } from '@/components/ui/Ribbon'

interface CrossedRibbonsProps {
  /** Fragmentos de código de la cinta tinta, y su nombre accesible. */
  code: readonly string[]
  codeLabel: string
  /** Verbos de la cinta Signal, y su nombre accesible. */
  verbs: readonly string[]
  verbsLabel: string
  className?: string
}

/**
 * Cintas cruzadas entre Servicios y Proyectos (spec §3.3 y §4.4): una tinta
 * girada +3° con código en mono y una Signal girada -2,5° con los verbos del
 * oficio, en sentidos opuestos. Cada una es una Ribbon: el lector de
 * pantalla oye cada lista una vez, y se paran con la pausa global y con
 * movimiento reducido. La banda no recibe clics: lo que queda debajo sigue
 * respondiendo. Quien la usa la coloca.
 */
export function CrossedRibbons({ code, codeLabel, verbs, verbsLabel, className }: CrossedRibbonsProps) {
  return (
    <div className={className}>
      <div className={styles.ribbons}>
        <Ribbon className={styles.code} items={code} label={codeLabel} reverse />
        <Ribbon className={styles.verbs} items={verbs} label={verbsLabel} />
      </div>
    </div>
  )
}
