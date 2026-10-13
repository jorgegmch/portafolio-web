import styles from '@/components/ui/TerminalPanel.module.css'

interface TerminalPanelProps {
  /** Nombre accesible del panel; lo aporta quien lo usa, ya traducido. */
  label: string
  /** Comando cuya salida se muestra, sin el prompt. */
  command: string
  /** Salida: una línea por campo, en orden. */
  lines: readonly { name: string; value: string }[]
}

/**
 * Panel con aspecto de terminal: un comando y su salida, una línea por campo.
 * La salida es una lista de descripción, para que un lector de pantalla lea
 * cada valor junto a su campo. La barra, el «$» y los dos puntos son
 * decorativos: los pinta el CSS y no forman parte del texto.
 */
export function TerminalPanel({ label, command, lines }: TerminalPanelProps) {
  return (
    <figure className={styles.panel} aria-label={label}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <div className={styles.body}>
        <p className={styles.command}>
          <span className={styles.prompt} aria-hidden="true" />
          {command}
        </p>
        {lines.length > 0 && (
          <dl className={styles.output}>
            {lines.map(({ name, value }) => (
              <div key={name} className={styles.line}>
                <dt className={styles.name}>{name}</dt>
                <dd className={styles.value}>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </figure>
  )
}
