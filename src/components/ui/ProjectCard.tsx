import { type CSSProperties, useId } from 'react'
import styles from '@/components/ui/ProjectCard.module.css'
import { githubMark } from '@/data/projects'

interface ProjectCardProps {
  /** Número de la tarjeta, ya a dos cifras. */
  number: string
  /** Posición en la pila (base 0): de ella sale su punto de fijado. */
  index: number
  title: string
  description: string
  stack: readonly string[]
  stackLabel: string
  href: string
  viewCode: string
  /** Aviso de pestaña nueva, para el nombre accesible del enlace. */
  opensInNewTab: string
  /** Etiqueta «Proyecto principal»; solo la lleva el protagonista. */
  mainLabel?: string
  /** Cuántas capturas lleva: 3 la principal (1 grande y 2 pequeñas), 1 las demás. */
  shots: 1 | 3
  /** Texto del marcador de cada captura que todavía no existe. */
  shotPending: string
}

/**
 * Tarjeta de un proyecto en la pila (spec §3.4). Arriba, el número, el
 * nombre (h3), la etiqueta de protagonista si la lleva y «Ver código ↗»,
 * con el logo de GitHub delante; ese
 * enlace es lo único que se enfoca, y va en la franja de arriba, la que
 * queda a la vista cuando la tarjeta siguiente sube encima. Debajo, la
 * descripción, las tecnologías y las capturas en mosaico.
 *
 * Todavía no hay capturas de los proyectos en el repo: cada hueco lleva un
 * marcador visible que lo dice, en vez de una imagen inventada.
 */
export function ProjectCard({
  number,
  index,
  title,
  description,
  stack,
  stackLabel,
  href,
  viewCode,
  opensInNewTab,
  mainLabel,
  shots,
  shotPending,
}: ProjectCardProps) {
  const titleId = useId()
  // Valor dinámico: el CSS lo usa para el punto de fijado de cada tarjeta.
  const position: CSSProperties & Record<'--card-index', number> = { '--card-index': index }

  return (
    <article className={styles.card} aria-labelledby={titleId} style={position}>
      <div className={styles.head}>
        <div className={styles.identity}>
          <span className={styles.number} aria-hidden="true">
            {number}
          </span>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          {mainLabel && <span className={styles.badge}>{mainLabel}</span>}
        </div>
        <a
          className={styles.code}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${viewCode}: ${title} (${opensInNewTab})`}
        >
          {/* Decorativo: el enlace ya dice adónde lleva (spec v2.1 §3.4). */}
          <img
            className={styles.mark}
            src={githubMark.src}
            width={githubMark.width}
            height={githubMark.height}
            alt=""
          />
          {viewCode}
          <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>

      <div className={styles.body}>
        <div className={styles.text}>
          <p className={styles.description}>{description}</p>
          <ul className={styles.stack} aria-label={stackLabel}>
            {stack.map((name) => (
              <li key={name} className={styles.tag}>
                {name}
              </li>
            ))}
          </ul>
        </div>
        <div className={shots === 3 ? `${styles.shots} ${styles.mosaic}` : styles.shots}>
          {Array.from({ length: shots }, (_, shot) => (
            <p key={shot} className={styles.shot}>
              {shotPending}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}
