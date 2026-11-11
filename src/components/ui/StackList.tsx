import { useId } from 'react'
import styles from '@/components/ui/StackList.module.css'

export interface StackItem {
  id: string
  name: string
  logoUrl: string
}

export interface StackGroup {
  id: string
  label: string
  items: readonly StackItem[]
}

interface StackListProps {
  /** Rótulo en mono, sobre el título. */
  tag: string
  title: string
  /** Cuántas tecnologías hay, ya redactado. */
  count: string
  groups: readonly StackGroup[]
}

/** Lado del logo, en px: reserva su caja antes de que cargue la imagen. */
const LOGO_SIZE = 24

/**
 * Bloque «Mi stack» (spec v2.1 §3.2): rótulo en la voz de código, título y,
 * a la derecha, cuántas tecnologías son. Debajo, una columna por grupo, cada
 * una con su título y su lista; cada tecnología lleva su logo en una ficha
 * Tile y su nombre al lado. El logo es decorativo (alt=""): el nombre lleva
 * la información.
 */
export function StackList({ tag, title, count, groups }: StackListProps) {
  const groupIdPrefix = useId()

  return (
    <div className={styles.stack}>
      <div className={styles.head}>
        <div className={styles.titles}>
          <p className={styles.tag}>{tag}</p>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <p className={styles.count}>{count}</p>
      </div>
      <div className={styles.groups}>
        {groups.map((group) => {
          const labelId = `${groupIdPrefix}-${group.id}`
          return (
            <div key={group.id} className={styles.group}>
              <h4 id={labelId} className={styles.groupLabel}>
                {group.label}
              </h4>
              <ul className={styles.items} aria-labelledby={labelId}>
                {group.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <span className={styles.tile}>
                      <img
                        className={styles.logo}
                        src={item.logoUrl}
                        width={LOGO_SIZE}
                        height={LOGO_SIZE}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
