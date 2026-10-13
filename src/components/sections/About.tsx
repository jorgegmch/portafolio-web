import { useId } from 'react'
import { Link } from 'react-router-dom'
import styles from '@/components/sections/About.module.css'
import { TerminalPanel } from '@/components/ui/TerminalPanel'
import { HIGHLIGHT_PHRASE } from '@/config/about'
import { developer } from '@/config/developer'
import { routes, sections } from '@/config/routes'
import { useAge } from '@/hooks/useAge'
import { useLang } from '@/hooks/useLang'

/**
 * Sección «Sobre mí»: título, una frase grande, la descripción en cuatro
 * párrafos, la terminal del desarrollador y el enlace a las certificaciones.
 * La frase es un párrafo, no un título; su tramo final va en un span que
 * config/about puede resaltar. Desde 1024 px la descripción ocupa la columna
 * izquierda y la terminal la derecha; por debajo, todo va apilado.
 *
 * La terminal muestra los campos de config/developer. La edad es en vivo: al
 * DOM solo llega el número, nunca la fecha de nacimiento.
 */
export function About() {
  const { t } = useLang()
  const headingId = useId()
  const { lead, highlight } = t.about.phrase
  const age = useAge()
  const terminalLines = developer.fields.map((field) => ({
    name: field,
    value: field === 'age' ? String(age) : developer.values[field],
  }))

  return (
    <section id={sections.about} className={styles.about} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t.about.heading}
      </h2>
      <p className={styles.phrase}>
        {lead}
        <span className={HIGHLIGHT_PHRASE ? styles.highlight : undefined}>{highlight}</span>
      </p>
      <div className={styles.columns}>
        <div className={styles.bio}>
          {t.about.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className={styles.terminal}>
          <TerminalPanel
            label={t.about.terminalLabel}
            command={developer.command}
            lines={terminalLines}
          />
        </div>
      </div>
      <Link className={styles.cta} to={routes.certifications}>
        {t.about.viewCertifications}
      </Link>
    </section>
  )
}
